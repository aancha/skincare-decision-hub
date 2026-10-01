#!/usr/bin/env python3
"""Independent stdlib MCP client: real subprocess transport, no server imports.

This is a small protocol client, not an SDK or a ChatGPT integration test.
It validates the advertised JSON Schema subset used by this example.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import selectors
import subprocess
import sys
import time
from pathlib import Path
from typing import Any


SUPPORTED_PROTOCOLS = {"2025-11-25"}
CLIENT_VERSION = "1.0.0"
MAX_RESPONSE_BYTES = 65536


def validate_schema(value: Any, schema: dict[str, Any]) -> None:
    """Client-side validation for this example's documented schema subset only."""
    if "const" in schema and (value != schema["const"] or type(value) is not type(schema["const"])):
        raise ValueError("Result does not match an advertised constant")
    kinds = schema.get("type", [])
    if isinstance(kinds, str):
        kinds = [kinds]
    matches = {
        "object": isinstance(value, dict), "array": isinstance(value, list),
        "string": isinstance(value, str), "boolean": type(value) is bool,
        "integer": type(value) is int, "number": type(value) in (int, float) and math.isfinite(value),
        "null": value is None,
    }
    if kinds and not any(matches.get(kind, False) for kind in kinds):
        raise ValueError("Result type does not match the advertised schema")
    if isinstance(value, dict):
        properties = schema.get("properties", {})
        if set(schema.get("required", [])) - set(value):
            raise ValueError("Required result fields are missing")
        if schema.get("additionalProperties") is False and set(value) - set(properties):
            raise ValueError("Unexpected result fields")
        for key, child in value.items():
            if key in properties:
                validate_schema(child, properties[key])
    if isinstance(value, list):
        if not schema.get("minItems", 0) <= len(value) <= schema.get("maxItems", 10000):
            raise ValueError("Result array size is out of bounds")
        for child in value:
            validate_schema(child, schema.get("items", {}))
    if type(value) in (int, float) and value < schema.get("minimum", float("-inf")):
        raise ValueError("Result number is out of bounds")


