# Getting Started

Welcome to PatchPilot.

This guide walks you through setting up a local development environment for PatchPilot. By the end, you'll have the frontend, backend, database, and local AI model running on your machine.

---

## Prerequisites

Before you begin, install the following:

- Git
- Docker
- Docker Compose
- Ollama
- Node.js 20+
- Python 3.12+

Verify your installation:

```bash
node --version
python --version
docker --version
ollama --version
```

---

## Clone the Repository

```bash
git clone https://github.com/yourusername/patchpilot.git

cd patchpilot
```

---

## Configure Environment Variables

Create a local environment file:

```bash
cp .env.example .env
```

Update any required configuration values before starting the application.

---

## Start Supporting Services

Launch PostgreSQL and any additional infrastructure:

```bash
docker compose up --build
```

Leave Docker running while developing.

---

## Start Ollama

In a separate terminal:

```bash
ollama serve
```

Download your preferred model (example):

```bash
ollama pull llama3.1:8b
```

---

## Start the Backend

```bash
cd apps/api

uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

---

## Start the Frontend

Open another terminal:

```bash
cd apps/web

npm install
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

## Verify Your Installation

Once everything is running, you should be able to:

- Create a new incident.
- Upload logs or stack traces.
- Run AI analysis.
- View generated summaries and suggested fixes.
- Browse previous incidents.

---

## Common Issues

### Ollama is not running

Start the Ollama server:

```bash
ollama serve
```

### Docker services fail to start

Verify Docker Desktop is running and retry:

```bash
docker compose up --build
```

### Frontend cannot reach the API

Confirm that:

- FastAPI is running.
- Environment variables are configured correctly.
- The frontend is pointing to the correct backend URL.

---

## Next Steps

Continue with:

- `architecture.md`
- `api-reference.md`
- `troubleshooting.md`
- `roadmap.md`
