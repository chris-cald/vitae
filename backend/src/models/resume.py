from sqlmodel import SQLModel, Field, Relationship  # type: ignore
from typing import TYPE_CHECKING, Optional, List, Dict, Any
from sqlalchemy import Column, JSON, ForeignKey
import sqlalchemy as sa
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .job import Job
    from .resume import RawResume, Resume


class Resume(SQLModel, table=True):
    resume_id: str = Field(
        sa_column=Column(
            sa.String(), ForeignKey("rawresume.resume_id"), primary_key=True
        )
    )
    name: str = Field(
        sa_column=Column(sa.String(), nullable=False)
    )  # Required user-friendly name
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
    profile_categories: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_resume: Optional["RawResume"] = Relationship(
        back_populates="raw_resume_association"
    )
    jobs: List["Job"] = Relationship(back_populates="resume")


class RawResume(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resume_id: str = Field(sa_column=Column(sa.String(), unique=True, index=True))
    file_path: str = Field(sa_column=Column(sa.String()))  # path to uploaded file
    extracted_content: str = Field(sa_column=Column(sa.String()))  # text sent to LLM
    content_type: str = Field(sa_column=Column(sa.String()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_resume_association: Optional["Resume"] = Relationship(
        back_populates="raw_resume", sa_relationship_kwargs={"uselist": False}
    )
