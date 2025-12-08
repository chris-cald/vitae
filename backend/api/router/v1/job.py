# Minimal API route for job upload
from fastapi import APIRouter, HTTPException, UploadFile, File, Request, Query, Body
from backend.services import JobService
from typing import Optional

job_router = APIRouter()


@job_router.post(
    "",
    summary="Create a job posting from text, file, or URL, and persist processed result.",
)
async def create_job(
    request: Request,
    job_text: Optional[str] = Body(default=None, embed=True),
    job_url: Optional[str] = Body(default=None, embed=True),
    job_file: Optional[UploadFile] = File(default=None),
):
    # Only one input type allowed
    provided = [v for v in (job_text, job_url, job_file) if v is not None]
    if len(provided) != 1:
        raise HTTPException(
            status_code=400,
            detail="Provide exactly one input: job_text, job_url, or job_file.",
        )
    service = JobService()
    await service.process_job_input(
        job_text=job_text, job_url=job_url, job_file=job_file
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
