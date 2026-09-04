# Consequential engineering decisions

## 1. Static first, live when available

The browser uses native modules and a repository-root static fallback. This keeps the main product inspectable without a service stack while allowing SQLite-backed reads and SSE refresh in the deployed system.

Tradeoff: some API-only capabilities degrade locally, but a reviewer reaches the product immediately and the core decision flow does not depend on credentials.

## 2. One deterministic safety contract

Shared taxonomy and fixed cases constrain pregnancy, irritation, unrealistic expectations, and red-flag symptom handling across Python and plain JavaScript.

Tradeoff: deterministic rules are intentionally conservative and cannot diagnose; they create a testable boundary for any optional AI explanation.

## 3. Promotion gates before model authority

Learned rankers were compared with an explicit baseline on frozen evidence. Missing the required threshold kept the deterministic ranker in control.

Tradeoff: the product gave up a more fashionable architecture in exchange for a decision that is reproducible, reversible, and honest about evidence quality.
