# Architecture

## Overview

PatchPilot follows a lightweight monorepo architecture that separates the user interface, backend services, shared libraries, and AI-specific components. This structure keeps the application modular, maintainable, and easy to extend as new debugging capabilities are introduced.

The repository is organized into two primary applications and several shared packages:

- `apps/web` — Next.js frontend responsible for incident creation, evidence uploads, and displaying analysis results.
- `apps/api` — FastAPI backend responsible for persistence, evidence parsing, AI orchestration, and analysis.
- `packages/shared` — Shared TypeScript types, Zod schemas, and request/response contracts.
- `packages/prompts` — Version-controlled prompt templates used by the AI pipeline.
- `packages/parsers` — Utilities for extracting structured signals from logs, stack traces, screenshots, and bug reports.
- `packages/evals` — Evaluation helpers for measuring and validating AI-generated outputs.

## High-Level Request Flow

```text
Client
   │
   ▼
Next.js Frontend
   │
   ▼
FastAPI API
   │
   ├── Store Incident
   ├── Parse Evidence
   ├── Run AI Analysis
   ├── Generate Artifacts
   └── Persist Results
   │
   ▼
PostgreSQL
```

## Backend Pipeline

When a developer submits a new incident, PatchPilot processes it through a deterministic pipeline:

1. `POST /incidents` creates a new incident and stores the uploaded evidence.
2. Evidence is normalized and classified by the parsing layer.
3. `POST /incidents/{id}/analyze` executes the AI pipeline:
   - Normalize evidence
   - Extract structured signals
   - Generate an incident summary
   - Rank root-cause hypotheses
   - Suggest potential fixes
   - Generate commit messages and pull request summaries
4. Results are stored in PostgreSQL.
5. `GET /incidents/{id}/results` retrieves the completed analysis for the frontend.

## Data Model

### incidents

Stores metadata about each debugging session together with generated summaries.

### evidence

Stores uploaded logs, stack traces, screenshots, bug reports, and normalized signal data.

### hypotheses

Stores ranked root-cause candidates with confidence scores and supporting evidence.

### fix_suggestions

Stores AI-generated remediation recommendations and links them to related hypotheses when applicable.

## API Design

The backend follows a layered architecture:

- FastAPI routes are organized under `app/api/routes`.
- SQLModel manages database models and sessions.
- Pydantic models define explicit request and response schemas.
- Ollama integration is isolated inside `app/services/ollama.py`, keeping the remainder of the application deterministic and easy to test.

## Frontend Design

The frontend is built with the Next.js App Router.

Key responsibilities include:

- Creating new incidents.
- Uploading debugging evidence.
- Displaying AI-generated analysis.
- Browsing previous incident history.

A typed API client located in `apps/web/lib/api.ts` converts backend snake_case responses into shared camelCase models used throughout the frontend.

Reusable UI components are built using a lightweight shadcn-inspired component system consisting of cards, badges, buttons, dialogs, and tabs.

## Design Principles

PatchPilot is designed around a few core principles:

- Separation of concerns between frontend, backend, and AI services.
- Strong typing across application boundaries.
- Modular parsing and prompt pipelines.
- Privacy-first local inference through Ollama.
- Deterministic processing outside of AI generation.
- Extensible architecture for future integrations such as GitHub, desktop clients, and evaluation dashboards.
