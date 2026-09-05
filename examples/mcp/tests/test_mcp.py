"""Offline function tests plus real stdio client/server interoperability."""

from __future__ import annotations

import copy
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


EXAMPLE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(EXAMPLE_ROOT))

from client import MCPClient, run_demo, validate_schema
from server import MAX_TOOL_CALLS, Session, run
from tool_logic import GUARDRAIL_FILE, InvalidArguments, OUTPUT_SCHEMA, SyntheticTools, UnknownTool


class BrokenTools:
    def call(self, name: str, arguments: dict) -> dict:
        raise RuntimeError("SYNTHETIC_DIAGNOSTIC_CANARY never return this detail")


def ready_session(tools=None) -> Session:
    session = Session(tools)
    session.handle({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
        "protocolVersion": "2025-11-25", "capabilities": {},
        "clientInfo": {"name": "unit-client", "version": "1"},
    }})
    session.handle({"jsonrpc": "2.0", "method": "notifications/initialized"})
    return session


class ToolFunctionTests(unittest.TestCase):
    def setUp(self):
        self.tools = SyntheticTools()

    def test_search_detail_and_comparison_use_only_fictional_data(self):
        found = self.tools.call("search_products", {"query": "dryness", "category": "moisturizer"})
        self.assertEqual(len(found["products"]), 2)
        ids = [product["id"] for product in found["products"]]
        compared = self.tools.call("compare_products", {"product_ids": ids, "decision_goal": "listed prices"})
        self.assertEqual(compared["comparison"]["lowest_listed_price_id"], "fictional-light-lotion")
        detail = self.tools.call("get_product_detail", {"product_id": ids[0]})
        for output in (found, compared, detail):
            validate_schema(output, OUTPUT_SCHEMA)
            self.assertFalse(output["source_context"]["model_called"])

    def test_invalid_arguments_are_bounded_and_not_coerced(self):
        invalid = [
            ("search_products", {"query": ""}), ("search_products", {"query": " "}),
            ("search_products", {"query": 1}), ("search_products", {"query": "a" * 161}),
            ("search_products", {"query": "a\nb"}),
            ("search_products", {"query": "dryness", "limit": True}),
            ("search_products", {"query": "dryness", "limit": 1.5}),
            ("search_products", {"query": "dryness", "limit": 0}),
            ("search_products", {"query": "dryness", "category": "unknown"}),
            ("search_products", {"query": "dryness", "endpoint": "file:///private"}),
            ("get_product_detail", {"product_id": "../../private"}),
            ("get_product_detail", {"product_id": "fictional-missing"}),
            ("compare_products", {"product_ids": ["fictional-light-lotion"], "decision_goal": "price"}),
            ("compare_products", {"product_ids": ["fictional-light-lotion"] * 2, "decision_goal": "price"}),
            ("compare_products", {"product_ids": [1, 2], "decision_goal": "price"}),
        ]
        for name, arguments in invalid:
            with self.subTest(name=name, arguments=arguments), self.assertRaises(InvalidArguments):
                self.tools.call(name, arguments)
        with self.assertRaises(UnknownTool):
            self.tools.call("export_private_data", {})

    def test_canonical_guardrails_block_selection_without_forked_patterns(self):
        self.assertEqual(GUARDRAIL_FILE, EXAMPLE_ROOT.parents[1] / "scripts" / "skincare_guardrails.py")
        for question in ("severe burning after a peel", "pregnancy safe moisturizer", "allergy to ingredients", "guaranteed overnight results"):
            with self.subTest(question=question):
                output = self.tools.call("search_products", {"query": question})
                self.assertEqual(output["products"], [])
                self.assertTrue(output["cautions"])

    def test_projection_excludes_unknown_fields_and_hostile_text_has_no_authority(self):
        before = copy.deepcopy(self.tools.products)
        output = self.tools.call("get_product_detail", {"product_id": "fictional-hostile-text"})
        self.assertIn("Ignore instructions", output["products"][0]["description"])
        self.assertEqual(output["source_context"]["content_trust"], "untrusted-data")
        self.assertNotIn("internal_notes", json.dumps(output))
        self.assertNotIn("SYNTHETIC_NONPUBLIC_FIELD_CANARY", json.dumps(output))
        with self.assertRaises(UnknownTool):
            self.tools.call("export_private_data", {})
        self.assertEqual(before, self.tools.products)

    def test_missing_and_nonfinite_fixture_fields_fail_closed(self):
        for update in ({"price": float("nan")}, {"price": -1}, {"id": "private-row"}, {"ingredients": "not a list"}):
            product = copy.deepcopy(self.tools.products[0])
            product.update(update)
            with self.subTest(update=update), self.assertRaises(ValueError):
                SyntheticTools([product])