class MCPClient:
    def __init__(self, server: Path | None = None, timeout: float = 5.0):
        self.server = server or Path(__file__).resolve().with_name("server.py")
        self.timeout = timeout
        self.process: subprocess.Popen[bytes] | None = None
        self.selector = selectors.DefaultSelector()
        self.buffer = b""
        self.next_id = 1
        self.transcript: list[dict[str, Any]] = []
        self.tools: dict[str, dict[str, Any]] = {}

    def __enter__(self) -> MCPClient:
        # Deliberately do not copy os.environ: no provider key, home, proxy,
        # PYTHONPATH, private catalog path, or configuration reaches the child.
        self.process = subprocess.Popen(
            [sys.executable, "-E", "-s", "-B", str(self.server)],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            env={"PYTHONDONTWRITEBYTECODE": "1", "PYTHONIOENCODING": "utf-8"},
            cwd=str(self.server.parent), bufsize=0,
        )
        self.selector.register(self.process.stdout, selectors.EVENT_READ)
        return self

    def close(self) -> None:
        if self.process is not None:
            if self.process.stdin and not self.process.stdin.closed:
                self.process.stdin.close()
            try:
                self.process.wait(timeout=1)
            except subprocess.TimeoutExpired:
                self.process.terminate()
                try:
                    self.process.wait(timeout=1)
                except subprocess.TimeoutExpired:
                    self.process.kill()
                    self.process.wait(timeout=1)
            if self.process.stdout:
                self.process.stdout.close()
        self.selector.close()

    def __exit__(self, exception_type: Any, exception: Any, traceback: Any) -> None:
        self.close()

    def send(self, payload: dict[str, Any]) -> None:
        if self.process is None or self.process.stdin is None:
            raise RuntimeError("Start the local client before sending")
        frame = json.dumps(payload, ensure_ascii=True, allow_nan=False).encode("utf-8") + b"\n"
        if len(frame) > MAX_RESPONSE_BYTES:
            raise ValueError("Client request exceeds frame limit")
        self.process.stdin.write(frame)
        self.process.stdin.flush()
        self.transcript.append({"direction": "client->server", "message": payload})

    def request(self, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        request_id = self.next_id
        self.next_id += 1
        self.send({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params or {}})
        deadline = time.monotonic() + self.timeout
        while b"\n" not in self.buffer:
            remaining = deadline - time.monotonic()
            if remaining <= 0 or not self.selector.select(remaining):
                self.send({"jsonrpc": "2.0", "method": "notifications/cancelled",
                           "params": {"requestId": request_id, "reason": "Local client deadline exceeded"}})
                raise TimeoutError("Local MCP request deadline exceeded")
            chunk = os.read(self.process.stdout.fileno(), 4096)
            if not chunk:
                raise RuntimeError("Local MCP server closed the transport")
            self.buffer += chunk
            if len(self.buffer) > MAX_RESPONSE_BYTES:
                raise ValueError("Server response exceeds frame limit")
        frame, self.buffer = self.buffer.split(b"\n", 1)
        payload = json.loads(frame.decode("utf-8"))
        if not isinstance(payload, dict) or payload.get("jsonrpc") != "2.0" or payload.get("id") != request_id:
            raise ValueError("Invalid or mismatched MCP response")
        if ("result" in payload) == ("error" in payload):
            raise ValueError("Response must contain exactly one result or error")
        self.transcript.append({"direction": "server->client", "message": payload})
        return payload

    def initialize(self, proposed: str = "2025-11-25") -> dict[str, Any]:
        response = self.request("initialize", {"protocolVersion": proposed, "capabilities": {},
                                               "clientInfo": {"name": "skincare-stdlib-client", "version": CLIENT_VERSION}})
        negotiated = response.get("result", {})
        if negotiated.get("protocolVersion") not in SUPPORTED_PROTOCOLS:
            raise ValueError("The server selected an unsupported protocol version")
        if negotiated.get("capabilities") != {"tools": {"listChanged": False}}:
            raise ValueError("Server advertised unexpected capabilities")
        self.send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        return negotiated

    def discover(self) -> list[dict[str, Any]]:
        response = self.request("tools/list")
        found = response.get("result", {}).get("tools", [])
        if len(found) != 3 or {tool.get("name") for tool in found} != {"search_products", "get_product_detail", "compare_products"}:
            raise ValueError("Unexpected tool discovery result")
        self.tools = {tool["name"]: tool for tool in found}
        for tool in found:
            if tool.get("annotations") != {"readOnlyHint": True, "destructiveHint": False,
                                            "idempotentHint": True, "openWorldHint": False}:
                raise ValueError("Unexpected tool annotations")
            if not isinstance(tool.get("inputSchema"), dict) or not isinstance(tool.get("outputSchema"), dict):
                raise ValueError("Missing tool schema")
        return found

    def call(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        response = self.request("tools/call", {"name": name, "arguments": arguments})
        if "error" in response:
            return response
        output = response["result"]
        if output.get("isError"):
            return response
        if name not in self.tools:
            raise ValueError("Discover tools before validating results")
        validate_schema(output.get("structuredContent"), self.tools[name]["outputSchema"])
        if output.get("content") != [{"type": "text", "text": json.dumps(output["structuredContent"], ensure_ascii=True, allow_nan=False)}]:
            raise ValueError("Text and structured result disagree")
        return response


def run_demo() -> dict[str, Any]:
    with MCPClient() as client:
        initialized = client.initialize()
        found = client.discover()
        search = client.call("search_products", {"query": "dryness", "category": "moisturizer"})["result"]["structuredContent"]
        ids = [product["id"] for product in search["products"]]
        if len(ids) != 2:
            raise ValueError("Expected two fictional moisturizer matches")
        detail = client.call("get_product_detail", {"product_id": ids[0]})["result"]["structuredContent"]
        comparison = client.call("compare_products", {"product_ids": ids, "decision_goal": "Compare listed fixture prices"})["result"]["structuredContent"]
        invalid = client.call("search_products", {"query": "dryness", "limit": 99})
        unknown = client.call("export_private_data", {})
        guardrail = client.call("search_products", {"query": "severe burning after a peel"})["result"]["structuredContent"]
        hostile = client.call("get_product_detail", {"product_id": "fictional-hostile-text"})["result"]["structuredContent"]
        if not invalid["result"]["isError"] or unknown["error"]["code"] != -32602 or guardrail["products"]:
            raise ValueError("An expected failure boundary did not hold")
        if "SYNTHETIC_NONPUBLIC_FIELD_CANARY" in json.dumps(client.transcript):
            raise ValueError("A nonpublic fixture field escaped")
        return {
            "status": "PASS", "client": "skincare-stdlib-client", "client_version": CLIENT_VERSION,
            "sdk": "none (custom standard-library client and server)", "transport": "stdio",
            "protocol": initialized["protocolVersion"], "tools": [tool["name"] for tool in found],
            "search_ids": ids, "detail_id": detail["products"][0]["id"],
            "comparison": comparison["comparison"], "invalid_arguments": "tool-error",
            "unknown_tool": "protocol-error", "guardrail": "no products",
            "hostile_text": "returned as inert untrusted data; no extra tool authorized",
            "hostile_fixture_id": hostile["products"][0]["id"],
            "model_calls": 0, "external_network": "not used", "transcript": client.transcript,
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run a real local MCP discovery and invocation sequence")
    parser.add_argument("--transcript", action="store_true", help="Print actual JSON-RPC messages from this run")
    args = parser.parse_args()
    report = run_demo()
    if not args.transcript:
        del report["transcript"]
    print(json.dumps(report, indent=2, ensure_ascii=True, allow_nan=False))
