from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Body
from src.services import JobService
from typing import Any
from pydantic import BaseModel

job_router = APIRouter()


# Unified PATCH /job/{job_id}
class JobPatch(BaseModel):
    name: str | None = None
    profile_categories: Any = None


@job_router.patch(
    "/{job_id}",
    summary="Partially update a job (name, profile_categories)",
)
async def patch_job(job_id: str, body: JobPatch = Body(...)):
    from src.models.job import Job
    from db.db import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        from src.services.utils import get_or_404

        job = await get_or_404(session, Job, "job_id", job_id)
        updated = False
        patch_dict = body.model_dump(exclude_unset=True)
        # Prevent processed_at from being set to None
        if "processed_at" in patch_dict and patch_dict["processed_at"] is None:
            patch_dict.pop("processed_at")
        if "name" in patch_dict:
            job.name = patch_dict["name"]
            updated = True
        if "profile_categories" in patch_dict:
            job.profile_categories = patch_dict["profile_categories"]
            updated = True
        # Optionally, update processed_at if you want to track updates
        # job.processed_at = datetime.now(timezone.utc)
        if updated:
            session.add(job)
            await session.commit()
        data = job.model_dump()
    return {"job": data}


# PATCH /job/{job_id}/name
class JobNameUpdate(BaseModel):
    name: str


@job_router.patch(
    "/{job_id}/name",
    summary="Update the name of a job.",
)
async def update_job_name(job_id: str, body: JobNameUpdate):
    service = JobService()
    try:
        await service.update_job_name(job_id, body.name)
    except Exception:
        raise HTTPException(status_code=500, detail="Job update failed.")
    return {"message": "Job name updated."}


# 1. POST /job/url
@job_router.post("/url", summary="Create a job posting from a URL.")
async def create_job_url(input: dict[str, Any] = Body(...)):
    job_url = input.get("job_url")
    if not job_url:
        raise HTTPException(status_code=400, detail="Missing job_url.")
    service = JobService()
    try:
        job_id = await service.process_job_input(job_url=job_url, name=input.get("name"))
    except Exception:
        raise HTTPException(status_code=500, detail="Job processing failed.")
    return {"job_id": job_id, "message": "Job uploaded and processed successfully."}


# 2. POST /job/text
@job_router.post("/text", summary="Create a job posting from raw text.")
async def create_job_text(input: dict[str, Any] = Body(...)):
    job_text = input.get("job_text")
    if not job_text:
        raise HTTPException(status_code=400, detail="Missing job_text.")
    service = JobService()
    try:
        job_id = await service.process_job_input(job_text=job_text, name=input.get("name"))
    except Exception:
        raise HTTPException(status_code=500, detail="Job processing failed.")
    return {"job_id": job_id, "message": "Job uploaded and processed successfully."}


# 3. POST /job/file
@job_router.post(
    "/file",
    summary="Create a job posting from a file (PDF, DOCX, Markdown).",
)
async def create_job_file(file: UploadFile = File(...), name: str | None = Form(None)):
    allowed_content_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/markdown",
    ]
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF, DOCX, and Markdown files are allowed.",
        )
    MAX_FILE_SIZE = 2 * 1024 * 1024
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, detail="File size exceeds maximum allowed size of 2.0MB."
        )
    service = JobService()
    try:
        job_id = await service.process_job_input(job_file=file, name=name)
    except Exception:
        raise HTTPException(status_code=500, detail="Job processing failed.")
    return {"job_id": job_id, "message": "Job uploaded and processed successfully."}


# Fetch endpoint for jobs
@job_router.get("", summary="Fetch all job postings.")
async def fetch_jobs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    service = JobService()
    jobs = await service.fetch_jobs(limit=limit, offset=offset)
    return {"jobs": jobs}


# Fetch single job by job_id
@job_router.get("/{job_id}", summary="Fetch a single job posting by job_id.")
async def fetch_job(
    job_id: str,
    force: bool = Query(False, description="Force re-detection of profile_categories"),
) -> dict[str, Any]:
    service = JobService()
    job = await service.fetch_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"job": job}


# DELETE /job/{job_id}
@job_router.delete("/{job_id}", summary="Delete a job by job_id.", status_code=204)
async def delete_job(job_id: str):
    service = JobService()
    try:
        await service.delete_job(job_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Job not found.")
    return
