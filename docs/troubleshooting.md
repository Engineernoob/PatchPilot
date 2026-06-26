

# Troubleshooting

## Overview

This guide covers common issues you may encounter while installing, configuring, or running PatchPilot.

For installation instructions, see `getting-started.md`.

---

## Ollama Is Not Running

### Symptoms

- AI analysis never starts.
- Requests timeout.
- Connection refused errors.

### Solution

Start the Ollama server:

```bash
ollama serve
```

Verify it is running:

```bash
ollama list
```

---

## Model Not Found

### Symptoms

- "Model does not exist"
- Failed inference requests

### Solution

Download the required model:

```bash
ollama pull llama3.1:8b
```

Update your environment variables if you're using a different model.

---

## Docker Containers Fail to Start

### Symptoms

- Docker exits immediately.
- Database unavailable.
- Container startup failures.

### Solution

Confirm Docker Desktop is running, then rebuild the containers:

```bash
docker compose down

docker compose up --build
```

Review container logs for additional details:

```bash
docker compose logs
```

---

## Frontend Cannot Connect to the API

### Symptoms

- Network request failures
- CORS errors
- Empty dashboard

### Solution

Verify:

- FastAPI is running.
- The backend URL is configured correctly.
- Required environment variables are present.
- No firewall or proxy is blocking local traffic.

---

## Database Connection Errors

### Symptoms

- Failed database migrations
- Connection refused
- Unable to save incidents

### Solution

Verify PostgreSQL is running and confirm the database connection string in your `.env` file.

Restart the database if necessary.

---

## Analysis Never Completes

### Symptoms

- Incident remains in a processing state.
- No generated results appear.

### Solution

Check:

- Ollama is running.
- The configured model has been downloaded.
- Backend logs for AI pipeline errors.
- Uploaded evidence is valid.

---

## Poor AI Results

### Symptoms

- Weak summaries
- Low-confidence hypotheses
- Irrelevant fix suggestions

### Suggestions

Improve the quality of uploaded evidence by including:

- Complete stack traces
- Relevant logs
- Clear reproduction steps
- Screenshots when appropriate
- Environment details

Higher-quality input generally produces better results.

---

## Collecting Diagnostic Information

Before reporting an issue, gather:

- PatchPilot version
- Operating system
- Ollama version
- Model name
- Docker version
- Relevant logs
- Error messages
- Steps to reproduce

Providing complete diagnostic information helps maintainers investigate issues more efficiently.

---

## Still Need Help?

If the issue persists:

1. Search existing GitHub Issues.
2. Review the project documentation.
3. Open a new issue with diagnostic information and reproduction steps.

Include screenshots and logs whenever possible to speed up troubleshooting.