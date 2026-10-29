import pytest

from src.services.runtime_execution_adapter import TEMPORAL_WORKFLOW_NAME
from src.workflows import runtime_workflow as runtime_workflow_module
from src.workflows.runtime_workflow import VitaeRuntimeWorkflow, WORKFLOW_NAME


class _WorkflowShim:
    async def wait_condition(self, condition):
        if not condition():
            raise RuntimeError("workflow-decision-required")

    async def execute_activity(self, fn, payload, **kwargs):
        del kwargs
        return await fn(payload)


@pytest.mark.asyncio
async def test_runtime_workflow_name_matches_adapter_and_waits_for_decision(monkeypatch):
    monkeypatch.setattr(runtime_workflow_module, "workflow", _WorkflowShim())

    workflow = VitaeRuntimeWorkflow()
    await workflow.runtime_decision({"decisionCode": "approve"})

    result = await workflow.run(
        {
            "executionId": "exec_00000000-0000-4000-8000-000000000888",
            "workflowType": "curation",
        }
    )

    assert WORKFLOW_NAME == TEMPORAL_WORKFLOW_NAME
    assert result == {"statusCode": "completed", "activityName": "curation", "recordCount": 1}


@pytest.mark.asyncio
@pytest.mark.parametrize(("decision", "status"), [("cancel", "cancelled"), ("reject", "rejected")])
async def test_runtime_workflow_does_not_run_an_activity_for_terminal_decisions(monkeypatch, decision, status):
    class NoActivityWorkflowShim(_WorkflowShim):
        async def execute_activity(self, *_args, **_kwargs):
            raise AssertionError("terminal decision must not execute activity")

    monkeypatch.setattr(runtime_workflow_module, "workflow", NoActivityWorkflowShim())
    workflow = VitaeRuntimeWorkflow()
    await workflow.runtime_decision({"decisionCode": decision})

    assert await workflow.run({"workflowType": "curation"}) == {"statusCode": status}
