# Minimal API route for job upload
from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from backend.services import JobService
from fastapi import Body
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
