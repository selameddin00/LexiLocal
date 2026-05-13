"""Batch evaluate all reading records from the synthetic CSV via the analysis + RAG pipeline."""

from __future__ import annotations

import math
import os
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

import pandas as pd
from dotenv import load_dotenv

THIS_DIR = Path(__file__).resolve().parent
if str(THIS_DIR) not in sys.path:
    sys.path.insert(0, str(THIS_DIR))

from analysis import bridge_analyze_json
from evaluator import evaluate_report, init_bertscorer
from rag_report import generate_rag_report

load_dotenv()

DEFAULT_CSV_PATH: Path = Path(
    r"C:\Users\Selam\Documents\GitHub\LexiLocal\Sunumlar ve Raporlar\Sprint3"
    r"\sample_75.csv"
)
CSV_PATH: Path = Path(os.getenv("LEXILOCAL_CSV_PATH", str(DEFAULT_CSV_PATH)))

LABEL_WIDTH: int = 15
ARROW: str = "\u2192"
SEPARATOR: str = "---"
GENERAL_LABEL: str = "GENEL"

STUDENT_ID_COLUMNS: Tuple[str, ...] = ("student_id", "id", "ogrenci_id", "ogrenciID")
READING_SPEED_COLUMNS: Tuple[str, ...] = ("reading_speed_wpcm", "reading_speed", "okuma_hizi")
ACCURACY_COLUMNS: Tuple[str, ...] = (
    "reading_accuracy_percent",
    "accuracy",
    "okuma_dogrulugu",
)
PHONO_COLUMNS: Tuple[str, ...] = (
    "phonological_awareness_percent",
    "phonological_awareness_score",
    "fonolojik_farkindalik",
)
LETTER_COLUMNS: Tuple[str, ...] = (
    "letter_symbol_recognition_accuracy",
    "harf_sembol_tanima",
)
REREADING_COLUMNS: Tuple[str, ...] = (
    "rereading_rate",
    "yeniden_okuma_orani",
)
WORKING_MEMORY_COLUMNS: Tuple[str, ...] = (
    "working_memory_accuracy",
    "calisma_bellegi",
)


def _configure_stdout_utf8() -> None:
    reconfigure = getattr(sys.stdout, "reconfigure", None)
    if callable(reconfigure):
        try:
            reconfigure(encoding="utf-8")
        except Exception:
            pass


def _is_missing(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, float) and math.isnan(value):
        return True
    if isinstance(value, str) and not value.strip():
        return True
    return False


def _first_present(record: Dict[str, Any], candidates: Iterable[str]) -> Any:
    for candidate in candidates:
        if candidate in record and not _is_missing(record[candidate]):
            return record[candidate]
    return None


def fetch_reading_data() -> List[Dict[str, Any]]:
    if not CSV_PATH.is_file():
        raise FileNotFoundError(f"CSV dosyası bulunamadı: {CSV_PATH}")

    if CSV_PATH.stat().st_size == 0:
        return []

    try:
        dataframe = pd.read_csv(CSV_PATH)
    except pd.errors.EmptyDataError:
        return []

    if dataframe.empty:
        return []

    return dataframe.to_dict(orient="records")


def _build_bridge_payload(record: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "student_id": _first_present(record, STUDENT_ID_COLUMNS),
        "reading_speed": _first_present(record, READING_SPEED_COLUMNS),
        "accuracy": _first_present(record, ACCURACY_COLUMNS),
        "phonological_awareness_percent": _first_present(record, PHONO_COLUMNS),
        "letter_symbol_recognition_accuracy": _first_present(record, LETTER_COLUMNS),
        "rereading_rate": _first_present(record, REREADING_COLUMNS),
        "working_memory_accuracy": _first_present(record, WORKING_MEMORY_COLUMNS),
        "errors": [],
    }


def _build_rag_student_data(record: Dict[str, Any]) -> Dict[str, Any]:
    student_data: Dict[str, Any] = {
        "reading_speed": _first_present(record, READING_SPEED_COLUMNS),
        "accuracy": _first_present(record, ACCURACY_COLUMNS),
        "errors": [],
    }
    optional_mappings: Tuple[Tuple[str, Tuple[str, ...]], ...] = (
        ("phonological_awareness_percent", PHONO_COLUMNS),
        ("letter_symbol_recognition_accuracy", LETTER_COLUMNS),
        ("rereading_rate", REREADING_COLUMNS),
        ("working_memory_accuracy", WORKING_MEMORY_COLUMNS),
    )
    for target_key, candidates in optional_mappings:
        value = _first_present(record, candidates)
        if value is not None:
            student_data[target_key] = value
    return student_data


def _filter_evaluable_labels(labels: Sequence[str]) -> List[str]:
    return [label for label in labels if isinstance(label, str) and label and label != "Normal"]


def _format_score_line(student_id: Any, label: str, rouge_l: float, bertscore_f1: float) -> str:
    label_cell = label.ljust(LABEL_WIDTH)
    return (
        f"[StudentID: {student_id}] {label_cell} {ARROW} "
        f"ROUGE-L: {rouge_l:.2f} | BERTScore-F1: {bertscore_f1:.2f}"
    )


