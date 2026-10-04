import asyncio
from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from src.main import app

from sqlmodel import select

from db.db import AsyncSessionLocal, init_db
from src.models.application_bundle import ApplicationBundle
from src.models.job import Job
from src.models.job_fit import JobFit, JobRequirementMapping
from src.models.resume import RawResume, Resume
from src.services.application_bundle_service import ApplicationBundleService
from src.services.generation_input_resolver import resolve_generation_inputs


def _suffix() -> str:
    return uuid4().hex[:10]


async def _seed_job_fit(
    suffix: str,
    mismatched_mapping: bool = False,
    job_meta: dict | None = None,
    requirements: list[dict] | None = None,
) -> str:
    resume_id = f"resume-{suffix}"
    job_id = f"job-{suffix}"
    mapping_id = f"mapping-{suffix}"
    job_fit_id = f"job-fit-{suffix}"
    mapping_resume_id = f"resume-other-{suffix}" if mismatched_mapping else resume_id
    mapping_job_id = f"job-other-{suffix}" if mismatched_mapping else job_id
    requirements = requirements or [{"requirement_id": f"req-{suffix}", "requirement": "Build reliable platforms", "resume_evidence": "synthetic evidence", "match_level": "partial", "notes": ""}]
    async with AsyncSessionLocal() as session:
        session.add(RawResume(resume_id=resume_id, file_path=f"/tmp/{resume_id}.pdf", extracted_content="synthetic", content_type="text/plain"))
        session.add(Resume(resume_id=resume_id, name=f"Resume {suffix}", basics={"name": "Synthetic Candidate"}))
        session.add(Job(job_id=job_id, name=f"Role {suffix}", resume_id=resume_id, title=f"Staff Engineer {suffix}", company=f"Company {suffix}", description="synthetic JD", meta=job_meta))
        session.add(JobRequirementMapping(id=mapping_id, resume_id=mapping_resume_id, job_id=mapping_job_id, requirements=requirements))
        session.add(JobFit(id=job_fit_id, name=f"Fit {suffix}", resume_id=resume_id, job_id=job_id, mapping_id=mapping_id, score=0.72, analysis="synthetic analysis", feedback=[], keywords=["platform"], skills=[], created_at=datetime.now(timezone.utc).isoformat()))
        await session.commit()
    return job_fit_id


@pytest.mark.asyncio
async def test_create_and_fetch_draft_bundle_links_ids_without_note_prose():
    await init_db()
    job_fit_id = await _seed_job_fit(_suffix())
    service = ApplicationBundleService()

    bundle = await service.create_draft_bundle(
        job_fit_id,
        deliverable_ids=["deliverable-alpha"],
        unsupported_claim_note_ids=["note-review-alpha"],
    )
    fetched = await service.fetch_bundle(bundle["application"]["id"])

    assert fetched == bundle
    assert bundle["application"]["kind"] == "application"
    assert bundle["application"]["status"] == "draft"
    assert bundle["application"]["deliverableIds"] == ["deliverable-alpha"]
    assert bundle["application"]["noteIds"] == ["note-review-alpha"]
    assert bundle["target"]["id"] == bundle["fitAnalysis"]["targetId"]
    assert bundle["fitAnalysis"]["profileId"].startswith("profile-")
    assert bundle["sourceRefs"]
    assert bundle["applicationRecords"] == []
    requirement_mapping = bundle["fitAnalysis"]["requirementMappings"][0]
    assert "catalogAssetIds" not in requirement_mapping
    assert requirement_mapping["generationGap"] == {
        "reason": "validated-catalog-asset-required",
        "sourceKind": "job-fit-analysis",
    }
    assert resolve_generation_inputs([bundle["fitAnalysis"]]) == {
        "eligibleSources": [],
        "targetContext": None,
        "gaps": [
            {
                "id": bundle["fitAnalysis"]["id"],
                "kind": "fit-analysis",
                "reason": "unsupported-source-kind",
            }
        ],
    }
    assert "unsupported claim prose" not in str(bundle).lower()
    assert "synthetic evidence" not in str(bundle).lower()
    assert "synthetic jd" not in str(bundle).lower()


