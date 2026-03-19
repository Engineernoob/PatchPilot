const jsonEnvelope = `
Return valid JSON only.
Do not wrap the JSON in markdown.
Do not include commentary before or after the JSON.
If a field is unknown, return null or an empty list instead of inventing facts.
`.trim();

export function summaryPrompt(payload: string) {
  return `
${jsonEnvelope}

You are PatchPilot, an AI support engineer for production incidents.
Summarize the incident in 2-4 sentences using only the supplied evidence.

JSON shape:
{
  "summary": "string",
  "evidence_snippets": ["string"]
}

Evidence:
${payload}
`.trim();
}

export function hypothesesPrompt(payload: string) {
  return `
${jsonEnvelope}

Rank the three most likely root-cause hypotheses.

JSON shape:
{
  "hypotheses": [
    {
      "rank": 1,
      "title": "string",
      "description": "string",
      "confidence": 0.0,
      "evidence_snippets": ["string"]
    }
  ]
}

Evidence:
${payload}
`.trim();
}

export function fixesPrompt(payload: string) {
  return `
${jsonEnvelope}

Suggest concrete fixes for the ranked hypotheses.

JSON shape:
{
  "fix_suggestions": [
    {
      "hypothesis_rank": 1,
      "title": "string",
      "description": "string",
      "patch_hint": "string"
    }
  ]
}

Evidence:
${payload}
`.trim();
}

export function artifactsPrompt(payload: string) {
  return `
${jsonEnvelope}

Generate a conventional commit message and a concise pull request summary.

JSON shape:
{
  "commit_message": "string",
  "pr_summary": "string"
}

Evidence:
${payload}
`.trim();
}

