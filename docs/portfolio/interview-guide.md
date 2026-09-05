# Interview guide

Use only claims whose evidence status is established in the [evidence guide](evidence.md). New local examples are not yet a published or independently reviewed release. Do not use pending measurements as résumé metrics.

## Thirty-second introduction

“I built SkinCare Hub to help shoppers compare products and understand decision tradeoffs. The application separates GPT explanations, MCP product tools and deterministic safety and ranking controls. I also evaluated a learned ranker against a baseline and kept it out of authoritative ranking when promotion gates failed. The public portfolio uses synthetic data so reviewers can inspect failure handling and reproduce the engineering without private data or credentials.”

## Three-minute recording script — recording pending

- **0:00–0:20 — Problem and ownership:** show the synthetic catalog screenshot and explain the catalog→Shortlist→Routine decision flow. Identify Aanchal's ownership and coding-assistant/library assistance.
- **0:20–1:00 — Grounded explanation pipeline:** execute the synthetic Shortlist CLI, show the two fictional products, context projection, strict response fields and citations. Caption “Local mocked provider; no GPT call.” If a separately approved real output replaces this segment, label its actual provenance and keep the context visible.
- **1:00–1:35 — MCP:** execute the independent client. Show discovery of search/detail/comparison, a search result and a detail/price comparison. Explain that these Example Lab fixtures are a separate fictional set from the Shortlist fixtures. Caption “Real local MCP protocol exchange; no hosted ChatGPT invocation.”
- **1:35–2:00 — Failure:** execute the Shortlist timeout scenario. Show fallback and explain why it preserves the decision without claiming a successful model answer. Briefly point to safety short-circuit tests.
- **2:00–2:40 — ML judgment:** show the verified supported live comparison scenario only after re-verification and media-rights review; otherwise use clearly labeled historical aggregate evidence and leave the required live-demo segment unfinished. Explain eligible top five, maximum two-position movement, default-off behavior and the failed promotion gates.
- **2:40–3:00 — Reproduction and limits:** show the code tour and offline commands. State that model quality/cost/latency and unfamiliar-human usefulness remain unmeasured unless their approved runs have actually occurred.

This is a script, not a video. The actual captioned recording, exact live scenario and playback review remain required.

## Ten-minute technical interview outline

1. **0–1 min:** user problem, product flow, personal ownership and evidence boundaries.
2. **1–3 min:** context selection, prompt/schema, adapter, citation validation and safe rendering; one failure test.
3. **3–5 min:** MCP negotiation/discovery/tool dispatch, input and output restrictions, hostile data, local vs hosted security.
4. **5–7 min:** paired evaluation design, held-out limits, claim support vs formatting, real-model measurements vs mocks, human rubric.
5. **7–9 min:** learned-ranking baseline, failed gates, uncertainty, browser parity and retained ranking authority.
6. **9–10 min:** operational tradeoffs, missing evidence, and the next experiment that could change a decision.

## Three evidence-backed résumé bullets

- Built a skincare decision-support application with a no-build JavaScript client and Python/SQLite services, integrating bounded GPT explanation paths for Shortlist, comparison, routine rationale and learning with structured validation and deterministic fallbacks.
- Implemented MCP product-tool integration and a synthetic read-only local example demonstrating protocol negotiation, discovery, validated invocation and failure handling without private services or credentials. **Use the local-example clause only after its verification; do not imply app-directory approval.**
- Evaluated a learned ranker against a deterministic baseline on a historical 95-pair study; retained deterministic ranking authority when five promotion gates failed, preserving uncertainty and Python/JavaScript parity evidence rather than claiming an unproven recommendation improvement.

These bullets describe engineering, not adoption or business impact. Adapt wording to actual professional experience; the project does not establish seniority.

## Questions to prepare for

**What does grounding guarantee?** Context projection limits supplied facts and citation checks restrict identifiers. Neither proves the generated claim follows from those facts. Inspect claim-level support and report unsupported/contradicted statements separately.

**Why MCP?** It provides a discoverable tool interface for product capabilities outside the website. The useful proof is tested protocol behavior and bounded actions, not the acronym. MCP is not itself an autonomous agent or an access-control system.

**How is MCP secured?** Explain exact local allowlists, argument bounds, fixed synthetic source, field projection and failure tests. Do not extrapolate from stdio tests to hosted authentication, authorization or production security.

**What happens when the model fails?** Guardrail and incomplete-context paths avoid the call; refusal, timeout, malformed schema and unknown citations trigger labeled fallback. The fixed provider adapter has one attempt and does not follow redirects. A timeout can still represent a billed provider attempt.

**How did you measure quality?** Separate the canonical safety suite, mocked orchestration contracts, actual provider outputs and human usefulness. The paired harness currently prepares evidence, not a quality win. Do not report null measurements as zero.

**What is the latency or cost?** No new live-model measurement is available. The adapter bounds output tokens and request attempts; it does not enforce a hard dollar or account-wide cap. Approved runs must report sample size, conditions, actual usage and dated prices.

**Why was ML not promoted?** The +1.05-point pairwise gain missed the +3-point gate, uncertainty included no improvement, and top-choice accuracy was lower than baseline. Five gates failed. A bounded comparison is not production authority.

**What does synthetic reproducibility prove?** It can prove code execution, split discipline, artifact validation and cross-runtime parity. It cannot establish relevance for real shoppers; baseline-derived labels establish imitation, not independent quality.

**What did you personally own?** Explain specific product and engineering decisions, verification and release responsibility. Acknowledge coding-assistant help, reused libraries and infrastructure without claiming unaided authorship.