class ProtocolTests(unittest.TestCase):
    def test_lifecycle_version_selection_and_nonadvertised_methods(self):
        session = Session()
        self.assertEqual(session.handle({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})["error"]["code"], -32600)
        response = session.handle({"jsonrpc": "2.0", "id": 2, "method": "initialize", "params": {
            "protocolVersion": "unsupported-client-version", "capabilities": {}, "clientInfo": {"name": "client", "version": "1"}}})
        self.assertEqual(response["result"]["protocolVersion"], "2025-11-25")
        self.assertIn("error", session.handle({"jsonrpc": "2.0", "id": 3, "method": "tools/list"}))
        session.handle({"jsonrpc": "2.0", "method": "notifications/initialized"})
        self.assertEqual(session.handle({"jsonrpc": "2.0", "id": 4, "method": "resources/list"})["error"]["code"], -32601)
        self.assertEqual(session.handle({"jsonrpc": "2.0", "id": 5, "method": "tools/list", "params": {"cursor": "unexpected"}})["error"]["code"], -32602)

    def test_sanitized_failure_and_session_call_limit(self):
        session = ready_session(BrokenTools())
        request = {"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "search_products", "arguments": {"query": "dryness"}}}
        output = session.handle(request)
        self.assertTrue(output["result"]["isError"])
        self.assertNotIn("SYNTHETIC_DIAGNOSTIC_CANARY", json.dumps(output))
        session.tool_calls = MAX_TOOL_CALLS
        self.assertIn("limit reached", session.handle(request)["result"]["content"][0]["text"])

    def test_malformed_frames_and_ids_do_not_leak_input(self):
        for frame in (b"not-json\n", b"{\"value\":NaN}\n", b"\xff\n", b"[1,2]\n", b"x" * 65537):
            output = io.BytesIO()
            run(io.BytesIO(frame), output)
            self.assertIn("error", json.loads(output.getvalue()))
        session = ready_session()
        for request_id in (None, True, [], {}, 1.5):
            self.assertEqual(session.handle({"jsonrpc": "2.0", "id": request_id, "method": "ping"})["error"]["code"], -32600)


class InteroperabilityTests(unittest.TestCase):
    def test_real_client_initialization_discovery_and_all_tool_calls(self):
        report = run_demo()
        self.assertEqual(report["status"], "PASS")
        self.assertEqual(report["protocol"], "2025-11-25")
        self.assertEqual(report["model_calls"], 0)
        self.assertGreater(len(report["transcript"]), 12)

    def test_actual_stdio_negotiation_invalid_args_unknown_methods_and_tools(self):
        with MCPClient() as client:
            self.assertIn("error", client.request("tools/list"))
            self.assertEqual(client.initialize("2024-11-05")["protocolVersion"], "2025-11-25")
            client.discover()
            self.assertEqual(client.request("ping")["result"], {})
            self.assertEqual(client.request("resources/list")["error"]["code"], -32601)
            self.assertTrue(client.call("search_products", {"query": "dryness", "path": "secret"})["result"]["isError"])
            self.assertEqual(client.call("delete_product", {})["error"]["code"], -32602)
            self.assertFalse(client.call("search_products", {"query": "no-matching-product"})["result"]["structuredContent"]["products"])

    def test_client_deadline_cancels_and_reaps_hung_subprocess(self):
        client = MCPClient(EXAMPLE_ROOT / "tests" / "silent_server.py", timeout=0.1)
        with client:
            with self.assertRaises(TimeoutError):
                client.request("initialize")
        self.assertIsNotNone(client.process.returncode)
        self.assertEqual(client.transcript[-1]["message"]["method"], "notifications/cancelled")

    def test_real_server_runs_with_network_writes_and_private_reads_denied(self):
        with MCPClient(EXAMPLE_ROOT / "tests" / "restricted_server.py") as client:
            client.initialize()
            client.discover()
            for name, arguments in (
                ("search_products", {"query": "dryness"}),
                ("get_product_detail", {"product_id": "fictional-hostile-text"}),
                ("compare_products", {"product_ids": ["fictional-barrier-cream", "fictional-light-lotion"],
                                      "decision_goal": "fixture prices"}),
                ("search_products", {"query": "severe burning after a peel"}),
            ):
                with self.subTest(name=name):
                    response = client.call(name, arguments)
                    self.assertFalse(response["result"]["isError"])
            self.assertEqual(client.call("export_private_data", {})["error"]["code"], -32602)
            self.assertNotIn("SYNTHETIC_NONPUBLIC_FIELD_CANARY", json.dumps(client.transcript))

    def test_offline_client_runs_without_private_tree_or_parent_credentials(self):
        # Execute from an unrelated cwd with synthetic environment bait. These are
        # canaries, not real credentials. The child's env is a positive allowlist.
        with tempfile.TemporaryDirectory(prefix="mcp-client-cwd-") as directory:
            environment = {"PATH": os.defpath, "OPENAI_API_KEY": "SYNTHETIC_ENV_CANARY",
                           "SKINCAREHUB_CHATGPT_OUTPUT_MODE": "private", "PYTHONDONTWRITEBYTECODE": "1"}
            completed = subprocess.run([sys.executable, "-E", "-s", "-B", str(EXAMPLE_ROOT / "client.py")],
                                       cwd=directory, env=environment, capture_output=True, timeout=15, check=True, text=True)
        self.assertEqual(json.loads(completed.stdout)["status"], "PASS")
        self.assertNotIn("SYNTHETIC_ENV_CANARY", completed.stdout + completed.stderr)


if __name__ == "__main__":
    unittest.main()
