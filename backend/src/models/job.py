from sqlmodel import SQLModel, Field, Relationship  # type: ignore
from typing import TYPE_CHECKING, Optional, List, Dict, Any
from sqlalchemy import Column, JSON, ForeignKey
import sqlalchemy as sa
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .job import RawJob, Job
    from .resume import Resume


# Standardized Job Model based on JSON Resume Schema


class Job(SQLModel, table=True):
    job_id: str = Field(
        sa_column=Column(sa.String(), ForeignKey("job.job_id"), primary_key=True)
    )
    name: str = Field(
        sa_column=Column(sa.String(), nullable=False)
    )  # Required user-friendly name
    resume_id: Optional[str] = Field(
        default=None,
        sa_column=Column(sa.String(), ForeignKey("resume.resume_id")),
    )
    title: str = Field(sa_column=Column(sa.String()))
    company: str = Field(sa_column=Column(sa.String()))
    type: Optional[str] = Field(default=None, sa_column=Column(sa.String()))
    date: Optional[str] = Field(default=None, sa_column=Column(sa.String()))  # ISO8601
    description: Optional[str] = Field(default=None, sa_column=Column(sa.String()))
    location: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    remote: Optional[str] = Field(default=None, sa_column=Column(sa.String()))
    salary: Optional[str] = Field(default=None, sa_column=Column(sa.String()))
    experience: Optional[str] = Field(default=None, sa_column=Column(sa.String()))
    responsibilities: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    qualifications: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    skills: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    meta: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    profile_categories: Optional[Dict[str, Any]] = Field(
        default=None, sa_column=Column(JSON)
    )
    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_job: Optional["RawJob"] = Relationship(back_populates="raw_job_association")
    resume: Optional["Resume"] = Relationship(back_populates="jobs")


class RawJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(
        sa_column=Column(sa.String(), ForeignKey("job.job_id"), unique=True, index=True)
    )
    resume_id: str = Field(
        sa_column=Column(sa.String(), ForeignKey("resume.resume_id"))
    )
    # Store the raw job JSON matching the standardized schema
    content: Dict[str, Any] = Field(sa_column=Column(JSON))
    file_path: Optional[str] = Field(default=None, sa_column=Column(sa.String()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_job_association: Optional["Job"] = Relationship(
        back_populates="raw_job", sa_relationship_kwargs={"uselist": False}
    )
