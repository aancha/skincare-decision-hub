# Consequential engineering decisions

## 1. Keep product decisions available when AI or live services fail

- **Problem:** optional services can fail while a shopper is making a decision.
- **Alternatives:** require the complete backend/provider stack for every interaction, or keep deterministic behavior available and add live capabilities when present.
- **Choice:** static-first browser behavior with bounded GPT explanations and deterministic fallbacks.
- **Implementation:** native modules and a repository-root catalog fallback; the private deployment adds SQLite reads and SSE. The [Shortlist example](../../examples/shortlist_ai/shortlist.py) shows context assembly, provider dispatch, validation and fallback as distinct stages.
- **Evidence:** [offline failure tests](../../examples/shortlist_ai/test_shortlist.py) exercise missing context, refusal, timeout and invalid output. The public static browser does not call private services.

**Remaining tradeoff:** API-only capabilities degrade locally. A deterministic fallback may be less useful than a well-grounded model answer; this requires paired evaluation, not an assumption that either output is better.

## 2. Separate explanation and tool access from decision authority

- **Problem:** fluent model output and descriptive tool annotations cannot enforce product safety or data access.
- **Alternatives:** rely on prompting and read-only labels, or enforce boundaries in context projection, dispatch and deterministic product logic.
- **Choice:** shared safety rules plus bounded inputs, named tool dispatch and allowlisted output fields. GPT explains supplied facts; MCP exposes permitted capabilities; neither grants new authority.
- **Implementation:** [canonical taxonomy](../../web/skincare_guardrails.json), [shared Python rules](../../scripts/skincare_guardrails.py), and example-specific validators. The public examples use the same safety source instead of copying medical constants.
- **Evidence:** the canonical 50-case suite is executable in Python and browser JavaScript. The [GPT tests](../../examples/shortlist_ai/test_shortlist.py) include hostile rendering and demonstrate that citation validity does not prove grounding.

**Remaining tradeoff:** keyword rules miss unfamiliar phrasing and cannot diagnose. Restricted synthetic tools do not establish production authentication, hosted authorization or clinical safety. Those claims require separate evidence.

## 3. Promotion gates before model authority

- **Problem:** a trainable ranker can appear more sophisticated without producing a reliable improvement.
- **Alternatives:** promote on point-estimate gain, keep experimenting without a decision rule, or define promotion criteria before final evaluation.
- **Choice:** evaluate against a deterministic baseline and withhold authority when required gates fail.
- **Implementation:** frozen experiment evidence, quality and coverage gates, Python/JavaScript parity, and a separately bounded default-off comparison with at most two positions of movement inside the eligible top five.
- **Evidence:** the [responsible-ML result](responsible-ml.md) reports +1.05 percentage points versus a +3-point requirement, an interval spanning zero, and worse top-choice accuracy. Five gates failed; deterministic ordering retained authority.

**Remaining tradeoff:** potential future gains remain unproven. Synthetic reproducibility can establish training/export/parity mechanics but cannot replace independent recommendation-quality evidence.

## Attribution

Aanchal owns the product choices, integration and acceptance decisions. Coding assistants support implementation and documentation; standard runtimes/libraries provide underlying infrastructure. These records do not imply unaided authorship, team leadership, customer adoption or measured business impact.
