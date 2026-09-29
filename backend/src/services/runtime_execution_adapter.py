from __future__ import annotations

from typing import Any

from src.services.runtime_execution_contract import ExecutionCommand, build_temporal_payload
from src.services.temporal_config import TemporalWorkerConfig

TEMPORAL_WORKFLOW_NAME = "vitae_runtime_workflow"
TEMPORAL_SIGNAL_NAME = "runtime_decision"


class LocalTemporalAdapter:
    """Local validating adapter used by tests/dev when no Temporal client is wired."""

    async def start(self, command: ExecutionCommand) -> dict[str, Any]:
        return build_temporal_payload(command)

    async def signal(self, command: ExecutionCommand) -> dict[str, Any]:
        return build_temporal_payload(command)


class TemporalExecutionAdapter:
    """Thin Temporal client seam; all payload validation happens before client calls."""

    workflow_name = TEMPORAL_WORKFLOW_NAME
    signal_name = TEMPORAL_SIGNAL_NAME

    def __init__(self, client: Any, config: TemporalWorkerConfig) -> None:
        self.client = client
        self.config = config

    async def start(self, command: ExecutionCommand) -> dict[str, Any]:
        payload = build_temporal_payload(command)
        await self.client.start_workflow(
            self.workflow_name,
            payload,
            id=command.execution_id,
            task_queue=self.config.task_queue,
        )
        return payload

    async def signal(self, command: ExecutionCommand) -> dict[str, Any]:
        payload = build_temporal_payload(command)
        handle = self.client.get_workflow_handle(command.execution_id)
        await handle.signal(self.signal_name, payload)
        return payload


async def connect_temporal_adapter(config: TemporalWorkerConfig) -> TemporalExecutionAdapter:
    from temporalio.client import Client

    client = await Client.connect(config.address, namespace=config.namespace)
    return TemporalExecutionAdapter(client, config)
