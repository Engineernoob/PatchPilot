from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class EvidenceSignal(BaseModel):
    error_type: str | None = None
    candidate_file: str | None = None
    timestamp: str | None = None
    relevant_lines: list[str] = Field(default_factory=list)
    severity: str = "info"
    service: str | None = None
    repeated_patterns: list[str] = Field(default_factory=list)


class IncidentCreate(BaseModel):
    title: str
    description: str
    repo_url: str | None = None
    logs: str | None = None
    screenshot_name: str | None = None
    screenshot_content_base64: str | None = None


class EvidenceCreate(BaseModel):
    kind: str
    source_name: str | None = None
    raw_content: str


class IncidentRead(BaseModel):
    id: str
    title: str
    description: str
    repo_url: str | None = None
    status: str
    summary: str | None = None
    commit_message: str | None = None
    pr_summary: str | None = None
    created_at: datetime
    updated_at: datetime


class EvidenceRead(BaseModel):
    id: str
    incident_id: str
    kind: str
    source_name: str | None = None
    raw_content: str
    signal: EvidenceSignal
    created_at: datetime


class HypothesisRead(BaseModel):
    id: str
    incident_id: str
    rank: int
    title: str
    description: str
    confidence: float
    evidence_snippets: list[str] = Field(default_factory=list)


class FixSuggestionRead(BaseModel):
    id: str
    incident_id: str
    hypothesis_rank: int | None = None
    title: str
    description: str
    patch_hint: str | None = None


class IncidentDetail(IncidentRead):
    evidence: list[EvidenceRead] = Field(default_factory=list)
    hypotheses: list[HypothesisRead] = Field(default_factory=list)
    fix_suggestions: list[FixSuggestionRead] = Field(default_factory=list)


class AnalysisResultRead(BaseModel):
    incident_id: str
    summary: str
    hypotheses: list[HypothesisRead]
    fix_suggestions: list[FixSuggestionRead]
    commit_message: str
    pr_summary: str
    evidence_snippets: list[str] = Field(default_factory=list)
    generated_at: datetime


class AISummaryResponse(BaseModel):
    summary: str
    evidence_snippets: list[str] = Field(default_factory=list)


class AIHypothesisItem(BaseModel):
    rank: int
    title: str
    description: str
    confidence: float
    evidence_snippets: list[str] = Field(default_factory=list)


class AIHypothesesResponse(BaseModel):
    hypotheses: list[AIHypothesisItem]


class AIFixSuggestionItem(BaseModel):
    hypothesis_rank: int | None = None
    title: str
    description: str
    patch_hint: str | None = None


class AIFixesResponse(BaseModel):
    fix_suggestions: list[AIFixSuggestionItem]


class AIArtifactsResponse(BaseModel):
    commit_message: str
    pr_summary: str

