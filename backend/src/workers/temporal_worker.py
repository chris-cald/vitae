from __future__ import annotations

import os

from src.services.temporal_config import TemporalWorkerConfig


async def build_worker_config_from_env() -> TemporalWorkerConfig:
    """Build isolated worker config without starting a worker in FastAPI."""
    return TemporalWorkerConfig.from_env(os.environ)


async def build_temporal_worker(client, config: TemporalWorkerConfig):
    from temporalio.worker import Worker
    from src.workflows.runtime_activities import record_runtime_activity
    from src.workflows.runtime_workflow import VitaeRuntimeWorkflow

    return Worker(
        client,
        task_queue=config.task_queue,
        workflows=[VitaeRuntimeWorkflow],
        activities=[record_runtime_activity],
    )
