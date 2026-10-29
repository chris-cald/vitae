from typing import Any

import sqlalchemy as sa
from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class BookOfWorkRefreshState(SQLModel, table=True):
    source_key: str = Field(sa_column=Column(sa.String(), primary_key=True))
    snapshot: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))
