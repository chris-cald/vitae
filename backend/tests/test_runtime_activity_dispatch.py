import pytest

from src.workflows.runtime_activities import record_runtime_activity


@pytest.mark.asyncio
async def test_runtime_activity_dispatches_required_workflow_types_with_codes_only():
    workflow_types = [
        "book-of-work-refresh",
        "curation",
        "target-catalog-fit",
        "deliverable-generation",
        "application-automation",
        "job-fit",
    ]

    for workflow_type in workflow_types:
        result = await record_runtime_activity(
            {"workflowType": workflow_type, "executionId": "exec_00000000-0000-4000-8000-000000000001"}
        )
        assert result == {"statusCode": "completed", "activityName": workflow_type, "recordCount": 1}
        assert "resume" not in str(result).lower()


@pytest.mark.asyncio
async def test_runtime_activity_rejects_unknown_workflow_type():
    with pytest.raises(ValueError, match="unsupported-runtime-workflow"):
        await record_runtime_activity({"workflowType": "unknown"})
