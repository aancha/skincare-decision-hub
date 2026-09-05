# MCP architecture, contracts, and provenance

## How MCP relates to the product and GPT

The existing private MCP bridge exposes product operations to a host client. The client discovers tool schemas, supplies arguments, and receives a bounded result envelope. The website instead talks to its Python API. Both use the product's deterministic catalog/safety logic; the MCP tool handlers inspected here **do not invoke the website's GPT orchestrator**. A host such as ChatGPT may use its own model to choose a tool and explain its result; that is separate from a provider call inside the tool implementation.

This public example preserves a representative discovery → search → detail → comparison interaction, but substitutes an original four-product fixture and simpler deterministic logic. It is not the deployed MCP service, a production configuration, or a replica of every private handler.

## Existing private tool inventory: inspected implementation

Source names below are provenance identifiers, not files shipped in this public export. Inspected: `scripts/chatgpt_mcp_server.py`, `scripts/chatgpt_app_tools.py`, `scripts/chatgpt_product_context.py`, `scripts/chatgpt_safety.py`, `scripts/chatgpt_output_contract.py`, and the five `chatgpt-app/schemas/*.schema.json` files.

All five expose read-only product guidance. The shared optional profile inputs are `skin_type`, `sensitivity`, and `pregnancy_context`, each constrained by schema enums. All schemas declare `additionalProperties: false`. The bridge checks the argument object shape; individual handlers clean, bound, and validate fields. **Do not mistake a declared schema for a complete runtime JSON-Schema validator**: the original bridge does not centrally enforce every schema keyword.

| Existing advertised tool | Inputs | Data, outputs, validation, and effects |
|---|---|---|
| `search_products` | Required `query`; optional concerns, profile, avoid ingredients, category, nonnegative budget, retailer enum, limit 1–10 | Calls bounded product-context search; uses local product readers and generated fallback. Returns product summaries, best/safer/value IDs, cautions, missing-data and source context. Cleans query to 260 characters; applies safety before and after selection; bounded lists. No model, external fetch, or user-state write in this handler. |
| `get_product_detail` | Required `product_id`; optional profile and routine context | Local ID lookup, then bounded name resolution when needed; summary, ingredient/routine information and up to three alternatives. Missing product returns a safe envelope; red flags short-circuit. No model or user-state write. |
| `compare_products` | Required 2–4 `product_ids` and `decision_goal`; optional profile, budget, comparison-mode enum | Local lookup/resolution and deterministic comparison; best/safer/value IDs, product summaries, cautions and missing IDs. Requires at least two inputs and nonempty goal; safety gate before comparison. Does not buy, save, or fetch a retailer page. No model call. |
| `build_routine_preview` | Required `primary_goal`; optional profile, active-comfort enum, avoid ingredients, owned/selected IDs, budget | Local product context and routine-plan read/fallback functions; ordered preview, warnings, missing slots and source context. Bounds selected IDs and applies safety. A read-only preview, not a saved routine or cart; no model call. |
| `routine_ingredient_guidance` | Required `question`; optional profile and current products | Local product resolution and Learn article context with deterministic clarification/safety branches. Returns answer, cautions, references and required visible clarification fields. Unsupported-action/red-flag routing is enforced in code. No external search or provider call. The local alias `answer_skincare_question` is not a sixth advertised tool. |

The common original output schema requires `summary`, `recommendation`, `products`, `cautions`, `retailer_context`, `routine_context`, `missing_data`, `source_context`, and `next_actions`; optional visible-answer fields support the clarification widget. Errors are sanitized through `safe_error` and dispatcher exception handling. MCP packages text plus `structuredContent`; the private integration also advertises a clarification UI resource, which this example does not advertise or implement.

### Original access controls: important limits

The original bridge is custom standard-library HTTP JSON-RPC, not an SDK server. Its read-only annotations are supplemented by a fixed handler map and unsupported-action checks; no cart, save, account, checkout, or arbitrary-fetch handler is exposed. Product context uses local API/store readers with generated artifact fallbacks. It imports the larger private API module, which is why this example does not import that adapter directly.

The original integration has distinct internal and limited-public output contracts. Output projection/sanitization is **a data boundary, not evidence of authentication or authorization**. Private deployment configuration and its security assessment are excluded from this public example. Tool descriptions, an output mode, and historical Developer Mode tests must not be presented as hosted security approval or current app-directory approval. No original HTTP server or real ChatGPT connection was started in this workstream; hosted access controls require separate verification.

## Public example contracts and simplifications

| Public tool | Enforced input boundary | Output and behavior |
|---|---|---|
| `search_products` | Nonempty query ≤160 characters; optional category from three values; integer limit 1–4; no extra fields | Literal-token match on names/category/concerns/ingredients. Returns ≤4 projected fictional products in fixture order. No learned ranking or natural-language search claim. |
| `get_product_detail` | One bounded `fictional-*` ID already present in the fixture; no extra fields | One projected fictional product; no arbitrary path, URL, external ID, or private lookup. |
| `compare_products` | Two to four distinct bounded fictional IDs and nonempty decision goal ≤160 characters; no extra fields | Preserves requested order and identifies the minimum listed fixture price. The goal is guardrail-screened context, not a model instruction or medical recommendation. |

All successful results include `summary`, projected `products`, `cautions`, `comparison.lowest_listed_price_id`, and explicit synthetic/nonlive/no-model `source_context`. Full machine-readable input/output schemas are returned by `tools/list` and are defined beside their enforcement in [tool_logic.py](tool_logic.py). Invalid tool arguments produce `isError: true`; unknown tools and malformed requests produce JSON-RPC errors. Unexpected failures never return exception strings or private diagnostics.

Direct reuse: the existing public Python guardrail loader and its shared JSON rules. Adapted concepts: the original three tool names, required query/ID/goal shape, bounded result envelope, caution-first routing, positive field projection, sanitized failures. Newly written: stdio lifecycle/state machine, strict example argument validation, independent client, fictional fixture, and tests. The retrieval/ranking and output schema are intentionally smaller than the original; no claim of behavioral parity with the private product is made.

The existing website remains static and unchanged. This example adds no browser build step, production UI, server deployment, model credentials, hosted resources, or ranking authority.
