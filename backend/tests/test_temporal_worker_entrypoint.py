import importlib
import sys
import types

import pytest

from src.services.temporal_config import TemporalWorkerConfig
from src.workers import temporal_worker
from src.workers.temporal_worker import build_temporal_worker


class FakeWorker:
    def __init__(self, client, *, task_queue, workflows, activities):
        self.client = client
        self.task_queue = task_queue
        self.workflows = workflows
        self.activities = activities


def test_temporal_worker_import_is_lazy():
    for module_name in ("temporalio.worker", "temporalio.workflow", "temporalio.activity"):
        sys.modules.pop(module_name, None)

    importlib.reload(temporal_worker)

    assert "temporalio.worker" not in sys.modules
    assert "temporalio.workflow" not in sys.modules
    assert "temporalio.activity" not in sys.modules


@pytest.mark.asyncio
async def test_build_temporal_worker_uses_isolated_config(monkeypatch):
    fake_worker_module = types.SimpleNamespace(Worker=FakeWorker)
    monkeypatch.setitem(sys.modules, "temporalio.worker", fake_worker_module)

    worker = await build_temporal_worker(
        client=object(),
        config=TemporalWorkerConfig("localhost:7233", "vitae-dev", "vitae-orchestration"),
    )

    assert worker.task_queue == "vitae-orchestration"
    assert worker.workflows
    assert worker.activities
