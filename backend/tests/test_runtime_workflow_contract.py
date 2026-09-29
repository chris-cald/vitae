import pytest

from src.services.runtime_execution_adapter import TEMPORAL_WORKFLOW_NAME
from src.workflows.runtime_workflow import VitaeRuntimeWorkflow, WORKFLOW_NAME


@pytest.mark.asyncio
async def test_runtime_workflow_name_matches_adapter_and_waits_for_decision():
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
