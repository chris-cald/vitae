from __future__ import annotations

import asyncio
import hmac
import logging
import os
import threading
from collections import OrderedDict
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Literal, Mapping
from uuid import UUID, uuid4

import jwt
from pydantic import ValidationError
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, update
from temporalio.exceptions import WorkflowAlreadyStartedError

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
    "actor_key": "actor_",
    "correlation_id": "corr_",
    "idempotency_key": "idem_",
}
logger = logging.getLogger(__name__)

_JWKS_CACHE_MAX_SIZE = 8
_jwks_clients: OrderedDict[str, Any] = OrderedDict()
_jwks_clients_lock = threading.Lock()
_DISPATCHABLE_STATUSES = {"pending-dispatch", "retryable-failure"}
_TERMINAL_STATUSES = {
    "completed",
    "rejected",
    "cancelled",
    "retryable-failure",
    "permanent-failure",
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


def _is_runtime_identifier(value: Any, prefix: str) -> bool:
    if not isinstance(value, str) or not value.startswith(prefix):
        return False
    try:
        return UUID(value.removeprefix(prefix)).version == 4
    except ValueError:
        return False


def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def _jwks_client(jwks_url: str) -> Any:
    with _jwks_clients_lock:
        cached = _jwks_clients.pop(jwks_url, None)
        if cached is not None:
            _jwks_clients[jwks_url] = cached
            return cached
        client = jwt.PyJWKClient(
            jwks_url, cache_keys=True, max_cached_keys=8, lifespan=300
        )
        _jwks_clients[jwks_url] = client
        while len(_jwks_clients) > _JWKS_CACHE_MAX_SIZE:
            _jwks_clients.popitem(last=False)
        return client


def _workflow_permissions(value: Any) -> frozenset[str]:
    if value == "*":
        return frozenset(_ALLOWED_WORKFLOW_TYPES)
    if not isinstance(value, (list, tuple, set)):
        return frozenset()
    if "*" in value:
        return frozenset(_ALLOWED_WORKFLOW_TYPES)
    return frozenset(item for item in value if item in _ALLOWED_WORKFLOW_TYPES)


@dataclass(frozen=True)
class RuntimeExecutionAuthority:
    """An authenticated, workflow-authorized actor with a server-selected tenant."""

    tenant_key: str
    actor_key: str
    allowed_workflow_types: frozenset[str]

    def authorize(self, workflow_type: str) -> None:
        if workflow_type not in self.allowed_workflow_types:
            raise RuntimeContractError("runtime-authorization-denied")

    @classmethod
    async def from_authorization_header(
        cls,
        authorization: str | None,
        env: Mapping[str, str] | None = None,
    ) -> "RuntimeExecutionAuthority":
        env = os.environ if env is None else env
        if env.get("RUNTIME_EXECUTION_AUTH_MODE") == "dummy":
            token = env.get("RUNTIME_EXECUTION_TOKEN")
            tenant_key = env.get("RUNTIME_EXECUTION_TENANT_KEY")
            actor_key = env.get("RUNTIME_EXECUTION_ACTOR_KEY")
            workflows = _workflow_permissions(
                env.get("RUNTIME_EXECUTION_ALLOWED_WORKFLOWS", "").split(",")
            )
            if not token or not tenant_key or not actor_key or authorization is None:
                raise RuntimeContractError("runtime-authorization-required")
            if not hmac.compare_digest(authorization.encode(), f"Bearer {token}".encode()):
                raise RuntimeContractError("runtime-authorization-denied")
            if not (
                _is_runtime_identifier(tenant_key, _REQUEST_ID_PREFIXES["tenant_key"])
                and _is_runtime_identifier(actor_key, _REQUEST_ID_PREFIXES["actor_key"])
                and workflows
            ):
                raise RuntimeContractError("runtime-authorization-required")
            return cls(tenant_key=tenant_key, actor_key=actor_key, allowed_workflow_types=workflows)
        if env.get("RUNTIME_EXECUTION_AUTH_MODE") != "oidc" or authorization is None:
            raise RuntimeContractError("runtime-authorization-required")
        return await asyncio.to_thread(cls._from_oidc_token, authorization, env)

    @classmethod
    def _from_oidc_token(
        cls, authorization: str, env: Mapping[str, str]
    ) -> "RuntimeExecutionAuthority":
        issuer = env.get("RUNTIME_OIDC_ISSUER")
        audience = env.get("RUNTIME_OIDC_AUDIENCE")
        jwks_url = env.get("RUNTIME_OIDC_JWKS_URL")
        tenant_claim = env.get("RUNTIME_OIDC_TENANT_CLAIM", "vitae_tenant")
        actor_claim = env.get("RUNTIME_OIDC_ACTOR_CLAIM", "sub")
        workflow_claim = env.get("RUNTIME_OIDC_WORKFLOW_CLAIM", "vitae_runtime_workflows")
        if not issuer or not audience or not jwks_url or not authorization.startswith("Bearer "):
            raise RuntimeContractError("runtime-authorization-required")
        try:
            token = authorization.removeprefix("Bearer ")
            key = _jwks_client(jwks_url).get_signing_key_from_jwt(token).key
            claims = jwt.decode(
                token,
                key,
                algorithms=["RS256"],
                audience=audience,
                issuer=issuer,
                options={"require": ["exp", "sub"]},
            )
        except (jwt.PyJWTError, OSError, ValueError):
            raise RuntimeContractError("runtime-authorization-denied") from None
        tenant_key = claims.get(tenant_claim)
        actor_key = claims.get(actor_claim)
        workflows = _workflow_permissions(claims.get(workflow_claim))
        if not (
            _is_runtime_identifier(tenant_key, _REQUEST_ID_PREFIXES["tenant_key"])
            and _is_runtime_identifier(actor_key, _REQUEST_ID_PREFIXES["actor_key"])
            and workflows
        ):
            raise RuntimeContractError("runtime-authorization-denied")
        return cls(tenant_key=tenant_key, actor_key=actor_key, allowed_workflow_types=workflows)


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

    async def start(
        self, request: dict[str, Any], authority: RuntimeExecutionAuthority
    ) -> tuple[RuntimeExecution, bool]:
        self._reject_unsafe_request(request)
        workflow_type = request.get("workflow_type")
        if workflow_type not in _ALLOWED_WORKFLOW_TYPES:
            raise RuntimeContractError("invalid-workflow-type")
        authority.authorize(workflow_type)

        idempotency_key = request.get("idempotency_key") or _id("idem")
        now = datetime.now(timezone.utc)
        execution = RuntimeExecution(
            execution_id=_id("exec"),
            tenant_key=authority.tenant_key,
            workflow_definition_id=_id("workflow"),
            workflow_version="v1",
            workflow_run_id=_id("workflowrun"),
            correlation_id=request.get("correlation_id") or _id("corr"),
            idempotency_key=idempotency_key,
            workflow_type=workflow_type,
            status_code="pending-dispatch",
            created_at=now,
            updated_at=now,
        )
        created = True
        async with AsyncSessionLocal() as session:
            existing = (
                await session.execute(
                    select(RuntimeExecution).where(
                        RuntimeExecution.idempotency_key == idempotency_key
                    )
                )
            ).scalars().first()
            if existing:
                execution, created = existing, False
            else:
                session.add(execution)
                try:
                    await session.commit()
                except IntegrityError:
                    await session.rollback()
                    execution = (
                        await session.execute(
                            select(RuntimeExecution).where(
                                RuntimeExecution.idempotency_key == idempotency_key
                            )
                        )
                    ).scalars().first()
                    if execution is None:
                        raise
                    created = False
            if execution.tenant_key != authority.tenant_key:
                raise RuntimeContractError("runtime-authorization-denied")
            authority.authorize(execution.workflow_type)

        if execution.status_code in _DISPATCHABLE_STATUSES or (
            execution.status_code == "dispatching"
            and _as_utc(execution.updated_at) <= datetime.now(timezone.utc) - timedelta(minutes=1)
        ):
            execution = await self._dispatch(execution, authority)
        return execution, created

    async def _dispatch(
        self, execution: RuntimeExecution, authority: RuntimeExecutionAuthority
    ) -> RuntimeExecution:
        now = datetime.now(timezone.utc)
        async with AsyncSessionLocal() as session:
            claimed = await session.execute(
                update(RuntimeExecution)
                .where(
                    RuntimeExecution.execution_id == execution.execution_id,
                    or_(
                        RuntimeExecution.status_code.in_(_DISPATCHABLE_STATUSES),
                        (
                            (RuntimeExecution.status_code == "dispatching")
                            & (RuntimeExecution.updated_at <= now - timedelta(minutes=1))
                        ),
                    ),
                )
                .values(
                    status_code="dispatching",
                    updated_at=now,
                    dispatch_attempt=RuntimeExecution.dispatch_attempt + 1,
                )
            )
            await session.commit()
            persisted = await session.get(RuntimeExecution, execution.execution_id)
            if not claimed.rowcount or persisted is None:
                return persisted or execution
            dispatch_attempt = persisted.dispatch_attempt

        try:
            command = ExecutionCommand(
                execution_id=persisted.execution_id,
                tenant_key=persisted.tenant_key,
                actor_key=authority.actor_key,
                workflow_definition_id=persisted.workflow_definition_id,
                workflow_version=persisted.workflow_version,
                workflow_type=persisted.workflow_type,  # type: ignore[arg-type]
                workflow_run_id=persisted.workflow_run_id,
                correlation_id=persisted.correlation_id,
                idempotency_key=persisted.idempotency_key,
                actor_type="user",
                command="start",
                occurred_at=datetime.now(timezone.utc),
            )
        except ValidationError:
            raise RuntimeContractError("invalid-execution-command") from None

        try:
            await self.adapter.start(command)
        except WorkflowAlreadyStartedError:
            pass
        except Exception as error:
            logger.error(
                "runtime adapter dispatch failed execution_id=%s exception_type=%s",
                persisted.execution_id,
                type(error).__name__,
            )
            async with AsyncSessionLocal() as session:
                await session.execute(
                    update(RuntimeExecution)
                    .where(
                        RuntimeExecution.execution_id == persisted.execution_id,
                        RuntimeExecution.dispatch_attempt == dispatch_attempt,
                        RuntimeExecution.status_code == "dispatching",
                    )
                    .values(status_code="retryable-failure", updated_at=datetime.now(timezone.utc))
                )
                await session.commit()
            raise RuntimeContractError("runtime-start-failed") from None

        async with AsyncSessionLocal() as session:
            await session.execute(
                update(RuntimeExecution)
                .where(
                    RuntimeExecution.execution_id == persisted.execution_id,
                    RuntimeExecution.dispatch_attempt == dispatch_attempt,
                    RuntimeExecution.status_code == "dispatching",
                )
                .values(status_code="accepted", updated_at=datetime.now(timezone.utc))
            )
            await session.commit()
            started = await session.get(RuntimeExecution, persisted.execution_id)
            if started is not None:
                return started
        return persisted

    async def cancel(
        self, execution_id: str, authority: RuntimeExecutionAuthority
    ) -> RuntimeExecution:
        return await self._signal(execution_id, "cancel", authority)

    async def record_decision(
        self,
        execution_id: str,
        decision_code: str,
        authority: RuntimeExecutionAuthority,
    ) -> RuntimeExecution:
        if decision_code not in {"approve", "reject", "cancel"}:
            raise RuntimeContractError("invalid-decision-code")
        return await self._signal(execution_id, decision_code, authority)

    async def _signal(
        self,
        execution_id: str,
        decision_code: str,
        authority: RuntimeExecutionAuthority,
    ) -> RuntimeExecution:
        async with AsyncSessionLocal() as session:
            execution = await session.get(RuntimeExecution, execution_id)
            if not execution:
                raise RuntimeContractError("execution-not-found")
            if execution.tenant_key != authority.tenant_key:
                raise RuntimeContractError("runtime-authorization-denied")
            if execution.status_code in _TERMINAL_STATUSES:
                raise RuntimeContractError("stale-execution-decision")
            now = datetime.now(timezone.utc)
            command = ExecutionCommand(
                execution_id=execution.execution_id,
                tenant_key=execution.tenant_key,
                actor_key=authority.actor_key,
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

    async def fetch(
        self, execution_id: str, authority: RuntimeExecutionAuthority
    ) -> RuntimeExecution | None:
        async with AsyncSessionLocal() as session:
            execution = await session.get(RuntimeExecution, execution_id)
            if execution is not None and execution.tenant_key != authority.tenant_key:
                raise RuntimeContractError("runtime-authorization-denied")
            return execution

    def _reject_unsafe_request(self, request: dict[str, Any]) -> None:
        normalized = {"".join(ch for ch in key.lower() if ch.isalnum()) for key in request}
        forbidden = {"".join(ch for ch in key.lower() if ch.isalnum()) for key in _FORBIDDEN_REQUEST_FIELDS}
        if normalized & forbidden or "tenantkey" in normalized:
            raise RuntimeContractError("invalid-runtime-execution-request")
        for field, prefix in _REQUEST_ID_PREFIXES.items():
            if field not in request:
                continue
            value = request[field]
            if not _is_runtime_identifier(value, prefix):
                raise RuntimeContractError("invalid-execution-command")
