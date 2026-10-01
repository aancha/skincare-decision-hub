# SkinCare Hub case study

## Product

SkinCare Hub is an independent comparison tool for shoppers who know their concern or budget but need help choosing among products, retailers, and routine tradeoffs. Its core flow is Overview → Catalog → Shortlist → Routine.

## Ownership

Aanchal personally designed the product flow, implemented the browser client and Python/SQLite services, built and operated the ingestion path, defined deterministic safety contracts, constructed the evaluation suites, and made the publication and ML promotion decisions documented here.

Implementation work uses coding-assistant support and existing libraries/runtime infrastructure. Ownership means responsibility for product choices, integration, verification and release decisions, not a claim that every line was written without assistance. This portfolio is not evidence of employment seniority, team size, customer adoption or business impact.

## Engineering challenge

The system combines volatile retailer data with safety-sensitive decision support while remaining usable as a static site. It has to distinguish strong evidence from thin evidence, preserve a shopper’s current work during live updates, and fail safely when APIs or models are unavailable.

## Inspect the implementation

The public source companion contains the no-build browser client, fictional fixtures, shared deterministic guardrails, and three standalone engineering examples. Start with the [code tour](code-tour.md) or [canonical reproduction guide](engineering-examples.md).

The private product adds ingestion, Python/SQLite services, server-sent updates, explanation orchestration, and a custom MCP bridge. Those services are described in the [architecture](../architecture/overview.md); they are not included in this checkout. Historical private measurements remain in the [evidence record](evidence.md#historical-evidence-not-current-candidate-verification).

## What the public checkout proves

The static synthetic application and deterministic safety fixtures are directly reproducible. The private deployment architecture and existing GPT/MCP implementations are documented boundaries, not provider-connected functionality in the static public page. Included [Shortlist](../../examples/shortlist_ai/README.md), [MCP](../../examples/mcp/README.md) and [evaluation](../../examples/evaluation/README.md) programs are offline-tested and separately runnable. Fresh-context agents reproduced examples; this is not human usefulness or real-model quality evidence. See [verification and deferred checks](evidence.md).

The technical story is the integration: deterministic controls decide eligibility and ranking; GPT explains supplied evidence; MCP exposes bounded product capabilities; the learned ranker remains a separate experiment. Neither GPT nor MCP receives authority to bypass safety or change production ranking.

## What did not ship

The learned ranker did not earn production authority. Its final experiment missed the predeclared promotion threshold and four other evidence gates. The deterministic system remained authoritative; a later bounded comparison stayed default-off and default-off.

Retailer-derived data and legacy media are not included in the public showcase because redistribution rights are not established. This separation is part of the engineering outcome, not a packaging omission.

## Inspect next

Read the [architecture](../architecture/overview.md), the [responsible-ML case study](responsible-ml.md), or the [evidence guide](evidence.md).
