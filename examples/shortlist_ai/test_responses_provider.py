"""Responses wire-contract tests using injected transport; zero paid/model calls."""

import copy
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

import responses_provider as provider_module
import shortlist


TEST_CREDENTIAL = "synthetic-" + "test-credential"


class FakeTransport:
    def __init__(self, response: dict) -> None:
        self.response = response
        self.calls = []

    def __call__(self, body: bytes, api_key: str, timeout_seconds: int, max_response_bytes: int) -> bytes:
        self.calls.append((body, api_key, timeout_seconds, max_response_bytes))
        return json.dumps(self.response).encode()


class ResponsesTests(unittest.TestCase):
    def setUp(self) -> None:
        self.payload = shortlist.build_context(shortlist.FIXTURE, shortlist.CATALOG)
        self.request = shortlist.build_request(self.payload)
        self.answer = shortlist.fallback(self.payload)
        self.response = {"status": "completed", "model": "gpt-5-mini-2025-08-07",
                         "usage": {"input_tokens": 100, "output_tokens": 80, "total_tokens": 180},
                         "output": [{"type": "message", "role": "assistant", "status": "completed",
                                     "content": [{"type": "output_text", "text": json.dumps(self.answer)}]}]}

    def adapter(self, transport: FakeTransport) -> provider_module.ResponsesProvider:
        return provider_module.ResponsesProvider(api_key=TEST_CREDENTIAL, enabled=True,
            approval_reference="OFFLINE TEST ONLY", approved_request_sha256=provider_module.request_digest(self.request), transport=transport)

    def test_request_contract_and_observed_metadata(self) -> None:
        transport = FakeTransport(self.response)
        adapter = self.adapter(transport)
        result = shortlist.explain(shortlist.FIXTURE, shortlist.CATALOG, adapter)
        body, key, timeout, limit = transport.calls[0]
        decoded = json.loads(body)
        self.assertEqual(decoded["model"], "gpt-5-mini")
        self.assertFalse(decoded["store"])
        self.assertFalse(decoded["stream"])
        self.assertEqual(decoded["max_output_tokens"], 2048)
        self.assertTrue(decoded["text"]["format"]["strict"])
        self.assertEqual(decoded["text"]["format"]["schema"], shortlist.SCHEMA)
        self.assertEqual((timeout, limit), (25, 65536))
        self.assertEqual(result["source"], "mock")
        self.assertIsNone(result["model"])
        self.assertEqual(result["provider_metadata"]["configured_model"], "gpt-5-mini")
        self.assertEqual(result["provider_metadata"]["observed_model"], "gpt-5-mini-2025-08-07")
        self.assertNotIn(key, json.dumps(result))

    def test_default_gate_and_digest_mismatch_never_call_transport(self) -> None:
        transport = FakeTransport(self.response)
        closed = provider_module.ResponsesProvider(transport=transport)
        with self.assertRaises(PermissionError):
            closed.complete(self.request)
        adapter = self.adapter(transport)
        changed = copy.deepcopy(self.request)
        changed["input"] += "extra data"
        with self.assertRaises(PermissionError):
            adapter.complete(changed)
        self.assertEqual(transport.calls, [])

    def test_credentials_cannot_inject_headers(self) -> None:
        transport = FakeTransport(self.response)
        for key in ("", "bad\r\nInjected: value", "unicode-\N{SNOWMAN}", "x" * 513):
            adapter = provider_module.ResponsesProvider(api_key=key, enabled=True,
                approval_reference="OFFLINE TEST ONLY", approved_request_sha256=provider_module.request_digest(self.request), transport=transport)
            with self.subTest(length=len(key)), self.assertRaises(PermissionError):
                adapter.complete(self.request)
        self.assertEqual(transport.calls, [])

    def test_one_attempt_including_timeout_no_retry(self) -> None:
        def timeout_transport(body: bytes, api_key: str, timeout: int, limit: int) -> bytes:
            raise TimeoutError("sensitive provider detail")
        adapter = self.adapter(timeout_transport)
        result = shortlist.explain(shortlist.FIXTURE, shortlist.CATALOG, adapter)
        self.assertEqual(result["reason"], "provider-timeout")
        with self.assertRaises(PermissionError):
            adapter.complete(self.request)
        self.assertEqual(adapter.calls, 1)
        self.assertNotIn("sensitive provider detail", json.dumps(result))

    def test_refusal_incomplete_and_invalid_schema_fallback(self) -> None:
        cases = []
        refusal = copy.deepcopy(self.response)
        refusal["output"][0]["content"] = [{"type": "refusal", "refusal": "private text"}]
        cases.append((refusal, "refusal-or-incomplete"))
        incomplete = copy.deepcopy(self.response)
        incomplete["status"] = "incomplete"
        cases.append((incomplete, "refusal-or-incomplete"))
        invalid = copy.deepcopy(self.response)
        invalid["output"][0]["content"][0]["text"] = '{"lead": "incomplete schema"}'
        cases.append((invalid, "invalid-output"))
        unknown = copy.deepcopy(self.response)
        bad_answer = copy.deepcopy(self.answer)
        bad_answer["cited_product_ids"] = ["unknown"]
        unknown["output"][0]["content"][0]["text"] = json.dumps(bad_answer)
        cases.append((unknown, "invalid-output"))
        for response, reason in cases:
            with self.subTest(reason=reason):
                result = shortlist.explain(shortlist.FIXTURE, shortlist.CATALOG, self.adapter(FakeTransport(response)))
                self.assertEqual(result["source"], "fallback")
                self.assertEqual(result["reason"], reason)
                self.assertNotIn("private text", json.dumps(result))

    def test_malformed_oversized_and_tool_output_rejected(self) -> None:
        for raw in (b"{", b"x" * 65537, b"[]", b'{"status":"completed","output":[{"type":"function_call"}]}'):
            with self.subTest(length=len(raw)), self.assertRaises(ValueError):
                provider_module.translate_response(raw)
        changed = copy.deepcopy(self.request)
        changed["input"] = "x" * 65537
        with self.assertRaises(ValueError):
            provider_module.request_bytes(changed)

    def test_http_destination_proxy_and_redirect_boundaries(self) -> None:
        class FakeResponse(io.BytesIO):
            status = 302
        class FakeConnection:
            def __init__(self) -> None:
                self.request_args = None
                self.closed = False
            def request(self, method: str, path: str, body: bytes, headers: dict) -> None:
                self.request_args = (method, path, body, headers)
            def getresponse(self) -> FakeResponse:
                return FakeResponse(b"sensitive redirect payload")
            def close(self) -> None:
                self.closed = True
        connection = FakeConnection()
        with patch.dict(os.environ, {"HTTPS_PROXY": "https://invalid.example", "OPENAI_BASE_URL": "https://invalid.example"}), patch("responses_provider.http.client.HTTPSConnection", return_value=connection) as factory:
            with self.assertRaisesRegex(OSError, "provider-transport-error"):
                provider_module.https_transport(b"{}", "synthetic-credential", 25, 65536)
        self.assertEqual(factory.call_args.args, ("api.openai.com",))
        self.assertEqual(connection.request_args[:2], ("POST", "/v1/responses"))
        self.assertTrue(connection.closed)
        self.assertEqual(factory.call_count, 1)

    def test_http_body_bound_and_success(self) -> None:
        class Response(io.BytesIO):
            status = 200
        for raw, valid in ((b"{}", True), (b"x" * 20, False)):
            connection = unittest.mock.Mock()
            connection.getresponse.return_value = Response(raw)
            with patch("responses_provider.http.client.HTTPSConnection", return_value=connection):
                if valid:
                    self.assertEqual(provider_module.https_transport(b"{}", "synthetic", 25, 10), b"{}")
                else:
                    with self.assertRaises(ValueError):
                        provider_module.https_transport(b"{}", "synthetic", 25, 10)
            connection.close.assert_called_once()

    def test_preview_with_credentials_does_not_open_network(self) -> None:
        with patch.dict(os.environ, {"OPENAI_API_KEY": "synthetic-not-real"}), patch("socket.socket", side_effect=AssertionError("forbidden")), patch("socket.getaddrinfo", side_effect=AssertionError("DNS forbidden")), patch.object(sys, "argv", ["responses_provider.py"]), patch("sys.stdout", new_callable=io.StringIO) as output:
            provider_module.main()
        preview = json.loads(output.getvalue())
        self.assertEqual(preview["execution"], "NOT EXECUTED")
        self.assertEqual(preview["maximum_attempts"], 1)
        self.assertNotIn("synthetic-not-real", output.getvalue())

    def test_cli_execute_without_approval_stops_before_credentials(self) -> None:
        script = Path(provider_module.__file__).resolve()
        completed = subprocess.run([sys.executable, str(script), "--execute-approved"], capture_output=True, text=True)
        self.assertEqual(completed.returncode, 2)
        self.assertIn("exact approved request digest", completed.stderr)
        self.assertNotIn("Approved OpenAI API key", completed.stderr)


if __name__ == "__main__":
    unittest.main()
