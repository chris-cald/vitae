import re
from typing import Any

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
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Application bundle dependency not found.")


@router.get("/application-bundles/{application_or_bundle_id}")
async def get_application_bundle(application_or_bundle_id: str) -> dict[str, Any]:
    try:
        return await ApplicationBundleService().fetch_bundle(application_or_bundle_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Application bundle not found.")
