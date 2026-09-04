# Evidence and reproducibility

Every headline claim is labeled by evidence type: publicly reproducible, publicly inspectable, or documented from private artifacts that are deliberately excluded.

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
