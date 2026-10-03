from __future__ import annotations

import hashlib
import re
from typing import Any
from uuid import uuid4

from sqlmodel import select

from db.db import AsyncSessionLocal
from src.models.application_bundle import ApplicationBundle, ApplicationRecord
from src.models.job import Job
from src.models.job_fit import JobFit, JobRequirementMapping
from src.services.utils import get_or_404

_MATERIAL_RECORD_TYPES = {"submission", "interview", "decision", "follow-up", "material-change"}
_ASSESSMENT_BY_MATCH = {
    "strong": "matched",
    "partial": "partial",
    "weak": "gap",
    "none": "unsupported",
}


def _entity_id(prefix: str, value: str) -> str:
    safe = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not safe or len(f"{prefix}-{safe}") > 127:
        safe = hashlib.sha1(value.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}-{safe}"


class ApplicationBundleService:
    async def create_draft_bundle(
        self,
        job_fit_id: str,
        deliverable_ids: list[str] | None = None,
        unsupported_claim_note_ids: list[str] | None = None,
    ) -> dict[str, Any]:
        deliverable_ids = deliverable_ids or []
        note_ids = unsupported_claim_note_ids or []
        async with AsyncSessionLocal() as session:
            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            job = await get_or_404(session, Job, "job_id", job_fit.job_id)
            mapping = await get_or_404(session, JobRequirementMapping, "id", job_fit.mapping_id)
            self._validate_context(job_fit, mapping)

            existing = (
                await session.execute(
                    select(ApplicationBundle).where(ApplicationBundle.job_fit_id == job_fit_id)
                )
            ).scalars().first()
            if existing:
                return await self._render_bundle(session, existing)

            application_id = _entity_id("application", job_fit.id)
            bundle_id = _entity_id("bundle", job_fit.id)
            target_id = _entity_id("target", job.job_id)
            fit_analysis_id = _entity_id("fit-analysis", job_fit.id)
            source_refs = [
                {"uri": f"db://jobs/{job.job_id}"},
                {"uri": f"db://job-fits/{job_fit.id}"},
                {"uri": f"db://job-requirement-mappings/{mapping.id}"},
            ]
            target: dict[str, Any] = {
                "id": target_id,
                "kind": "target",
                "title": job.title or job.name,
                "sourceRef": source_refs[0],
            }
            if job.company:
                target["organization"] = job.company
            fit_analysis = {
                "id": fit_analysis_id,
                "kind": "fit-analysis",
                "profileId": _entity_id("profile", job_fit.resume_id),
                "targetId": target_id,
                "score": job_fit.score,
                "requirementMappings": [
                    self._requirement_mapping(item, source_refs[2])
                    for item in (mapping.requirements or [])
                ],
            }
            bundle = ApplicationBundle(
                application_id=application_id,
                bundle_id=bundle_id,
                job_fit_id=job_fit.id,
                resume_id=job_fit.resume_id,
                job_id=job_fit.job_id,
                target_id=target_id,
                fit_analysis_id=fit_analysis_id,
                deliverable_ids=deliverable_ids,
                note_ids=note_ids,
                source_refs=source_refs,
                target=target,
                fit_analysis=fit_analysis,
            )
            session.add(bundle)
            await session.commit()
            await session.refresh(bundle)
            return await self._render_bundle(session, bundle)

    async def fetch_bundle(self, application_or_bundle_id: str) -> dict[str, Any]:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ApplicationBundle).where(
                    (ApplicationBundle.application_id == application_or_bundle_id)
                    | (ApplicationBundle.bundle_id == application_or_bundle_id)
                )
            )
            bundle = result.scalars().one_or_none()
            if bundle is None:
                raise ValueError("Application bundle not found.")
            return await self._render_bundle(session, bundle)

    async def add_application_record(
        self,
        application_id: str,
        record_type: str,
        note_ids: list[str] | None = None,
        note_text: str | None = None,
    ) -> dict[str, Any] | None:
        if record_type not in _MATERIAL_RECORD_TYPES:
            return None
        async with AsyncSessionLocal() as session:
            await get_or_404(session, ApplicationBundle, "application_id", application_id)
            record = ApplicationRecord(
                id=_entity_id("application-record", uuid4().hex),
                application_id=application_id,
                record_type=record_type,
                note_ids=note_ids or [],
            )
            session.add(record)
            await session.commit()
            await session.refresh(record)
            return self._render_record(record)

    def _validate_context(self, job_fit: JobFit, mapping: JobRequirementMapping) -> None:
        if mapping.resume_id != job_fit.resume_id or mapping.job_id != job_fit.job_id:
            raise ValueError("JobRequirementMapping context does not match JobFit context.")

    def _requirement_mapping(self, item: dict[str, Any], source_ref: dict[str, str]) -> dict[str, Any]:
        requirement_id = str(item.get("requirement_id") or item.get("requirementId") or uuid4().hex)
        assessment = _ASSESSMENT_BY_MATCH.get(str(item.get("match_level", "")).lower(), "unsupported")
        result: dict[str, Any] = {
            "requirementId": _entity_id("requirement", requirement_id),
            "assessment": assessment,
            "method": "Existing job-fit requirement mapping adapter",
            "needsHumanConfirmation": assessment in {"gap", "unsupported"},
            "sourceRefs": [source_ref],
        }
        result["generationGap"] = {
            "reason": "validated-catalog-asset-required",
            "sourceKind": "job-fit-analysis",
        }
        return result

    async def _render_bundle(self, session: Any, bundle: ApplicationBundle) -> dict[str, Any]:
        records = (
            await session.execute(
                select(ApplicationRecord)
                .where(ApplicationRecord.application_id == bundle.application_id)
                .order_by(ApplicationRecord.occurred_at)
            )
        ).scalars().all()
        application = {
            "id": bundle.application_id,
            "kind": "application",
            "targetId": bundle.target_id,
            "status": bundle.status,
            "bundle": {
                "id": bundle.bundle_id,
                "manifestSourceRef": {"uri": f"db://application-bundles/{bundle.bundle_id}"},
                "materialCategories": ["generated", "claims-needing-validation"],
            },
            "deliverableIds": bundle.deliverable_ids,
            "noteIds": bundle.note_ids,
        }
        return {
            "application": application,
            "target": bundle.target,
            "fitAnalysis": bundle.fit_analysis,
            "sourceRefs": bundle.source_refs,
            "applicationRecords": [self._render_record(record) for record in records],
            "adapterSubset": "application-bundle-record-slice-v1",
        }

    def _render_record(self, record: ApplicationRecord) -> dict[str, Any]:
        rendered = {
            "id": record.id,
            "kind": "application-record",
            "applicationId": record.application_id,
            "recordType": record.record_type,
            "occurredAt": record.occurred_at.isoformat().replace("+00:00", "Z"),
        }
        if record.note_ids:
            rendered["noteIds"] = record.note_ids
        return rendered