@pytest.mark.asyncio
async def test_draft_bundle_generates_artifacts_from_approved_inputs_only_without_vault_writes():
    await init_db()
    job_fit_id = await _seed_job_fit(
        _suffix(),
        job_meta={"source_url": "https://jobs.example.test/staff", "accessed_at": "2025-01-02T03:04:05Z"},
        requirements=[
            {"requirement_id": "supported", "requirement": "Approved source backs this", "resume_evidence": "DO NOT COPY RESUME EVIDENCE", "match_level": "strong", "notes": ""},
            {"requirement_id": "gap", "requirement": "Needs human proof", "resume_evidence": "UNSUPPORTED CLAIM PROSE", "match_level": "none", "notes": ""},
        ],
    )

    bundle = await ApplicationBundleService().create_draft_bundle(
        job_fit_id,
        generation_records=[
            {
                "id": "catalog-asset-platform-reliability",
                "kind": "catalog-asset",
                "confirmationStatus": "validated",
                "summary": "PRIVATE RAW FACT",
                "sourceRefs": [{"uri": "source://candidate/platform", "locator": "#impact"}],
            },
            {
                "id": "projection-platform-summary",
                "kind": "projection",
                "status": "validated",
                "text": "PRIVATE POLISHED WORDING",
                "derivedFromCatalogAssetIds": ["catalog-asset-platform-reliability"],
                "inputRef": {"uri": "template://resume/summary"},
            },
            {"id": "note-private", "kind": "note", "content": "PRIVATE NOTE"},
        ],
    )

    artifacts = bundle["draftArtifacts"]
    assert artifacts["capturedJdNote"]["name"].endswith("-jd.md")
    assert artifacts["tailoredResumeDraft"]["name"].endswith("-resume.md")
    assert artifacts["capturedJdNote"]["path"].startswith("vitae://draft-application-bundles/")
    assert artifacts["tailoredResumeDraft"]["path"].startswith("vitae://draft-application-bundles/")
    assert artifacts["capturedJdNote"]["name"] in artifacts["manifest"]["markdown"]
    assert artifacts["tailoredResumeDraft"]["name"] in artifacts["manifest"]["markdown"]
    assert "https://jobs.example.test/staff" in artifacts["capturedJdNote"]["markdown"]
    assert "2025-01-02T03:04:05Z" in artifacts["capturedJdNote"]["markdown"]
    assert "catalog-asset-platform-reliability" in artifacts["tailoredResumeDraft"]["markdown"]
    assert "projection-platform-summary" in artifacts["tailoredResumeDraft"]["markdown"]
    assert artifacts["sourceSummary"]["eligibleSourceIds"] == [
        "catalog-asset-platform-reliability",
        "projection-platform-summary",
    ]
    assert artifacts["unsupportedClaims"] == [
        {"id": "requirement-gap", "assessment": "unsupported", "reason": "needs-human-confirmation"},
        {"id": "note-private", "kind": "note", "reason": "source-kind-not-generation-authoritative"},
    ]
    assert artifacts["nextAction"] == "Review unsupported claims before publishing."

    fetched = await ApplicationBundleService().fetch_bundle(bundle["application"]["id"])
    assert fetched["draftArtifacts"]["sourceSummary"]["eligibleSourceIds"] == artifacts["sourceSummary"]["eligibleSourceIds"]
    assert fetched["draftArtifacts"]["unsupportedClaims"] == artifacts["unsupportedClaims"]

    rendered = str(bundle)
    assert "Obsidian Vaults" not in rendered
    assert "synthetic JD" not in rendered
    assert "DO NOT COPY RESUME EVIDENCE" not in rendered
    assert "UNSUPPORTED CLAIM PROSE" not in rendered
    assert "PRIVATE RAW FACT" not in rendered
    assert "PRIVATE POLISHED WORDING" not in rendered
    assert "PRIVATE NOTE" not in rendered


@pytest.mark.asyncio
async def test_rejects_mismatched_job_fit_mapping_context_before_persisting():
    await init_db()
    job_fit_id = await _seed_job_fit(_suffix(), mismatched_mapping=True)

    with pytest.raises(ValueError, match="does not match"):
        await ApplicationBundleService().create_draft_bundle(job_fit_id)

    async with AsyncSessionLocal() as session:
        bundles = (await session.execute(select(ApplicationBundle).where(ApplicationBundle.job_fit_id == job_fit_id))).scalars().all()
    assert bundles == []


@pytest.mark.asyncio
async def test_two_bundles_do_not_share_targets_or_deliverables():
    await init_db()
    first_fit = await _seed_job_fit(_suffix())
    second_fit = await _seed_job_fit(_suffix())
    service = ApplicationBundleService()

    first = await service.create_draft_bundle(first_fit, deliverable_ids=["deliverable-first"])
    second = await service.create_draft_bundle(second_fit, deliverable_ids=["deliverable-second"])

    assert first["application"]["id"] != second["application"]["id"]
    assert first["target"]["id"] != second["target"]["id"]
    assert first["application"]["deliverableIds"] == ["deliverable-first"]
    assert second["application"]["deliverableIds"] == ["deliverable-second"]
    assert "deliverable-second" not in str(first)
    assert "deliverable-first" not in str(second)


@pytest.mark.asyncio
async def test_records_only_material_application_events_without_note_prose():
    await init_db()
    job_fit_id = await _seed_job_fit(_suffix())
    service = ApplicationBundleService()
    bundle = await service.create_draft_bundle(job_fit_id)
    application_id = bundle["application"]["id"]

    ignored = await service.add_application_record(application_id, "autosave", note_ids=["note-sensitive"], note_text="unsupported claim prose")
    created = await service.add_application_record(application_id, "follow-up", note_ids=["note-sensitive"], note_text="unsupported claim prose")
    fetched = await service.fetch_bundle(application_id)

    assert ignored is None
    assert created is not None
    assert created["recordType"] == "follow-up"
    assert created["noteIds"] == ["note-sensitive"]
    assert len(fetched["applicationRecords"]) == 1
    assert "unsupported claim prose" not in str(fetched).lower()


def test_application_bundle_create_and_fetch_endpoints():
    asyncio.run(init_db())
    job_fit_id = asyncio.run(_seed_job_fit(_suffix()))

    with TestClient(app) as client:
        created = client.post(
            "/api/v1/application-bundles/draft",
            json={"job_fit_id": job_fit_id, "deliverable_ids": ["deliverable-api"]},
        )
        fetched = client.get(f"/api/v1/application-bundles/{created.json()['application']['id']}")

    assert created.status_code == 201
    assert fetched.status_code == 200
    assert fetched.json()["application"]["deliverableIds"] == ["deliverable-api"]


def test_application_bundle_create_endpoint_rejects_invalid_or_duplicate_refs():
    asyncio.run(init_db())
    job_fit_id = asyncio.run(_seed_job_fit(_suffix()))

    with TestClient(app) as client:
        bad_deliverable = client.post(
            "/api/v1/application-bundles/draft",
            json={"job_fit_id": job_fit_id, "deliverable_ids": ["random-string"]},
        )
        duplicate_note = client.post(
            "/api/v1/application-bundles/draft",
            json={"job_fit_id": job_fit_id, "unsupported_claim_note_ids": ["note-review", "note-review"]},
        )

    assert bad_deliverable.status_code == 422
    assert duplicate_note.status_code == 422
