"""Evaluate one generated Turkish report against per-label retrieved chunks."""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Sequence, Tuple

from rouge_score import rouge_scorer

ROUGE_METRICS: Tuple[str, str, str] = ("rouge1", "rouge2", "rougeL")
BERTSCORE_LANGUAGE: str = "tr"
BERTSCORE_MODEL_TYPE: str = "dbmdz/bert-base-turkish-cased"
BERTSCORE_VERBOSE: bool = False
BERTSCORE_RESCALE_WITH_BASELINE: bool = False
CHUNK_CONTENT_KEY: str = "content"
NEWLINE_SEPARATOR: str = "\n"

ERROR_GENERIC_MESSAGE: str = "Evaluation could not be completed."
ERROR_INVALID_INPUT_MESSAGE: str = "Invalid input provided."
ERROR_INTERNAL_MESSAGE: str = "Evaluation failed due to an internal error."
WARNING_MISSING_REFERENCE_TEMPLATE: str = "No reference chunks found for labels: {labels}"
WARNING_MISSING_SECTION_TEMPLATE: str = "Report section missing for labels: {labels}"

LABEL_KEYWORDS: Dict[str, Tuple[str, ...]] = {
    "OKUMA_HIZI": ("hız",),
    "OKUMA_DOGRULUGU": ("okuma", "doğru"),
    "FONOLOJIK_FARKINDALIK": ("fonolojik",),
    "HARF_SEMBOL_TANIMA_DOGRULUGU": ("harf",),
    "OKUMA_SIRASINDA_YENIDEN_OKUMA_ORANI": ("yeniden",),
    "CALISMA_BELLEGI_DOGRULUGU": ("belle",),
}

SECTION_HEADING_PATTERN: re.Pattern = re.compile(r"^#{2,}\s+(.+?)\s*$", re.MULTILINE)

MACRO_KEYS: Tuple[str, ...] = (
    "rouge1_f1",
    "rouge2_f1",
    "rougeL_f1",
    "bertscore_precision",
    "bertscore_recall",
    "bertscore_f1",
)

_bertscorer = None


class EvaluationError(Exception):
    """Base exception for evaluation failures."""


class InputValidationError(EvaluationError):
    """Raised when request inputs do not satisfy validation rules."""


def init_bertscorer():
    """Load the BERTScorer model exactly once and cache the instance.

    Call this explicitly at process startup (e.g. from batch_evaluate.py) so
    the underlying transformer weights are downloaded/initialized a single
    time. Subsequent calls return the cached instance.
    """
    global _bertscorer
    if _bertscorer is None:
        from bert_score import BERTScorer

        _bertscorer = BERTScorer(
            lang=BERTSCORE_LANGUAGE,
            model_type=BERTSCORE_MODEL_TYPE,
            rescale_with_baseline=BERTSCORE_RESCALE_WITH_BASELINE,
        )
    return _bertscorer


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


def _validate_chunks_per_label(
    chunks_per_label: Dict[str, List[Dict[str, Any]]],
) -> Dict[str, List[Dict[str, Any]]]:
    if not isinstance(chunks_per_label, dict):
        raise InputValidationError(ERROR_INVALID_INPUT_MESSAGE)
    return chunks_per_label


def _bertscore_adapter(generated: str, reference: str) -> Dict[str, float]:
    scorer = init_bertscorer()

    precision_tensor, recall_tensor, f1_tensor = scorer.score(
        cands=[generated],
        refs=[reference],
        verbose=BERTSCORE_VERBOSE,
    )
    return {
        "precision": float(precision_tensor.mean().item()),
        "recall": float(recall_tensor.mean().item()),
        "f1": float(f1_tensor.mean().item()),
    }


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


def build_reference_text(chunks: Sequence[Dict[str, Any]]) -> str:
    if not isinstance(chunks, list):
        return ""
    contents = [
        str(chunk.get(CHUNK_CONTENT_KEY))
        for chunk in chunks
        if isinstance(chunk, dict) and isinstance(chunk.get(CHUNK_CONTENT_KEY), str)
    ]
    return NEWLINE_SEPARATOR.join(contents)


