from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from src.services.career_inventory_service import CareerInventoryNotFound, CareerInventoryService

router = APIRouter()


class HarvestRequest(BaseModel):
    source_id: str


@router.get("/career-inventory")
async def list_career_inventory() -> dict[str, Any]:
    return await CareerInventoryService().list_inventory()


@router.post("/career-inventory/harvest", status_code=status.HTTP_201_CREATED)
async def harvest_career_inventory(input: HarvestRequest) -> dict[str, Any]:
    try:
        return await CareerInventoryService().harvest(input.source_id)
    except CareerInventoryNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/career-inventory/seeds/{seed_id}/prime")
async def prime_career_inventory_seed(seed_id: str) -> dict[str, Any]:
    try:
        return await CareerInventoryService().prime(seed_id)
    except CareerInventoryNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
