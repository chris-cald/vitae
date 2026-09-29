import json
from pathlib import Path
from typing import Any

CANONICAL_JOB_SEARCH_PATH = "~/Obsidian Vaults/loft/1 Projects/Job Search/"
_FIXTURE_DIR = Path(__file__).resolve().parents[3] / "schemas" / "career" / "fixtures" / "valid"


def _fixture(name: str) -> dict[str, Any]:
    return json.loads((_FIXTURE_DIR / f"{name}.json").read_text())


def ensure_uat_write_target_allowed(path: str | Path) -> None:
    target = Path(path).expanduser().resolve(strict=False)
    canonical = Path(CANONICAL_JOB_SEARCH_PATH).expanduser().resolve(strict=False)
    if target == canonical or canonical in target.parents:
        raise ValueError("canonical-vault-write-blocked")


def build_demo_application_loop() -> dict[str, Any]:
    """Return the smallest source-backed MVP loop for UAT smoke checks."""
    fit = _fixture("fit-analysis")
    target = _fixture("target")
    requirements = [
        {
            "id": item["requirementId"],
            "kind": "requirement",
            "targetId": target["id"],
            "statement": item["method"],
            "priority": "must",
            "sourceRef": target["sourceRef"],
        }
        for item in fit["requirementMappings"]
    ]
    misalignments = [
        {
            "id": "misalignment-requirement-domain-depth",
            "kind": "misalignment",
            "fitAnalysisId": fit["id"],
            "requirementId": "requirement-domain-depth",
            "category": "harvest",
            "explanation": "No validated CatalogAsset identified for this requirement.",
        },
        {
            "id": "misalignment-overbroad-claim",
            "kind": "misalignment",
            "fitAnalysisId": fit["id"],
            "requirementId": "requirement-platform-reliability",
            "category": "cull",
            "explanation": "Remove unsupported wording while preserving source history.",
        },
        {
            "id": "misalignment-role-positioning",
            "kind": "misalignment",
            "fitAnalysisId": fit["id"],
            "requirementId": "requirement-platform-reliability",
            "category": "prime",
            "explanation": "Adapt validated material to the target role.",
        },
        {
            "id": "misalignment-evidence-gap",
            "kind": "misalignment",
            "fitAnalysisId": fit["id"],
            "requirementId": "requirement-domain-depth",
            "category": "substantiate",
            "explanation": "Add evidence before publishing this claim.",
        },
    ]
    recommendations = [
        {
            "id": f"recommendation-{m['id']}",
            "kind": "recommendation",
            "misalignmentId": m["id"],
            "action": "Harvest source material or mark the gap for human review.",
            "rationale": m["explanation"],
        }
        for m in misalignments
    ]

    return {
        "sourceAssets": [_fixture("source-asset")],
        "catalogAssets": [_fixture("catalog-asset")],
        "target": target,
        "requirements": requirements,
        "fitAnalysis": fit,
        "misalignments": misalignments,
        "recommendations": recommendations,
        "deliverables": [_fixture("deliverable"), _fixture("cover-letter")],
        "application": _fixture("application"),
        "applicationRecords": [_fixture("application-record")],
    }


def build_expanded_uat_application_loop(application_count: int = 2) -> dict[str, Any]:
    if application_count < 2:
        raise ValueError("expanded-uat-requires-concurrent-applications")

    base = build_demo_application_loop()
    applications = []
    application_records = []
    targets = []
    requirements = []
    fit_analyses = []
    deliverables = []
    misalignments = []
    recommendations = []
    for index in range(application_count):
        suffix = f"role-{index + 1}"
        target = dict(base["target"], id=f"target-{suffix}")
        role_requirements = [
            dict(item, id=f"{item['id']}-{suffix}", targetId=target["id"])
            for item in base["requirements"]
        ]
        requirement_id_map = {
            original["id"]: cloned["id"]
            for original, cloned in zip(base["requirements"], role_requirements)
        }
        fit = dict(
            base["fitAnalysis"],
            id=f"fit-analysis-{suffix}",
            targetId=target["id"],
            status="recomputed-after-curation",
            requirementMappings=[
                dict(
                    item,
                    requirementId=requirement_id_map.get(
                        item["requirementId"], item["requirementId"]
                    ),
                )
                for item in base["fitAnalysis"]["requirementMappings"]
            ],
        )
        application = dict(
            base["application"],
            id=f"application-{suffix}",
            targetId=target["id"],
        )
        role_deliverables = [
            dict(
                item,
                id=f"{item['id']}-{suffix}",
                targetId=target["id"],
                applicationId=application["id"],
            )
            for item in base["deliverables"]
        ]
        record = dict(
            base["applicationRecords"][0],
            id=f"application-record-{suffix}",
            applicationId=application["id"],
        )
        role_misalignments = [
            dict(
                item,
                id=f"{item['id']}-{suffix}",
                fitAnalysisId=fit["id"],
                requirementId=requirement_id_map.get(
                    item["requirementId"], item["requirementId"]
                ),
            )
            for item in base["misalignments"]
        ]
        role_recommendations = [
            dict(
                item,
                id=f"{item['id']}-{suffix}",
                misalignmentId=role_misalignments[item_index]["id"],
            )
            for item_index, item in enumerate(base["recommendations"])
        ]
        application["deliverableIds"] = [item["id"] for item in role_deliverables]
        targets.append(target)
        requirements.extend(role_requirements)
        fit_analyses.append(fit)
        applications.append(application)
        application_records.append(record)
        deliverables.extend(role_deliverables)
        misalignments.extend(role_misalignments)
        recommendations.extend(role_recommendations)

    return {
        **base,
        "target": targets[0],
        "fitAnalysis": fit_analyses[0],
        "application": applications[0],
        "targets": targets,
        "requirements": requirements,
        "fitAnalyses": fit_analyses,
        "applications": applications,
        "applicationRecords": application_records,
        "deliverables": deliverables,
        "misalignments": misalignments,
        "recommendations": recommendations,
        "curationEvents": [
            {"stage": "harvest", "status": "completed", "recordCount": 1},
            {"stage": "cull", "status": "completed", "recordCount": 1, "effect": "catalog-asset-rejected"},
            {"stage": "prime", "status": "completed", "recordCount": 1},
            {"stage": "substantiate", "status": "completed", "recordCount": 1, "effect": "catalog-asset-promoted"},
        ],
        "bookOfWorkRefresh": {
            "status": "incorporated",
            "canonicalVaultMutated": False,
            "writeTarget": "vitae-test-storage",
        },
        "temporal": {
            "required": True,
            "payloadPolicy": "opaque-ids-only",
            "workflowTypes": [
                "book-of-work-refresh",
                "curation",
                "target-catalog-fit",
                "deliverable-generation",
                "application-automation",
            ],
        },
    }
