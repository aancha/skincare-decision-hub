# SkinCare Hub case study

## Product

SkinCare Hub is an independent comparison tool for shoppers who know their concern or budget but need help choosing among products, retailers, and routine tradeoffs. Its core flow is Overview → Catalog → Shortlist → Routine.

## Ownership

Aanchal personally designed the product flow, implemented the browser client and Python/SQLite services, built and operated the ingestion path, defined deterministic safety contracts, constructed the evaluation suites, and made the publication and ML promotion decisions documented here.

Implementation work uses coding-assistant support and existing libraries/runtime infrastructure. Ownership means responsibility for product choices, integration, verification and release decisions, not a claim that every line was written without assistance. This portfolio is not evidence of employment seniority, team size, customer adoption or business impact.

## Engineering challenge

The system combines volatile retailer data with safety-sensitive decision support while remaining usable as a static site. It has to distinguish strong evidence from thin evidence, preserve a shopper’s current work during live updates, and fail safely when APIs or models are unavailable.

## What shipped

- A no-build HTML/CSS/ES-module client with catalog, shortlist, retailer-check, routine, and learning flows.
- A Python/SQLite API with paged reads and server-sent events.
- Three-retailer ingestion and normalization for a private operational catalog of 8K+ products as measured September 4, 2026.
- Static fallback and anonymous continuity.
- A shared Python/plain-JavaScript skincare guardrail contract with a 50-case deterministic matrix.
- GPT-backed explanation paths for Shortlist, embedded retailer comparison, routine rationale and Learn, with bounded context, structured responses, citation checks and deterministic fallbacks. The inspected code default is `gpt-5-mini`; configuration can override it. No current real-response model identity or quality measurement is inferred from that default.
- A custom MCP bridge exposing product tools. The bridge, website and GPT orchestrator have distinct responsibilities; a tool call need not invoke GPT. Hosted operation and actual ChatGPT use require separate evidence from local protocol tests.
- Network-independent grounded-AI contract evaluation and deterministic fallbacks. These tests establish response and failure-handling contracts, not medical effectiveness or human usefulness.

## What the public checkout proves

The static synthetic application and deterministic safety fixtures are directly reproducible. The private deployment architecture and existing GPT/MCP implementations are documented boundaries, not provider-connected functionality in the static public page. Published [Shortlist](../../examples/shortlist_ai/README.md), [MCP](../../examples/mcp/README.md) and [evaluation](../../examples/evaluation/README.md) programs are offline-tested and separately runnable. Fresh-context agents reproduced examples; this is not human usefulness or real-model quality evidence. See [verification and deferred checks](evidence.md).

The technical story is the integration: deterministic controls decide eligibility and ranking; GPT explains supplied evidence; MCP exposes bounded product capabilities; the learned ranker remains a separate experiment. Neither GPT nor MCP receives authority to bypass safety or change production ranking.

## What did not ship

The learned ranker did not earn production authority. Its final experiment missed the predeclared promotion threshold and four other evidence gates. The deterministic system remained authoritative; a later bounded comparison stayed default-off and interview-only.

Retailer-derived data and legacy media are not included in the public showcase because redistribution rights are not established. This separation is part of the engineering outcome, not a packaging omission.

## Inspect next

Read the [architecture](../architecture/overview.md), the [responsible-ML case study](responsible-ml.md), or the [evidence guide](evidence.md).