def _format_info_line(student_id: Any, label: str, info: str) -> str:
    label_cell = label.ljust(LABEL_WIDTH)
    return f"[StudentID: {student_id}] {label_cell} {ARROW} {info}"


def _run_pipeline_for_record(
    record: Dict[str, Any],
) -> Tuple[List[str], Optional[str], Dict[str, List[Dict[str, Any]]], Optional[str]]:
    analysis_result = bridge_analyze_json(_build_bridge_payload(record))
    raw_labels: List[str] = [
        str(label) for label in analysis_result.get("labels", []) if isinstance(label, str)
    ]
    labels = _filter_evaluable_labels(raw_labels)

    if not labels:
        return raw_labels, None, {}, "Değerlendirilecek label bulunamadı."

    rag_result = generate_rag_report(labels, _build_rag_student_data(record))
    rag_error = rag_result.get("error")
    rag_report = rag_result.get("rag_report")
    chunks_per_label = rag_result.get("chunks_per_label") or {}

    if rag_error or not rag_report:
        return labels, None, chunks_per_label, rag_error or "RAG raporu üretilemedi."

    return labels, rag_report, chunks_per_label, None


def _emit_record_lines(
    student_id: Any,
    labels: List[str],
    evaluation: Dict[str, Any],
) -> Tuple[Optional[float], Optional[float]]:
    per_label = evaluation.get("per_label", {}) or {}

    for label in labels:
        scores = per_label.get(label, {}) or {}
        if "rougeL_f1" in scores and "bertscore_f1" in scores:
            print(_format_score_line(student_id, label, scores["rougeL_f1"], scores["bertscore_f1"]))
        else:
            reason = scores.get("error", "skor hesaplanamadı")
            print(_format_info_line(student_id, label, f"SKOR YOK ({reason})"))

    macro = evaluation.get("macro_average", {}) or {}
    scored_count = int(evaluation.get("scored_label_count", 0) or 0)

    if scored_count > 0:
        rouge_l = float(macro.get("rougeL_f1", 0.0))
        bertscore_f1 = float(macro.get("bertscore_f1", 0.0))
        print(_format_score_line(student_id, GENERAL_LABEL, rouge_l, bertscore_f1))
        return rouge_l, bertscore_f1

    print(_format_info_line(student_id, GENERAL_LABEL, "SKOR YOK (label başına skor yok)"))
    return None, None


def _process_record(
    record: Dict[str, Any],
    rouge_accum: List[float],
    bertscore_accum: List[float],
) -> None:
    student_id = _first_present(record, STUDENT_ID_COLUMNS) or "?"
    labels, rag_report, chunks_per_label, error = _run_pipeline_for_record(record)

    if error or not rag_report:
        print(_format_info_line(student_id, "HATA", error or "RAG raporu yok."))
        print(SEPARATOR)
        return

    evaluation = evaluate_report(rag_report, labels, chunks_per_label)

    if "error" in evaluation:
        print(_format_info_line(student_id, "HATA", evaluation["error"]))
        print(SEPARATOR)
        return

    rouge_l, bertscore_f1 = _emit_record_lines(student_id, labels, evaluation)
    print(SEPARATOR)

    if rouge_l is not None and bertscore_f1 is not None:
        rouge_accum.append(rouge_l)
        bertscore_accum.append(bertscore_f1)


def _print_system_macro(rouge_accum: List[float], bertscore_accum: List[float]) -> None:
    if rouge_accum and bertscore_accum:
        system_rouge = sum(rouge_accum) / len(rouge_accum)
        system_bertscore = sum(bertscore_accum) / len(bertscore_accum)
    else:
        system_rouge = 0.0
        system_bertscore = 0.0

    print(
        f"SYSTEM MACRO AVG {ARROW} ROUGE-L: {system_rouge:.2f} | "
        f"BERTScore-F1: {system_bertscore:.2f}"
    )


def main() -> int:
    _configure_stdout_utf8()

    try:
        records = fetch_reading_data()
    except Exception as exc:
        print(f"CSV okuma hatası: {exc}", file=sys.stderr)
        return 1

    if not records:
        print(f"CSV dosyasında hiç kayıt yok: {CSV_PATH}")
        return 0

    print("BERTScore modeli yükleniyor (tek sefer)...", file=sys.stderr)
    try:
        init_bertscorer()
    except Exception as exc:
        print(f"BERTScore modeli yüklenemedi: {exc}", file=sys.stderr)
        return 1
    print("BERTScore modeli hazır.", file=sys.stderr)

    rouge_accum: List[float] = []
    bertscore_accum: List[float] = []

    for record in records:
        _process_record(record, rouge_accum, bertscore_accum)

    _print_system_macro(rouge_accum, bertscore_accum)
    return 0


if __name__ == "__main__":
    sys.exit(main())
