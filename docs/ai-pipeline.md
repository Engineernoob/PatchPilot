# AI Pipeline

## Overview

The PatchPilot AI pipeline transforms raw debugging evidence into structured engineering outputs. Rather than relying on a single prompt, the pipeline executes a series of deterministic preprocessing steps followed by focused AI generation.

This approach improves consistency, traceability, and makes the system easier to evaluate over time.

---

## Pipeline Overview

```text
Upload Evidence
      │
      ▼
Normalize Input
      │
      ▼
Extract Signals
      │
      ▼
Generate Incident Summary
      │
      ▼
Generate Root-Cause Hypotheses
      │
      ▼
Rank Hypotheses
      │
      ▼
Generate Suggested Fixes
      │
      ▼
Generate Commit Message
      │
      ▼
Generate Pull Request Summary
```

---

## Stage 1: Evidence Normalization

Incoming evidence is standardized into a common internal representation.

Supported inputs include:

- Log files
- Stack traces
- Screenshots
- Bug reports
- Console output

Normalization removes formatting inconsistencies and prepares the data for downstream analysis.

---

## Stage 2: Signal Extraction

The parser identifies structured debugging signals such as:

- Exception types
- File names
- Line numbers
- Error messages
- HTTP status codes
- Database errors
- Framework identifiers
- Repeated failures

These signals become structured inputs for later AI stages.

---

## Stage 3: Incident Summary

The AI generates a concise summary describing:

- What failed
- Where the failure occurred
- Likely impact
- Important supporting evidence

The summary is intended to help engineers understand an incident quickly before reviewing detailed logs.

---

## Stage 4: Root-Cause Analysis

The AI proposes multiple root-cause hypotheses based on the normalized evidence.

Each hypothesis includes:

- Description
- Supporting evidence
- Confidence score
- Suggested validation steps

---

## Stage 5: Fix Generation

After ranking hypotheses, the AI suggests potential remediation steps.

Suggested fixes are grounded in the available evidence and linked to the most likely hypothesis.

---

## Stage 6: Engineering Artifacts

PatchPilot generates documentation that can be reused during development, including:

- Commit messages
- Pull request summaries
- Engineering notes

These outputs reduce repetitive documentation work during the debugging process.

---

## Design Principles

The AI pipeline is designed around several principles:

- Deterministic preprocessing before AI generation.
- Modular prompt templates.
- Privacy-first local inference through Ollama.
- Structured outputs that are easy to evaluate.
- Separation of parsing, orchestration, and generation.

---

## Future Improvements

Planned enhancements include:

- Retrieval-augmented debugging.
- Similar incident search.
- Automated regression detection.
- Multi-model evaluation.
- Prompt version comparisons.
- Human feedback collection for continuous improvement.
