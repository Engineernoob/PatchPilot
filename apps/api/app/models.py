from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.utcnow()


class Incident(SQLModel, table=True):
    __tablename__ = "incidents"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    title: str = Field(index=True)
    description: str
    repo_url: str | None = None
    status: str = Field(default="pending", index=True)
    summary: str | None = None
    commit_message: str | None = None
    pr_summary: str | None = None
    created_at: datetime = Field(default_factory=utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": utcnow},
    )


class Evidence(SQLModel, table=True):
    __tablename__ = "evidence"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    incident_id: str = Field(foreign_key="incidents.id", index=True)
    kind: str = Field(index=True)
    source_name: str | None = None
    raw_content: str
    signal: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=utcnow, nullable=False)


class Hypothesis(SQLModel, table=True):
    __tablename__ = "hypotheses"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    incident_id: str = Field(foreign_key="incidents.id", index=True)
    rank: int = Field(index=True)
    title: str
    description: str
    confidence: float
    evidence_snippets: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=utcnow, nullable=False)


class FixSuggestion(SQLModel, table=True):
    __tablename__ = "fix_suggestions"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    incident_id: str = Field(foreign_key="incidents.id", index=True)
    hypothesis_rank: int | None = Field(default=None, index=True)
    title: str
    description: str
    patch_hint: str | None = None
    created_at: datetime = Field(default_factory=utcnow, nullable=False)

