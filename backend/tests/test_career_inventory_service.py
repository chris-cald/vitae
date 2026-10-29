import asyncio
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import delete

from db.db import AsyncSessionLocal, init_db
from src.api.router.v1.career_inventory import router
from src.models.book_of_work_refresh import BookOfWorkRefreshState
from src.models.career_inventory import CareerInventoryAction, CareerInventorySeed
from src.services.book_of_work_refresh_service import BookOfWorkRefreshService
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


@pytest.mark.asyncio
async def test_inventory_marks_out_of_band_book_of_work_change_stale_without_exposing_paths(tmp_path):
    await init_db()
    source = tmp_path / "book-of-work"
    source.mkdir()
    note = source / "current.md"
    note.write_text("before")
    service = CareerInventoryService(BookOfWorkRefreshService(source))

    incorporated = await service.list_inventory()
    note.write_text("after")
    stale = await service.list_inventory()

    assert incorporated["bookOfWork"] == {"status": "unprocessed", "changeCount": 1}
    assert stale["bookOfWork"] == {"status": "stale", "changeCount": 1}
    assert str(source) not in str(stale)
    assert note.read_text() == "after"


@pytest.mark.asyncio
async def test_unavailable_book_of_work_source_never_appears_incorporated(tmp_path):
    await init_db()
    source = tmp_path / "missing"

    state = await BookOfWorkRefreshService(source).observe()

    assert state == {"status": "unavailable", "changeCount": 0}
    assert str(source) not in str(state)


@pytest.mark.asyncio
async def test_book_of_work_source_uses_container_mount_when_no_override_is_set():
    service = BookOfWorkRefreshService.from_env({})
    assert service.source_root == Path("/vault/job-search")


@pytest.mark.asyncio
async def test_concurrent_first_observation_does_not_fail_on_duplicate_state(tmp_path):
    await init_db()
    source = tmp_path / "source"
    source.mkdir()
    (source / "current.md").write_text("metadata only")
    service = BookOfWorkRefreshService(source)

    first, second = await asyncio.gather(service.observe(), service.observe())

    assert {first["status"], second["status"]} == {"unprocessed"}


@pytest.mark.asyncio
async def test_book_of_work_scan_failure_is_unavailable_and_does_not_persist_partial_state(tmp_path, monkeypatch):
    await init_db()
    source = tmp_path / "source"
    source.mkdir()

    def unavailable_snapshot(_self):
        raise OSError("permission denied")

    monkeypatch.setattr("src.services.book_of_work_refresh_service.BookOfWorkAdapter.opaque_snapshot", unavailable_snapshot)
    state = await BookOfWorkRefreshService(source).observe()

    assert state == {"status": "unavailable", "changeCount": 0}
    async with AsyncSessionLocal() as session:
        assert await session.get(BookOfWorkRefreshState, __import__("hashlib").sha256(str(source.resolve()).encode()).hexdigest()) is None
