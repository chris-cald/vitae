from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from src.models.job_fit import JobFit, JobRequirementMapping
from typing import Any
from src.services.job_fit_service import JobFitService


router = APIRouter()


# PATCH /job-fit/{job_fit_id}/name
class JobFitNameUpdate(BaseModel):
    name: str


@router.patch(
    "/job-fit/{job_fit_id}/name",
    summary="Update the name of a job-fit analysis.",
)
async def update_job_fit_name(job_fit_id: str, body: JobFitNameUpdate):
    service = JobFitService()
    try:
        await service.update_job_fit_name(job_fit_id, body.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Job-fit name updated."}


@router.get("/job-fit", response_model=list[JobFit])
async def list_job_fits(
    limit: int = Query(10, ge=1, le=100), offset: int = Query(0, ge=0)
):
    service = JobFitService()
    return await service.list_job_fits(limit=limit, offset=offset)


@router.get("/job-fit/{job_fit_id}/skill", response_model=list[dict[str, str]])
async def get_skill(job_fit_id: str):
    service = JobFitService()
    try:
        skill = await service.fetch_skill(job_fit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return skill


class JobFitCreateRequest(BaseModel):
    resume_id: str
    job_id: str
    name: str | None = None
    profile_categories: dict[str, Any] | None = None


@router.post(
    "/job-fit",
    summary="Create a job-fit analysis between a candidate profile and a job description",
    response_model=JobFit,
    status_code=201,
)
async def create_job_fit(req: JobFitCreateRequest):
    service = JobFitService()
    try:
        job_fit = await service.analyze_fit(
            resume_id=req.resume_id,
            job_id=req.job_id,
            name=req.name,
            profile_categories=req.profile_categories,
        )
    except Exception as e:
        msg = str(e)
        if "not found" in msg:
            raise HTTPException(status_code=404, detail=msg)
        raise HTTPException(status_code=400, detail=msg)
    return job_fit


@router.get("/job-fit/{job_fit_id}", response_model=JobFit)
async def get_job_fit(job_fit_id: str):
    service = JobFitService()
    try:
        job_fit = await service.fetch_job_fit(job_fit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return job_fit


# DELETE /job-fit/{job_fit_id}
@router.delete(
    "/job-fit/{job_fit_id}",
    summary="Delete a job-fit analysis by job_fit_id.",
    status_code=204,
)
async def delete_job_fit(job_fit_id: str):
    service = JobFitService()
    try:
        await service.delete_job_fit(job_fit_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    return


# --- Sub-resource endpoints for mapping and feedback ---
@router.get("/job-fit/{job_fit_id}/mapping", response_model=JobRequirementMapping)
async def get_job_fit_mapping(job_fit_id: str) -> dict[str, Any]:
    """Get the mapping for a job-fit analysis."""
    service = JobFitService()
    try:
        mapping = await service.fetch_job_fit_mapping(job_fit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return mapping


@router.get("/job-fit/{job_fit_id}/feedback")
async def get_job_fit_feedback(job_fit_id: str):
    """Get feedback for a job-fit analysis (lazy-loads if not present)."""
    service = JobFitService()
    try:
        feedback = await service.fetch_feedback(job_fit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return feedback
