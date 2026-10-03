"""PII-safe contracts for the future Vitae durable-execution adapter.

This module intentionally has no Temporal, database, HTTP, ORM, or model-provider
imports. It validates only the minimal opaque data that a later adapter may serialize.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
import re
from typing import Any, Literal, Mapping
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator

MAX_TEMPORAL_PAYLOAD_BYTES = 4_096
MAX_COUNT = 1_000_000
_IDENTIFIER_PREFIXES = {
    "execution_id": "exec_",
    "tenant_key": "tenant_",
    "workflow_definition_id": "workflow_",
    "workflow_run_id": "workflowrun_",
    "correlation_id": "corr_",
    "idempotency_key": "idem_",
}
_WORKFLOW_VERSION_PATTERN = re.compile(r"^v[1-9][0-9]{0,7}$")
WorkflowType = Literal[
    "job-fit",
    "target-catalog-fit",
    "deliverable-generation",
    "application-automation",
    "book-of-work-refresh",
    "curation",
]
_FORBIDDEN_FIELD_FRAGMENTS = frozenset(
    {
        "resume", "jobdescription", "prompt", "completion", "secret", "password",
        "token", "credential", "content", "body", "text", "message", "error",
        "exception", "reviewer", "comment", "filename", "filepath", "url", "source",
        "document",
    }
)


class RuntimeContractError(ValueError):
    """A safe, code-only runtime-boundary validation failure."""

    __slots__ = ("code",)

    def __init__(self, code: str) -> None:
        self.code = code
        super().__init__()

    def __str__(self) -> str:
        return self.code

    def as_dict(self) -> dict[str, str]:
        """Return a serialization-safe public error without rejected input."""
        return {"code": self.code}


class RuntimeStatusCode(str, Enum):
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    RETRYABLE_FAILURE = "retryable-failure"
    PERMANENT_FAILURE = "permanent-failure"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class DiagnosticCode(str, Enum):
    ACTIVITY_FAILED = "activity-failed"
    AUTHORIZATION_DENIED = "authorization-denied"
    DEADLINE_EXCEEDED = "deadline-exceeded"
    IDEMPOTENCY_CONFLICT = "idempotency-conflict"
    PAYLOAD_INVALID = "payload-invalid"
    SOURCE_FETCH_TIMEOUT = "source-fetch-timeout"
    WORKFLOW_NOT_FOUND = "workflow-not-found"


class _SafeRuntimeModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
        hide_input_in_errors=True,
        validation_error_cause=False,
    )

    @model_validator(mode="before")
    @classmethod
    def reject_forbidden_fields(cls, value: Any) -> Any:
        if not isinstance(value, Mapping):
            return value
        for field_name in value:
            normalized = "".join(
                character for character in str(field_name).lower() if character.isalnum()
            )
            if any(fragment in normalized for fragment in _FORBIDDEN_FIELD_FRAGMENTS):
                raise ValueError("forbidden-runtime-payload-field")
        return value


def _validate_identifier(field_name: str, value: str | None) -> str | None:
    if value is None:
        return None
    prefix = _IDENTIFIER_PREFIXES[field_name]
    if not value.startswith(prefix):
        raise ValueError("invalid-system-identifier")
    try:
        parsed = UUID(value.removeprefix(prefix))
    except ValueError as error:
        raise ValueError("invalid-system-identifier") from error
    if parsed.version != 4:
        raise ValueError("invalid-system-identifier")
    return value


class ExecutionCommand(_SafeRuntimeModel):
    """An allowlisted, system-identifier-only command for a future Temporal adapter.

    Construct untrusted inputs through :func:`parse_execution_command`, which returns
    only code-safe failures. Direct model construction is reserved for trusted code.
    """

    execution_id: str = Field(serialization_alias="executionId")
    tenant_key: str = Field(serialization_alias="tenantKey")
    workflow_definition_id: str = Field(serialization_alias="workflowDefinitionId")
    workflow_version: str = Field(serialization_alias="workflowVersion")
    workflow_type: WorkflowType = Field(serialization_alias="workflowType")
    workflow_run_id: str | None = Field(default=None, serialization_alias="workflowRunId")
    correlation_id: str = Field(serialization_alias="correlationId")
    idempotency_key: str = Field(serialization_alias="idempotencyKey")
    actor_type: Literal["service", "user"] = Field(serialization_alias="actorType")
    command: Literal["start", "signal", "cancel"]
    decision_code: Literal["approve", "reject", "cancel"] | None = Field(
        default=None, serialization_alias="decisionCode"
    )
    occurred_at: datetime = Field(serialization_alias="occurredAt")

    @field_validator(*_IDENTIFIER_PREFIXES)
    @classmethod
    def require_system_identifier(cls, value: str | None, info: Any) -> str | None:
        return _validate_identifier(info.field_name, value)

    @field_validator("workflow_version")
    @classmethod
    def require_deployment_controlled_version(cls, value: str) -> str:
        if not _WORKFLOW_VERSION_PATTERN.fullmatch(value):
            raise ValueError("invalid-workflow-version")
        return value


class ActivityResult(_SafeRuntimeModel):
    """A code-only Activity outcome safe for workflow history and telemetry."""

    execution_id: str
    correlation_id: str
    status_code: RuntimeStatusCode
    diagnostic_code: DiagnosticCode | None = None
    retryable: bool
    attempt: int = Field(ge=1, le=MAX_COUNT)
    record_count: int | None = Field(default=None, ge=0, le=MAX_COUNT)
    byte_count: int | None = Field(default=None, ge=0, le=MAX_COUNT)
    occurred_at: datetime

    @field_validator("execution_id", "correlation_id")
    @classmethod
    def require_system_identifier(cls, value: str, info: Any) -> str:
        return _validate_identifier(info.field_name, value) or ""


def parse_execution_command(value: Mapping[str, Any]) -> ExecutionCommand:
    """Validate untrusted command data without exposing rejected values publicly."""
    invalid_command = False
    try:
        command = ExecutionCommand.model_validate(value)
    except (TypeError, ValidationError):
        invalid_command = True
    else:
        return command

    if invalid_command:
        raise RuntimeContractError("invalid-execution-command")
    raise AssertionError("unreachable command parsing state")


def build_temporal_payload(
    command: ExecutionCommand, *, max_payload_bytes: int = MAX_TEMPORAL_PAYLOAD_BYTES
) -> dict[str, Any]:
    """Return the exact allowlisted payload or fail before a client call exists."""
    if max_payload_bytes < 1:
        raise RuntimeContractError("invalid-payload-limit")

    payload = command.model_dump(mode="json", by_alias=True, exclude_none=True)
    payload_bytes = len(command.model_dump_json(by_alias=True, exclude_none=True).encode("utf-8"))
    if payload_bytes > max_payload_bytes:
        raise RuntimeContractError("payload-too-large")
    return payload


def redact_exception(
    exception: Exception,
    *,
    execution_id: str,
    correlation_id: str,
) -> ActivityResult:
    """Discard exception text and emit only a safe retryable failure classification."""
    del exception
    return ActivityResult(
        execution_id=execution_id,
        correlation_id=correlation_id,
        status_code=RuntimeStatusCode.RETRYABLE_FAILURE,
        diagnostic_code=DiagnosticCode.ACTIVITY_FAILED,
        retryable=True,
        attempt=1,
        occurred_at=datetime.now(timezone.utc),
    )
