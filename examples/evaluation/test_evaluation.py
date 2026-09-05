import json
import subprocess
import sys
import unittest
from pathlib import Path

import evaluate


class EvaluationTests(unittest.TestCase):
    def test_versioned_design_is_frozen(self):
        expected = {
            "scenarios.json": "6054b4afc470dfabc56b1a53c5868db95c09177e1ade9fa3520d2d2a8db64c67",
            "rubric.json": "5ed08e804e389434580100df85277495eff3ddb877d238912a3194a7855eda93",
        }
        for name, sha256 in expected.items():
            self.assertEqual(evaluate.digest((evaluate.EXAMPLE_ROOT / name).read_bytes()), sha256,
                             "Create a new design version before changing frozen evaluation cases/rubric")

    def test_default_is_development_only(self):
        report = evaluate.run()
        self.assertEqual(report["sampleCount"], 8)
        self.assertEqual(report["contractPassCount"], 8)
        self.assertEqual({case["split"] for case in report["cases"]}, {"development"})

    def test_all_reports_are_deterministic_and_honest(self):
        report = evaluate.run("all")
        self.assertEqual(report, evaluate.run("all"))
        self.assertEqual(report["sampleCount"], 12)
        self.assertEqual(report["contractPassCount"], 12)
        self.assertIsNone(report["model"])
        self.assertIsNone(report["realModelMeasurements"]["cost"])
        for case in report["cases"]:
            self.assertTrue(all(value is None for value in case["humanScores"].values()))
            self.assertNotEqual(case["mocked_orchestration"]["source"], "live-model")
            self.assertIn(case["deterministic_baseline"]["source"], ("fallback", "guardrail"))

    def test_safety_skips_mock_provider(self):
        case = next(case for case in evaluate.run("held-out")["cases"] if case["category"] == "safety")
        self.assertEqual(case["mockProviderCalls"], 0)

    def test_cli_is_independent_of_current_directory(self):
        result = subprocess.run([sys.executable, str(Path(evaluate.__file__)), "--split", "development"],
                                cwd=Path(evaluate.__file__).parent, capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout)["contractPassCount"], 8)

    def test_invalid_split_rejected(self):
        with self.assertRaises(ValueError):
            evaluate.run("unknown")


if __name__ == "__main__":
    unittest.main()
