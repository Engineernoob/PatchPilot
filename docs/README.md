## PatchPilot

AI-powered debugging assistant that transforms logs, stack traces, screenshots, and bug reports into structured incident analysis, ranked root-cause hypotheses, and patch-ready engineering artifacts.

PatchPilot helps developers spend less time investigating failures and more time shipping fixes.

Instead of manually piecing together logs, screenshots, and bug reports, PatchPilot analyzes incident evidence and generates actionable insights that accelerate debugging.

## Features

* 📄 Upload logs, stack traces, screenshots, and bug reports
* 🔍 Parse raw debugging evidence into structured signals
* 🤖 Generate AI-assisted incident summaries
* 📊 Rank likely root causes with confidence scores
* 🛠 Suggest potential fixes based on available evidence
* 💬 Generate draft commit messages
* 🚀 Generate pull request summaries
* 📚 Store incident history for future reference
* 🔒 Run entirely locally with Ollama for privacy-first workflows

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* FastAPI
* Python
* SQLAlchemy / SQLModel

### Database

* PostgreSQL

### AI

* Ollama

## Project Structure


```text
patchpilot/
├── apps/
│   ├── api/          # FastAPI backend
│   └── web/          # Next.js frontend
│
├── packages/
│   ├── parsers/      # Evidence parsing
│   ├── prompts/      # Versioned prompt templates
│   ├── shared/       # Shared types
│   └── evals/        # Evaluation utilities
│
└── docker/
```
## Architecture

PatchPilot consists of two primary applications:

- apps/web

Responsible for:

* Incident creation
* File uploads
* Results dashboard
* Incident history
* User interface

- apps/api

Responsible for:

* Evidence ingestion
* Parsing
* AI orchestration
* Persistence
* Incident analysis

Shared packages contain reusable business logic, prompt templates, parsers, and evaluation helpers.


## How It Works

```
Create Incident
        │
        ▼
Upload Evidence
(logs, screenshots, bug reports)
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
Rank Root Causes
        │
        ▼
Generate Suggested Fixes
        │
        ▼
Produce Commit Message + PR Summary
```

## Quick Start

Prerequisites

* Docker
* Docker Compose
* Ollama

## Installation
```text
git clone https://github.com/yourusername/patchpilot.git
cd patchpilot
cp .env.example .env
docker compose up --build
```

Start Ollama:
- ollama serve

- Download a model:
```
ollama pull llama3.1:8b

Open the application:

http://localhost:3000
```

## Example Output

PatchPilot can generate:

* Incident summary
* Ranked root-cause hypotheses
* Confidence scores
* Suggested fixes
* Draft commit messages
* Pull request summaries

## Roadmap

MVP

* Incident creation
* Evidence upload
* Log parsing
* AI analysis
* Results dashboard
* Incident history

## Planned

* GitHub integration
* Similar incident retrieval
* Incident replay mode
* Evaluation dashboard
* Team workspaces
* Desktop application (Tauri)

### Documentation

* ARCHITECTURE.md
* ROADMAP.md
* EVALS.md

### Contributing

Contributions are welcome.

Please open an issue before beginning large changes.

Bug reports, feature requests, documentation improvements, and pull requests are all appreciated.



### License

MIT
