"""Original synthetic baseline-imitation study; standard-library Python only."""

import argparse
import hashlib
import itertools
import json
import math
import random
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
VERSION = "synthetic-ranking-imitation-v1"
SEED = 20260905
FEATURES = ["concern_match", "ingredient_match", "budget_fit", "evidence_completeness", "active_fit"]
TEACHER_WEIGHTS = [1.8, 1.2, 0.8, 0.4, 0.6]
DESIGN = {
    "version": VERSION,
    "seed": SEED,
    "families": 24,
    "queriesPerFamily": 2,
    "productsPerFamily": 5,
    "splitCounts": {"train": 16, "development": 4, "final": 4},
    "featureOrder": FEATURES,
    "labelSource": "deterministic synthetic teacher; baseline imitation, not human preference",
    "teacherWeights": TEACHER_WEIGHTS,
    "training": {"epochs": 300, "learningRate": 0.35, "l2": 0.02, "initialWeights": "all zero"},
    "selection": "One predeclared configuration; development is diagnostic only; no final-set selection.",
    "metrics": ["pairwise_teacher_agreement", "top_choice_teacher_agreement"],
    "realRecommendationQuality": "not measured",
}


def encoded(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, allow_nan=False) + "\n").encode("utf-8")


def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def number(value: Any) -> bool:
    return type(value) in (int, float) and math.isfinite(value)


def generate() -> tuple[dict, dict]:
    """No source dataset: correlated query variants share an isolated product bundle."""
    rng = random.Random(SEED)
    groups = [f"family-{index:02d}" for index in range(DESIGN["families"])]
    rng.shuffle(groups)
    split_groups = {"train": groups[:16], "development": groups[16:20], "final": groups[20:]}
    split_for = {group: split for split, members in split_groups.items() for group in members}
    queries = []
    for index in range(DESIGN["families"]):
        group = f"family-{index:02d}"
        # Each family has independent fictional inventory; variants stay together.
        inventory = [
            {"id": f"fictional-{index:02d}-{item}", "productFamily": f"product-{index:02d}-{item}",
             "concern": rng.randrange(3), "ingredient": rng.randrange(3),
             "price": rng.randrange(10, 71), "evidence": rng.randrange(2, 6) / 5,
             "active": rng.randrange(5) / 4}
            for item in range(5)
        ]
        context = {"concern": rng.randrange(3), "ingredient": rng.randrange(3),
                   "budget": rng.randrange(20, 61), "active": rng.randrange(5) / 4}
        for variant in range(2):
            budget = context["budget"] + 3 * variant
            candidates = []
            for product in inventory:
                features = [float(product["concern"] == context["concern"]),
                            float(product["ingredient"] == context["ingredient"]),
                            round(max(0, 1 - abs(product["price"] - budget) / 60), 6),
                            product["evidence"], 1 - abs(product["active"] - context["active"])]
                candidates.append({"id": product["id"], "productFamily": product["productFamily"],
                                   "features": features})
            queries.append({"id": f"query-{index:02d}-{variant}", "queryFamily": group,
                            "split": split_for[group], "scope": "fictional-comparison",
                            "candidates": candidates})
    dataset = {"version": VERSION, "provenance": DESIGN["labelSource"], "queries": queries}
    split = {"version": VERSION, "seed": SEED, "families": split_groups,
             "policy": "Both correlated query families and product families are disjoint between splits."}
    validate_split(dataset, split)
    return dataset, split


def validate_split(dataset: dict, split: dict) -> None:
    seen_queries = set()
    family_owners = {}
    product_owners = {}
    if set(split["families"]) != {"train", "development", "final"}:
        raise ValueError("Unknown split")
    for query in dataset["queries"]:
        owner = query["split"]
        if owner not in split["families"] or query["queryFamily"] not in split["families"][owner]:
            raise ValueError("Query does not match frozen split")
        if query["id"] in seen_queries:
            raise ValueError("Duplicate query")
        seen_queries.add(query["id"])
        family = query["queryFamily"]
        if family_owners.setdefault(family, owner) != owner:
            raise ValueError("Correlated query-family leakage")
        for product in query["candidates"]:
            if product_owners.setdefault(product["productFamily"], owner) != owner:
                raise ValueError("Correlated product-family leakage")
    all_groups = [group for groups in split["families"].values() for group in groups]
    if len(set(all_groups)) != len(all_groups) or set(all_groups) != set(family_owners):
        raise ValueError("Split families overlap or are missing")


