import copy
import json
import math
import subprocess
import sys
import unittest

import pipeline


class SyntheticRankingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.files = pipeline.build()
        cls.dataset = json.loads(cls.files["dataset.json"])
        cls.split = json.loads(cls.files["split.json"])
        cls.model = json.loads(cls.files["model.json"])
        cls.query = json.loads(cls.files["parity.json"])["cases"][0]["query"]

    def test_reproducible_bytes_and_exported_manifest(self):
        self.assertEqual(self.files, pipeline.build())
        manifest = json.loads(self.files["manifest.json"])
        self.assertEqual(set(manifest["sha256"]), set(self.files) - {"manifest.json"})
        for name, expected in manifest["sha256"].items():
            self.assertEqual(pipeline.digest(self.files[name]), expected)
            self.assertEqual((pipeline.ROOT / "artifacts" / name).read_bytes(), self.files[name])

    def test_versioned_design_and_model_are_frozen(self):
        expected = {
            "design.json": "c3fde048a4648d75be7439ca7e6bd0fabdf19ae4fdac0f901f8943e9c83a436b",
            "model.json": "e77510d2a92a671f3beef6aa639f843373facec4571500b826ac603865c6adaa",
        }
        for name, sha256 in expected.items():
            self.assertEqual(pipeline.digest(self.files[name]), sha256,
                             "Do not tune the frozen final set; a new study needs a new version and fresh families")

    def test_float_accumulation_matches_browser_and_frozen_parity(self):
        # Builtin sum changes this cancellation result in Python 3.12; inference
        # deliberately preserves the original left-to-right browser semantics.
        self.assertEqual(pipeline.score([1e16, 1.0, -1e16], [1.0, 1.0, 1.0]), 0.0)
        self.assertEqual(pipeline.digest(self.files["parity.json"]),
                         "c1efe5b73baf7c862438f70b6ca354807e215292b5da1c27521a6c40408ca1c2")

    def test_group_and_product_families_do_not_leak(self):
        groups = {}
        products = {}
        for name in ("train", "development", "final"):
            queries = [query for query in self.dataset["queries"] if query["split"] == name]
            groups[name] = {query["queryFamily"] for query in queries}
            products[name] = {candidate["productFamily"] for query in queries for candidate in query["candidates"]}
            self.assertEqual(len(groups[name]), pipeline.DESIGN["splitCounts"][name])
        for left, right in (("train", "development"), ("train", "final"), ("development", "final")):
            self.assertFalse(groups[left] & groups[right])
            self.assertFalse(products[left] & products[right])

    def test_product_family_leakage_is_rejected(self):
        bad = copy.deepcopy(self.dataset)
        train = next(query for query in bad["queries"] if query["split"] == "train")
        final = next(query for query in bad["queries"] if query["split"] == "final")
        final["candidates"][0]["productFamily"] = train["candidates"][0]["productFamily"]
        with self.assertRaisesRegex(ValueError, "product-family leakage"):
            pipeline.validate_split(bad, self.split)

    def test_training_is_actual_optimization_of_train_only(self):
        train = [query for query in self.dataset["queries"] if query["split"] == "train"]
        weights = pipeline.train(train)
        self.assertEqual(weights, self.model["weights"])
        self.assertNotEqual(weights, pipeline.TEACHER_WEIGHTS)
        self.assertGreater(sum(value * value for value in weights), 0)
        self.assertGreater(pipeline.metrics(train, weights)["pairwiseTeacherAgreement"], 0.5)
        with self.assertRaisesRegex(ValueError, "training split only"):
            pipeline.train(self.dataset["queries"])
        with self.assertRaises(ValueError):
            pipeline.train([])

    def test_heldout_changes_cannot_select_weights(self):
        changed = copy.deepcopy(self.dataset)
        for query in changed["queries"]:
            if query["split"] != "train":
                for candidate in query["candidates"]:
                    candidate["features"] = [0.0] * len(pipeline.FEATURES)
        weights = pipeline.train([query for query in changed["queries"] if query["split"] == "train"])
        self.assertEqual(weights, self.model["weights"])

    def test_report_is_imitation_not_quality(self):
        report = json.loads(self.files["report.json"])
        self.assertEqual(report["evidence"], "synthetic baseline imitation only")
        self.assertIn("not human preference", report["labelSource"])
        for split in report["splits"].values():
            self.assertEqual(split["teacherBaseline"]["pairwiseTeacherAgreement"], 1)
            self.assertEqual(split["teacherBaseline"]["topChoiceTeacherAgreement"], 1)
            self.assertLessEqual(split["learned"]["pairwiseTeacherAgreement"], 1)

    def test_invalid_artifacts_fail_closed(self):
        invalid = [None, [], {}, {**self.model, "version": "drift"},
                   {**self.model, "weights": [math.inf, 0, 0, 0, 0]},
                   {**self.model, "weights": [True, 0, 0, 0, 0]},
                   {**self.model, "featureOrder": list(reversed(pipeline.FEATURES))},
                   {**self.model, "trainingHashes": {}},
                   {**self.model, "policy": {**self.model["policy"], "authoritative": True}},
                   {**self.model, "policy": {**self.model["policy"], "authoritative": 0}},
                   {**self.model, "extra": "not allowed"}]
        for artifact in invalid:
            with self.subTest(artifact=artifact):
                result = pipeline.infer(self.query, artifact)
                self.assertFalse(result["controlled"])
                self.assertEqual(result["reason"], "invalid-artifact")
                self.assertEqual(result["order"], [candidate["id"] for candidate in self.query["candidates"]])

    def test_out_of_scope_and_malformed_input_fail_closed(self):
        self.assertEqual(pipeline.infer({**self.query, "scope": "medical"}, self.model)["reason"], "out-of-scope")
        self.assertEqual(pipeline.infer(None, self.model)["reason"], "out-of-scope")
        for value in (math.nan, math.inf, True, -0.1, 1.1, "1"):
            bad = copy.deepcopy(self.query)
            bad["candidates"][0]["features"][0] = value
            self.assertEqual(pipeline.infer(bad, self.model)["reason"], "invalid-input")
        bad = copy.deepcopy(self.query)
        bad["candidates"][1]["id"] = bad["candidates"][0]["id"]
        self.assertEqual(pipeline.infer(bad, self.model)["reason"], "invalid-input")

    def test_parity_contract_bounded_movement_and_no_mutation(self):
        fixture = json.loads(self.files["parity.json"])
        before = copy.deepcopy(fixture)
        for case in fixture["cases"]:
            result = pipeline.infer(case["query"], self.model)
            self.assertEqual(result, case["expected"])
            if result["controlled"]:
                order = [product["id"] for product in case["query"]["candidates"]]
                self.assertEqual(set(order), set(result["order"]))
                self.assertTrue(all(abs(order.index(identifier) - index) <= 2 for index, identifier in enumerate(result["order"])))
        self.assertEqual(fixture, before)

    def test_exact_ties_preserve_input_order(self):
        query = copy.deepcopy(self.query)
        for candidate in query["candidates"]:
            candidate["features"] = [0.0] * len(pipeline.FEATURES)
        self.assertEqual(pipeline.infer(query, self.model)["order"], [candidate["id"] for candidate in query["candidates"]])

    def test_verify_cli_runs_without_private_context(self):
        result = subprocess.run([sys.executable, str(pipeline.ROOT / "pipeline.py"), "verify"],
                                cwd=pipeline.ROOT, capture_output=True, text=True, check=True)
        self.assertIn("PASS: 7 reproducible artifacts", result.stdout)


if __name__ == "__main__":
    unittest.main()
