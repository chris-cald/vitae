from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Any

_FORBIDDEN_KEY_PARTS = (
    "resume",
    "jobdescription",
    "prompt",
    "completion",
    "secret",
    "password",
    "token",
    "credential",
    "reviewer",
    "comment",
    "filename",
    "filepath",
    "path",
    "url",
    "source",
    "locator",
    "content",
    "body",
    "text",
    "document",
    "artifact",
    "input",
    "result",
    "memo",
    "searchattributes",
    "fields",
    "candidate",
    "customkeyword",
)
_FORBIDDEN_VALUE_PATTERNS = (
    re.compile(r"@"),
    re.compile(r"https?://", re.IGNORECASE),
    re.compile(r"Obsidian Vaults/loft/1 Projects/Job Search"),
    re.compile(r"\b(resume|job description|prompt|completion|secret|reviewer)\b", re.IGNORECASE),
    re.compile(r"\.(pdf|docx?|md|txt)\b", re.IGNORECASE),
)


def snapshot_file_inventory(root: str | Path) -> dict[str, dict[str, int]]:
    base = Path(root)
    return {
        _path_hash(path.relative_to(base)): {
            "size": path.stat().st_size,
            "mtime_ns": path.stat().st_mtime_ns,
        }
        for path in sorted(base.rglob("*"))
        if path.is_file()
    }


def diff_file_inventory(
    before: dict[str, dict[str, int]], after: dict[str, dict[str, int]]
) -> list[dict[str, str]]:
    events = [{"change": "added", "pathHash": path_hash} for path_hash in after.keys() - before.keys()]
    events.extend({"change": "deleted", "pathHash": path_hash} for path_hash in before.keys() - after.keys())
    events.extend(
        {"change": "modified", "pathHash": path_hash}
        for path_hash in before.keys() & after.keys()
        if before[path_hash] != after[path_hash]
    )
    return sorted(events, key=lambda event: (event["pathHash"], event["change"]))


def assert_no_vault_inventory_changes(
    before: dict[str, dict[str, int]], after: dict[str, dict[str, int]]
) -> None:
    if diff_file_inventory(before, after):
        raise ValueError("canonical-vault-mutated")


def assert_no_forbidden_temporal_history(history: Any) -> None:
    _assert_safe(history)


def _assert_safe(value: Any, key_name: str = "") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            normalized_key = "".join(character for character in str(key).lower() if character.isalnum())
            if any(part in normalized_key for part in _FORBIDDEN_KEY_PARTS):
                if normalized_key in {"input", "result"} and _is_encoded_temporal_payloads(child):
                    continue
                raise ValueError("forbidden-uat-evidence")
            _assert_safe(child, normalized_key)
        return
    if isinstance(value, list):
        for child in value:
            _assert_safe(child, key_name)
        return
    if isinstance(value, str):
        if key_name == "identity" and re.fullmatch(r"[A-Za-z0-9_.:-]+@[A-Za-z0-9_.:-]+", value):
            return
        if re.fullmatch(r"\d+@[a-f0-9-]+", value):
            return
        if any(pattern.search(value) for pattern in _FORBIDDEN_VALUE_PATTERNS):
            raise ValueError("forbidden-uat-evidence")


def _is_encoded_temporal_payloads(value: Any) -> bool:
    if not isinstance(value, dict) or not isinstance(value.get("payloads"), list):
        return False
    for payload in value["payloads"]:
        if not isinstance(payload, dict):
            return False
        if set(payload) - {"metadata", "data"}:
            return False
        if "data" in payload and not isinstance(payload["data"], str):
            return False
    return True


def _path_hash(relative_path: Path) -> str:
    return hashlib.sha256(relative_path.as_posix().encode("utf-8")).hexdigest()
