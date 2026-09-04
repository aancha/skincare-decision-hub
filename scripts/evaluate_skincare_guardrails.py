#!/usr/bin/env python3

import json
import pathlib
from typing import Dict, List

from routine_planner import build_routine_warning_entries, normalize_products
from skincare_guardrails import assess_product_guardrails, evaluate_question_guardrails


ROOT = pathlib.Path(__file__).resolve().parents[1]
FIXTURES_PATH = ROOT / "tests" / "fixtures" / "skincare_guardrail_eval_cases.json"


def load_cases(path: pathlib.Path = FIXTURES_PATH) -> List[Dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    cases = payload.get("cases", [])
    if len(cases) != 50:
        raise AssertionError(f"Expected 50 guardrail eval cases, found {len(cases)}.")
    return cases


def _assert_includes(actual: List[str], expected: List[str], label: str) -> None:
    missing = [value for value in expected if value not in actual]
    if missing:
        raise AssertionError(f"Missing {label}: {', '.join(missing)}")


def run_case(case: Dict) -> None:
    kind = case["kind"]
    expected = case["expected"]

    if kind == "product_posture":
        posture = assess_product_guardrails(case["product"])
        if "sensitiveSafe" in expected and posture["sensitiveSafe"] != expected["sensitiveSafe"]:
            raise AssertionError(
                f"Expected sensitiveSafe={expected['sensitiveSafe']}, got {posture['sensitiveSafe']}"
            )
        _assert_includes(posture["tags"], expected.get("tagsInclude", []), "product tags")
        _assert_includes(
            posture["pregnancyCautionTags"],
            expected.get("pregnancyTagsInclude", []),
            "pregnancy tags",
        )
        return

    if kind == "question_guardrail":
        evaluation = evaluate_question_guardrails(case["question"], case.get("products"))
        if evaluation["severity"] != expected["severity"]:
            raise AssertionError(
                f"Expected severity={expected['severity']}, got {evaluation['severity']}"
            )
        if expected.get("primaryTag") and evaluation["primaryTag"] != expected["primaryTag"]:
            raise AssertionError(
                f"Expected primaryTag={expected['primaryTag']}, got {evaluation['primaryTag']}"
            )
        _assert_includes(evaluation["tags"], expected.get("tagsInclude", []), "guardrail tags")
        return

    if kind == "routine_warning":
        warnings = build_routine_warning_entries(
            normalize_products(case["products"]),
            case["timing"],
            case.get("avoidIngredients"),
        )
        warning_tags = [entry["tag"] for entry in warnings]
        _assert_includes(warning_tags, expected.get("tagsInclude", []), "routine warning tags")
        return

    raise AssertionError(f"Unsupported case kind: {kind}")


def run_eval_cases(path: pathlib.Path = FIXTURES_PATH) -> Dict:
    cases = load_cases(path)
    failures = []

    for case in cases:
        try:
            run_case(case)
        except AssertionError as exc:
            failures.append({"id": case["id"], "error": str(exc)})

    total = len(cases)
    return {
      "total": total,
      "passed": total - len(failures),
      "failed": len(failures),
      "failures": failures,
    }


def main() -> None:
    summary = run_eval_cases()
    print(f"SkinCare guardrail evals: {summary['passed']}/{summary['total']} passed")
    if summary["failures"]:
        for failure in summary["failures"]:
            print(f"- {failure['id']}: {failure['error']}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
