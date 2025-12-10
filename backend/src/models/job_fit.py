from sqlmodel import SQLModel, Field  # type: ignore
from typing import List, Dict, Optional


from sqlalchemy import Column, JSON
import sqlalchemy as sa


class JobFit(SQLModel, table=True):
    id: str = Field(sa_column=Column(sa.String(), primary_key=True))
    resume_id: str = Field(sa_column=Column(sa.String()))
    job_id: str = Field(sa_column=Column(sa.String()))
    links: Optional[List[Dict[str, str]]] = Field(default=None, sa_column=Column(JSON))


class ScoreResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    score: int
    links: Optional[List[Dict[str, str]]] = Field(default=None, sa_column=Column(JSON))


class FeedbackItem(SQLModel, table=False):
    intent: str  # preserve, add, remove, reword, reformat, move, clarify
    message: str
    lineNumber: str
    weight: float  # 0=lowest, 1=highest
