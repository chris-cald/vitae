from __future__ import annotations

from pathlib import Path

CANONICAL_JOB_SEARCH_PATH = "~/Obsidian Vaults/loft/1 Projects/Job Search/"


def ensure_not_canonical_write(path: str | Path) -> None:
    target = Path(path).expanduser().resolve(strict=False)
    canonical = Path(CANONICAL_JOB_SEARCH_PATH).expanduser().resolve(strict=False)
    if target == canonical or canonical in target.parents:
        raise ValueError("canonical-vault-write-blocked")


class BookOfWorkAdapter:
    """Read-only Book of Work source adapter; derived state writes elsewhere."""

    def __init__(self, source_root: str | Path, output_root: str | Path) -> None:
        self.source_root = Path(source_root).expanduser()
        self.output_root = Path(output_root).expanduser()
        ensure_not_canonical_write(self.output_root)

    def list_markdown_sources(self) -> list[Path]:
        if not self.source_root.exists():
            return []
        return sorted(path for path in self.source_root.rglob("*.md") if path.is_file())

    def snapshot(self) -> dict[str, int]:
        return {str(path): path.stat().st_mtime_ns for path in self.list_markdown_sources()}

    def changed_since(self, previous: dict[str, int]) -> list[dict[str, str]]:
        current = self.snapshot()
        events = [
            {"change": "added", "path": path}
            for path in current.keys() - previous.keys()
        ]
        events.extend(
            {"change": "deleted", "path": path}
            for path in previous.keys() - current.keys()
        )
        events.extend(
            {"change": "modified", "path": path}
            for path in current.keys() & previous.keys()
            if current[path] != previous[path]
        )
        return sorted(events, key=lambda event: (event["path"], event["change"]))
