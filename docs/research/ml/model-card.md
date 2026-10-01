# Residual ranker model card

## Intended use

Research-only comparison within an already eligible deterministic top-five set for selected cleanser, serum, and moisturizer contexts.

## Not intended for

Production ranking authority, medical or pregnancy decisions, allergy/prescription/red-flag contexts, unrestricted search, or eligibility changes.

## Model

A small logistic residual ranker evaluated against the deterministic baseline. Any comparison was bounded to two positions of movement, failed closed on invalid inputs, and did not perform live learning or telemetry.

## Disposition

Not promoted. Five evidence gates failed, including the required improvement threshold. The deterministic ranker remains authoritative.
