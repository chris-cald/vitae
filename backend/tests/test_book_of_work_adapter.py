import os
from pathlib import Path

import pytest

from src.services.book_of_work_adapter import BookOfWorkAdapter, CANONICAL_JOB_SEARCH_PATH


def test_book_of_work_adapter_allows_canonical_input_but_not_output():
    adapter = BookOfWorkAdapter(CANONICAL_JOB_SEARCH_PATH, Path("/tmp/vitae-uat-output"))

    assert adapter.source_root == Path(CANONICAL_JOB_SEARCH_PATH).expanduser()
    assert adapter.output_root == Path("/tmp/vitae-uat-output")

    with pytest.raises(ValueError, match="canonical-vault-write-blocked"):
        BookOfWorkAdapter(
            CANONICAL_JOB_SEARCH_PATH,
            Path(CANONICAL_JOB_SEARCH_PATH).expanduser() / "Catalog",
        )


def test_book_of_work_adapter_reports_added_modified_and_deleted_files(tmp_path):
    source = tmp_path / "source"
    source.mkdir()
    existing = source / "existing.md"
    deleted = source / "deleted.md"
    existing.write_text("before")
    deleted.write_text("gone")
    adapter = BookOfWorkAdapter(source, tmp_path / "output")
    previous = adapter.snapshot()

    existing.write_text("after")
    deleted.unlink()
    added = source / "added.md"
    added.write_text("new")

    events = adapter.changed_since(previous)

    assert {event["change"] for event in events} == {"added", "modified", "deleted"}
    assert {Path(event["path"]).name for event in events} == {"added.md", "existing.md", "deleted.md"}


def test_opaque_snapshot_detects_content_replaced_with_preserved_timestamp(tmp_path):
    source = tmp_path / "source"
    source.mkdir()
    note = source / "current.md"
    note.write_text("before")
    adapter = BookOfWorkAdapter(source)
    original = adapter.opaque_snapshot()
    timestamp = note.stat().st_mtime_ns

    note.write_text("after")
    os.utime(note, ns=(timestamp, timestamp))

    assert adapter.opaque_snapshot() != original
    assert "before" not in str(adapter.opaque_snapshot())
    assert str(note) not in str(adapter.opaque_snapshot())


def test_book_of_work_adapter_has_no_write_api():
    adapter = BookOfWorkAdapter(Path("/tmp/source"), Path("/tmp/output"))

    assert not hasattr(adapter, "write")
    assert not hasattr(adapter, "save")
    assert not hasattr(adapter, "delete")