def score(weights: list[float], features: list[float]) -> float:
    # Explicit left-to-right accumulation matches browser reduce and the frozen
    # artifact; Python 3.12's more accurate float sum changes last-bit results.
    total = 0.0
    for weight, value in zip(weights, features):
        total += weight * value
    return total


def pairs(queries: list[dict]) -> list[tuple[list[float], int]]:
    rows = []
    for query in queries:
        for left, right in itertools.combinations(query["candidates"], 2):
            difference = [a - b for a, b in zip(left["features"], right["features"])]
            margin = score(TEACHER_WEIGHTS, difference)
            if abs(margin) > 1e-12:
                rows.append((difference, int(margin > 0)))
    return rows


def train(train_queries: list[dict]) -> list[float]:
    if not train_queries or any(query["split"] != "train" for query in train_queries):
        raise ValueError("Training accepts the frozen training split only")
    rows = pairs(train_queries)
    if not rows:
        raise ValueError("No non-tied training pairs")
    weights = [0.0] * len(FEATURES)
    settings = DESIGN["training"]
    for _ in range(settings["epochs"]):
        gradient = [settings["l2"] * value for value in weights]
        for difference, label in rows:
            probability = 1 / (1 + math.exp(-score(weights, difference)))
            for index, value in enumerate(difference):
                gradient[index] += (probability - label) * value / len(rows)
        weights = [value - settings["learningRate"] * derivative
                   for value, derivative in zip(weights, gradient)]
    # Fixed precision makes the exported cross-runtime artifact stable and legible.
    return [round(value, 12) for value in weights]


def validate_artifact(artifact: dict) -> None:
    if not isinstance(artifact, dict) or set(artifact) != {
        "version", "kind", "featureOrder", "weights", "trainingHashes", "policy"
    }:
        raise ValueError("Invalid artifact schema")
    if artifact["version"] != VERSION or artifact["kind"] != "pairwise-logistic-baseline-imitation":
        raise ValueError("Unsupported artifact")
    if artifact["featureOrder"] != FEATURES:
        raise ValueError("Feature schema mismatch")
    weights = artifact["weights"]
    if not isinstance(weights, list) or len(weights) != len(FEATURES) or any(
        not number(value) or abs(value) > 100 for value in weights
    ):
        raise ValueError("Invalid learned weights")
    if artifact["policy"] != {"scope": "fictional-comparison", "candidateCount": 5,
                               "maximumDisplacement": 2, "authoritative": False} or artifact["policy"]["authoritative"] is not False:
        raise ValueError("Invalid authority policy")
    hashes = artifact["trainingHashes"]
    if not isinstance(hashes, dict) or set(hashes) != {"design", "dataset", "split"} or any(
        not isinstance(value, str) or len(value) != 64 or any(char not in "0123456789abcdef" for char in value)
        for value in hashes.values()
    ):
        raise ValueError("Invalid training provenance")


def infer(query: dict, artifact: dict) -> dict:
    """Comparison-only inference: fail closed to the supplied deterministic order."""
    candidates = query.get("candidates", []) if isinstance(query, dict) else []
    order = [entry.get("id") for entry in candidates if isinstance(entry, dict)] if isinstance(candidates, list) else []
    fallback = {"controlled": False, "order": order, "scores": [], "reason": "invalid-input"}
    try:
        validate_artifact(artifact)
    except (ValueError, TypeError):
        return {**fallback, "reason": "invalid-artifact"}
    if not isinstance(query, dict) or query.get("scope") != "fictional-comparison":
        return {**fallback, "reason": "out-of-scope"}
    if not isinstance(candidates, list) or len(candidates) != 5 or len(order) != 5:
        return fallback
    if any(not isinstance(identifier, str) or not identifier.startswith("fictional-") or len(identifier) > 60 for identifier in order):
        return fallback
    if len(set(order)) != 5:
        return fallback
    for candidate in candidates:
        values = candidate.get("features")
        if not isinstance(values, list) or len(values) != len(FEATURES) or any(
            not number(value) or not 0 <= value <= 1 for value in values
        ):
            return fallback
    scores = [score(artifact["weights"], candidate["features"]) for candidate in candidates]
    best = tuple(range(5))
    best_score = -math.inf
    for proposed in itertools.permutations(range(5)):
        if any(abs(index - original) > 2 for index, original in enumerate(proposed)):
            continue
        utility = 0.0
        for index, original in enumerate(proposed):
            utility += (5 - index) * scores[original]
        if utility > best_score + 1e-12:
            best, best_score = proposed, utility
    return {"controlled": True, "order": [order[index] for index in best], "scores": scores,
            "reason": "synthetic-comparison-only"}


