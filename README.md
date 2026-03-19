# PatchPilot

PatchPilot is an open-source AI support engineer for debugging apps, ranking root causes, and generating patch-ready fixes from logs, stack traces, screenshots, and bug reports.

## Why PatchPilot?

Most debugging tools stop at showing errors.

PatchPilot goes further by turning messy incident evidence into structured engineering outputs:
- concise incident summaries
- ranked root-cause hypotheses
- suggested fixes
- draft commit messages
- PR-ready summaries

It is designed for developers who want faster triage, clearer diagnostics, and a cleaner path from failure to fix.

## Features

- Upload logs, stack traces, screenshots, and bug reports
- Parse raw evidence into structured signals
- Generate AI-assisted incident summaries
- Rank likely root causes with confidence scores
- Suggest fixes based on available evidence
- Generate draft commit messages and pull request summaries
- Save incident history for later review
- Run locally with Ollama for privacy-friendly workflows

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- FastAPI
- Python
- SQLAlchemy / SQLModel

### Data
- Postgres

### AI
- Ollama

## Architecture Overview

PatchPilot has two main applications:

- `apps/web` — frontend for uploads, results, and history
- `apps/api` — backend for ingestion, parsing, storage, and AI analysis

Supporting packages include:
- `packages/shared` — shared contracts and types
- `packages/prompts` — versioned AI prompt templates
- `packages/parsers` — evidence extraction logic
- `packages/evals` — evaluation helpers

## How It Works

1. Create an incident
2. Upload logs, stack traces, screenshots, or bug details
3. Normalize and parse evidence
4. Extract failure signals
5. Generate a structured incident summary
6. Rank root-cause hypotheses
7. Generate suggested fixes and shipping artifacts

## Quickstart

### Prerequisites
- Docker
- Docker Compose
- Ollama installed locally

### Setup

```bash
git clone https://github.com/yourusername/patchpilot.git
cd patchpilot
cp .env.example .env
docker compose up --build
```
# Run Ollama
ollama serve
ollama pull model_name

Then open the app in your browser.

# Example Outputs

PatchPilot can generate:
	•	a readable incident summary
	•	likely root causes
	•	confidence-ranked hypotheses
	•	fix suggestions
	•	draft commit messages
	•	pull request notes

## Project Status

PatchPilot is currently in MVP development.

Current MVP Scope
	•	incident creation
	•	evidence upload
	•	log parsing
	•	AI analysis
	•	results dashboard
	•	saved incident history

Planned
	•	GitHub integration
	•	incident replay mode
	•	similar incident retrieval
	•	eval dashboard
	•	team workspaces
	•	desktop app via Tauri

Documentation
	•	ARCHITECTURE.md
	•	ROADMAP.md
	•	EVALS.md

Contributing

Contributions are welcome. Open an issue, suggest a feature, or submit a PR.

License

MIT


