# Responsible-ML case study

## Question

Could a learned ranker improve the ordering produced by the deterministic skincare recommendation system without weakening eligibility, safety, reproducibility, or browser parity?

## Experiment

The final residual-slice experiment evaluated a logistic ranker on 95 fresh pairwise judgments within a bounded cleanser/serum/moisturizer relevance slice. Promotion required explicit quality, repeatability, coverage, safety, parity, and runtime gates.

## Result

- Learned pairwise accuracy: **51.58%**
- Deterministic baseline: **50.53%**
- Improvement: **+1.05 percentage points**, below the frozen +3-point gate
- Grouped 95% improvement interval: **−4.21 to +6.32 points**
- Learned top-choice accuracy: **26.32%** versus **31.58%** deterministic
- Development repeat direction agreement: **50%**
- Owner-best deterministic-top-five coverage: **78.95%**

Five promotion gates failed. Safety and implementation checks passed: zero hard-eligibility or skincare-safety violations, exact Python/JavaScript order and tie parity, bounded numeric error, and fail-closed invalid inputs.

## Decision

The model was **not promoted**. The deterministic system retained all production ranking authority.

A later interview-only comparison used a byte/hash-verified frozen model, was default-off, operated only inside the deterministic eligible top five, limited movement to two positions, collected no telemetry, and never changed the authoritative cards. It is a comparison artifact, not a production recommender.

## Why this matters

The technically interesting result is the refusal to promote. The project treated evaluation gates as product controls rather than presentation theater, preserved negative evidence, and kept an attractive but underqualified model outside the decision path.

See the public-safe [research summary](../research/ml/README.md), [model card](../research/ml/model-card.md), and [data card](../research/ml/data-card.md). Raw retailer-derived evidence remains private.
