from src.services.generation_input_resolver import resolve_generation_inputs


def test_resolver_allows_only_validated_sources_and_target_context_without_prose():
    catalog_asset = {
        "id": "catalog-asset-platform-reliability",
        "kind": "catalog-asset",
        "confirmationStatus": "validated",
        "summary": "raw-ish candidate prose must not be echoed",
        "sourceRefs": [{"uri": "vault://career/platform", "locator": "#outcome"}],
    }
    projection = {
        "id": "projection-platform-summary",
        "kind": "projection",
        "status": "validated",
        "derivedFromCatalogAssetIds": [catalog_asset["id"]],
        "inputRef": {"uri": "template://career/summary"},
        "outputKind": "summary",
        "method": "validated projection",
        "text": "polished wording must not be echoed",
    }
    target = {
        "id": "target-staff-platform-engineer",
        "kind": "target",
        "title": "targeting context must not become proof",
        "sourceRef": {"uri": "https://jobs.example.test/staff-platform"},
    }

    result = resolve_generation_inputs([catalog_asset, projection, target])

    assert result["eligibleSources"] == [
        {
            "id": catalog_asset["id"],
            "kind": "catalog-asset",
            "role": "fact",
            "sourceRefs": catalog_asset["sourceRefs"],
        },
        {
            "id": projection["id"],
            "kind": "projection",
            "role": "wording",
            "derivedFromCatalogAssetIds": projection["derivedFromCatalogAssetIds"],
            "inputRef": projection["inputRef"],
        },
    ]
    assert result["targetContext"] == {
        "id": target["id"],
        "kind": "target",
        "role": "targeting-context",
        "sourceRef": target["sourceRef"],
    }
    assert result["gaps"] == []
    rendered = str(result)
    assert "raw-ish candidate prose" not in rendered
    assert "polished wording" not in rendered
    assert "targeting context" not in rendered


def test_resolver_requires_explicit_validated_projection_status():
    catalog_asset = {
        "id": "catalog-asset-platform-reliability",
        "kind": "catalog-asset",
        "confirmationStatus": "validated",
        "sourceRefs": [{"uri": "vault://career/platform"}],
    }
    records = [
        catalog_asset,
        {
            "id": "projection-missing-status",
            "kind": "projection",
            "derivedFromCatalogAssetIds": [catalog_asset["id"]],
            "inputRef": {"uri": "template://missing-status"},
        },
        {
            "id": "projection-approved-status",
            "kind": "projection",
            "status": "approved",
            "derivedFromCatalogAssetIds": [catalog_asset["id"]],
            "inputRef": {"uri": "template://approved"},
        },
        {
            "id": "projection-confirmation-only",
            "kind": "projection",
            "confirmationStatus": "validated",
            "derivedFromCatalogAssetIds": [catalog_asset["id"]],
            "inputRef": {"uri": "template://confirmation-only"},
        },
    ]

    result = resolve_generation_inputs(records)

    assert result["eligibleSources"] == [
        {
            "id": catalog_asset["id"],
            "kind": "catalog-asset",
            "role": "fact",
            "sourceRefs": catalog_asset["sourceRefs"],
        }
    ]
    assert {gap["id"]: gap["reason"] for gap in result["gaps"]} == {
        "projection-missing-status": "projection-not-validated",
        "projection-approved-status": "projection-not-validated",
        "projection-confirmation-only": "projection-not-validated",
    }


def test_resolver_denies_non_authoritative_sources_and_drafts_as_gaps():
    records = [
        {"id": "seed-one", "kind": "seed", "status": "substantiated", "sourceRefs": [{"uri": "vault://seed"}]},
        {"id": "note-one", "kind": "note", "content": "private note"},
        {"id": "work-order-one", "kind": "work-order"},
        {"id": "test-fixture-one", "kind": "test"},
        {"id": "catalog-draft", "kind": "catalog-asset", "confirmationStatus": "draft", "sourceRefs": [{"uri": "vault://draft"}]},
        {
            "id": "projection-draft",
            "kind": "projection",
            "status": "draft",
            "derivedFromCatalogAssetIds": ["catalog-missing"],
            "inputRef": {"uri": "template://draft"},
        },
    ]

    result = resolve_generation_inputs(records)

    assert result["eligibleSources"] == []
    assert result["targetContext"] is None
    assert {gap["id"]: gap["reason"] for gap in result["gaps"]} == {
        "seed-one": "source-kind-not-generation-authoritative",
        "note-one": "source-kind-not-generation-authoritative",
        "work-order-one": "source-kind-not-generation-authoritative",
        "test-fixture-one": "source-kind-not-generation-authoritative",
        "catalog-draft": "catalog-asset-not-validated",
        "projection-draft": "projection-not-validated",
    }
    assert "private note" not in str(result)
