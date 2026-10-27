from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from sqlmodel import select

from db.db import AsyncSessionLocal
from src.models.career_inventory import CareerInventoryAction, CareerInventorySeed
from src.services.generation_input_resolver import resolve_generation_inputs


_SOURCE = {
    "id": "source-synthetic-platform",
    "title": "Synthetic platform record",
    "sourceType": "synthetic",
    "sourceRef": {"uri": "vitae://synthetic/career-source/platform"},
    "capturedAt": "2026-01-01T00:00:00+00:00",
}


class CareerInventoryService:
    async def list_inventory(self) -> dict[str, Any]:
        async with AsyncSessionLocal() as session:
            seeds = (await session.execute(select(CareerInventorySeed).order_by(CareerInventorySeed.created_at))).scalars().all()
            actions = (await session.execute(select(CareerInventoryAction).order_by(CareerInventoryAction.created_at))).scalars().all()
        rendered_seeds = [self._seed(seed) for seed in seeds]
        return {
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
            raise ValueError("Career inventory source not found.")
        now = datetime.now(timezone.utc)
        seed = CareerInventorySeed(
            id=f"seed-synthetic-{uuid4().hex}",
            source_id=source_id,
            status="harvested",
            source_ref=_SOURCE["sourceRef"],
            created_at=now,
            updated_at=now,
        )
        async with AsyncSessionLocal() as session:
            session.add(seed)
            session.add(self._new_action("harvest", seed.id, seed.source_ref))
            await session.commit()
            await session.refresh(seed)
        return self._seed(seed)

    async def record_decision(self, seed_id: str, action: str, approved: bool) -> dict[str, Any]:
        if action not in {"cull", "publish-catalog-asset"}:
            raise ValueError("Unsupported career inventory decision.")
        async with AsyncSessionLocal() as session:
            seed = (await session.execute(select(CareerInventorySeed).where(CareerInventorySeed.id == seed_id))).scalars().one_or_none()
            if seed is None:
                raise ValueError("Career inventory Seed not found.")
            decision = self._new_action(action, seed.id, seed.source_ref, "approved" if approved else "requested")
            session.add(decision)
            await session.commit()
            await session.refresh(decision)
        return self._action(decision)

    async def prime(self, seed_id: str) -> dict[str, Any]:
        async with AsyncSessionLocal() as session:
            seed = (await session.execute(select(CareerInventorySeed).where(CareerInventorySeed.id == seed_id))).scalars().one_or_none()
            if seed is None or seed.status != "harvested":
                raise ValueError("Only harvested Seeds can be primed.")
            seed.status = "primed"
            seed.updated_at = datetime.now(timezone.utc)
            session.add(seed)
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
