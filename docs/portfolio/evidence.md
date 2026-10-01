# Evidence and reproducibility

The [canonical reproduction guide](engineering-examples.md) is shared by the repository and downloadable ZIP. The current table records distinct scopes; nested or overlapping suites must not be added into a promotional total. A passing contract is not a measurement of medical safety or model usefulness.

## Current candidate verification

Verified October 1, 2026 (Pacific Time), using Python 3.9.6. These local results describe the source files inventoried in `PUBLICATION_MANIFEST.json`; the accompanying release review records the final manifest digest. This fresh-history candidate is verified locally; the live website is separately deployed. Nested suites overlap and are listed separately to make their scope clear.

| Demonstrated capability | Command or artifact | Result, scope, and date | Unmeasured |
|---|---|---|---|
| Structured explanation and failure handling | `python3 -B -m unittest discover -s examples/shortlist_ai -p 'test_*.py' -v` | 26 tests pass; mocked providers and injected HTTP transport; 2026-10-01 | Real-model factual support, usefulness, latency, cost |
| Local MCP interoperability | `python3 -B examples/mcp/client.py`; `python3 -B -m unittest discover -s examples/mcp/tests -v` | 13 tests pass; client PASS; actual local stdio subprocesses, three tools; 2026-10-01 | Official SDK conformance, hosted ChatGPT integration |
| Deterministic guardrail contracts | `python3 -B scripts/evaluate_skincare_guardrails.py`; browser smoke | 50/50 in each runtime; same fixed cases with answer abstention and wording variants; 2026-10-01 | Missed-risk frequency, clinical safety |
| Injected evaluation scenarios | `python3 -B examples/evaluation/evaluate.py --split all`; `python3 -B -m unittest discover -s examples/evaluation -v` | 6 harness tests pass; 12/12 paired mock/fallback scenarios; 2026-10-01 | Real-model quality, blinded human scores |
| Synthetic ML reproducibility | `python3 -B examples/ml_ranking/pipeline.py verify`; `python3 -B -m unittest discover -s examples/ml_ranking -v` | 7 artifacts reproduce exactly; 50 browser parity cases pass; 2026-10-01 | Shopper benefit; replication of the private study |
| Repository integration and browser flows | `python3 -B -m unittest discover -s tests -v`; `python3 -B scripts/check_python_syntax.py` | 26 top-level tests pass (including nested suites); 27 syntax checks pass; exact 1440/390px browser smoke; 2026-10-01 | Exhaustive UI coverage, human usability, production reliability |

## Prerequisites and interpretation

Use Python 3.9+ and its standard library. The documented explanation, MCP, evaluation, and Python guardrail commands need no browser, credentials, external network, or paid calls. Repository integration includes real browser checks and therefore also requires Chrome/Chromium installed at a supported system path and permission to start loopback HTTP servers and local subprocesses. Missing browser prerequisites are failures, not skipped passes. No Node or frontend build is required.

The browser smoke exercises Catalog → save → Shortlist → Workspace/Routine at desktop and mobile sizes and runs the fixed JavaScript guardrail matrix. Public mode blocks private API/SSE access. Structured validation checks shape and citation membership only; the test that accepts unsupported prose with a valid ID makes that limitation explicit. Independent agent reading is navigation/reproduction evidence, not human validation.

## Release maintenance

Build engineering assets into an empty directory outside the checkout:

```sh
python3 -B scripts/build_engineering_site.py --output ../skincare-engineering-site
python3 -m http.server 8001 --bind 127.0.0.1 --directory ../skincare-engineering-site
```

Open `http://127.0.0.1:8001/engineering/`. The deterministic builder emits four assets and copies only its explicit source allowlist into the ZIP. Extract the ZIP into another empty directory and run every command in its README. Inspect the rendered pages, links, source views, ZIP checksums, and synthetic desktop/mobile application flows before publication.

After final edits, run `python3 -B scripts/publication_manifest.py generate`, then `python3 -B scripts/publication_manifest.py verify` and the complete repository suite. After an approved local commit, `verify --tracked` additionally checks the committed tree. Review reachable history and GitHub publication surfaces separately: a current-tree manifest does not cover those surfaces. Record security findings against the candidate manifest or revision. Publication and deployment require separate approval.

