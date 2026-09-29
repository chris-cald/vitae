from datetime import datetime, timezone

import pytest

from src.services.runtime_execution_adapter import TemporalExecutionAdapter
from src.services.runtime_execution_contract import ExecutionCommand
from src.services.temporal_config import TemporalWorkerConfig


IDENTIFIER_SUFFIX = "00000000-0000-4000-8000-000000000777"


def command(**overrides):
    payload = {
        "execution_id": f"exec_{IDENTIFIER_SUFFIX}",
        "tenant_key": f"tenant_{IDENTIFIER_SUFFIX}",
        "workflow_definition_id": f"workflow_{IDENTIFIER_SUFFIX}",
        "workflow_version": "v1",
        "workflow_run_id": f"workflowrun_{IDENTIFIER_SUFFIX}",
        "correlation_id": f"corr_{IDENTIFIER_SUFFIX}",
        "idempotency_key": f"idem_{IDENTIFIER_SUFFIX}",
        "actor_type": "service",
        "command": "start",
        "occurred_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
    }
    payload.update(overrides)
    return ExecutionCommand(**payload)


class FakeHandle:
    def __init__(self):
        self.signals = []

    async def signal(self, name, payload):
        self.signals.append((name, payload))


class FakeTemporalClient:
    def __init__(self):
        self.started = []
        self.handle = FakeHandle()

    async def start_workflow(self, workflow, payload, *, id, task_queue):
        self.started.append(
            {"workflow": workflow, "payload": payload, "id": id, "task_queue": task_queue}
        )
        return object()

    def get_workflow_handle(self, workflow_id):
        self.workflow_id = workflow_id
        return self.handle


@pytest.mark.asyncio
async def test_temporal_adapter_starts_workflow_with_safe_payload_only():
    client = FakeTemporalClient()
    adapter = TemporalExecutionAdapter(
        client,
        TemporalWorkerConfig("localhost:7233", "vitae-dev", "vitae-orchestration"),
    )

    payload = await adapter.start(command())

    assert client.started == [
        {
            "workflow": "vitae_runtime_workflow",
            "payload": payload,
            "id": f"exec_{IDENTIFIER_SUFFIX}",
            "task_queue": "vitae-orchestration",
        }
    ]
    assert "tenantKey" in payload
    assert "resume" not in str(payload).lower()


@pytest.mark.asyncio
async def test_temporal_adapter_signals_existing_workflow_with_safe_payload_only():
    client = FakeTemporalClient()
    adapter = TemporalExecutionAdapter(
        client,
        TemporalWorkerConfig("localhost:7233", "vitae-dev", "vitae-orchestration"),
    )
    signal_command = command(actor_type="user", command="signal", decision_code="approve")

    payload = await adapter.signal(signal_command)

    assert client.workflow_id == f"exec_{IDENTIFIER_SUFFIX}"
    assert client.handle.signals == [("runtime_decision", payload)]
    assert payload["decisionCode"] == "approve"
