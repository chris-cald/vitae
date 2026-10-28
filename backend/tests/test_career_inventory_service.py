import asyncio

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import delete

from db.db import AsyncSessionLocal, init_db
from src.api.router.v1.career_inventory import router
from src.models.career_inventory import CareerInventoryAction, CareerInventorySeed
from src.services.career_inventory_service import CareerInventoryNotFound, CareerInventoryService


def test_inventory_models_require_persisted_metadata():
    for column in (
        CareerInventorySeed.__table__.c.source_id,
        CareerInventorySeed.__table__.c.status,
        CareerInventorySeed.__table__.c.source_ref,
        CareerInventoryAction.__table__.c.action,
        CareerInventoryAction.__table__.c.status,
        CareerInventoryAction.__table__.c.provenance_ref,
    ):
        assert column.nullable is False
    assert CareerInventorySeed.__table__.c.source_id.unique is True


async def reset_inventory() -> None:
    await init_db()
    async with AsyncSessionLocal() as session:
        await session.execute(delete(CareerInventoryAction))
        await session.execute(delete(CareerInventorySeed))
        await session.commit()


@pytest.mark.asyncio
async def test_inventory_harvest_is_idempotent_and_prime_has_one_canonical_transition():
    await reset_inventory()
    service = CareerInventoryService()

    harvested = await service.harvest("source-synthetic-platform")
    repeated_harvest = await service.harvest("source-synthetic-platform")
    primed = await service.prime(harvested["id"])
    repeated_prime = await service.prime(harvested["id"])
    inventory = await service.list_inventory()

    assert harvested == repeated_harvest
    assert harvested["status"] == "incubating"
    assert primed == repeated_prime
    assert primed["status"] == "primed"
    assert [action["action"] for action in inventory["actions"]] == ["harvest", "prime"]
    assert inventory["counts"] == {"sources": 1, "seeds": 1, "catalogAssets": 0}
    assert inventory["catalogAssets"] == []
    assert inventory["generationEligibility"]["eligibleSources"] == []
    assert {
        "id": harvested["id"],
        "kind": "seed",
        "reason": "source-kind-not-generation-authoritative",
    } in inventory["generationEligibility"]["gaps"]

    with pytest.raises(CareerInventoryNotFound):
        await service.prime("missing-seed")


def test_inventory_api_initializes_tables_and_distinguishes_missing_resources():
    asyncio.run(reset_inventory())
    app = FastAPI()
    app.include_router(router, prefix="/api/v1")

    with TestClient(app) as client:
        listed = client.get("/api/v1/career-inventory")
        harvested = client.post("/api/v1/career-inventory/harvest", json={"source_id": "source-synthetic-platform"})
        primed = client.post(f"/api/v1/career-inventory/seeds/{harvested.json()['id']}/prime")
        missing = client.post("/api/v1/career-inventory/seeds/missing-seed/prime")
        decision = client.post(
            f"/api/v1/career-inventory/seeds/{harvested.json()['id']}/decisions",
            json={"action": "publish-catalog-asset", "approved": True},
        )

    assert listed.status_code == 200
    assert harvested.status_code == 201
    assert harvested.json()["status"] == "incubating"
    assert primed.status_code == 200
    assert primed.json()["status"] == "primed"
    assert missing.status_code == 404
    assert decision.status_code == 404
    assert listed.json()["sources"][0]["sourceRef"]["uri"].startswith("vitae://")
    assert "raw" not in str(listed.json()).lower()
