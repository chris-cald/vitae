from __future__ import annotations

from datetime import timedelta
from typing import Any, Callable

from src.workflows.runtime_activities import record_runtime_activity

WORKFLOW_NAME = "vitae_runtime_workflow"

try:
    from temporalio import workflow
except ImportError:  # local tests do not require Temporal installed
    class _WorkflowDecorators:
        def defn(self, cls=None, *, name: str | None = None):
            def decorate(target):
                target.__temporal_name__ = name
                return target
            return decorate(cls) if cls is not None else decorate

        def run(self, fn):
            return fn

        def signal(self, fn):
            return fn

        async def wait_condition(self, condition: Callable[[], bool]):
            if not condition():
                raise RuntimeError("workflow-decision-required")

        async def execute_activity(self, fn, payload, **kwargs):
            del kwargs
            return await fn(payload)

    workflow = _WorkflowDecorators()


@workflow.defn(name=WORKFLOW_NAME)
class VitaeRuntimeWorkflow:
    def __init__(self) -> None:
        self.decision: dict[str, Any] | None = None

    @workflow.run
    async def run(self, payload: dict[str, Any]) -> dict[str, str]:
        await workflow.wait_condition(lambda: self.decision is not None)
        return await workflow.execute_activity(
            record_runtime_activity,
            {**payload, **(self.decision or {})},
            start_to_close_timeout=timedelta(seconds=30),
        )

    @workflow.signal
    async def runtime_decision(self, payload: dict[str, Any]) -> None:
        self.decision = payload
