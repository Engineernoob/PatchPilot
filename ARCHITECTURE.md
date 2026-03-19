# Architecture

## Overview

PatchPilot is organized as a small monorepo with a clear split between presentation, API orchestration, and reusable contracts.

- `apps/web` renders the product UI, submits incidents, and displays stored analysis results.
- `apps/api` owns persistence, evidence parsing, the analysis pipeline, and the Ollama adapter.
- `packages/shared` defines the frontend-facing request and response contracts with Zod.
- `packages/prompts` keeps the JSON-first prompt templates versioned alongside the codebase.
- `packages/parsers` and `packages/evals` provide reusable TypeScript utilities for parsing and evaluation.

## Backend flow

1. `POST /incidents` creates the incident record and stores initial evidence rows for the description, logs, and optional screenshot.
2. Evidence content is normalized through parser helpers that infer the evidence kind and extract structured signals.
3. `POST /incidents/{id}/analyze` loads the incident evidence and runs the analysis pipeline:
   - Normalize evidence
   - Extract signal rollups
   - Generate summary
   - Generate ranked hypotheses
   - Generate fix suggestions
   - Generate commit and PR artifacts
4. Results are stored back into Postgres across the `incidents`, `hypotheses`, and `fix_suggestions` tables.
5. `GET /incidents/{id}/results` materializes the stored artifacts for the dashboard.

## Data model

- `incidents`
  - Primary incident metadata and generated summary artifacts
- `evidence`
  - Raw evidence payload plus a normalized `signal` JSON document
- `hypotheses`
  - Ranked root-cause candidates with confidence and evidence snippets
- `fix_suggestions`
  - Suggested remediation steps linked back to a hypothesis rank when available

## API design

- FastAPI routes are grouped under `app/api/routes`.
- SQLModel handles table definitions and database sessions.
- Pydantic response schemas are explicit and separate from the table models.
- Ollama usage is isolated in `app/services/ollama.py` so the rest of the pipeline stays deterministic and testable.

## Frontend design

- Next.js 15 app router pages default to server rendering for data views.
- The upload form and tabbed results panel are isolated client components.
- API calls pass through a typed adapter in `apps/web/lib/api.ts` that converts snake_case API payloads into the shared camelCase schema package.
- UI primitives use a small local component layer modeled after shadcn-style cards, badges, buttons, and tabs.

