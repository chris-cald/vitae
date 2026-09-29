from __future__ import annotations

from typing import Any

try:
    from temporalio import activity
except ImportError:  # local tests do not require Temporal installed
    class _ActivityDecorators:
        def defn(self, fn):
            return fn

    activity = _ActivityDecorators()

_SUPPORTED_WORKFLOW_TYPES = {
    "book-of-work-refresh",
    "curation",
    "target-catalog-fit",
    "deliverable-generation",
    "application-automation",
    "job-fit",
}


@activity.defn
async def record_runtime_activity(payload: dict[str, Any]) -> dict[str, str | int]:
    workflow_type = payload.get("workflowType")
    if workflow_type not in _SUPPORTED_WORKFLOW_TYPES:
        raise ValueError("unsupported-runtime-workflow")
    return {
        "statusCode": "completed",
        "activityName": workflow_type,
        "recordCount": 1,
    }
