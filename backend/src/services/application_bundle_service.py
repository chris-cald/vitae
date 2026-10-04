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
from src.services.generation_input_resolver import resolve_generation_inputs
from src.services.utils import get_or_404

_MATERIAL_RECORD_TYPES = {"submission", "interview", "decision", "follow-up", "material-change"}
_ASSESSMENT_BY_MATCH = {
    "strong": "matched",
    "partial": "partial",
    "weak": "gap",
    "none": "unsupported",
}
_GENERATION_CONTEXT_URI = "vitae://generation-inputs"


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
        generation_records: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        deliverable_ids = deliverable_ids or []
        note_ids = unsupported_claim_note_ids or []
        generation_records = generation_records or []
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
                self._remember_generation_context(existing, generation_records)
                session.add(existing)
                await session.commit()
                await session.refresh(existing)
                return await self._render_bundle(session, existing, generation_records)

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
            source_refs = self._source_refs_with_generation_context(source_refs, generation_records, target)
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
            return await self._render_bundle(session, bundle, generation_records)

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

    async def _render_bundle(
        self,
        session: Any,
        bundle: ApplicationBundle,
        generation_records: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
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
        job_fit = await get_or_404(session, JobFit, "id", bundle.job_fit_id)
        job = await get_or_404(session, Job, "job_id", bundle.job_id)
        mapping = await get_or_404(session, JobRequirementMapping, "id", job_fit.mapping_id)
        return {
            "application": application,
            "target": bundle.target,
            "fitAnalysis": bundle.fit_analysis,
            "sourceRefs": bundle.source_refs,
            "applicationRecords": [self._render_record(record) for record in records],
            "draftArtifacts": self._draft_artifacts(bundle, job, mapping, generation_records or []),
            "adapterSubset": "application-bundle-record-slice-v1",
        }

    def _source_refs_with_generation_context(
        self,
        source_refs: list[dict[str, Any]],
        generation_records: list[dict[str, Any]],
        target: dict[str, Any],
    ) -> list[dict[str, Any]]:
        refs = [ref for ref in source_refs if ref.get("uri") != _GENERATION_CONTEXT_URI]
        if generation_records:
            refs.append({"uri": _GENERATION_CONTEXT_URI, **resolve_generation_inputs([*generation_records, target])})
        return refs

    def _remember_generation_context(
        self,
        bundle: ApplicationBundle,
        generation_records: list[dict[str, Any]],
    ) -> None:
        if generation_records:
            bundle.source_refs = self._source_refs_with_generation_context(
                bundle.source_refs,
                generation_records,
                bundle.target,
            )

    def _resolved_generation_inputs(
        self,
        bundle: ApplicationBundle,
        generation_records: list[dict[str, Any]],
    ) -> dict[str, Any]:
        if generation_records:
            return resolve_generation_inputs([*generation_records, bundle.target])
        for ref in bundle.source_refs:
            if ref.get("uri") == _GENERATION_CONTEXT_URI:
                return {
                    "eligibleSources": ref.get("eligibleSources", []),
                    "targetContext": ref.get("targetContext"),
                    "gaps": ref.get("gaps", []),
                }
        return resolve_generation_inputs([bundle.target])

    def _draft_artifacts(
        self,
        bundle: ApplicationBundle,
        job: Job,
        mapping: JobRequirementMapping,
        generation_records: list[dict[str, Any]],
    ) -> dict[str, Any]:
        resolved = self._resolved_generation_inputs(bundle, generation_records)
        jd_name = f"{bundle.target_id}-jd.md"
        resume_name = f"{bundle.target_id}-resume.md"
        manifest_name = f"{bundle.bundle_id}-manifest.md"
        root = f"vitae://draft-application-bundles/{bundle.bundle_id}"
        source_url = (job.meta or {}).get("source_url") or (job.meta or {}).get("sourceUrl") or f"db://jobs/{job.job_id}"
        accessed_at = (job.meta or {}).get("accessed_at") or (job.meta or {}).get("accessedAt") or "not-recorded"
        eligible_ids = [source["id"] for source in resolved["eligibleSources"]]
        source_refs = [
            source_ref
            for source in resolved["eligibleSources"]
            for source_ref in source.get("sourceRefs", [])
        ]
        unsupported_claims = [
            {
                "id": item["requirementId"],
                "assessment": item["assessment"],
                "reason": "needs-human-confirmation",
            }
            for item in bundle.fit_analysis.get("requirementMappings", [])
            if item.get("assessment") in {"gap", "unsupported"}
        ]
        unsupported_claims.extend(resolved["gaps"])
        next_action = (
            "Review unsupported claims before publishing."
            if unsupported_claims
            else "Ready for human review before publishing."
        )
        jd_markdown = "\n".join(
            [
                f"# Captured JD: {job.title or job.name}",
                "",
                f"- Target ID: `{bundle.target_id}`",
                f"- Organization: {job.company or 'not-recorded'}",
                f"- Source: {source_url}",
                f"- Accessed: {accessed_at}",
                "- Content: stored in Vitae source storage; raw JD text is not copied into this draft artifact.",
            ]
        )
        resume_markdown = "\n".join(
            [
                f"# Tailored resume draft for {job.title or job.name}",
                "",
                "Uses only WI-052-approved generation inputs.",
                "",
                "## Approved inputs",
                *(f"- `{source_id}`" for source_id in eligible_ids),
                "",
                "## Omitted claims",
                *(f"- `{claim['id']}` — {claim['reason']}" for claim in unsupported_claims),
            ]
        )
        manifest_markdown = "\n".join(
            [
                f"# Draft application bundle manifest: {bundle.bundle_id}",
                "",
                f"- JD note: [{jd_name}]({root}/{jd_name})",
                f"- Tailored resume draft: [{resume_name}]({root}/{resume_name})",
                f"- Next action: {next_action}",
            ]
        )
        return {
            "capturedJdNote": {"name": jd_name, "path": f"{root}/{jd_name}", "markdown": jd_markdown},
            "tailoredResumeDraft": {"name": resume_name, "path": f"{root}/{resume_name}", "markdown": resume_markdown},
            "manifest": {"name": manifest_name, "path": f"{root}/{manifest_name}", "markdown": manifest_markdown},
            "sourceSummary": {
                "eligibleSourceIds": eligible_ids,
                "targetSourceRef": resolved["targetContext"]["sourceRef"],
                "sourceRefs": source_refs,
            },
            "unsupportedClaims": unsupported_claims,
            "nextAction": next_action,
            "storage": {"writeTarget": root, "canonicalVaultMutated": False},
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
