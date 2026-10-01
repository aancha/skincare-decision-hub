"""Paired offline contract evaluation; no quality, cost or latency estimates."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import sys

EXAMPLE_ROOT = Path(__file__).resolve().parent
SHORTLIST_ROOT = EXAMPLE_ROOT.parent / "shortlist_ai"
sys.path.insert(0, str(SHORTLIST_ROOT))
from shortlist import CATALOG, FIXTURE, MockProvider, build_context, build_request, explain


def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")


def load_design() -> tuple[dict, dict]:
    cases = json.loads((EXAMPLE_ROOT / "scenarios.json").read_text(encoding="utf-8"))
    rubric = json.loads((EXAMPLE_ROOT / "rubric.json").read_text(encoding="utf-8"))
    ids = [case["id"] for case in cases["cases"]]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate evaluation IDs")
    if any(case["split"] not in ("development", "held-out") for case in cases["cases"]):
        raise ValueError("Unknown evaluation split")
    return cases, rubric


def run(split: str = "development") -> dict:
    if split not in ("development", "held-out", "all"):
        raise ValueError("Unknown evaluation split")
    design, rubric = load_design()
    request = build_request(build_context(FIXTURE, CATALOG))
    rows = []
    for case in design["cases"]:
        if split != "all" and case["split"] != split:
            continue
        inputs, catalog = copy.deepcopy(FIXTURE), copy.deepcopy(CATALOG)
        inputs["question"] = case["question"]
        if case["scenario"] == "missing":
            inputs["productIds"] = ["missing-fictional-product"]
        elif case["scenario"] == "conflict":
            catalog.append(copy.deepcopy(catalog[0]))
        provider = MockProvider(case["scenario"])
        attempted = explain(inputs, catalog, provider)
        baseline = explain(inputs, catalog, None)
        passed = (attempted["source"], attempted["reason"]) == (case["expectedSource"], case["expectedReason"])
        rows.append({
            "id": case["id"], "split": case["split"], "category": case["category"],
            "input": inputs, "inputSha256": digest(canonical({"input": inputs, "catalog": catalog})),
            "mocked_orchestration": attempted, "deterministic_baseline": baseline,
            "contractPassed": passed, "mockProviderCalls": provider.calls,
            "humanScores": {name: None for name in rubric["dimensions"]},
            "claimAnnotations": None,
        })
    return {
        "reportVersion": "paired-offline-contract-v1", "evidenceCategory": "mocked-orchestration-and-contract-tests",
        "datasetVersion": design["version"], "datasetSha256": digest((EXAMPLE_ROOT / "scenarios.json").read_bytes()),
        "rubricVersion": rubric["version"], "rubricSha256": digest((EXAMPLE_ROOT / "rubric.json").read_bytes()),
        "promptSha256": digest(request["instructions"].encode("utf-8")),
        "schemaSha256": digest(canonical(request["text"]["format"])),
        "implementationSha256": digest((SHORTLIST_ROOT / "shortlist.py").read_bytes()),
        "fixtureSha256": digest(canonical(CATALOG)), "model": None,
        "split": split, "sampleCount": len(rows), "contractPassCount": sum(row["contractPassed"] for row in rows),
        "realModelMeasurements": {"status": "pending-approval", "quality": None, "unsupportedClaimRate": None,
                                  "latencyMedianMs": None, "latencyP95Ms": None, "tokens": None, "cost": None},
        "humanUsefulness": "pending-consent-and-review",
        "limitations": "Tiny fictional fault-injection matrix, not representative product quality or clinical evidence. Held-out contract checks are not an independent human/model study.",
        "cases": rows,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--split", choices=("development", "held-out", "all"), default="development")
    args = parser.parse_args()
    report = run(args.split)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["sampleCount"] == report["contractPassCount"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
