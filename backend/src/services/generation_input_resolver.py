from __future__ import annotations

from typing import Any

_DENIED_KINDS = {"seed", "test", "work-order", "note", "evidence", "workflow", "workflow-run"}
_VALIDATED_STATUS = "validated"


def resolve_generation_inputs(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Return the PII-safe source set allowed for deliverable generation."""
    catalog_assets = {
        record.get("id"): record
        for record in records
        if record.get("kind") == "catalog-asset"
        and record.get("confirmationStatus") == "validated"
    }
    result: dict[str, Any] = {"eligibleSources": [], "targetContext": None, "gaps": []}

    for record in records:
        kind = record.get("kind")
        record_id = record.get("id", "missing-id")

        if kind == "target":
            result["targetContext"] = {
                "id": record_id,
                "kind": "target",
                "role": "targeting-context",
                "sourceRef": record.get("sourceRef"),
            }
        elif kind == "catalog-asset":
            if record.get("confirmationStatus") == "validated":
                result["eligibleSources"].append(
                    {
                        "id": record_id,
                        "kind": kind,
                        "role": "fact",
                        "sourceRefs": record.get("sourceRefs", []),
                    }
                )
            else:
                _gap(result, record_id, kind, "catalog-asset-not-validated")
        elif kind == "projection":
            status = str(record.get("status") or "").strip().lower()
            source_ids = record.get("derivedFromCatalogAssetIds") or []
            if status != _VALIDATED_STATUS:
                _gap(result, record_id, kind, "projection-not-validated")
            elif source_ids and all(source_id in catalog_assets for source_id in source_ids):
                result["eligibleSources"].append(
                    {
                        "id": record_id,
                        "kind": kind,
                        "role": "wording",
                        "derivedFromCatalogAssetIds": source_ids,
                        "inputRef": record.get("inputRef"),
                    }
                )
            else:
                _gap(result, record_id, kind, "projection-source-not-validated")
        elif kind in _DENIED_KINDS:
            _gap(result, record_id, kind, "source-kind-not-generation-authoritative")
        else:
            _gap(result, record_id, kind, "unsupported-source-kind")

    return result


def _gap(result: dict[str, Any], record_id: str, kind: str | None, reason: str) -> None:
    result["gaps"].append({"id": record_id, "kind": kind, "reason": reason})
