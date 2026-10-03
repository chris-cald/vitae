from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Literal, Mapping
from uuid import UUID, uuid4

from pydantic import ValidationError
from sqlmodel import select

from db.db import AsyncSessionLocal
from src.models.runtime_execution import RuntimeExecution
from src.services.runtime_execution_adapter import (
    LocalTemporalAdapter,
    connect_temporal_adapter,
)
from src.services.runtime_execution_contract import (
    ExecutionCommand,
    RuntimeContractError,
)
from src.services.temporal_config import TemporalWorkerConfig

WorkflowType = Literal[
    "job-fit",
    "target-catalog-fit",
    "deliverable-generation",
    "application-automation",
    "book-of-work-refresh",
    "curation",
]

_ALLOWED_WORKFLOW_TYPES = set(WorkflowType.__args__)  # type: ignore[attr-defined]
_REQUEST_ID_PREFIXES = {
    "tenant_key": "tenant_",
    "correlation_id": "corr_",
    "idempotency_key": "idem_",
}

_FORBIDDEN_REQUEST_FIELDS = {
    "resume_content",
    "job_description",
    "prompt",
    "completion",
    "secret",
    "reviewer_comment",
    "error_message",
}


def _id(prefix: str) -> str:
    return f"{prefix}_{uuid4()}"


async def build_runtime_execution_service(
    env: Mapping[str, str] | None = None,
) -> "RuntimeExecutionService":
    env = os.environ if env is None else env
    if not env.get("TEMPORAL_ADDRESS"):
        return RuntimeExecutionService()
    adapter = await connect_temporal_adapter(TemporalWorkerConfig.from_env(env))
    return RuntimeExecutionService(adapter)


class RuntimeExecutionService:
    def __init__(self, adapter: Any | None = None) -> None:
        self.adapter = adapter or LocalTemporalAdapter()

    async def start(self, request: dict[str, Any]) -> tuple[RuntimeExecution, bool]:
        self._reject_unsafe_request(request)
        workflow_type = request.get("workflow_type")
        if workflow_type not in _ALLOWED_WORKFLOW_TYPES:
            raise RuntimeContractError("invalid-workflow-type")

        idempotency_key = request.get("idempotency_key") or _id("idem")
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(RuntimeExecution).where(
                    RuntimeExecution.idempotency_key == idempotency_key
                )
            )
            existing = result.scalars().first()
            if existing:
                return existing, False

            now = datetime.now(timezone.utc)
            execution = RuntimeExecution(
                execution_id=_id("exec"),
                tenant_key=request.get("tenant_key") or _id("tenant"),
                workflow_definition_id=_id("workflow"),
                workflow_version="v1",
                workflow_run_id=_id("workflowrun"),
                correlation_id=request.get("correlation_id") or _id("corr"),
                idempotency_key=idempotency_key,
                workflow_type=workflow_type,
                status_code="accepted",
                created_at=now,
                updated_at=now,
            )
            try:
                command = ExecutionCommand(
                    execution_id=execution.execution_id,
                    tenant_key=execution.tenant_key,
                    workflow_definition_id=execution.workflow_definition_id,
                    workflow_version=execution.workflow_version,
                    workflow_type=execution.workflow_type,  # type: ignore[arg-type]
                    workflow_run_id=execution.workflow_run_id,
                    correlation_id=execution.correlation_id,
                    idempotency_key=execution.idempotency_key,
                    actor_type="service",
                    command="start",
                    occurred_at=now,
                )
            except ValidationError as error:
                raise RuntimeContractError("invalid-execution-command") from None
            await self.adapter.start(command)
            session.add(execution)
            await session.commit()
            await session.refresh(execution)
            return execution, True

    async def cancel(self, execution_id: str) -> RuntimeExecution:
        return await self._signal(execution_id, "cancel")

    async def record_decision(self, execution_id: str, decision_code: str) -> RuntimeExecution:
        if decision_code not in {"approve", "reject", "cancel"}:
            raise RuntimeContractError("invalid-decision-code")
        return await self._signal(execution_id, decision_code)

    async def _signal(self, execution_id: str, decision_code: str) -> RuntimeExecution:
        async with AsyncSessionLocal() as session:
            execution = await session.get(RuntimeExecution, execution_id)
            if not execution:
                raise RuntimeContractError("execution-not-found")
            if execution.status_code in {"completed", "rejected", "cancelled"}:
                raise RuntimeContractError("stale-execution-decision")
            now = datetime.now(timezone.utc)
            command = ExecutionCommand(
                execution_id=execution.execution_id,
                tenant_key=execution.tenant_key,
                workflow_definition_id=execution.workflow_definition_id,
                workflow_version=execution.workflow_version,
                workflow_type=execution.workflow_type,  # type: ignore[arg-type]
                workflow_run_id=execution.workflow_run_id,
                correlation_id=execution.correlation_id,
                idempotency_key=_id("idem"),
                actor_type="user",
                command="cancel" if decision_code == "cancel" else "signal",
                decision_code=decision_code,  # type: ignore[arg-type]
                occurred_at=now,
            )
            await self.adapter.signal(command)
            execution.status_code = {
                "approve": "completed",
                "reject": "rejected",
                "cancel": "cancelled",
            }[decision_code]
            execution.updated_at = now
            session.add(execution)
            await session.commit()
            await session.refresh(execution)
            return execution

    async def fetch(self, execution_id: str) -> RuntimeExecution | None:
        async with AsyncSessionLocal() as session:
            return await session.get(RuntimeExecution, execution_id)

    def _reject_unsafe_request(self, request: dict[str, Any]) -> None:
        normalized = {"".join(ch for ch in key.lower() if ch.isalnum()) for key in request}
        forbidden = {"".join(ch for ch in key.lower() if ch.isalnum()) for key in _FORBIDDEN_REQUEST_FIELDS}
        if normalized & forbidden:
            raise RuntimeContractError("invalid-runtime-execution-request")
        for field, prefix in _REQUEST_ID_PREFIXES.items():
            if field not in request:
                continue
            value = request[field]
            if not isinstance(value, str) or not value.startswith(prefix):
                raise RuntimeContractError("invalid-execution-command")
            try:
                parsed = UUID(value.removeprefix(prefix))
            except ValueError:
                raise RuntimeContractError("invalid-execution-command") from None
            if parsed.version != 4:
                raise RuntimeContractError("invalid-execution-command")
