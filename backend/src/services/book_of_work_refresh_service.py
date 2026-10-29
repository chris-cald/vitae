from __future__ import annotations

import hashlib
import os
from pathlib import Path
from typing import Any, Mapping

from db.db import AsyncSessionLocal
from src.models.book_of_work_refresh import BookOfWorkRefreshState
from src.services.book_of_work_adapter import BookOfWorkAdapter


class BookOfWorkRefreshService:
    """Tracks opaque source fingerprints; never writes to the source tree."""

    def __init__(self, source_root: str | Path | None = None) -> None:
        self.source_root = Path(source_root).expanduser() if source_root else None

    @classmethod
    def from_env(cls, env: Mapping[str, str] | None = None) -> "BookOfWorkRefreshService":
        env = os.environ if env is None else env
        return cls(env.get("BOOK_OF_WORK_SOURCE_ROOT"))

    async def observe(self) -> dict[str, str | int]:
        if self.source_root is None:
            return {"status": "unavailable", "changeCount": 0}

        adapter = BookOfWorkAdapter(self.source_root)
        current = adapter.opaque_snapshot()
        source_key = hashlib.sha256(str(self.source_root.resolve()).encode()).hexdigest()
        async with AsyncSessionLocal() as session:
            previous = await session.get(BookOfWorkRefreshState, source_key)
            if previous is None:
                session.add(BookOfWorkRefreshState(source_key=source_key, snapshot=current))
                await session.commit()
                return {"status": "incorporated", "changeCount": 0}

            change_count = sum(
                current.get(path) != previous.snapshot.get(path)
                for path in current.keys() | previous.snapshot.keys()
            )
        return {
            "status": "stale" if change_count else "incorporated",
            "changeCount": change_count,
        }
