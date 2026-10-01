# SkinCare Hub: reproducible engineering examples

By Aanchal Khandelwal. Use **Python 3.9+ and the standard library**.
In a repository checkout, start at its root. For the download, unzip it and
open a terminal in `skincare-hub-engineering-examples`. The same commands
work in either location. No dependency installation or API key is needed.

```sh
python3 -B -m unittest discover -s examples/shortlist_ai -p 'test_*.py' -v
python3 -B -m unittest discover -s examples/mcp/tests -p 'test_*.py' -v
python3 -B -m unittest discover -s examples/evaluation -p 'test_*.py' -v
python3 -B scripts/evaluate_skincare_guardrails.py
python3 -B examples/mcp/client.py
python3 -B examples/evaluation/evaluate.py --split all
python3 -B examples/shortlist_ai/shortlist.py --scenario unknown-citation
```

## Expected results

Each unittest command ends in `OK`. The guardrail runner reports 50/50 fixed
cases. The MCP client reports `status: PASS`, three discovered tools, and
actual local subprocess results. Evaluation reports `sampleCount: 12` and
`contractPassCount: 12`. The final command returns `source: fallback` and
`reason: invalid-output` because its mock answer cites an unknown product.

Verification results and their date are recorded in the repository's evidence
guide. Suite counts are separate scopes, not a combined measure of quality.

## What these examples establish

- **Explanations:** ID-resolved, bounded context; exact response fields;
  known citation IDs; deterministic fallback on controlled provider failures.
  Provider tests inject transport; they do not contact a real model.
- **MCP:** a custom Python client/server over stdio, bounded tool dispatch,
  and projected synthetic product fields. Tests start real local subprocesses.
- **Evaluation:** mock orchestration paired with deterministic fallback on
  injected scenarios. Model quality, cost, latency, and human scores are unmeasured.
- **Guardrails:** 50 fixed cases, including answer abstention and variants for
  named allergens and swelling wording. Recognized guarded questions retain
  each matched caution and select no saved product; the explanation path skips
  the provider. Keyword matching can miss unfamiliar wording, so passing these
  cases does not establish clinical safety.

These standalone examples exclude the product API, database, ingestion services,
and browser application. They do not establish model usefulness, official SDK
conformance, hosted integration, production reliability, or shopper outcomes.
Citation membership does not prove factual support;
`test_runtime_validation_does_not_prove_grounding` demonstrates that limit.

## Provider boundary

All commands above use local mocks and subprocesses with fictional fixtures.
`responses_provider.py` contains an optional HTTP adapter, disabled by default.
Its separate opt-in CLI can transmit a synthetic request and incur charges;
that path is unnecessary here and has no verified real-provider result.

## Contents and provenance

The ZIP includes these three examples, tests, shared rules, fictional fixtures,
MIT license, and `MANIFEST.json` with SHA-256 file identities. Its README is
copied verbatim from this guide. The repository's browser and ML examples are
separate and are not included in the ZIP. Browser automation requires an
installed Chrome/Chromium and loopback permission; these commands do not.

No retailer catalog or imagery, application database, operational logs,
credentials, or Git history is included. Literal private-data and hostile-text
canaries in tests are fictional inputs. A checksum proves file identity,
not the truth of a model answer.
