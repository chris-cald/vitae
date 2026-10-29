from datetime import datetime, timezone
import json

import pytest
from pydantic import ValidationError

from src.services.runtime_execution_contract import (
    ActivityResult,
    ExecutionCommand,
    RuntimeContractError,
    RuntimeStatusCode,
    build_temporal_payload,
    parse_execution_command,
    redact_exception,
)


IDENTIFIER_SUFFIX = "00000000-0000-4000-8000-000000000001"


def command_payload(**overrides):
    payload = {
        "execution_id": f"exec_{IDENTIFIER_SUFFIX}",
        "tenant_key": f"tenant_{IDENTIFIER_SUFFIX}",
        "actor_key": f"actor_{IDENTIFIER_SUFFIX}",
        "workflow_definition_id": f"workflow_{IDENTIFIER_SUFFIX}",
        "workflow_version": "v1",
        "workflow_type": "curation",
        "workflow_run_id": f"workflowrun_{IDENTIFIER_SUFFIX}",
        "correlation_id": f"corr_{IDENTIFIER_SUFFIX}",
        "idempotency_key": f"idem_{IDENTIFIER_SUFFIX}",
        "actor_type": "service",
        "command": "start",
        "occurred_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
    }
    payload.update(overrides)
    return payload


def test_execution_command_serializes_only_allowlisted_opaque_fields():
    command = ExecutionCommand(**command_payload())

    assert build_temporal_payload(command) == {
        "executionId": f"exec_{IDENTIFIER_SUFFIX}",
        "tenantKey": f"tenant_{IDENTIFIER_SUFFIX}",
        "actorKey": f"actor_{IDENTIFIER_SUFFIX}",
        "workflowDefinitionId": f"workflow_{IDENTIFIER_SUFFIX}",
        "workflowVersion": "v1",
        "workflowType": "curation",
        "workflowRunId": f"workflowrun_{IDENTIFIER_SUFFIX}",
        "correlationId": f"corr_{IDENTIFIER_SUFFIX}",
        "idempotencyKey": f"idem_{IDENTIFIER_SUFFIX}",
        "actorType": "service",
        "command": "start",
        "occurredAt": "2025-01-01T00:00:00Z",
    }


@pytest.mark.parametrize(
    "unsafe_field",
    [
        "resume_content",
        "job_description",
        "prompt",
        "completion",
        "api_secret",
        "reviewer_comment",
        "error_message",
    ],
)
def test_execution_command_rejects_raw_content_and_freeform_error_fields(unsafe_field):
    with pytest.raises(ValidationError):
        ExecutionCommand(**command_payload(**{unsafe_field: "sensitive prose"}))


@pytest.mark.parametrize(
    "field,value",
    [
        ("execution_id", "candidate resume content should never be accepted"),
        ("tenant_key", "person@example.test"),
        ("workflow_definition_id", "workflow with spaces"),
        ("idempotency_key", ""),
        ("execution_id", "exec_jane.example"),
        ("tenant_key", "tenant_415-555-0199"),
        ("workflow_definition_id", "workflow_a1-b2.c3:d4"),
    ],
)
def test_execution_command_rejects_non_opaque_identifiers(field, value):
    with pytest.raises(ValidationError):
        ExecutionCommand(**command_payload(**{field: value}))


def test_activity_result_uses_only_safe_status_and_diagnostic_codes():
    result = ActivityResult(
        execution_id=f"exec_{IDENTIFIER_SUFFIX}",
        correlation_id=f"corr_{IDENTIFIER_SUFFIX}",
        status_code=RuntimeStatusCode.RETRYABLE_FAILURE,
        diagnostic_code="source-fetch-timeout",
        retryable=True,
        attempt=2,
        record_count=3,
        byte_count=128,
        occurred_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
    )

    assert result.model_dump(mode="json") == {
        "execution_id": f"exec_{IDENTIFIER_SUFFIX}",
        "correlation_id": f"corr_{IDENTIFIER_SUFFIX}",
        "status_code": "retryable-failure",
        "diagnostic_code": "source-fetch-timeout",
        "retryable": True,
        "attempt": 2,
        "record_count": 3,
        "byte_count": 128,
        "occurred_at": "2025-01-01T00:00:00Z",
    }


def test_activity_result_rejects_freeform_errors_and_unknown_diagnostics():
    with pytest.raises(ValidationError):
        ActivityResult(
            execution_id=f"exec_{IDENTIFIER_SUFFIX}",
            correlation_id=f"corr_{IDENTIFIER_SUFFIX}",
            status_code="failed",
            diagnostic_code="the resume parsing failed for Jane Example",
            retryable=False,
            attempt=1,
            error="raw exception text",
            occurred_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
        )


def test_execution_command_rejects_unsupported_workflow_type():
    with pytest.raises(ValidationError):
        ExecutionCommand(**command_payload(workflow_type="unknown"))


def test_payload_size_limit_fails_closed_before_any_client_call():
    command = ExecutionCommand(**command_payload())

    with pytest.raises(RuntimeContractError, match="payload-too-large"):
        build_temporal_payload(command, max_payload_bytes=40)


def test_exception_redaction_never_returns_exception_text():
    safe = redact_exception(
        RuntimeError("resume text and API key must not leave Vitae"),
        execution_id=f"exec_{IDENTIFIER_SUFFIX}",
        correlation_id=f"corr_{IDENTIFIER_SUFFIX}",
    )

    assert safe.status_code is RuntimeStatusCode.RETRYABLE_FAILURE
    assert safe.diagnostic_code == "activity-failed"
    assert "resume" not in safe.model_dump_json().lower()


@pytest.mark.parametrize(
    "field,value",
    [
        ("tenant_key", "person@example.test"),
        ("actor_key", "person@example.test"),
        ("execution_id", "exec_Jane-Example-415-555-0199"),
        ("resume_content", "Candidate resume for jane@example.test"),
    ],
)
def test_public_command_parser_never_exposes_rejected_raw_input(field, value):
    with pytest.raises(RuntimeContractError) as raised:
        parse_execution_command(command_payload(**{field: value}))

    error = raised.value
    serialized_error = json.dumps(error.as_dict())
    raw_value = str(value)
    assert str(error) == "invalid-execution-command"
    assert error.as_dict() == {"code": "invalid-execution-command"}
    assert raw_value not in str(error)
    assert raw_value not in repr(error)
    assert raw_value not in serialized_error
    assert raw_value not in json.dumps(vars(error))
    assert error.__cause__ is None
    assert error.__context__ is None
    assert error.args == ()
    assert all(
        raw_value not in str(attribute_value)
        for attribute_value in vars(error).values()
    )
    rendered_traceback = "".join(
        __import__("traceback").format_exception(error)
    )
    assert raw_value not in rendered_traceback
    assert "ValidationError" not in rendered_traceback
