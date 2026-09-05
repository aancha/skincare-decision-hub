"""Exercise separately importable examples through fresh Python processes."""

import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENVIRONMENT = {"PYTHONDONTWRITEBYTECODE": "1", "PYTHONIOENCODING": "utf-8"}


class AIExampleIntegrationTests(unittest.TestCase):
    def test_shortlist_example_suite(self):
        self.run_suite("examples/shortlist_ai")

    def test_paired_evaluation_suite(self):
        self.run_suite("examples/evaluation")

    def test_mcp_example_suite(self):
        self.run_suite("examples/mcp/tests")

    def test_ml_reproduction_and_browser_suite(self):
        self.run_suite("examples/ml_ranking")

    def run_suite(self, directory):
        result = subprocess.run(
            [sys.executable, "-B", "-m", "unittest", "discover", "-s", directory, "-p", "test_*.py", "-v"],
            cwd=ROOT, env=ENVIRONMENT, capture_output=True, text=True, timeout=60,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("\nOK", result.stderr)

    def test_evaluation_offline_with_socket_and_dns_disabled(self):
        script = (
            "import socket, sys, json; "
            "sys.path.insert(0, 'examples/evaluation'); import evaluate; "
            "def_block = lambda *a, **k: (_ for _ in ()).throw(AssertionError('network attempted')); "
            "socket.socket = def_block; socket.create_connection = def_block; socket.getaddrinfo = def_block; "
            "print(json.dumps(evaluate.run('all')))"
        )
        result = subprocess.run([sys.executable, "-B", "-c", script], cwd=ROOT,
                                env=ENVIRONMENT, capture_output=True, text=True, timeout=30, check=True)
        report = json.loads(result.stdout)
        self.assertEqual(report["sampleCount"], 12)
        self.assertEqual(report["contractPassCount"], 12)
        self.assertIsNone(report["realModelMeasurements"]["latencyP95Ms"])


if __name__ == "__main__":
    unittest.main()
