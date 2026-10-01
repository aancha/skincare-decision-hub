"""Opt-in Responses adapter. Importing this module never opens a connection."""

from __future__ import annotations

import argparse
import getpass
import hashlib
import http.client
import json
import re
import ssl
from threading import Lock
from typing import Protocol

from shortlist import CATALOG, FIXTURE, build_context, build_request, explain


MODEL = "gpt-5-mini"
HOST = "api.openai.com"
PATH = "/v1/responses"
MAX_REQUEST_BYTES = 65536
MAX_RESPONSE_BYTES = 65536
MAX_OUTPUT_TOKENS = 2048
TIMEOUT_SECONDS = 25


class Transport(Protocol):
    def __call__(self, body: bytes, api_key: str, timeout_seconds: int, max_response_bytes: int) -> bytes:
        """A single request; no retries. The injected implementation is test-only."""


def request_bytes(request: dict) -> bytes:
    """Bind approved input and schema to immutable provider limits/settings."""
    if not isinstance(request, dict) or set(request) != {"instructions", "input", "text"}:
        raise ValueError("invalid-request")
    body = {**request, "model": MODEL, "store": False, "stream": False,
            "max_output_tokens": MAX_OUTPUT_TOKENS, "reasoning": {"effort": "minimal"}}
    encoded = json.dumps(body, ensure_ascii=True, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")
    if len(encoded) > MAX_REQUEST_BYTES:
        raise ValueError("request-too-large")
    return encoded


def request_digest(request: dict) -> str:
    return hashlib.sha256(request_bytes(request)).hexdigest()


def https_transport(body: bytes, api_key: str, timeout_seconds: int, max_response_bytes: int) -> bytes:
    """Direct HTTPS: system trust, fixed host/path, no redirects or proxy environment."""
    connection = http.client.HTTPSConnection(HOST, timeout=timeout_seconds, context=ssl.create_default_context())
    try:
        connection.request("POST", PATH, body=body, headers={
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json", "Accept": "application/json",
        })
        response = connection.getresponse()
        if response.status != 200:
            # Never read or disclose an error body; do not follow redirects.
            raise OSError("provider-http-error")
        raw = response.read(max_response_bytes + 1)
        if len(raw) > max_response_bytes:
            raise ValueError("response-too-large")
        return raw
    except TimeoutError:
        raise TimeoutError("provider-timeout") from None
    except (OSError, http.client.HTTPException):
        raise OSError("provider-transport-error") from None
    finally:
        connection.close()


def translate_response(raw: bytes) -> dict:
    """Consume only assistant output text; never execute tools or expose raw errors."""
    if not isinstance(raw, bytes) or len(raw) > MAX_RESPONSE_BYTES:
        raise ValueError("invalid-response-size")
    try:
        response = json.loads(raw)
    except (ValueError, UnicodeError):
        raise ValueError("invalid-provider-json") from None
    if not isinstance(response, dict):
        raise ValueError("invalid-provider-response")
    observed = response.get("model")
    metadata = {
        "configured_model": MODEL,
        "observed_model": observed if isinstance(observed, str) and re.fullmatch(r"gpt-[A-Za-z0-9._-]{1,80}", observed) else None,
        "usage": None,
    }
    usage = response.get("usage")
    if isinstance(usage, dict):
        counts = {key: usage.get(key) for key in ("input_tokens", "output_tokens", "total_tokens")}
        if all(type(v) is int and 0 <= v <= 10000000 for v in counts.values()):
            metadata["usage"] = counts
    if response.get("status") != "completed":
        return {"status": "incomplete", "metadata": metadata}
    output = response.get("output")
    if not isinstance(output, list):
        raise ValueError("invalid-provider-output")
    texts = []
    for item in output:
        if not isinstance(item, dict):
            raise ValueError("invalid-provider-item")
        if item.get("type") == "reasoning":
            continue
        if item.get("type") != "message" or item.get("role") != "assistant" or item.get("status") != "completed":
            raise ValueError("unexpected-provider-item")
        content = item.get("content")
        if not isinstance(content, list):
            raise ValueError("invalid-provider-content")
        for part in content:
            if not isinstance(part, dict):
                raise ValueError("invalid-provider-content")
            if part.get("type") == "refusal":
                return {"status": "refusal", "metadata": metadata}
            if part.get("type") != "output_text" or not isinstance(part.get("text"), str):
                raise ValueError("unexpected-provider-content")
            texts.append(part["text"])
    if len(texts) != 1:
        raise ValueError("expected-single-answer")
    try:
        answer = json.loads(texts[0])
    except ValueError:
        raise ValueError("invalid-answer-json") from None
    return {"status": "completed", "answer": answer, "metadata": metadata}


class ResponsesProvider:
    """One attempt per instance, exact request approval, no retry or dollar-cap claim."""

    configured_model = MODEL

    def __init__(self, *, api_key: str = "", enabled: bool = False,
                 approved_request_sha256: str = "", approval_reference: str = "",
                 transport: Transport | None = None) -> None:
        self.evidence_label = "mock" if transport is not None else "live-model"
        self._transport = transport if transport is not None else https_transport
        self._key = api_key
        self._enabled = enabled is True
        self._approved_digest = approved_request_sha256
        self._approval_reference = approval_reference
        self._lock = Lock()
        self.calls = 0

    def complete(self, request: dict) -> dict:
        if not self._enabled or not self._approval_reference.strip():
            raise PermissionError("real-provider-approval-required")
        if not isinstance(self._key, str) or not 1 <= len(self._key) <= 512 or any(not 33 <= ord(c) <= 126 for c in self._key):
            raise PermissionError("valid-provider-credential-required")
        body = request_bytes(request)
        if not re.fullmatch(r"[0-9a-f]{64}", self._approved_digest) or hashlib.sha256(body).hexdigest() != self._approved_digest:
            raise PermissionError("approved-request-mismatch")
        with self._lock:
            if self.calls >= 1:
                raise PermissionError("single-attempt-limit")
            # A timeout still consumes the allowance; the provider may have processed it.
            self.calls += 1
        try:
            raw = self._transport(body, self._key, TIMEOUT_SECONDS, MAX_RESPONSE_BYTES)
        except TimeoutError:
            raise TimeoutError("provider-timeout") from None
        except (OSError, http.client.HTTPException):
            raise OSError("provider-error") from None
        return translate_response(raw)


def main() -> None:
    parser = argparse.ArgumentParser(description="Default: print approval preview, never contact a provider.")
    parser.add_argument("--execute-approved", action="store_true")
    parser.add_argument("--approved-request-sha256", default="")
    parser.add_argument("--approval-reference", default="")
    args = parser.parse_args()
    request = build_request(build_context(FIXTURE, CATALOG))
    digest = request_digest(request)
    if not args.execute_approved:
        print(json.dumps({"execution": "NOT EXECUTED", "destination": "https://" + HOST + PATH,
                          "request_sha256": digest, "maximum_attempts": 1, "retries": 0,
                          "timeout_seconds": TIMEOUT_SECONDS, "maximum_response_bytes": MAX_RESPONSE_BYTES,
                          "spending_cap": "Not enforced; separate approval required before execution",
                          "request": json.loads(request_bytes(request))}, indent=2))
        return
    if args.approved_request_sha256 != digest or not args.approval_reference.strip():
        parser.error("exact approved request digest and approval reference required")
    key = getpass.getpass("Approved OpenAI API key (not stored): ")
    provider = ResponsesProvider(api_key=key, enabled=True, approved_request_sha256=digest,
                                 approval_reference=args.approval_reference)
    print(json.dumps(explain(FIXTURE, CATALOG, provider), indent=2))


if __name__ == "__main__":
    main()
