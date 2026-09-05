# Evidence and reproducibility

Every headline claim is labeled by evidence type: publicly reproducible, publicly inspectable, or documented from private artifacts that are deliberately excluded.

## AI evidence status

Do not collapse these six statuses into a single “working AI” claim. This table distinguishes inspected private implementation, historical evidence and published synthetic examples. [PR #1](https://github.com/aancha/skincare-decision-hub/pull/1) merged as `07bd8dd78641cb56064921f5fb12b647a9aebbd1`; its anonymous main clone passed 24 top-level tests, 50 guardrail cases and 25 syntax checks. [Post-merge CI](https://github.com/aancha/skincare-decision-hub/actions/runs/33934888489) passed. These results describe that commit, not unverified future changes.

| Capability | Implemented | Tested offline | Real model exercised | Deployed | Publicly reproducible | Independently evaluated |
|---|---|---|---|---|---|---|
| Four GPT explanation surfaces | Inspected private implementation; synthetic Shortlist extraction | Local pipeline and injected Responses-transport tests pass | No provider call made by this audit | Historical application records; current model path not reverified | Published synthetic Shortlist example runnable offline | Fresh agents reproduced offline behavior; human usefulness pending |
| MCP product tools | Inspected custom private bridge; synthetic three-tool subset | Local tests and separate stdio client pass | Tool invocation is not model evidence | Historical bridge records; current hosted transport not reverified | Published local server/client runnable offline | Fresh agents reproduced client/tests; independent SDK conformance pending |
| Learned ranking | Historical experiment; separate synthetic logistic pipeline | Synthetic training/export/50-case Python-JS parity tested | Not a GPT model | Existing bounded live comparison rechecked; no ranking authority | Published synthetic teacher-imitation example runnable | Two fresh agents understood limits; one reran artifact verification; no independent real-user quality study |
| Deterministic safety | Shared Python/JavaScript implementation | Public fixed 50-case suite | Not applicable | Historical product baseline | Yes, using checked-in synthetic fixtures | Agent review and anonymous-clone regression; no human/clinical claim |

The API code default is `gpt-5-mini`; environment configuration can change the four surface models. A default does not prove a live response used that model. GPT output validity, factual support and usefulness require different checks. Local MCP interoperability does not prove hosted ChatGPT integration or app-directory approval.

## Reproduce the new local AI evidence

From the repository root with Python 3.9+, no dependencies or credentials:

```bash
python3 -B -m unittest discover -s examples/shortlist_ai -p 'test_*.py' -v
python3 -B examples/mcp/client.py
python3 -B -m unittest discover -s examples/mcp/tests -v
python3 -B examples/evaluation/evaluate.py
python3 -B -m unittest discover -s examples/evaluation -p 'test_*.py' -v
```

The [Shortlist example](../../examples/shortlist_ai/README.md) covers context projection, strict output validation, citations, escaped rendering, provider failures and an opt-in real HTTP adapter tested with an injected transport. The ordinary CLI is offline. The [MCP example](../../examples/mcp/README.md) tests three read-only tools through a real local process exchange, including denied network/private reads. The [evaluation harness](../../examples/evaluation/README.md) records paired outputs and hashes but leaves real-model quality, latency, cost and human scores unmeasured.

See the [captioned replay and matching walkthrough](demo-walkthrough.md), [five-minute code tour](code-tour.md) and [unfamiliar-review protocol](unfamiliar-review.md). The replay is a captured offline demonstration, not live-model evidence; human checks remain pending.

The [synthetic ML pipeline](../../examples/ml_ranking/README.md) trains a pairwise logistic model from zero on disjoint family groups, reproduces seven frozen artifacts, and verifies Python/browser JavaScript inference. Its final 76/80 pairwise agreement measures deterministic-teacher imitation, not improved shopper recommendations or replication of the historical private study.

```bash
python3 examples/ml_ranking/pipeline.py verify
python3 -m unittest discover -s examples/ml_ranking -p 'test_*.py' -v
```

The browser test requires an existing Chrome/Chromium and loopback permission, not Node or a frontend build. Earlier fresh-context agents identified the product/ownership/AI distinctions within five seconds and independently reproduced offline examples within 30 seconds. Additional fresh reviewers inspected all eight replay scene-final images and reproduced Shortlist behavior; their requested visible citation-rejection example was added and rechecked. These are agent observations, not human usability evidence or continuous playback. Fresh-context agent evaluation completed; unfamiliar-human validation pending. Overall playback acceptance remains incomplete.

| Claim | Evidence path | Reproduce |
|---|---|---|
| Static no-build product | `web/index.html`, `web/app.js`, `web/js/` | Run the loopback quick start |
| Python/SQLite live path | [Architecture](../architecture/overview.md) and deployed behavior | Documented private evidence; inspect the bounded public description |
| SSE refresh | `web/js/api.js` | Inspect the client event and refresh contract |
| Skincare safety | `scripts/skincare_guardrails.py`, `web/js/guardrails.js`, `web/skincare_guardrails.json` | Reproduce the 50 Python cases with `python3 scripts/evaluate_skincare_guardrails.py`; the browser smoke checks the same 50 required contracts in JavaScript |
| Synthetic public data | `data/generated/catalog.json` | `python3 -m unittest discover -s tests -v` |
| ML no-promotion decision | `docs/research/ml/` | Inspect public aggregate evidence; labels and trained artifacts remain private |
| Public boundary | `NOTICE.md` | Confirm retailer data/media are excluded |

## Measurement scope

The private generated catalog contained 8,762 normalized products on September 4, 2026. Treat that as a dated local measurement, not a real-time retailer claim. Public fixtures are synthetic and intentionally much smaller.

The clean-start smoke test uses an equivalent standard-library `ThreadingHTTPServer` on loopback, verifies `/web/` and `/data/generated/catalog.json`, and confirms that the fixture is present. A dependency-free Chrome/Chromium smoke test then exercises Catalog → save → Shortlist → Workspace/Routine at desktop and mobile sizes, runs all 50 shared safety fixtures through browser JavaScript, and rejects blocking horizontal overflow. It is still a focused release smoke rather than exhaustive UI coverage.

## Evidence boundaries

- CI and local deterministic tests establish contract behavior, not medical effectiveness.
- An available live URL establishes deploy reachability, not retailer freshness.
- Fresh-context agent evaluation is not unfamiliar-human validation.
- A failed ML promotion gate is evidence of disciplined evaluation, not a production ML recommender.
- Historical release checks do not verify subsequently edited files. The AI portfolio has separate clean-checkout and publication evidence above; no new tag or release was created.
- Dedicated generated-Shortlist HTML desktop/mobile inspection and continuous-playback usability acceptance were explicitly deferred by the owner, not passed. Automated safe-rendering tests and decoded replay-frame review do not establish those outcomes.
