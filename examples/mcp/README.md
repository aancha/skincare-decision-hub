# Bounded MCP tools: a runnable synthetic example

This example demonstrates **MCP discovery and tool invocation**, not GPT generation or an autonomous agent. A real independent Python client launches a separate server process, negotiates MCP, discovers three tools, and runs search → detail → comparison. Both implementations use the standard library; neither uses an MCP SDK.

Everything runs locally over **stdio**, with four original fictional products. No credentials, provider calls, production endpoint, private catalog, socket listener, saved state, or installation is required. It does not connect to ChatGPT.

## Run and verify

From the public repository root, with Python 3.9+:

```bash
python3 -B examples/mcp/client.py
python3 -B -m unittest discover -s examples/mcp/tests -v
```

The client starts and stops the server automatically. Expect `"status": "PASS"`, protocol `2025-11-25`, three tool names, two moisturizer IDs, and `fictional-light-lotion` as the lower **fictional listed price**. This is not a value-for-money or clinical judgment. The test command currently runs 13 tests. Both commands were verified with Python **3.9.6**.

For the actual messages exchanged by a new run:

```bash
python3 -B examples/mcp/client.py --transcript
```

The printed transcript is captured from real local subprocess communication. It is not a simulated ChatGPT conversation. A transcript copied into a document or recording is a replay, not a fresh live interaction.

To use another already-available local MCP stdio client, set its command to `python3`, arguments to `-E -s -B /absolute/path/to/examples/mcp/server.py`, and start with an empty environment. Do not connect an external client or ChatGPT without separate approval. This command alone waits for a client; it does not serve a web page.

## One end-to-end interaction

The provided client executes this sequence; IDs are resolved from search, not invented by the caller:

1. `initialize`: propose `2025-11-25`, empty client capabilities, client name/version.
2. Server returns that protocol and only `tools: {listChanged: false}`.
3. Client sends `notifications/initialized`, then `tools/list`.
4. `search_products({"query":"dryness","category":"moisturizer"})` returns Barrier Cream and Light Lotion.
5. `get_product_detail({"product_id":"fictional-barrier-cream"})` returns only approved fixture fields.
6. `compare_products({"product_ids":["fictional-barrier-cream","fictional-light-lotion"],"decision_goal":"Compare listed fixture prices"})` reports the lower listed price, without changing product ordering elsewhere.
7. An out-of-range limit returns a tool error; `export_private_data` returns a protocol error; a red-flag query returns canonical caution text and no products.
8. Client closes stdin and reaps the server. On a deadline it sends cancellation, stops waiting, and closes/terminates the child.

Protocol messages are newline-delimited UTF-8 JSON-RPC. Requests above 64 KiB close the session; tool execution is limited to 60 calls per process. Unsupported versions are negotiated to the server's supported version; a client must reject that choice if it cannot support it. The independent client validates response IDs, result envelopes, the advertised output-schema subset, and agreement between text and structured results.

## Code tour

- [tool_logic.py](tool_logic.py): exact tool/input allowlist, positive output projection, fixed fixture loading, canonical guardrail adapter, deterministic matching/price comparison.
- [server.py](server.py): lifecycle, capability advertisement, discovery, dispatch, frame/call bounds, protocol versus tool errors.
- [client.py](client.py): independent wire client, response validation, deadlines, explicit subprocess environment, and runnable demonstration.
- [test_mcp.py](tests/test_mcp.py): malformed arguments, unknown methods/tools, negotiated lifecycle, sanitized failures, red flags, hostile text, deadlines, and local interoperability.
- [restricted_server.py](tests/restricted_server.py): test-only Python audit hook rejecting sockets, subprocess creation, writes, and reads outside the example, public guardrail files, or Python standard library.

## Access and trust boundaries

Tool annotations describe behavior; **they do not grant or enforce permission**. Restrictions are enforced by the fixed dispatch map, explicit argument validation, fixture-only loader, field projection, and absence of write/network/provider handlers. No path, URL, SQL, shell, credential, environment variable, output-mode override, or arbitrary tool name is accepted as a data-source selector.

The client passes a small positive environment allowlist to the child, not its own provider keys or private configuration. The server never reads an environment credential. This is local process access, not user authentication or multi-tenant authorization. It is not intended to be hosted unchanged.

The hostile fixture description deliberately asks to read credentials and invoke a nonexistent tool. It remains **untrusted text data**; it cannot add tools or change dispatch. Unknown stored fields are omitted. The tests prove these server-side boundaries, not that every downstream model or UI resists prompt injection. This example renders no HTML; any consuming UI must use safe text rendering, not insert descriptions as HTML. No model consumes the hostile text in these tests.

Medical-pattern rules are not duplicated: the adapter imports the existing [public Python guardrails](../../scripts/skincare_guardrails.py), which loads [the shared taxonomy](../../web/skincare_guardrails.json). As a conservative simplification, any matched question guardrail returns no selections. This does not certify clinical safety or cover every possible unsafe question.

## Evidence status

| Category | Status and scope |
|---|---|
| Offline function/contract tests | Tested locally; fixture matching, projection, input validation, canonical cautions, error handling |
| Local MCP interoperability | Tested with `skincare-stdlib-client` **1.0.0**, separate server **1.0.0**, stdio, protocol **2025-11-25**; no SDK |
| Network/private-data boundary | Exercised under a Python audit-hook deny policy; this is not an OS sandbox or exhaustive security proof |
| Independent SDK/client conformance | Not established; no official MCP SDK is installed or required by this example |
| Hosted transport verification | Not performed; this example advertises no HTTP transport |
| Actual ChatGPT invocation | Not performed for this example; local tests do not establish ChatGPT integration |
| App-directory approval | Not established; this example is not a submission or approved app |

See [architecture, original tool inventory, and provenance](contracts-and-provenance.md) for the distinction from the existing private integration.

## Protocol references

The implementation follows the documented [MCP lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle), [stdio transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports), and [tool contracts](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) for the small capability subset advertised here. It does not claim complete protocol conformance. OpenAI's [submission checklist](https://developers.openai.com/plugins/deploy/submission#final-checklist) is a separate deployment/review requirement, not something a local run satisfies.
