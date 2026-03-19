from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import Evidence, FixSuggestion, Hypothesis, Incident
from app.schemas import (
    AnalysisResultRead,
    EvidenceCreate,
    EvidenceRead,
    IncidentCreate,
    IncidentDetail,
    IncidentRead,
)
from app.services.analysis import AnalysisService
from app.services.parsers import parse_content


router = APIRouter(prefix="/incidents", tags=["incidents"])
analysis_service = AnalysisService()


@router.post("", response_model=IncidentDetail, status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate, session: Session = Depends(get_session)) -> IncidentDetail:
    incident = Incident(title=payload.title, description=payload.description, repo_url=payload.repo_url, status="pending")
    description_kind, description_signal = parse_content(payload.description, "description")

    try:
        session.add(incident)
        session.flush()
        session.add(
            _build_evidence(
                incident_id=incident.id,
                kind=description_kind,
                source_name="incident-description",
                raw_content=payload.description,
                signal=description_signal.model_dump(),
            )
        )

        if payload.logs:
            logs_kind, logs_signal = parse_content(payload.logs, "log")
            session.add(
                _build_evidence(
                    incident_id=incident.id,
                    kind=logs_kind,
                    source_name="uploaded-logs",
                    raw_content=payload.logs,
                    signal=logs_signal.model_dump(),
                )
            )

        if payload.screenshot_content_base64:
            screenshot_signal = description_signal.model_copy(
                update={
                    "severity": "info",
                    "relevant_lines": [f"Screenshot attached: {payload.screenshot_name or 'incident-screenshot'}"],
                }
            )
            session.add(
                _build_evidence(
                    incident_id=incident.id,
                    kind="screenshot",
                    source_name=payload.screenshot_name or "incident-screenshot",
                    raw_content=payload.screenshot_content_base64,
                    signal=screenshot_signal.model_dump(),
                )
            )

        session.commit()
        session.refresh(incident)
    except Exception:
        session.rollback()
        raise

    return _incident_detail(session, incident)


@router.get("", response_model=list[IncidentRead])
def list_incidents(session: Session = Depends(get_session)) -> list[IncidentRead]:
    incidents = session.exec(select(Incident).order_by(Incident.created_at.desc())).all()
    return [IncidentRead.model_validate(incident, from_attributes=True) for incident in incidents]


@router.get("/{incident_id}", response_model=IncidentDetail)
def get_incident(incident_id: str, session: Session = Depends(get_session)) -> IncidentDetail:
    incident = session.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return _incident_detail(session, incident)


@router.post("/{incident_id}/evidence", response_model=EvidenceRead, status_code=status.HTTP_201_CREATED)
def add_evidence(
    incident_id: str, payload: EvidenceCreate, session: Session = Depends(get_session)
) -> EvidenceRead:
    incident = session.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    kind, signal = parse_content(payload.raw_content, payload.kind)
    evidence = _build_evidence(
        incident_id=incident_id,
        kind=kind,
        source_name=payload.source_name,
        raw_content=payload.raw_content,
        signal=signal.model_dump(),
    )
    try:
        incident.updated_at = datetime.utcnow()
        session.add(incident)
        session.add(evidence)
        session.commit()
        session.refresh(evidence)
    except Exception:
        session.rollback()
        raise

    return _evidence_read(evidence)


@router.post("/{incident_id}/analyze", response_model=AnalysisResultRead)
def analyze_incident(incident_id: str, session: Session = Depends(get_session)) -> AnalysisResultRead:
    incident = session.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    incident.status = "analyzing"
    incident.updated_at = datetime.utcnow()
    session.add(incident)
    session.commit()
    session.refresh(incident)

    try:
        return analysis_service.analyze_incident(session, incident)
    except Exception as exc:
        session.rollback()
        incident.status = "failed"
        incident.updated_at = datetime.utcnow()
        session.add(incident)
        session.commit()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/{incident_id}/results", response_model=AnalysisResultRead)
def get_results(incident_id: str, session: Session = Depends(get_session)) -> AnalysisResultRead:
    incident = session.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    if not incident.summary or not incident.commit_message or not incident.pr_summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Results not available")

    hypotheses = session.exec(
        select(Hypothesis).where(Hypothesis.incident_id == incident_id).order_by(Hypothesis.rank)
    ).all()
    fixes = session.exec(
        select(FixSuggestion)
        .where(FixSuggestion.incident_id == incident_id)
        .order_by(FixSuggestion.hypothesis_rank)
    ).all()
    evidence = session.exec(
        select(Evidence).where(Evidence.incident_id == incident_id).order_by(Evidence.created_at)
    ).all()

    snippets = []
    for row in evidence:
        snippets.extend(row.signal.get("relevant_lines", [])[:2])

    return AnalysisResultRead(
        incident_id=incident.id,
        summary=incident.summary,
        hypotheses=[_hypothesis_read(item) for item in hypotheses],
        fix_suggestions=[_fix_read(item) for item in fixes],
        commit_message=incident.commit_message,
        pr_summary=incident.pr_summary,
        evidence_snippets=_dedupe(snippets, limit=8),
        generated_at=incident.updated_at,
    )


def _incident_detail(session: Session, incident: Incident) -> IncidentDetail:
    evidence = session.exec(
        select(Evidence).where(Evidence.incident_id == incident.id).order_by(Evidence.created_at)
    ).all()
    hypotheses = session.exec(
        select(Hypothesis).where(Hypothesis.incident_id == incident.id).order_by(Hypothesis.rank)
    ).all()
    fixes = session.exec(
        select(FixSuggestion)
        .where(FixSuggestion.incident_id == incident.id)
        .order_by(FixSuggestion.hypothesis_rank)
    ).all()

    return IncidentDetail(
        **IncidentRead.model_validate(incident, from_attributes=True).model_dump(),
        evidence=[_evidence_read(item) for item in evidence],
        hypotheses=[_hypothesis_read(item) for item in hypotheses],
        fix_suggestions=[_fix_read(item) for item in fixes],
    )


def _build_evidence(
    incident_id: str, kind: str, source_name: str | None, raw_content: str, signal: dict
) -> Evidence:
    return Evidence(
        incident_id=incident_id,
        kind=kind,
        source_name=source_name,
        raw_content=raw_content,
        signal=signal,
    )


def _evidence_read(evidence: Evidence) -> EvidenceRead:
    return EvidenceRead(
        id=evidence.id,
        incident_id=evidence.incident_id,
        kind=evidence.kind,
        source_name=evidence.source_name,
        raw_content=evidence.raw_content,
        signal=evidence.signal,
        created_at=evidence.created_at,
    )


def _hypothesis_read(hypothesis: Hypothesis):
    return {
        "id": hypothesis.id,
        "incident_id": hypothesis.incident_id,
        "rank": hypothesis.rank,
        "title": hypothesis.title,
        "description": hypothesis.description,
        "confidence": hypothesis.confidence,
        "evidence_snippets": hypothesis.evidence_snippets,
    }


def _fix_read(fix: FixSuggestion):
    return {
        "id": fix.id,
        "incident_id": fix.incident_id,
        "hypothesis_rank": fix.hypothesis_rank,
        "title": fix.title,
        "description": fix.description,
        "patch_hint": fix.patch_hint,
    }


def _dedupe(items: list[str], limit: int) -> list[str]:
    seen: set[str] = set()
    deduped: list[str] = []
    for item in items:
        cleaned = item.strip()
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        deduped.append(cleaned)
        if len(deduped) >= limit:
            break
    return deduped
