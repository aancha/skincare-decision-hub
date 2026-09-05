# Shortlist GPT engineering: offline vertical slice

This runnable **synthetic, mocked** example exposes the design of the product's GPT explanation pipeline. It does not call GPT, reproduce a recorded GPT answer, or establish model quality. The CLI has no network implementation and ignores environment credentials. Python 3.9+ and its standard library are sufficient; no installation, Node, or API key is needed.

From the public repository root:

```bash
python3 examples/shortlist_ai/shortlist.py
python3 examples/shortlist_ai/shortlist.py --scenario timeout
python3 examples/shortlist_ai/shortlist.py --scenario safety
python3 examples/shortlist_ai/shortlist.py --scenario fallback
python3 -m unittest discover -s examples/shortlist_ai -p 'test_*.py' -v
```

Expected JSON: normal has `source: mock`, two product citations and `model: null`; timeout has `source: fallback` and `reason: provider-timeout`; safety has `source: guardrail` and no provider call; fallback has `reason: provider-disabled`. All names, prices and questions are original fictional fixtures. Nothing changes ranking, saves a product, or modifies the main static app.

Additional scenarios: `missing`, `conflict`, `refusal`, `incomplete`, `error`, `invalid-schema`, `unknown-citation`. Add `--html` to print a standalone, mobile-friendly HTML rendering to stdout. Every dynamic string is escaped; no remote resources or scripts are permitted. This is a rendered explanation example, not a new shopper-facing application page.

## Follow the code

All entry points are in [shortlist.py](shortlist.py):

1. `build_context` resolves selected IDs against an in-memory catalog, rejects duplicate/conflicting records, projects an allowlist, and identifies missing IDs. It never trusts caller-provided instructions or unrelated fields.
2. `build_request` keeps context in a JSON data boundary and imports the shared prompt safety rules. The strict schema uses the original six answer sections and product citations.
3. `Provider` defines the explicit adapter seam. `MockProvider` is an in-process test double; its text is built from a deterministic template, not generated intelligence. The separate [Responses adapter](responses_provider.py) implements actual HTTP translation behind a default-closed execution gate; its wire contracts are tested with injected transport, not real calls.
4. `explain` calls the shared guardrails before any provider; incomplete context and provider failures use deterministic fallback. Raw provider errors are not returned.
5. `validate_answer` enforces exact fields, bounded strings, types, known/nonduplicate citations, and required citations for nonempty context.
6. `render_html` escapes answer and citation facts. Citations are product context, not medical sources or proof of efficacy.

Tests exercise success, empty/partial/conflicting context, invalid schema/citations, refusal/incomplete/error/timeout, pregnancy/prescription/allergy/red-flag/expectation short-circuits, hostile rendering, field minimization, finite prices, and credentials-present/no-socket execution.

## Relationship to the product implementation

This is a deliberately extracted/simplified engineering example, not the full deployed backend. At extraction, the private source files had these SHA-256 identities (content identities, not private Git history):

| Source | Relevant implementation | SHA-256 |
| --- | --- | --- |
| `scripts/ai_orchestrator.py` | `SHORTLIST_RESPONSE_SCHEMA`, `build_shortlist_prompt`, `_validate_shortlist_structured_answer`, `explain_shortlist_with_openai` | `cef5c075cd10e59226cccdcd9373ac8e694a5cb321c52d985fc6d412f96334ea` |
| `scripts/api_server.py` | `build_shortlist_explainer_context` | `e8717aa472f722dc7511ee11cf973076185875946e301392682d67b586e89f4b` |

The response field contract, allowlisted ID resolution, citation membership checks, safety-first ordering, and provider-to-fallback control flow are adapted from those paths. The live context additionally includes planner, trust, retailer-comparison and Learn signals; this example omits those services rather than inventing their evidence. It does not copy the private HTTP adapter, logs, infrastructure, datasets, review signals, or credentials.

Actual code reuse is through the public [shared guardrail module](../../scripts/skincare_guardrails.py), including `build_guardrailed_shortlist_answer` and `choose_conservative_product`, backed by [the canonical public taxonomy](../../web/skincare_guardrails.json). No new medical keyword lists or safety copy were created. Source hashes at extraction:

- Shared Python module: `188081ee6ae05bac88bed3a02b14322d6f0119a99e59a456d07835601f82e07c`.
- Shared taxonomy: `da0e1a93da5197c15192a32d664cad6a693a8d082b3e8a841c49f55a57db8b34`.

The simplified fallback uses shared conservative selection plus explicit product prices; it does not reproduce the private planner/scoring algorithm. Safety is keyword-based decision support, not comprehensive clinical triage. The original rule implementation can still miss unrecognized phrasing.

## Real-provider boundary and evidence limits

The separate [Responses adapter](responses_provider.py) implements the real request/response translation. It is **disabled by default and has not been exercised against OpenAI**. Injected transport automatically marks results `mock`, not `live-model`. A replay adapter must instead declare `recorded`. The run record must capture provider/model, prompt/schema version, sanitized request identity and measurement conditions. `model` identifies a successful live answer's observed model only; `provider_metadata` separates configured/observed model and token counts. Simulated counts in tests are not cost or performance evidence.

Safe approval preview (no network, no credential access):

```bash
python3 examples/shortlist_ai/responses_provider.py
```

The preview prints the exact synthetic body and its SHA-256. The configured model remains `gpt-5-mini`, matching the inspected application's default rather than introducing an upgrade. After separate explicit approval, the owner can run:

```bash
python3 examples/shortlist_ai/responses_provider.py --execute-approved --approved-request-sha256 APPROVED_DIGEST --approval-reference APPROVAL_REFERENCE
```

That execution path checks the exact digest/reference before prompting for a credential without echo. The key is held in memory, never read from environment automatically, printed, or written. The CLI can send only its built-in synthetic scenario; changing prompt/schema/context invalidates the digest. An approval reference is an operator acknowledgement, not an authentication mechanism or proof that permission was granted.

Hard-coded transport boundaries: fixed HTTPS host `api.openai.com` and `/v1/responses`, TLS verification, no proxy-environment use, redirects, custom endpoints, tools, streaming, or automatic retries. The adapter permits one attempted call per instance, including failed/timed-out attempts, with at most 2,048 output tokens, 65,536 request bytes and 65,536 response bytes. The 25-second timeout is a socket-operation timeout, not a guaranteed total wall-clock deadline. Re-running the CLI creates a new instance; the limit is not a persistent account-wide spending control. `store: false` disables response storage for retrieval; it does not guarantee zero provider retention under every account policy.

Any real execution needs explicit permission for provider/model, synthetic data transmitted, maximum calls/tokens/retries/cost, retention, and cleanup. The code does **not** enforce a dollar spending cap or exact input-token count. Approval must account for current pricing and available account-level controls; do not claim a hard dollar ceiling from these local limits. No paid calls were made for this example.

The [official Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) distinguishes structured responses from refusal/incomplete cases. The [Responses reference](https://developers.openai.com/api/reference/python/resources/responses/methods/create) and [GPT-5 Mini documentation](https://developers.openai.com/api/docs/models/gpt-5-mini) establish the API contract and supported model features used here. HTTP translation uses the Python standard library, not an OpenAI SDK. Offline injected-transport tests are not a verified live-provider integration. Runtime validation proves shape and citation membership only. It does **not** prove that prose is supported by cited facts, useful, safe, or better than fallback. `test_runtime_validation_does_not_prove_grounding` explicitly demonstrates this limitation. Real-model and human evaluation are separate, pending workstreams.
