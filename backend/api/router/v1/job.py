# Minimal API route for job upload

from fastapi import APIRouter, HTTPException, UploadFile, File, Request, Query, Body
from services import JobService
from typing import Optional
from pydantic import BaseModel


class JobInput(BaseModel):
    job_text: Optional[str] = None
    job_url: Optional[str] = None
    # job_file is not handled here; file uploads need a separate endpoint or logic


job_router = APIRouter()


@job_router.post(
    "",
    summary="Create a job posting from text or URL, and persist processed result.",
)
async def create_job(request: Request, input: JobInput = Body(...)):
    # Only one input type allowed
    provided = [v for v in (input.job_text, input.job_url) if v is not None]
    if len(provided) != 1:
        raise HTTPException(
            status_code=400,
            detail=f"Provide exactly one input: job_text or job_url. Received: job_text={input.job_text}, job_url={input.job_url}",
        )
    service = JobService()
    await service.process_job_input(
        job_text=input.job_text, job_url=input.job_url, job_file=None
    )
    return {"message": "Job uploaded and processed successfully."}


# Fetch endpoint for jobs
@job_router.get(
    "",
    summary="Fetch all job postings.",
)
async def fetch_jobs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    service = JobService()
    jobs = await service.fetch_jobs(limit=limit, offset=offset)
    return {"jobs": jobs}


# Fetch single job by job_id
@job_router.get(
    "/{job_id}",
    summary="Fetch a single job posting by job_id.",
)
async def fetch_job(job_id: str):
    service = JobService()
    job = await service.fetch_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"job": job}
