# SkinCare Hub case study

## Product

SkinCare Hub is an independent comparison tool for shoppers who know their concern or budget but need help choosing among products, retailers, and routine tradeoffs. Its core flow is Overview → Catalog → Shortlist → Routine.

## Ownership

Aanchal personally designed the product flow, implemented the browser client and Python/SQLite services, built and operated the ingestion path, defined deterministic safety contracts, constructed the evaluation suites, and made the publication and ML promotion decisions documented here.

## Engineering challenge

The system combines volatile retailer data with safety-sensitive decision support while remaining usable as a static site. It has to distinguish strong evidence from thin evidence, preserve a shopper’s current work during live updates, and fail safely when APIs or models are unavailable.

## What shipped

- A no-build HTML/CSS/ES-module client with catalog, shortlist, retailer-check, routine, and learning flows.
- A Python/SQLite API with paged reads and server-sent events.
- Three-retailer ingestion and normalization for a private operational catalog of 8K+ products as measured September 4, 2026.
- Static fallback and anonymous continuity.
- A shared Python/plain-JavaScript skincare guardrail contract with a 50-case deterministic matrix.
- Network-independent grounded-AI contract evaluation and deterministic fallbacks.

## What did not ship

The learned ranker did not earn production authority. Its final experiment missed the predeclared promotion threshold and four other evidence gates. The deterministic system remained authoritative; a later bounded comparison stayed default-off and interview-only.

Retailer-derived data and legacy media are not included in the public showcase because redistribution rights are not established. This separation is part of the engineering outcome, not a packaging omission.

## Inspect next

Read the [architecture](../architecture/overview.md), the [responsible-ML case study](responsible-ml.md), or the [evidence guide](evidence.md).
