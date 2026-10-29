from typing import Any

from fastapi import APIRouter, Body, Depends, Header, HTTPException, Response, status
from pydantic import BaseModel

from src.services.runtime_execution_contract import RuntimeContractError
from src.services.runtime_execution_service import (
    RuntimeExecutionAuthority,
    RuntimeExecutionService,
    build_runtime_execution_service,
)

router = APIRouter()


class RuntimeDecisionRequest(BaseModel):
    decision_code: str


def _public_execution(execution: Any) -> dict[str, Any]:
    return execution.model_dump(
        mode="json",
        exclude={
            "tenant_key",
            "workflow_definition_id",
            "workflow_run_id",
            "correlation_id",
            "idempotency_key",
        },
    )


async def runtime_execution_authority(
    authorization: str | None = Header(default=None),
) -> RuntimeExecutionAuthority:
    try:
        return await RuntimeExecutionAuthority.from_authorization_header(authorization)
    except RuntimeContractError as error:
        raise HTTPException(status_code=401, detail=error.as_dict()) from None


@router.post("/runtime-executions", status_code=status.HTTP_201_CREATED)
async def start_runtime_execution(
    response: Response,
    input: dict[str, Any] = Body(...),
    authority: RuntimeExecutionAuthority = Depends(runtime_execution_authority),
):
    service = await build_runtime_execution_service()
    try:
        execution, created = await service.start(input, authority)
    except RuntimeContractError as error:
        raise HTTPException(status_code=422, detail=error.as_dict())
    if not created:
        response.status_code = status.HTTP_200_OK
    return {"execution": _public_execution(execution), "created": created}


@router.get("/runtime-executions/{execution_id}")
async def get_runtime_execution(
    execution_id: str,
    authority: RuntimeExecutionAuthority = Depends(runtime_execution_authority),
):
    try:
        execution = await RuntimeExecutionService().fetch(execution_id, authority)
    except RuntimeContractError as error:
        raise HTTPException(status_code=422, detail=error.as_dict())
    if not execution:
        raise HTTPException(status_code=404, detail="Runtime execution not found.")
    return {"execution": _public_execution(execution)}


@router.post("/runtime-executions/{execution_id}/cancel")
async def cancel_runtime_execution(
    execution_id: str,
    authority: RuntimeExecutionAuthority = Depends(runtime_execution_authority),
):
    try:
        service = await build_runtime_execution_service()
        execution = await service.cancel(execution_id, authority)
    except RuntimeContractError as error:
        raise HTTPException(status_code=422, detail=error.as_dict())
    return {"execution": _public_execution(execution)}


@router.post("/runtime-executions/{execution_id}/decision")
async def decide_runtime_execution(
    execution_id: str,
    input: RuntimeDecisionRequest = Body(...),
    authority: RuntimeExecutionAuthority = Depends(runtime_execution_authority),
):
    try:
        service = await build_runtime_execution_service()
        execution = await service.record_decision(execution_id, input.decision_code, authority)
    except RuntimeContractError as error:
        raise HTTPException(status_code=422, detail=error.as_dict())
    return {"execution": _public_execution(execution)}