def metrics(queries: list[dict], weights: list[float]) -> dict:
    rows = pairs(queries)
    correct = sum(int(score(weights, difference) > 0) == label for difference, label in rows)
    top_correct = 0
    for query in queries:
        candidates = query["candidates"]
        teacher = max(range(5), key=lambda index: score(TEACHER_WEIGHTS, candidates[index]["features"]))
        learned = max(range(5), key=lambda index: score(weights, candidates[index]["features"]))
        top_correct += teacher == learned
    return {"queries": len(queries), "nonTiedPairs": len(rows), "pairwiseCorrect": correct,
            "pairwiseTeacherAgreement": round(correct / len(rows), 6),
            "topChoiceCorrect": top_correct, "topChoiceTeacherAgreement": round(top_correct / len(queries), 6)}


def build() -> dict[str, bytes]:
    dataset, split = generate()
    files = {"design.json": encoded(DESIGN), "dataset.json": encoded(dataset), "split.json": encoded(split)}
    weights = train([query for query in dataset["queries"] if query["split"] == "train"])
    artifact = {"version": VERSION, "kind": "pairwise-logistic-baseline-imitation",
                "featureOrder": FEATURES, "weights": weights,
                "trainingHashes": {name: digest(files[f"{name}.json"]) for name in ("design", "dataset", "split")},
                "policy": {"scope": "fictional-comparison", "candidateCount": 5,
                           "maximumDisplacement": 2, "authoritative": False}}
    validate_artifact(artifact)
    files["model.json"] = encoded(artifact)
    report = {"version": VERSION, "evidence": "synthetic baseline imitation only",
              "metricScope": "raw learned scores before the demonstration-only movement cap",
              "labelSource": DESIGN["labelSource"], "modelHash": digest(files["model.json"]), "splits": {}}
    for name in ("train", "development", "final"):
        queries = [query for query in dataset["queries"] if query["split"] == name]
        report["splits"][name] = {"learned": metrics(queries, weights), "teacherBaseline": metrics(queries, TEACHER_WEIGHTS)}
    files["report.json"] = encoded(report)
    cases = []
    for query in dataset["queries"]:
        # The authoritative baseline order is supplied; the example never changes app state.
        supplied = {**query, "candidates": sorted(query["candidates"],
                    key=lambda product: -score(TEACHER_WEIGHTS, product["features"]))}
        cases.append({"query": supplied, "expected": infer(supplied, artifact)})
    cases.extend([
        {"query": {"scope": "medical", "candidates": cases[0]["query"]["candidates"]},
         "expected": infer({"scope": "medical", "candidates": cases[0]["query"]["candidates"]}, artifact)},
        {"query": {"scope": "fictional-comparison", "candidates": []},
         "expected": infer({"scope": "fictional-comparison", "candidates": []}, artifact)},
    ])
    files["parity.json"] = encoded({"version": VERSION, "tolerance": 1e-9, "cases": cases})
    files["manifest.json"] = encoded({"version": VERSION, "sha256": {name: digest(value) for name, value in files.items()}})
    return files


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("build", "verify", "report"))
    args = parser.parse_args()
    destination = ROOT / "artifacts"
    if args.command == "report":
        print((destination / "report.json").read_text(), end="")
        return
    expected = build()
    if args.command == "build":
        destination.mkdir(exist_ok=True)
        for name, value in expected.items():
            path = destination / name
            if path.exists() and path.read_bytes() != value:
                raise SystemExit("Frozen artifact differs: create a new version; do not retune this final set.")
        for name, value in expected.items():
            (destination / name).write_bytes(value)
    else:
        if set(path.name for path in destination.iterdir()) != set(expected):
            raise SystemExit("Unexpected or missing artifact")
        for name, value in expected.items():
            if (destination / name).read_bytes() != value:
                raise SystemExit(f"Reproduction mismatch: {name}")
    print(f"PASS: {len(expected)} reproducible artifacts; synthetic baseline imitation only")


if __name__ == "__main__":
    main()
