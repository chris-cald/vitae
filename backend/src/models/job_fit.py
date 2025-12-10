from sqlmodel import SQLModel, Field  # type: ignore
from typing import List, Dict
from enum import Enum
from sqlalchemy import Column, JSON
import sqlalchemy as sa


class FeedbackIntent(str, Enum):
    PRESERVE = "preserve"
    ADD = "add"
    REMOVE = "remove"
    REWORD = "reword"
    REFORMAT = "reformat"
    MOVE = "move"
    CLARIFY = "clarify"


class Skill(SQLModel, table=False):
    name: str
    score: float = Field(ge=0, le=1)  # 0=lowest, 1=highest


class FeedbackItem(SQLModel, table=False):
    job_fit_id: str
    intent: FeedbackIntent
    message: str
    lineNumber: str
    weight: float = Field(ge=0, le=1)  # 0=lowest, 1=highest

    @property
    def links(self) -> list[Dict[str, str]]:
        job_fit_id = self.job_fit_id
        return [
            {"rel": "self", "href": f"/api/v1/job-fit/{job_fit_id}/score"},
            {
                "rel": "feedback",
                "href": f"/api/v1/job-fit/{job_fit_id}/feedback",
            },
        ]


class JobFit(SQLModel, table=True):
    id: str = Field(sa_column=Column(sa.String(), primary_key=True))
    resume_id: str = Field(sa_column=Column(sa.String()))
    job_id: str = Field(sa_column=Column(sa.String()))
    score: float = Field(
        sa_column=Column(sa.Float()), ge=0, le=1
    )  # 0=lowest, 1=highest
    analysis: str = Field(sa_column=Column(sa.String()))
    feedback: List[FeedbackItem] = Field(
        sa_column=Column(JSON), repr=False, exclude=True
    )
    keywords: List[str] = Field(sa_column=Column(JSON))
    skills: List[Skill] = Field(sa_column=Column(JSON), repr=False)
    created_at: str = Field(
        sa_column=Column(sa.String()),
        regex=r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$",
    )

    @property
    def links(self) -> list[Dict[str, str]]:
        return [
            {"rel": "self", "href": f"/api/v1/job-fit/{self.id}"},
            {"rel": "skills", "href": f"/api/v1/job-fit/{self.id}/skills"},
            {"rel": "feedback", "href": f"/api/v1/job-fit/{self.id}/feedback"},
            {"rel": "resume", "href": f"/api/v1/resume/{self.resume_id}"},
            {"rel": "job", "href": f"/api/v1/job/{self.job_id}"},
        ]
