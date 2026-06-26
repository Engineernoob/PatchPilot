# API Reference

## Overview

PatchPilot exposes a REST API that allows the frontend to create incidents, upload debugging evidence, trigger AI analysis, and retrieve structured results.

All endpoints return JSON and use standard HTTP status codes.

---

## Base URL

```text
http://localhost:8000/api/v1
```

---

# Incidents

## Create Incident

```http
POST /incidents
```

Creates a new debugging incident.

### Request

```json
{
  "title": "Application crashes on startup",
  "description": "The app exits immediately after launching.",
  "severity": "high"
}
```

### Response

```json
{
  "id": "inc_123456",
  "status": "created"
}
```

---

## Get Incident

```http
GET /incidents/{incidentId}
```

Returns metadata for a single incident.

---

## List Incidents

```http
GET /incidents
```

Returns all saved incidents.

---

# Evidence

## Upload Evidence

```http
POST /incidents/{incidentId}/evidence
```

Accepts:

- Log files
- Stack traces
- Screenshots
- Bug reports

Supported content types:

- text/plain
- application/json
- image/png
- image/jpeg

---

# Analysis

## Run Analysis

```http
POST /incidents/{incidentId}/analyze
```

Runs the complete AI pipeline.

Pipeline stages:

1. Normalize evidence
2. Extract structured signals
3. Generate incident summary
4. Rank root-cause hypotheses
5. Generate fix suggestions
6. Produce commit message
7. Generate pull request summary

### Response

```json
{
  "status": "completed"
}
```

---

## Get Results

```http
GET /incidents/{incidentId}/results
```

Returns:

- Incident summary
- Root-cause hypotheses
- Confidence scores
- Suggested fixes
- Commit message
- Pull request summary

---

# Health Check

```http
GET /health
```

Returns:

```json
{
  "status": "ok"
}
```

---

# Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Invalid request |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Internal server error |

---

# Authentication

Authentication is not required for the current MVP.

Future versions will support API keys and GitHub OAuth.
