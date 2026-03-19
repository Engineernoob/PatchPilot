def _json_envelope() -> str:
    return """
Return valid JSON only.
Do not wrap the JSON in markdown.
Do not add commentary or explanation outside the JSON.
Use null or [] when a field is unknown.
""".strip()


def summary_prompt(payload: str) -> str:
    return f"""
{_json_envelope()}

You are PatchPilot, an AI support engineer reviewing an incident.
Produce a concise 2-4 sentence summary grounded only in the supplied evidence.

JSON shape:
{{
  "summary": "string",
  "evidence_snippets": ["string"]
}}

Evidence:
{payload}
""".strip()


def hypotheses_prompt(payload: str) -> str:
    return f"""
{_json_envelope()}

Rank exactly 3 root-cause hypotheses.

JSON shape:
{{
  "hypotheses": [
    {{
      "rank": 1,
      "title": "string",
      "description": "string",
      "confidence": 0.0,
      "evidence_snippets": ["string"]
    }}
  ]
}}

Evidence:
{payload}
""".strip()


def fixes_prompt(payload: str) -> str:
    return f"""
{_json_envelope()}

Suggest concrete fixes for the ranked hypotheses.

JSON shape:
{{
  "fix_suggestions": [
    {{
      "hypothesis_rank": 1,
      "title": "string",
      "description": "string",
      "patch_hint": "string"
    }}
  ]
}}

Evidence:
{payload}
""".strip()


def artifacts_prompt(payload: str) -> str:
    return f"""
{_json_envelope()}

Generate a conventional commit message and a concise pull request summary.

JSON shape:
{{
  "commit_message": "string",
  "pr_summary": "string"
}}

Evidence:
{payload}
""".strip()

