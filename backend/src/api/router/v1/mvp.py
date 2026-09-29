from typing import Any

from fastapi import APIRouter

from src.services.mvp_application_loop_service import (
    build_demo_application_loop,
    build_expanded_uat_application_loop,
)

router = APIRouter()


@router.get("/mvp/application-loop/demo", response_model=dict[str, Any])
async def get_demo_application_loop() -> dict[str, Any]:
    return build_demo_application_loop()


@router.get("/mvp/application-loop/expanded-uat", response_model=dict[str, Any])
async def get_expanded_uat_application_loop() -> dict[str, Any]:
    return build_expanded_uat_application_loop()
