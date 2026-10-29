from datetime import datetime, timezone

import pytest

from src.services.runtime_execution_adapter import LocalTemporalAdapter, TemporalExecutionAdapter
from src.services.runtime_execution_service import build_runtime_execution_service
from src.services.runtime_execution_contract import ExecutionCommand
from src.services.temporal_config import TemporalWorkerConfig


IDENTIFIER_SUFFIX = "00000000-0000-4000-8000-000000000777"


def command(**overrides):
    payload = {
        "execution_id": f"exec_{IDENTIFIER_SUFFIX}",
        "tenant_key": f"tenant_{IDENTIFIER_SUFFIX}",
        "actor_key": f"actor_{IDENTIFIER_SUFFIX}",
        "workflow_definition_id": f"workflow_{IDENTIFIER_SUFFIX}",
        "workflow_version": "v1",
        "workflow_type": "target-catalog-fit",
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
async def test_runtime_service_uses_local_adapter_without_temporal_address():
    service = await build_runtime_execution_service({})

    assert isinstance(service.adapter, LocalTemporalAdapter)


@pytest.mark.asyncio
async def test_runtime_service_uses_temporal_adapter_when_configured(monkeypatch):
    adapter = object()
    seen = {}

    async def fake_connect_temporal_adapter(config):
        seen["config"] = config
        return adapter

    monkeypatch.setattr(
        "src.services.runtime_execution_service.connect_temporal_adapter",
        fake_connect_temporal_adapter,
    )

    service = await build_runtime_execution_service(
        {
            "TEMPORAL_ADDRESS": "localhost:7233",
            "TEMPORAL_NAMESPACE": "vitae-dev",
            "TEMPORAL_TASK_QUEUE": "vitae-orchestration",
        }
    )

    assert service.adapter is adapter
    assert seen["config"].address == "localhost:7233"
    assert seen["config"].task_queue == "vitae-orchestration"


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
    assert payload["workflowType"] == "target-catalog-fit"
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
