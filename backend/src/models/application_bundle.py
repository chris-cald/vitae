from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import Column, JSON
import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class ApplicationBundle(SQLModel, table=True):
    application_id: str = Field(sa_column=Column(sa.String(), primary_key=True))
    bundle_id: str = Field(sa_column=Column(sa.String(), unique=True, index=True))
    job_fit_id: str = Field(sa_column=Column(sa.String(), sa.ForeignKey("jobfit.id"), index=True))
    resume_id: str = Field(sa_column=Column(sa.String(), index=True))
    job_id: str = Field(sa_column=Column(sa.String(), index=True))
    target_id: str = Field(sa_column=Column(sa.String(), index=True))
    fit_analysis_id: str = Field(sa_column=Column(sa.String(), index=True))
    status: str = Field(default="draft", sa_column=Column(sa.String(), index=True))
    deliverable_ids: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    note_ids: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    source_refs: list[dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    target: dict[str, Any] = Field(sa_column=Column(JSON))
    fit_analysis: dict[str, Any] = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ApplicationRecord(SQLModel, table=True):
    id: str = Field(sa_column=Column(sa.String(), primary_key=True))
    application_id: str = Field(sa_column=Column(sa.String(), sa.ForeignKey("applicationbundle.application_id"), index=True))
    record_type: str = Field(sa_column=Column(sa.String(), index=True))
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    note_ids: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
