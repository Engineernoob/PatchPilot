from __future__ import annotations

from datetime import datetime
from itertools import chain

from sqlmodel import Session, delete, select

from app.models import Evidence, FixSuggestion, Hypothesis, Incident
from app.prompt_templates import artifacts_prompt, fixes_prompt, hypotheses_prompt, summary_prompt
from app.schemas import (
    AIArtifactsResponse,
    AIFixesResponse,
    AIHypothesesResponse,
    AISummaryResponse,
    AnalysisResultRead,
    EvidenceSignal,
    FixSuggestionRead,
    HypothesisRead,
)
from app.services.ollama import OllamaService
from app.services.parsers import extract_signal_rollup


class AnalysisService:
    def __init__(self) -> None:
        self.ollama = OllamaService()

    def analyze_incident(self, session: Session, incident: Incident) -> AnalysisResultRead:
        evidence_rows = session.exec(
            select(Evidence).where(Evidence.incident_id == incident.id).order_by(Evidence.created_at)
        ).all()
        signals = [EvidenceSignal.model_validate(row.signal) for row in evidence_rows]
        rollup = extract_signal_rollup(signals)
        payload = self._prompt_payload(incident, evidence_rows, rollup)

        summary_result = self.ollama.generate_json(summary_prompt(payload), AISummaryResponse)
        if summary_result is None:
            summary_result = self._fallback_summary(incident, signals, rollup)

        hypothesis_result = self.ollama.generate_json(hypotheses_prompt(payload), AIHypothesesResponse)
        if hypothesis_result is None or len(hypothesis_result.hypotheses) < 3:
            hypothesis_result = self._fallback_hypotheses(signals, rollup)

        fix_result = self.ollama.generate_json(fixes_prompt(payload), AIFixesResponse)
        if fix_result is None or not fix_result.fix_suggestions:
            fix_result = self._fallback_fixes(hypothesis_result)

        artifact_result = self.ollama.generate_json(artifacts_prompt(payload), AIArtifactsResponse)
        if artifact_result is None:
            artifact_result = self._fallback_artifacts(incident, hypothesis_result)

        evidence_snippets = self._dedupe_snippets(
            chain(
                summary_result.evidence_snippets,
                *(hypothesis.evidence_snippets for hypothesis in hypothesis_result.hypotheses),
                (line for signal in signals for line in signal.relevant_lines),
            ),
            limit=8,
        )

        incident.summary = summary_result.summary
        incident.commit_message = artifact_result.commit_message
        incident.pr_summary = artifact_result.pr_summary
        incident.status = "analyzed"
        incident.updated_at = datetime.utcnow()
        session.add(incident)

        session.exec(delete(Hypothesis).where(Hypothesis.incident_id == incident.id))
        session.exec(delete(FixSuggestion).where(FixSuggestion.incident_id == incident.id))

        persisted_hypotheses: list[Hypothesis] = []
        for item in self._normalize_hypotheses(hypothesis_result):
            hypothesis = Hypothesis(
                incident_id=incident.id,
                rank=item.rank,
                title=item.title,
                description=item.description,
                confidence=max(0.0, min(1.0, item.confidence)),
                evidence_snippets=item.evidence_snippets[:4],
            )
            session.add(hypothesis)
            persisted_hypotheses.append(hypothesis)

        persisted_fixes: list[FixSuggestion] = []
        for item in fix_result.fix_suggestions:
            fix = FixSuggestion(
                incident_id=incident.id,
                hypothesis_rank=item.hypothesis_rank,
                title=item.title,
                description=item.description,
                patch_hint=item.patch_hint,
            )
            session.add(fix)
            persisted_fixes.append(fix)

        session.commit()
        for hypothesis in persisted_hypotheses:
            session.refresh(hypothesis)
        for fix in persisted_fixes:
            session.refresh(fix)
        session.refresh(incident)

        return AnalysisResultRead(
            incident_id=incident.id,
            summary=incident.summary or "",
            hypotheses=[self._hypothesis_read(item) for item in persisted_hypotheses],
            fix_suggestions=[self._fix_read(item) for item in persisted_fixes],
            commit_message=incident.commit_message or "",
            pr_summary=incident.pr_summary or "",
            evidence_snippets=evidence_snippets,
            generated_at=incident.updated_at,
        )

    def _prompt_payload(self, incident: Incident, evidence_rows: list[Evidence], rollup: dict[str, list[str]]) -> str:
        snippets = []
        for row in evidence_rows[:8]:
            lines = row.signal.get("relevant_lines", [])[:3]
            snippets.append(
                {
                    "kind": row.kind,
                    "source_name": row.source_name,
                    "signal": row.signal,
                    "lines": lines,
                }
            )

        return (
            f"Incident title: {incident.title}\n"
            f"Description: {incident.description}\n"
            f"Repository URL: {incident.repo_url or 'n/a'}\n"
            f"Signal rollup: {rollup}\n"
            f"Evidence: {snippets}"
        )

    def _fallback_summary(
        self, incident: Incident, signals: list[EvidenceSignal], rollup: dict[str, list[str]]
    ) -> AISummaryResponse:
        primary_error = rollup["errors"][0] if rollup["errors"] else "application error"
        primary_file = rollup["files"][0] if rollup["files"] else "an unknown module"
        summary = (
            f"{incident.title} is failing with {primary_error}, with the strongest signal pointing to "
            f"{primary_file}. The incident aggregates {len(signals)} normalized evidence items and shows "
            f"repeated failures in the same execution path."
        )
        snippets = [line for signal in signals for line in signal.relevant_lines][:4]
        return AISummaryResponse(summary=summary, evidence_snippets=snippets)

    def _fallback_hypotheses(
        self, signals: list[EvidenceSignal], rollup: dict[str, list[str]]
    ) -> AIHypothesesResponse:
        primary_error = rollup["errors"][0] if rollup["errors"] else "runtime failure"
        primary_file = rollup["files"][0] if rollup["files"] else "the application boundary"
        primary_service = rollup["services"][0] if rollup["services"] else "the core service"
        snippets = [line for signal in signals for line in signal.relevant_lines][:6]

        return AIHypothesesResponse(
            hypotheses=[
                {
                    "rank": 1,
                    "title": f"Unhandled {primary_error} in {primary_file}",
                    "description": (
                        f"The leading evidence points to {primary_error} originating in {primary_file}, "
                        "suggesting missing guards or invalid input handling in that code path."
                    ),
                    "confidence": 0.82,
                    "evidence_snippets": snippets[:2],
                },
                {
                    "rank": 2,
                    "title": f"Downstream dependency instability in {primary_service}",
                    "description": (
                        f"Repeated error patterns implicate {primary_service}, which may be surfacing bad "
                        "responses or timing issues that bubble up into the failing request path."
                    ),
                    "confidence": 0.63,
                    "evidence_snippets": snippets[2:4],
                },
                {
                    "rank": 3,
                    "title": "Regression introduced by recent configuration or release changes",
                    "description": (
                        "The incident may be caused by a recent deploy, config drift, or environment mismatch "
                        "that only appears under the current workload."
                    ),
                    "confidence": 0.41,
                    "evidence_snippets": snippets[4:6],
                },
            ]
        )

    def _fallback_fixes(self, hypotheses: AIHypothesesResponse) -> AIFixesResponse:
        suggestions = []
        for hypothesis in hypotheses.hypotheses:
            suggestions.append(
                {
                    "hypothesis_rank": hypothesis.rank,
                    "title": f"Add targeted guardrails for hypothesis #{hypothesis.rank}",
                    "description": (
                        f"Instrument and patch the code path described in '{hypothesis.title}' with input "
                        "validation, explicit error handling, and regression coverage."
                    ),
                    "patch_hint": "Add validation, improve error handling, and cover the failing path with tests.",
                }
            )
        return AIFixesResponse(fix_suggestions=suggestions)

    def _normalize_hypotheses(self, response: AIHypothesesResponse):
        normalized = sorted(response.hypotheses, key=lambda hypothesis: (hypothesis.rank, -hypothesis.confidence))[:3]
        repaired = []
        for index, item in enumerate(normalized, start=1):
            repaired.append(
                item.model_copy(
                    update={
                        "rank": index,
                        "evidence_snippets": self._dedupe_snippets(item.evidence_snippets, limit=4),
                    }
                )
            )
        return repaired

    def _fallback_artifacts(
        self, incident: Incident, hypotheses: AIHypothesesResponse
    ) -> AIArtifactsResponse:
        primary_title = hypotheses.hypotheses[0].title.lower()
        return AIArtifactsResponse(
            commit_message=f"fix: address {primary_title}",
            pr_summary=(
                f"Stabilizes {incident.title} by addressing the leading incident hypothesis, tightening "
                "error handling around the failing path, and documenting the evidence used for diagnosis."
            ),
        )

    def _hypothesis_read(self, hypothesis: Hypothesis) -> HypothesisRead:
        return HypothesisRead(
            id=hypothesis.id,
            incident_id=hypothesis.incident_id,
            rank=hypothesis.rank,
            title=hypothesis.title,
            description=hypothesis.description,
            confidence=hypothesis.confidence,
            evidence_snippets=hypothesis.evidence_snippets,
        )

    def _fix_read(self, fix: FixSuggestion) -> FixSuggestionRead:
        return FixSuggestionRead(
            id=fix.id,
            incident_id=fix.incident_id,
            hypothesis_rank=fix.hypothesis_rank,
            title=fix.title,
            description=fix.description,
            patch_hint=fix.patch_hint,
        )

    def _dedupe_snippets(self, snippets, limit: int) -> list[str]:
        seen: set[str] = set()
        deduped: list[str] = []
        for snippet in snippets:
            cleaned = (snippet or "").strip()
            if not cleaned or cleaned in seen:
                continue
            seen.add(cleaned)
            deduped.append(cleaned)
            if len(deduped) >= limit:
                break
        return deduped
