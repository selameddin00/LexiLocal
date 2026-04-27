import json
from typing import Any, Dict, List

from analysis import bridge_analyze_json
from evaluator import evaluate_report


def main() -> None:
    payload: Dict[str, Any] = {
        "student_id": "TEST_001",
        "reading_speed_wpcm": 55,
        "reading_accuracy_percent": 87,
        "phonological_awareness_percent": 52,
        "visual_discrimination_score": 6.2,
        "visual_tracking_seconds": 89.0,
        "sequencing_score": 86,
    }

    analysis_result: Dict[str, Any] = bridge_analyze_json(payload)

    summary: str = str(analysis_result.get("summary", ""))
    explanations: List[str] = [
        str(item) for item in analysis_result.get("explanations", []) if isinstance(item, str)
    ]
    generated_report: str = " ".join([summary, *explanations]).strip()

    labels: List[str] = [
        str(label) for label in analysis_result.get("labels", []) if isinstance(label, str)
    ]
    evaluation_result: Dict[str, Any] = evaluate_report(generated_report, labels)

    print(json.dumps(evaluation_result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
