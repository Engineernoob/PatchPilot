import {
  AnalysisResultSchema,
  CreateIncidentRequestSchema,
  IncidentDetailSchema,
  IncidentListSchema,
  IncidentSchema,
  type AnalysisResult,
  type CreateIncidentRequest,
  type Incident,
  type IncidentDetail
} from "@patchpilot/shared";

type ApiEvidenceSignal = {
  error_type?: string | null;
  candidate_file?: string | null;
  timestamp?: string | null;
  relevant_lines?: string[];
  severity?: string;
  service?: string | null;
  repeated_patterns?: string[];
};

type ApiEvidence = {
  id: string;
  incident_id: string;
  kind: string;
  source_name?: string | null;
  raw_content: string;
  signal: ApiEvidenceSignal;
  created_at: string;
};

type ApiHypothesis = {
  id: string;
  incident_id: string;
  rank: number;
  title: string;
  description: string;
  confidence: number;
  evidence_snippets: string[];
};

type ApiFixSuggestion = {
  id: string;
  incident_id: string;
  hypothesis_rank?: number | null;
  title: string;
  description: string;
  patch_hint?: string | null;
};

type ApiIncident = {
  id: string;
  title: string;
  description: string;
  repo_url?: string | null;
  status: string;
  summary?: string | null;
  commit_message?: string | null;
  pr_summary?: string | null;
  created_at: string;
  updated_at: string;
};

type ApiIncidentDetail = ApiIncident & {
  evidence: ApiEvidence[];
  hypotheses: ApiHypothesis[];
  fix_suggestions: ApiFixSuggestion[];
};

type ApiAnalysisResult = {
  incident_id: string;
  summary: string;
  hypotheses: ApiHypothesis[];
  fix_suggestions: ApiFixSuggestion[];
  commit_message: string;
  pr_summary: string;
  evidence_snippets: string[];
  generated_at: string;
};

class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.PATCHPILOT_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      message = body.detail ?? message;
    } catch {
      // Intentionally ignored. The status code is enough for the UI.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

function mapIncident(raw: ApiIncident): Incident {
  return IncidentSchema.parse({
    id: raw.id,
    title: raw.title,
    description: raw.description,
    repoUrl: raw.repo_url ?? null,
    status: raw.status,
    summary: raw.summary ?? null,
    commitMessage: raw.commit_message ?? null,
    prSummary: raw.pr_summary ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at
  });
}

function mapIncidentDetail(raw: ApiIncidentDetail): IncidentDetail {
  return IncidentDetailSchema.parse({
    ...mapIncident(raw),
    evidence: raw.evidence.map((item) => ({
      id: item.id,
      incidentId: item.incident_id,
      kind: item.kind,
      sourceName: item.source_name ?? null,
      rawContent: item.raw_content,
      signal: {
        errorType: item.signal.error_type ?? null,
        candidateFile: item.signal.candidate_file ?? null,
        timestamp: item.signal.timestamp ?? null,
        relevantLines: item.signal.relevant_lines ?? [],
        severity: item.signal.severity ?? "info",
        service: item.signal.service ?? null,
        repeatedPatterns: item.signal.repeated_patterns ?? []
      },
      createdAt: item.created_at
    })),
    hypotheses: raw.hypotheses.map((item) => ({
      id: item.id,
      incidentId: item.incident_id,
      rank: item.rank,
      title: item.title,
      description: item.description,
      confidence: item.confidence,
      evidenceSnippets: item.evidence_snippets
    })),
    fixSuggestions: raw.fix_suggestions.map((item) => ({
      id: item.id,
      incidentId: item.incident_id,
      hypothesisRank: item.hypothesis_rank ?? null,
      title: item.title,
      description: item.description,
      patchHint: item.patch_hint ?? null
    }))
  });
}

function mapAnalysisResult(raw: ApiAnalysisResult): AnalysisResult {
  return AnalysisResultSchema.parse({
    incidentId: raw.incident_id,
    summary: raw.summary,
    hypotheses: raw.hypotheses.map((item) => ({
      id: item.id,
      incidentId: item.incident_id,
      rank: item.rank,
      title: item.title,
      description: item.description,
      confidence: item.confidence,
      evidenceSnippets: item.evidence_snippets
    })),
    fixSuggestions: raw.fix_suggestions.map((item) => ({
      id: item.id,
      incidentId: item.incident_id,
      hypothesisRank: item.hypothesis_rank ?? null,
      title: item.title,
      description: item.description,
      patchHint: item.patch_hint ?? null
    })),
    commitMessage: raw.commit_message,
    prSummary: raw.pr_summary,
    evidenceSnippets: raw.evidence_snippets,
    generatedAt: raw.generated_at
  });
}

export async function listIncidents(): Promise<Incident[]> {
  const raw = await fetchJson<ApiIncident[]>("/incidents");
  return IncidentListSchema.parse(raw.map(mapIncident));
}

export async function getIncident(id: string): Promise<IncidentDetail> {
  const raw = await fetchJson<ApiIncidentDetail>(`/incidents/${id}`);
  return mapIncidentDetail(raw);
}

export async function getResults(id: string): Promise<AnalysisResult | null> {
  try {
    const raw = await fetchJson<ApiAnalysisResult>(`/incidents/${id}/results`);
    return mapAnalysisResult(raw);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createIncident(payload: CreateIncidentRequest): Promise<IncidentDetail> {
  const parsed = CreateIncidentRequestSchema.parse(payload);
  const raw = await fetchJson<ApiIncidentDetail>("/incidents", {
    method: "POST",
    body: JSON.stringify({
      title: parsed.title,
      description: parsed.description,
      repo_url: parsed.repoUrl ?? null,
      logs: parsed.logs ?? null,
      screenshot_name: parsed.screenshotName ?? null,
      screenshot_content_base64: parsed.screenshotContentBase64 ?? null
    })
  });
  return mapIncidentDetail(raw);
}

export async function analyzeIncident(id: string): Promise<AnalysisResult> {
  const raw = await fetchJson<ApiAnalysisResult>(`/incidents/${id}/analyze`, {
    method: "POST"
  });
  return mapAnalysisResult(raw);
}
