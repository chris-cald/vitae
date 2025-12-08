from sqlmodel import SQLModel, Field  # type: ignore
from typing import List, Dict, Optional


class JobFit(SQLModel, table=True):
    id: str = Field(primary_key=True)
    resume_id: str
    job_id: str
    links: Optional[List[Dict[str, str]]] = None


class ScoreResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    score: int
    links: Optional[List[Dict[str, str]]] = None


class FeedbackItem(SQLModel, table=False):
    intent: str  # preserve, add, remove, reword, reformat, move, clarify
    message: str
    lineNumber: str
    weight: float  # 0=lowest, 1=highest
