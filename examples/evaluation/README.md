# Paired Shortlist evaluation

This offline harness runs the same fictional inputs through mocked provider orchestration and deterministic fallback. It does **not** compare actual GPT quality with fallback. It provides the versioned cases, paired outputs, failure taxonomy and human rubric needed for that later approved comparison.

From the public repository root, with Python 3.9+ and no dependencies:

```bash
python3 examples/evaluation/evaluate.py
python3 examples/evaluation/evaluate.py --split held-out
python3 -m unittest discover -s examples/evaluation -p 'test_*.py' -v
```

Default JSON contains eight development rows; held-out mode contains four reserved rows. Each includes input identity, both responses, contract outcome and empty human scores. The expected contract totals are 8/8 and 4/4, respectively. These are deliberately injected scenarios, not naturally observed model failure rates. The harness makes no provider calls and writes nothing; stdout may be captured locally after reviewing retention needs.

## Frozen design before measurement

- [scenarios.json](scenarios.json): 12 original fictional cases, eight development and four held-out, with immutable case IDs and explicit categories. No real-user data. This tiny design provides failure coverage, not population estimates; safety and hostile-input cases are especially sparse.
- [rubric.json](rubric.json): five anchored human dimensions, claim-level evidence annotations, denominator definitions, failure taxonomy and execution conditions.
- [evaluate.py](evaluate.py): records dataset/rubric versions and hashes, prompt/schema/implementation/fixture hashes, input identities and a null model identifier for mock runs.
- Freeze the exact candidate hashes before a real-model measurement. Changes create a new version, not silent edits to an existing measured run. Do not repeatedly tune against held-out outputs. Public held-out fixtures are inspectable, so an independent subsequent benchmark would require additional untouched cases.

## Four evidence categories

1. **Deterministic safety:** run the separate canonical 50-case suite; it is not clinical validation.
2. **Mocked contracts:** this harness verifies orchestration paths and provides paired artifacts. Synthetic success proves neither grounding nor usefulness.
3. **Real models:** pending approval and execution. Use the same cases and deterministic baseline, preserving all attempts, refusals/errors/fallbacks. Freeze provider/model, prompt/schema and request limits first. Artificial faults must stay separate from actual provider outcomes. Report quality annotations, unsupported claims, raw denominators, latency median/p95 with sample limitations, observed token usage and cost with dated pricing. Do not report mock timings as model measurements.
4. **Human usefulness:** pending participant-specific approval and consent. Use blinded randomized answer order, allow ties, report rater count/disagreement, and retain minimal anonymized observations. Agent review is not human review.

No claim support or usefulness score is automatically guessed. A known citation ID can accompany unsupported prose; human claim annotation must inspect the text against the context. There is no model-as-judge proxy here. Latency, tokens, cost and quality remain `null` until measured appropriately.

Real-provider execution requires separately approved provider/model, transmitted synthetic data, maximum calls/tokens/retries/spending, configuration, retention and cleanup. Existing credentials are not authorization. This offline harness does not read them.
