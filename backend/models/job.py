from sqlmodel import SQLModel, Field, Relationship  # type: ignore
from typing import TYPE_CHECKING, Optional, List, Dict, Any
from sqlalchemy import Column, JSON
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .job import Job, ProcessedJob
    from .resume import ProcessedResume


# Standardized Job Model based on JSON Resume Schema
class ProcessedJob(SQLModel, table=True):
    job_id: str = Field(primary_key=True, foreign_key="job.job_id")
    title: str
    company: str
    type: Optional[str] = None
    date: Optional[str] = None  # ISO8601
    description: Optional[str] = None
    location: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    remote: Optional[str] = None
    salary: Optional[str] = None
    experience: Optional[str] = None
    responsibilities: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    qualifications: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    skills: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    meta: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_job: Optional["Job"] = Relationship(back_populates="raw_job_association")
    processed_resumes: List["ProcessedResume"] = Relationship(
        back_populates="processed_jobs"
    )


class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True, unique=True)
    resume_id: str = Field(foreign_key="resume.resume_id")
    # Store the raw job JSON matching the standardized schema
    content: Dict[str, Any] = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_job_association: Optional["ProcessedJob"] = Relationship(
        back_populates="raw_job", sa_relationship_kwargs={"uselist": False}
    )
