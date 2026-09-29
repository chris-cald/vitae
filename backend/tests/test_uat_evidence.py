import pytest

from src.services.uat_evidence import (
    assert_no_forbidden_temporal_history,
    assert_no_vault_inventory_changes,
    diff_file_inventory,
    snapshot_file_inventory,
)


def test_vault_inventory_diff_detects_add_modify_and_delete(tmp_path):
    root = tmp_path / "vault-snapshot"
    root.mkdir()
    keep = root / "keep.md"
    gone = root / "gone.md"
    keep.write_text("before")
    gone.write_text("gone")
    before = snapshot_file_inventory(root)

    keep.write_text("after")
    gone.unlink()
    added = root / "added.md"
    added.write_text("added")
    after = snapshot_file_inventory(root)

    changes = diff_file_inventory(before, after)

    assert {change["change"] for change in changes} == {"added", "modified", "deleted"}
    rendered = str(changes)
    assert "added.md" not in rendered
    assert "keep.md" not in rendered
    assert "gone.md" not in rendered
    with pytest.raises(ValueError, match="canonical-vault-mutated"):
        assert_no_vault_inventory_changes(before, after)


def test_vault_inventory_diff_passes_unchanged_tree(tmp_path):
    root = tmp_path / "vault-snapshot"
    root.mkdir()
    (root / "keep.md").write_text("same")
    before = snapshot_file_inventory(root)
    after = snapshot_file_inventory(root)

    assert_no_vault_inventory_changes(before, after)


def test_temporal_history_inspection_accepts_opaque_synthetic_history():
    history = {
        "events": [
            {
                "eventType": "WorkflowExecutionStarted",
                "payload": {
                    "executionId": "exec_00000000-0000-4000-8000-000000000001",
                    "workflowType": "vitae_runtime_workflow",
                    "statusCode": "accepted",
                },
            }
        ]
    }

    assert_no_forbidden_temporal_history(history)


def test_temporal_history_inspection_accepts_encoded_temporal_payloads():
    assert_no_forbidden_temporal_history(
        {
            "events": [
                {
                    "workflowExecutionStartedEventAttributes": {
                        "input": {
                            "payloads": [
                                {
                                    "metadata": {"encoding": "anNvbi9wbGFpbg=="},
                                    "data": "eyJleGVjdXRpb25JZCI6ImV4ZWNfMDAwMCJ9",
                                }
                            ]
                        }
                    }
                }
            ]
        }
    )


@pytest.mark.parametrize(
    "history",
    [
        {"events": [{"payload": {"resume_content": "candidate@example.test"}}]},
        {"events": [{"payload": {"prompt": "write my resume"}}]},
        {"events": [{"payload": {"path": "~/Obsidian Vaults/loft/1 Projects/Job Search/file.md"}}]},
        {"events": [{"payload": {"url": "https://example.test/job"}}]},
        {"events": [{"payload": {"documentText": "Led growth by 30 percent at Acme."}}]},
        {"events": [{"payload": {"artifact": "candidate.pdf"}}]},
        {"events": [{"input": "Led growth by 30 percent at Acme."}]},
        {"events": [{"result": "Candidate led growth by 30 percent."}]},
        {"events": [{"memo": {"fields": {"candidateName": "Jane Example"}}}]},
        {"events": [{"searchAttributes": {"CustomKeywordField": ["Jane Example"]}}]},
    ],
)
def test_temporal_history_inspection_rejects_forbidden_content(history):
    with pytest.raises(ValueError, match="forbidden-uat-evidence"):
        assert_no_forbidden_temporal_history(history)