def _parse_report_sections(report: str) -> List[Tuple[str, str]]:
    sections: List[Tuple[str, str]] = []
    matches = list(SECTION_HEADING_PATTERN.finditer(report))
    for index, match in enumerate(matches):
        heading = match.group(1).strip()
        body_start = match.end()
        body_end = matches[index + 1].start() if index + 1 < len(matches) else len(report)
        body = report[body_start:body_end].strip()
        sections.append((heading, body))
    return sections


def _section_matches_label(heading: str, label: str) -> bool:
    keywords = LABEL_KEYWORDS.get(label)
    if not keywords:
        normalized_label = label.replace("_", " ").casefold()
        return normalized_label in heading.casefold()

    normalized_heading = heading.casefold()
    return all(keyword.casefold() in normalized_heading for keyword in keywords)


def _extract_label_section(sections: Sequence[Tuple[str, str]], label: str) -> str:
    for heading, body in sections:
        if _section_matches_label(heading, label):
            return body
    return ""


def _macro_average(per_label_scores: Sequence[Dict[str, float]]) -> Dict[str, float]:
    if not per_label_scores:
        return {key: 0.0 for key in MACRO_KEYS}
    return {
        key: sum(scores.get(key, 0.0) for scores in per_label_scores) / len(per_label_scores)
        for key in MACRO_KEYS
    }


def _build_warnings(
    missing_reference_labels: Sequence[str],
    missing_section_labels: Sequence[str],
) -> Optional[List[str]]:
    warnings: List[str] = []
    if missing_reference_labels:
        warnings.append(
            WARNING_MISSING_REFERENCE_TEMPLATE.format(labels=", ".join(missing_reference_labels))
        )
    if missing_section_labels:
        warnings.append(
            WARNING_MISSING_SECTION_TEMPLATE.format(labels=", ".join(missing_section_labels))
        )
    return warnings or None


def evaluate_report(
    generated_report: str,
    labels: List[str],
    chunks_per_label: Dict[str, List[Dict[str, Any]]],
) -> Dict[str, Any]:
    try:
        normalized_report = _validate_generated_report(generated_report)
        normalized_labels = _validate_labels(labels)
        normalized_chunks_map = _validate_chunks_per_label(chunks_per_label)

        sections = _parse_report_sections(normalized_report)

        per_label_results: Dict[str, Dict[str, Any]] = {}
        evaluated_score_dicts: List[Dict[str, float]] = []
        missing_reference_labels: List[str] = []
        missing_section_labels: List[str] = []

        for label in normalized_labels:
            label_chunks = normalized_chunks_map.get(label, [])
            reference_text = build_reference_text(label_chunks)
            section_text = _extract_label_section(sections, label)

            chunk_count = len(label_chunks) if isinstance(label_chunks, list) else 0
            label_entry: Dict[str, Any] = {
                "reference_chunk_count": chunk_count,
                "section_found": bool(section_text.strip()),
            }

            if not reference_text.strip():
                missing_reference_labels.append(label)
                label_entry["error"] = "No reference chunks for label."
                per_label_results[label] = label_entry
                continue

            if not section_text.strip():
                missing_section_labels.append(label)
                label_entry["error"] = "Label section not found in generated report."
                per_label_results[label] = label_entry
                continue

            rouge_scores = compute_rouge(section_text, reference_text)
            bertscore_scores = compute_bertscore(section_text, reference_text)
            combined_scores: Dict[str, float] = {**rouge_scores, **bertscore_scores}

            label_entry.update(combined_scores)
            per_label_results[label] = label_entry
            evaluated_score_dicts.append(combined_scores)

        macro_average = _macro_average(evaluated_score_dicts)

        return {
            "per_label": per_label_results,
            "macro_average": macro_average,
            "evaluated_labels": normalized_labels,
            "scored_label_count": len(evaluated_score_dicts),
            "warning": _build_warnings(missing_reference_labels, missing_section_labels),
        }
    except InputValidationError:
        return {"error": ERROR_INVALID_INPUT_MESSAGE}
    except EvaluationError:
        return {"error": ERROR_GENERIC_MESSAGE}
    except Exception:
        return {"error": ERROR_INTERNAL_MESSAGE}
