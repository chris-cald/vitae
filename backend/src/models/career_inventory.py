from datetime import datetime, timezone
from typing import Any

import sqlalchemy as sa
from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class CareerInventorySeed(SQLModel, table=True):
    id: str = Field(sa_column=Column(sa.String(), primary_key=True))
    source_id: str = Field(sa_column=Column(sa.String(), index=True, unique=True))
    status: str = Field(sa_column=Column(sa.String(), index=True))
    source_ref: dict[str, Any] = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CareerInventoryAction(SQLModel, table=True):
    id: str = Field(sa_column=Column(sa.String(), primary_key=True))
    action: str = Field(sa_column=Column(sa.String(), index=True))
    seed_id: str | None = Field(default=None, sa_column=Column(sa.String(), index=True))
    status: str = Field(sa_column=Column(sa.String(), index=True))
    provenance_ref: dict[str, Any] = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
