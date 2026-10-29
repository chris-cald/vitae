from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from db.db import AsyncSessionLocal
from src.models.career_inventory import CareerInventoryAction, CareerInventorySeed
from src.services.book_of_work_refresh_service import BookOfWorkRefreshService
from src.services.generation_input_resolver import resolve_generation_inputs


_SOURCE = {
    "id": "source-synthetic-platform",
    "title": "Synthetic platform record",
    "sourceType": "synthetic",
    "sourceRef": {"uri": "vitae://synthetic/career-source/platform"},
    "capturedAt": "2026-01-01T00:00:00+00:00",
}
_SEED_ID = "seed-synthetic-platform"


class CareerInventoryNotFound(ValueError):
    pass


class CareerInventoryService:
    def __init__(self, book_of_work_refresh: BookOfWorkRefreshService | None = None) -> None:
        self.book_of_work_refresh = book_of_work_refresh or BookOfWorkRefreshService.from_env()

    async def list_inventory(self) -> dict[str, Any]:
        async with AsyncSessionLocal() as session:
            seeds = (await session.execute(select(CareerInventorySeed).order_by(CareerInventorySeed.created_at))).scalars().all()
            actions = (await session.execute(select(CareerInventoryAction).order_by(CareerInventoryAction.created_at))).scalars().all()
        rendered_seeds = [self._seed(seed) for seed in seeds]
        return {
            "bookOfWork": await self.book_of_work_refresh.observe(),
            "sources": [{**_SOURCE, "seedCount": len(rendered_seeds)}],
            "seeds": rendered_seeds,
            "catalogAssets": [],
            "actions": [self._action(action) for action in actions],
            "counts": {"sources": 1, "seeds": len(rendered_seeds), "catalogAssets": 0},
            "generationEligibility": resolve_generation_inputs(
                [{"id": seed["id"], "kind": "seed"} for seed in rendered_seeds]
            ),
        }

    async def harvest(self, source_id: str) -> dict[str, Any]:
        if source_id != _SOURCE["id"]:
            raise CareerInventoryNotFound("Career inventory source not found.")
        async with AsyncSessionLocal() as session:
            seed = await session.get(CareerInventorySeed, _SEED_ID)
            if seed is not None:
                return self._seed(seed)
            now = datetime.now(timezone.utc)
            seed = CareerInventorySeed(
                id=_SEED_ID,
                source_id=source_id,
                status="incubating",
                source_ref=_SOURCE["sourceRef"],
                created_at=now,
                updated_at=now,
            )
            session.add(seed)
            session.add(self._new_action("harvest", seed.id, seed.source_ref))
            try:
                await session.commit()
            except IntegrityError:
                await session.rollback()
                seed = await session.get(CareerInventorySeed, _SEED_ID)
                if seed is None:
                    raise
            else:
                await session.refresh(seed)
        return self._seed(seed)

    async def prime(self, seed_id: str) -> dict[str, Any]:
        async with AsyncSessionLocal() as session:
            seed = await session.get(CareerInventorySeed, seed_id)
            if seed is None:
                raise CareerInventoryNotFound("Career inventory Seed not found.")
            if seed.status == "primed":
                return self._seed(seed)
            now = datetime.now(timezone.utc)
            result = await session.execute(
                update(CareerInventorySeed)
                .where(CareerInventorySeed.id == seed_id, CareerInventorySeed.status == "incubating")
                .values(status="primed", updated_at=now)
            )
            if result.rowcount != 1:
                await session.refresh(seed)
                if seed.status == "primed":
                    return self._seed(seed)
                raise ValueError("Only incubating Seeds can be primed.")
            session.add(self._new_action("prime", seed.id, seed.source_ref))
            await session.commit()
            await session.refresh(seed)
        return self._seed(seed)

    def _new_action(
        self, action: str, seed_id: str, source_ref: dict[str, Any], status: str = "recorded"
    ) -> CareerInventoryAction:
        return CareerInventoryAction(
            id=f"inventory-action-{uuid4().hex}",
            action=action,
            seed_id=seed_id,
            status=status,
            provenance_ref=source_ref,
        )

    def _seed(self, seed: CareerInventorySeed) -> dict[str, Any]:
        return {
            "id": seed.id,
            "sourceId": seed.source_id,
            "status": seed.status,
            "provenanceRef": seed.source_ref,
        }

    def _action(self, action: CareerInventoryAction) -> dict[str, Any]:
        return {
            "id": action.id,
            "action": action.action,
            "seedId": action.seed_id,
            "status": action.status,
            "provenanceRef": action.provenance_ref,
        }
