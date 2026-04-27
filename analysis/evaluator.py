"""Evaluate one generated Turkish report against label-filtered golden chunks."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

from rouge_score import rouge_scorer

GOLDEN_CHUNKS_PATH: Path = (
    Path(__file__).parent / "referans_metrikleri_raporu.json"
)
ROUGE_METRICS: Tuple[str, str, str] = ("rouge1", "rouge2", "rougeL")
BERTSCORE_LANGUAGE: str = "tr"
BERTSCORE_MODEL_TYPE: str = "dbmdz/bert-base-turkish-cased"
BERTSCORE_VERBOSE: bool = False
BERTSCORE_RESCALE_WITH_BASELINE: bool = False
CHUNK_LABEL_KEY: str = "label"
CHUNK_CONTENT_KEY: str = "content"
NEWLINE_SEPARATOR: str = "\n"

ERROR_GENERIC_MESSAGE: str = "Evaluation could not be completed."
ERROR_INVALID_INPUT_MESSAGE: str = "Invalid input provided."
ERROR_DATA_LOAD_MESSAGE: str = "Reference data could not be loaded."
ERROR_INTERNAL_MESSAGE: str = "Evaluation failed due to an internal error."
WARNING_MISSING_LABELS_TEMPLATE: str = "No reference chunks found for labels: {labels}"

_golden_chunks_cache: Optional[List[Dict[str, Any]]] = None
_bertscore_score_fn = None


class EvaluationError(Exception):
    """Base exception for evaluation failures."""


class InputValidationError(EvaluationError):
    """Raised when request inputs do not satisfy validation rules."""


class DataLoadError(EvaluationError):
    """Raised when golden reference data cannot be loaded safely."""


def _validate_generated_report(generated_report: str) -> str:
    if not isinstance(generated_report, str):
        raise InputValidationError(ERROR_INVALID_INPUT_MESSAGE)

    normalized_report = generated_report.strip()
    if not normalized_report:
        raise InputValidationError(ERROR_INVALID_INPUT_MESSAGE)
    return normalized_report


def _validate_labels(labels: Sequence[str]) -> List[str]:
    if not isinstance(labels, list) or not labels:
        raise InputValidationError(ERROR_INVALID_INPUT_MESSAGE)
    if not all(isinstance(label, str) for label in labels):
        raise InputValidationError(ERROR_INVALID_INPUT_MESSAGE)

    normalized_labels = [label.strip() for label in labels]
    if any(not label for label in normalized_labels):
        raise InputValidationError(ERROR_INVALID_INPUT_MESSAGE)
    return normalized_labels


def _build_missing_labels_warning(
    requested_labels: Sequence[str], matched_chunks: Sequence[Dict[str, Any]]
) -> Optional[str]:
    matched_labels = {
        str(chunk.get(CHUNK_LABEL_KEY))
        for chunk in matched_chunks
        if isinstance(chunk.get(CHUNK_LABEL_KEY), str)
    }
    missing_labels = sorted({label for label in requested_labels if label not in matched_labels})
    if not missing_labels:
        return None
    return WARNING_MISSING_LABELS_TEMPLATE.format(labels=", ".join(missing_labels))


def _bertscore_adapter(generated: str, reference: str) -> Dict[str, float]:
    global _bertscore_score_fn

    if _bertscore_score_fn is None:
        from bert_score import score as bertscore_score

        _bertscore_score_fn = bertscore_score

    precision_tensor, recall_tensor, f1_tensor = _bertscore_score_fn(
        cands=[generated],
        refs=[reference],
        lang=BERTSCORE_LANGUAGE,
        model_type=BERTSCORE_MODEL_TYPE,
        verbose=BERTSCORE_VERBOSE,
        rescale_with_baseline=BERTSCORE_RESCALE_WITH_BASELINE,
    )
    return {
        "precision": float(precision_tensor.mean().item()),
        "recall": float(recall_tensor.mean().item()),
        "f1": float(f1_tensor.mean().item()),
    }


def load_golden_chunks() -> List[Dict[str, Any]]:
    global _golden_chunks_cache

    if _golden_chunks_cache is not None:
        return _golden_chunks_cache

    try:
        with GOLDEN_CHUNKS_PATH.open("r", encoding="utf-8") as file_handle:
            raw_data = json.load(file_handle)
    except (OSError, json.JSONDecodeError) as exc:
        raise DataLoadError(ERROR_DATA_LOAD_MESSAGE) from exc

    if not isinstance(raw_data, list):
        raise DataLoadError(ERROR_DATA_LOAD_MESSAGE)

    _golden_chunks_cache = raw_data
    return _golden_chunks_cache


def filter_chunks_by_labels(labels: List[str]) -> List[Dict[str, Any]]:
    golden_chunks = load_golden_chunks()
    label_set = set(labels)
    return [
        chunk
        for chunk in golden_chunks
        if isinstance(chunk, dict) and chunk.get(CHUNK_LABEL_KEY) in label_set
    ]


def build_reference_text(chunks: List[Dict[str, Any]]) -> str:
    contents = [
        str(chunk.get(CHUNK_CONTENT_KEY))
        for chunk in chunks
        if isinstance(chunk.get(CHUNK_CONTENT_KEY), str)
    ]
    return NEWLINE_SEPARATOR.join(contents)


def compute_rouge(generated: str, reference: str) -> Dict[str, float]:
    scorer = rouge_scorer.RougeScorer(list(ROUGE_METRICS), use_stemmer=False)
    scores = scorer.score(reference, generated)
    return {
        "rouge1_f1": float(scores["rouge1"].fmeasure),
        "rouge2_f1": float(scores["rouge2"].fmeasure),
        "rougeL_f1": float(scores["rougeL"].fmeasure),
    }


def compute_bertscore(generated: str, reference: str) -> Dict[str, float]:
    bertscore_values = _bertscore_adapter(generated, reference)
    return {
        "bertscore_precision": bertscore_values["precision"],
        "bertscore_recall": bertscore_values["recall"],
        "bertscore_f1": bertscore_values["f1"],
    }


def evaluate_report(generated_report: str, labels: List[str]) -> Dict[str, Any]:
    try:
        normalized_report = _validate_generated_report(generated_report)
        normalized_labels = _validate_labels(labels)

        matched_chunks = filter_chunks_by_labels(normalized_labels)
        reference_text = build_reference_text(matched_chunks)
        if not reference_text.strip():
            return {
                "error": "No reference content found for the provided labels.",
                "evaluated_labels": normalized_labels,
                "reference_chunk_count": 0,
            }

        rouge_scores = compute_rouge(normalized_report, reference_text)
        bertscore_scores = compute_bertscore(normalized_report, reference_text)

        result: Dict[str, Any] = {
            **rouge_scores,
            **bertscore_scores,
            "evaluated_labels": normalized_labels,
            "reference_chunk_count": len(matched_chunks),
            "warning": _build_missing_labels_warning(normalized_labels, matched_chunks),
        }
        return result
    except InputValidationError:
        return {"error": ERROR_INVALID_INPUT_MESSAGE}
    except DataLoadError:
        return {"error": ERROR_DATA_LOAD_MESSAGE}
    except EvaluationError:
        return {"error": ERROR_GENERIC_MESSAGE}
    except Exception:
        return {"error": ERROR_INTERNAL_MESSAGE}
