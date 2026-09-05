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

| Failed gate | Predeclared requirement | Observed result |
|---|---|---|
| Pairwise improvement | At least +3 percentage points versus strongest deterministic baseline | +1.05 points |
| Grouped paired-bootstrap interval | Lower 95% bound strictly above zero | −4.21 points |
| Top-choice accuracy | At least strongest deterministic baseline | 26.32% versus 31.58% |
| Development hidden-repeat direction agreement | At least 90% | 50% (13/26) |
| Owner-best deterministic-top-five coverage | At least 95% | 78.95% |

These are historical aggregate results transcribed from the frozen private evaluation and decision record. They make the decision auditable at the summary level; they do not make the excluded private judgments independently reproducible. Passing safety or parity gates did not compensate for failed quality, repeatability or coverage gates.

## Decision

The model was **not promoted**. The deterministic system retained all production ranking authority.

A later interview-only comparison used a byte/hash-verified frozen model, was default-off, operated only inside the deterministic eligible top five, limited movement to two positions, collected no telemetry, and never changed the authoritative cards. It is a comparison artifact, not a production recommender.

## Try the bounded live comparison

Verified in the existing live UI on September 4, 2026; this is a reproducible filter recipe, not a promise of stable product names or counts:

1. Open the [ML comparison entry point](https://skincarehub.app/catalog/?mlDemo=1).
2. Leave search empty, retailer and brand unrestricted, and Show set to **Best match** (relevance).
3. Set Product type to **Moisturizer**, select the **Dryness** concern, choose **Ceramides** under Ingredient, and choose the **Mature + Dehydrated** example profile lens.
4. Wait for catalog hydration and frozen-model validation. A qualifying run shows **Bounded shadow ML** alongside the deterministic top five, with the top pick unchanged and each product moving at most two positions. The observed number of moved products varied during hydration; do not hardcode a count as the result.
5. Use **Disable ML demo** to remove the comparison. The control was exercised and the comparison became hidden; the ordinary recommendations remain deterministic.

This is a hypothetical demonstration lens, not a claim about the reader's skin. At least five eligible, sufficiently described candidates are needed. The broader moisturizer/dryness case and a different profile lens returned a labeled insufficient-evidence fallback during verification. That is expected fail-closed behavior, not permission to relax the boundary. Supported model slices are cleanser, serum and moisturizer on relevance sort with a concern or ingredient signal; arbitrary searches, unsupported sorts/categories and thin evidence can fall back.

The synthetic static checkout intentionally disables the private trained comparison. These live instructions do not authorize copying retailer data or media into the public repository, nor do they establish real-world recommendation quality.

## Why this matters

The technically interesting result is the refusal to promote. The project treated evaluation gates as product controls rather than presentation theater, preserved negative evidence, and kept an attractive but underqualified model outside the decision path.

See the public-safe [research summary](../research/ml/README.md), [model card](../research/ml/model-card.md), and [data card](../research/ml/data-card.md). Raw retailer-derived evidence remains private.
