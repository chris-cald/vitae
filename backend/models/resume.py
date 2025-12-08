from sqlmodel import SQLModel, Field, Relationship  # type: ignore
from typing import TYPE_CHECKING, Optional, List, Dict, Any
from sqlalchemy import Column, JSON
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .job import ProcessedJob
    from .resume import Resume, ProcessedResume


class ProcessedResume(SQLModel, table=True):
    resume_id: str = Field(primary_key=True, foreign_key="resume.resume_id")
    basics: Dict[str, Any] = Field(sa_column=Column(JSON))
    work: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    volunteer: Optional[List[Dict[str, Any]]] = Field(
        default=None, sa_column=Column(JSON)
    )
    education: Optional[List[Dict[str, Any]]] = Field(
        default=None, sa_column=Column(JSON)
    )
    awards: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    certificates: Optional[List[Dict[str, Any]]] = Field(
        default=None, sa_column=Column(JSON)
    )
    publications: Optional[List[Dict[str, Any]]] = Field(
        default=None, sa_column=Column(JSON)
    )
    skills: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    languages: Optional[List[Dict[str, Any]]] = Field(
        default=None, sa_column=Column(JSON)
    )
    interests: Optional[List[Dict[str, Any]]] = Field(
        default=None, sa_column=Column(JSON)
    )
    references: Optional[List[Dict[str, Any]]] = Field(
        default=None, sa_column=Column(JSON)
    )
    projects: Optional[List[Dict[str, Any]]] = Field(
        default=None, sa_column=Column(JSON)
    )
    meta: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_resume: Optional["Resume"] = Relationship(
        back_populates="raw_resume_association"
    )
    processed_jobs: List["ProcessedJob"] = Relationship(
        back_populates="processed_resumes"
    )


class Resume(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resume_id: str = Field(index=True, unique=True)
    content: str
    content_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_resume_association: Optional["ProcessedResume"] = Relationship(
        back_populates="raw_resume", sa_relationship_kwargs={"uselist": False}
    )
