from __future__ import annotations

import asyncio
import hashlib
import os
from pathlib import Path
from typing import Mapping

from sqlalchemy.exc import IntegrityError

from db.db import AsyncSessionLocal
from src.models.book_of_work_refresh import BookOfWorkRefreshState
from src.services.book_of_work_adapter import BookOfWorkAdapter

_CONTAINER_SOURCE_ROOT = "/vault/job-search"


class BookOfWorkRefreshService:
    """Tracks opaque source fingerprints; never writes to the source tree."""

    def __init__(self, source_root: str | Path | None = None) -> None:
        self.source_root = Path(source_root).expanduser() if source_root else None

    @classmethod
    def from_env(cls, env: Mapping[str, str] | None = None) -> "BookOfWorkRefreshService":
        env = os.environ if env is None else env
        return cls(env.get("BOOK_OF_WORK_SOURCE_ROOT", _CONTAINER_SOURCE_ROOT))

    async def observe(self) -> dict[str, str | int]:
        if self.source_root is None:
            return {"status": "unavailable", "changeCount": 0}
        try:
            if not self.source_root.is_dir():
                return {"status": "unavailable", "changeCount": 0}
        except OSError:
            return {"status": "unavailable", "changeCount": 0}

        adapter = BookOfWorkAdapter(self.source_root)
        try:
            current = await asyncio.to_thread(adapter.opaque_snapshot)
        except OSError:
            return {"status": "unavailable", "changeCount": 0}

        source_key = hashlib.sha256(str(self.source_root.resolve()).encode()).hexdigest()
        async with AsyncSessionLocal() as session:
            previous = await session.get(BookOfWorkRefreshState, source_key)
            if previous is None:
                session.add(BookOfWorkRefreshState(source_key=source_key, snapshot=current))
                try:
                    await session.commit()
                except IntegrityError:
                    await session.rollback()
                    previous = await session.get(BookOfWorkRefreshState, source_key)
                    if previous is None:
                        raise
                else:
                    return {"status": "unprocessed", "changeCount": len(current)}

            change_count = sum(
                current.get(path) != previous.snapshot.get(path)
                for path in current.keys() | previous.snapshot.keys()
            )
        return {
            "status": "stale" if change_count else "unprocessed",
            "changeCount": change_count,
        }
