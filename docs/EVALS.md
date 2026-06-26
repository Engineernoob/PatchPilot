# Evals

## Purpose

PatchPilot should not rely on vibes. Its outputs should be measurable.

## Metrics

- root-cause accuracy
- fix usefulness
- hallucination rate
- latency
- parse coverage

## Benchmark Cases

- missing environment variable
- external API timeout
- expired auth token
- malformed JSON payload
- null reference in frontend

## Evaluation Method

For each case:

1. upload evidence
2. run analysis
3. compare output against expected diagnosis
4. score correctness and usefulness

## Goal

Create a reproducible benchmark for debugging workflows powered by local LLMs.
