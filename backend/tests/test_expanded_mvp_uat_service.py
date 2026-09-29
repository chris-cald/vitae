from pathlib import Path

import pytest

from src.services.mvp_application_loop_service import (
    CANONICAL_JOB_SEARCH_PATH,
    build_expanded_uat_application_loop,
    ensure_uat_write_target_allowed,
)


def test_expanded_uat_loop_has_concurrent_apps_curation_refresh_and_temporal():
    loop = build_expanded_uat_application_loop(application_count=2)

    applications = loop["applications"]
    assert len(applications) == 2
    assert len({app["id"] for app in applications}) == 2
    assert len({app["targetId"] for app in applications}) == 2
    target_ids = {target["id"] for target in loop["targets"]}
    application_ids = {app["id"] for app in applications}
    assert {requirement["targetId"] for requirement in loop["requirements"]} == target_ids
    assert {record["applicationId"] for record in loop["applicationRecords"]} == application_ids
    assert {deliverable["applicationId"] for deliverable in loop["deliverables"]} == application_ids
    assert {event["stage"] for event in loop["curationEvents"]} >= {
        "harvest",
        "cull",
        "prime",
        "substantiate",
    }
    assert loop["application"]["id"] in application_ids
    assert loop["target"]["id"] in target_ids
    assert loop["fitAnalysis"]["id"] in {fit["id"] for fit in loop["fitAnalyses"]}
    assert set(loop["application"]["deliverableIds"]) <= {item["id"] for item in loop["deliverables"]}
    fit_ids = {fit["id"] for fit in loop["fitAnalyses"]}
    requirement_ids = {requirement["id"] for requirement in loop["requirements"]}
    assert {item["requirementId"] for item in loop["fitAnalysis"]["requirementMappings"]} <= requirement_ids
    assert {item["fitAnalysisId"] for item in loop["misalignments"]} <= fit_ids
    assert {item["requirementId"] for item in loop["misalignments"]} <= requirement_ids
    assert any(event.get("effect") == "catalog-asset-promoted" for event in loop["curationEvents"])
    assert any(analysis["status"] == "recomputed-after-curation" for analysis in loop["fitAnalyses"])
    assert loop["bookOfWorkRefresh"]["status"] == "incorporated"
    assert loop["bookOfWorkRefresh"]["canonicalVaultMutated"] is False
    assert loop["temporal"]["required"] is True
    assert loop["temporal"]["payloadPolicy"] == "opaque-ids-only"


def test_uat_write_guard_rejects_canonical_vault_mutation():
    forbidden = Path(CANONICAL_JOB_SEARCH_PATH).expanduser() / "Catalog" / "asset.md"

    with pytest.raises(ValueError, match="canonical-vault-write-blocked"):
        ensure_uat_write_target_allowed(forbidden)

    ensure_uat_write_target_allowed(Path("/tmp/vitae-uat-snapshot/Catalog/asset.md"))