`verify_fresh_repository.py` and its adversarial tests preserve the **initial-export** proof: exactly one parentless commit, approved identity and remote, no inherited objects or redirected Git database. An ordinary maintenance clone intentionally has multiple commits, tags, and remote refs. Do not run that initial-export verifier as a release-maintenance gate or weaken it to accept ordinary history. Its tests remain applicable regression checks. This replacement candidate uses a new root message and has no remote; its separate local release review verifies the fresh history, all objects, and exact identity without changing that historical verifier.

## Historical evidence (not current-candidate verification)

The following record predates this fresh-history candidate. Counts, dates, deployment observations, private implementation descriptions, and agent timings apply only to the revisions and scope stated below. They are preserved as history, not repeated measurements.


Every headline claim is labeled by evidence type: publicly reproducible, publicly inspectable, or documented from private artifacts that are deliberately excluded.

### AI evidence status

This historical table distinguishes inspected private implementation, prior evidence, and synthetic examples. Earlier-history checks recorded 24 top-level tests, 50 guardrail cases, 25 syntax checks, and successful CI. Those results predate this fresh-history candidate and do not verify its current files. Original revision and run identities remain in the private release record; they are not part of the replacement history.

| Capability | Implemented | Tested offline | Real model exercised | Deployed | Publicly reproducible | Independently evaluated |
|---|---|---|---|---|---|---|
| Four GPT explanation surfaces | Inspected private implementation; synthetic Shortlist extraction | Local pipeline and injected Responses-transport tests pass | No provider call made by this audit | Historical application records; current model path not reverified | Published synthetic Shortlist example runnable offline | Fresh agents reproduced offline behavior; human usefulness pending |
| MCP product tools | Inspected custom private bridge; synthetic three-tool subset | Local tests and separate stdio client pass | Tool invocation is not model evidence | Historical bridge records; current hosted transport not reverified | Published local server/client runnable offline | Fresh agents reproduced client/tests; independent SDK conformance pending |
| Learned ranking | Historical experiment; separate synthetic logistic pipeline | Synthetic training/export/50-case Python-JS parity tested | Not a GPT model | Existing bounded live comparison rechecked; no ranking authority | Published synthetic teacher-imitation example runnable | Two fresh agents understood limits; one reran artifact verification; no independent real-user quality study |
| Deterministic safety | Shared Python/JavaScript implementation | Public fixed 50-case suite | Not applicable | Historical product baseline | Yes, using checked-in synthetic fixtures | Agent review and anonymous-clone regression; no human/clinical claim |

The API code default is `gpt-5-mini`; environment configuration can change the four surface models. A default does not prove a live response used that model. GPT output validity, factual support and usefulness require different checks. Local MCP interoperability does not prove hosted ChatGPT integration or app-directory approval.

### Reproduce the new local AI evidence

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

### Measurement scope

The private generated catalog contained 8,762 normalized products on September 4, 2026. Treat that as a dated local measurement, not a real-time retailer claim. Public fixtures are synthetic and intentionally much smaller.

The clean-start smoke test uses an equivalent standard-library `ThreadingHTTPServer` on loopback, verifies `/web/` and `/data/generated/catalog.json`, and confirms that the fixture is present. A dependency-free Chrome/Chromium smoke test then exercises Catalog → save → Shortlist → Workspace/Routine at desktop and mobile sizes, runs all 50 shared safety fixtures through browser JavaScript, and rejects blocking horizontal overflow. It is still a focused release smoke rather than exhaustive UI coverage.

### Evidence boundaries

- CI and local deterministic tests establish contract behavior, not medical effectiveness.
- An available live URL establishes deploy reachability, not retailer freshness.
- Fresh-context agent evaluation is not unfamiliar-human validation.
- A failed ML promotion gate is evidence of disciplined evaluation, not a production ML recommender.
- Historical release checks do not verify subsequently edited files. The AI portfolio has separate clean-checkout and publication evidence above; no new tag or release was created.
- Dedicated generated-Shortlist HTML desktop/mobile inspection and continuous-playback usability acceptance were explicitly deferred by the owner, not passed. Automated safe-rendering tests and decoded replay-frame review do not establish those outcomes.
