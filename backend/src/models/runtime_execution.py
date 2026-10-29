from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column
import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class RuntimeExecution(SQLModel, table=True):
    execution_id: str = Field(sa_column=Column(sa.String(), primary_key=True))
    tenant_key: str = Field(sa_column=Column(sa.String(), index=True))
    workflow_definition_id: str = Field(sa_column=Column(sa.String(), index=True))
    workflow_version: str = Field(sa_column=Column(sa.String()))
    workflow_run_id: Optional[str] = Field(default=None, sa_column=Column(sa.String()))
    correlation_id: str = Field(sa_column=Column(sa.String(), index=True))
    idempotency_key: str = Field(sa_column=Column(sa.String(), unique=True, index=True))
    workflow_type: str = Field(sa_column=Column(sa.String(), index=True))
    status_code: str = Field(sa_column=Column(sa.String(), index=True))
    dispatch_attempt: int = Field(default=0, sa_column=Column(sa.Integer(), nullable=False, server_default="0"))
    diagnostic_code: Optional[str] = Field(default=None, sa_column=Column(sa.String()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
