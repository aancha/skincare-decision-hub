# Interview guide

Use only claims whose evidence status is established in the [evidence guide](evidence.md). The synthetic examples and replay are published; fresh-context agent review is not human validation or real-model evaluation. Do not use pending measurements as résumé metrics.

## Thirty-second introduction

“I built SkinCare Hub to help shoppers compare products and understand decision tradeoffs. The application separates GPT explanations, MCP product tools and deterministic safety and ranking controls. I also evaluated a learned ranker against a baseline and kept it out of authoritative ranking when promotion gates failed. The public portfolio uses synthetic data so reviewers can inspect failure handling and reproduce the engineering without private data or credentials.”

## Three-minute replay script

- **0:00–0:18 — Problem and ownership:** introduce the decision-support product, Aanchal's ownership, and separate GPT/MCP/ML responsibilities.
- **0:18–0:43 — Context:** show the two fictional Shortlist products and resolved context IDs. State that the provider is mocked, not a real GPT call.
- **0:43–1:05 — Explanation and validation:** show structured output and citations, then unknown-citation rejection into fallback. Citation membership is not factual-support proof.
- **1:05–1:35 — MCP:** show real local discovery, search, detail, comparison and errors. Example Lab products are a separate fictional fixture; no hosted ChatGPT invocation is shown.
- **1:35–2:00 — Failure:** show injected timeout fallback and the shared safety short-circuit, not a successful provider answer.
- **2:00–2:25 — Synthetic ML:** show frozen teacher-imitation artifacts and an illustrative bounded reorder; distinguish imitation from recommendation-quality evidence.
- **2:25–2:45 — Historical judgment:** explain the separate 95-pair study and failed promotion gates. Deterministic ranking retained authority; the opt-in comparison has eligible-top-five and movement limits.
- **2:45–3:00 — Reproduction and limits:** point to commands and code tour; model quality/cost/latency and unfamiliar-human usefulness remain unmeasured.

This script follows the published [180-second captioned terminal replay](demo-walkthrough.md), which uses mocked GPT, real local MCP and synthetic ML; it does not record the live website. The [live ML recipe](responsible-ml.md#try-the-bounded-live-comparison) was separately verified. Continuous-playback acceptance remains explicitly deferred, not passed.

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
