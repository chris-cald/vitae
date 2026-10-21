import re
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from src.services.application_bundle_service import ApplicationBundleService

router = APIRouter()

_ENTITY_ID_RE = re.compile(r"^[a-z][a-z0-9-]{2,127}$")


def _adapter_refs(values: list[str], prefix: str) -> list[str]:
    if len(values) != len(set(values)):
        raise ValueError("canonical references must be unique")
    if any(not _ENTITY_ID_RE.fullmatch(value) or not value.startswith(prefix) for value in values):
        raise ValueError(f"canonical references must use the {prefix} adapter subset")
    return values


class MaterialApplicationRecordRequest(BaseModel):
    job_fit_id: str
    record_type: Literal["submission", "interview", "decision", "follow-up", "material-change"]
    note_ids: list[str] = Field(default_factory=list)

    @field_validator("note_ids")
    @classmethod
    def validate_note_ids(cls, values: list[str]) -> list[str]:
        return _adapter_refs(values, "note-")


class DraftApplicationBundleRequest(BaseModel):
    job_fit_id: str
    deliverable_ids: list[str] = Field(
        default_factory=list,
        description="WI-051 adapter subset: unique canonical entity IDs with the deliverable- prefix.",
    )
    unsupported_claim_note_ids: list[str] = Field(
        default_factory=list,
        description="WI-051 adapter subset: unique canonical entity IDs with the note- prefix.",
    )
    generation_records: list[dict[str, Any]] = Field(
        default_factory=list,
        description="WI-052-approved source candidates; raw prose is ignored by artifact generation.",
    )

    @field_validator("deliverable_ids")
    @classmethod
    def validate_deliverable_ids(cls, values: list[str]) -> list[str]:
        return _adapter_refs(values, "deliverable-")

    @field_validator("unsupported_claim_note_ids")
    @classmethod
    def validate_unsupported_claim_note_ids(cls, values: list[str]) -> list[str]:
        return _adapter_refs(values, "note-")


@router.post("/application-bundles/draft", status_code=status.HTTP_201_CREATED)
async def create_draft_application_bundle(input: DraftApplicationBundleRequest) -> dict[str, Any]:
    try:
        return await ApplicationBundleService().create_draft_bundle(
            input.job_fit_id,
            deliverable_ids=input.deliverable_ids,
            unsupported_claim_note_ids=input.unsupported_claim_note_ids,
            generation_records=input.generation_records,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Application bundle dependency not found.")


@router.post(
    "/application-bundles/{application_id}/records",
    status_code=status.HTTP_201_CREATED,
)
async def add_material_application_record(
    application_id: str, input: MaterialApplicationRecordRequest
) -> dict[str, Any]:
    try:
        record = await ApplicationBundleService().add_application_record(
            application_id, input.job_fit_id, input.record_type, note_ids=input.note_ids
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Application bundle not found.")
    if record is None:
        raise HTTPException(status_code=422, detail="Application record type is not material.")
    return record


@router.get("/application-bundles")
async def list_application_bundles(job_fit_id: str) -> list[dict[str, Any]]:
    return await ApplicationBundleService().list_bundles(job_fit_id)


@router.get("/application-bundles/{application_or_bundle_id}")
async def get_application_bundle(application_or_bundle_id: str, job_fit_id: str) -> dict[str, Any]:
    try:
        return await ApplicationBundleService().fetch_bundle(application_or_bundle_id, job_fit_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Application bundle not found.")
