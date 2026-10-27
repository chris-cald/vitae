import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from db.db import init_db
from src.api.router.v1.career_inventory import router
from src.services.career_inventory_service import CareerInventoryService


@pytest.mark.asyncio
async def test_inventory_harvest_and_prime_expose_only_opaque_metadata_and_keep_seeds_ineligible():
    await init_db()
    service = CareerInventoryService()

    before = await service.list_inventory()
    harvested = await service.harvest("source-synthetic-platform")
    primed = await service.prime(harvested["id"])
    cull = await service.record_decision(harvested["id"], "cull", approved=True)
    publication = await service.record_decision(harvested["id"], "publish-catalog-asset", approved=True)
    inventory = await service.list_inventory()

    assert before["counts"]["sources"] == 1
    assert before["counts"]["catalogAssets"] == 0
    assert harvested["status"] == "harvested"
    assert primed["status"] == "primed"
    assert inventory["counts"]["seeds"] == before["counts"]["seeds"] + 1
    assert inventory["counts"]["catalogAssets"] == 0
    assert [action["action"] for action in inventory["actions"][-4:]] == ["harvest", "prime", "cull", "publish-catalog-asset"]
    assert cull["status"] == "approved"
    assert publication["status"] == "approved"
    assert inventory["catalogAssets"] == []
    assert inventory["generationEligibility"]["eligibleSources"] == []
    assert inventory["generationEligibility"]["targetContext"] is None
    assert {
        "id": harvested["id"],
        "kind": "seed",
        "reason": "source-kind-not-generation-authoritative",
    } in inventory["generationEligibility"]["gaps"]
    rendered = str(inventory).lower()
    assert "raw" not in rendered


def test_inventory_api_harvests_and_primes_synthetic_metadata_only():
    app = FastAPI()
    app.include_router(router, prefix="/api/v1")

    with TestClient(app) as client:
        listed = client.get("/api/v1/career-inventory")
        harvested = client.post("/api/v1/career-inventory/harvest", json={"source_id": "source-synthetic-platform"})
        primed = client.post(f"/api/v1/career-inventory/seeds/{harvested.json()['id']}/prime")
        decision = client.post(
            f"/api/v1/career-inventory/seeds/{harvested.json()['id']}/decisions",
            json={"action": "publish-catalog-asset", "approved": True},
        )

    assert listed.status_code == 200
    assert harvested.status_code == 201
    assert primed.status_code == 200
    assert primed.json()["status"] == "primed"
    assert decision.status_code == 201
    assert decision.json()["status"] == "approved"
    assert "raw" not in str(listed.json()).lower()
