from fastapi import (
    APIRouter,
    File,
    UploadFile,
    HTTPException,
    status,
    Request,
    Query,
    Body,
)
from src.services import ResumeService
from pydantic import BaseModel
from typing import Any

# Add missing import for AsyncSessionLocal
from db.db import AsyncSessionLocal

resume_router = APIRouter()


# Unified PATCH /resume/{resume_id}
class ResumePatch(BaseModel):
    name: str | None = None
    profile_categories: Any = None


@resume_router.patch(
    "/{resume_id}",
    summary="Partially update a resume (name, profile_categories)",
)
async def patch_resume(resume_id: str, body: ResumePatch = Body(...)):
    from src.models.resume import Resume

    async with AsyncSessionLocal() as session:
        from src.services.utils import get_or_404

        resume = await get_or_404(session, Resume, "resume_id", resume_id)
        updated = False
        patch_dict = body.model_dump(exclude_unset=True)
        if "name" in patch_dict:
            resume.name = patch_dict["name"]
            updated = True
        if "profile_categories" in patch_dict:
            resume.profile_categories = patch_dict["profile_categories"]
            updated = True
        if updated:
            session.add(resume)
            await session.commit()
        data = resume.model_dump()
    return {"resume": data}


# 1. POST /resume/text
@resume_router.post(
    "/text",
    summary="Create a resume from raw text.",
)
async def create_resume_text(request: Request):
    resume_text = await request.body()
    if not resume_text:
        raise HTTPException(status_code=400, detail="Missing resume_text.")
    service = ResumeService()
    try:
        await service.process_resume(resume_text, "text/plain", "raw.txt")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Resume uploaded and processed successfully."}


# 2. POST /resume/file
@resume_router.post(
    "/file",
    summary="Create a resume from a file (PDF, DOCX, Markdown).",
)
async def create_resume_file(file: UploadFile = File(...)):
    import logging

    logger = logging.getLogger(__name__)
    allowed_content_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/markdown",
    ]
    logger.info(
        "Received resume file upload with content_type=%s", file.content_type
    )
    if file.content_type not in allowed_content_types:
        logger.warning(
            f"Rejected file upload: invalid content_type={file.content_type}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF, DOCX, and Markdown files are allowed.",
        )
    MAX_FILE_SIZE = 2 * 1024 * 1024
    file_bytes = await file.read()
    logger.info("Resume file read complete, size=%s bytes", len(file_bytes))
    if len(file_bytes) > MAX_FILE_SIZE:
        logger.warning("Rejected resume upload: file too large (%s bytes)", len(file_bytes))
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed size of 2.0MB.",
        )
    service = ResumeService()
    filename = file.filename if file.filename is not None else ""
    try:
        logger.info(
            "Processing resume upload with content_type=%s", file.content_type
        )
        await service.process_resume(file_bytes, file.content_type, filename)
        logger.info("Resume processed successfully")
    except Exception as e:
        import traceback

        logger.error("Error processing resume upload: %s", e)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Resume uploaded and processed successfully."}


# 3. POST /resume/url (if supported)
@resume_router.post(
    "/url",
    summary="Create a resume from a URL.",
)
async def create_resume_url(input: dict[str, str] = Body(...)):
    resume_url = input.get("resume_url")
    if not resume_url:
        raise HTTPException(status_code=400, detail="Missing resume_url.")
    # You must implement URL fetching in ResumeService.process_resume if not already supported
    service = ResumeService()
    try:
        await service.process_resume(resume_url.encode(), "text/url", resume_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Resume uploaded and processed successfully."}


# Fetch endpoint for resumes
@resume_router.get(
    "",
    summary="Fetch all resumes.",
)
async def fetch_resumes(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    service = ResumeService()
    resumes = await service.fetch_resumes(limit=limit, offset=offset)
    return {"resumes": resumes}


# Fetch single resume by resume_id


@resume_router.get(
    "/{resume_id}",
    summary="Fetch a single resume by resume_id.",
)
async def fetch_resume(resume_id: str):
    service = ResumeService()
    resume = await service.fetch_resume(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"resume": resume}


# DELETE /resume/{resume_id}
@resume_router.delete(
    "/{resume_id}",
    summary="Delete a resume by resume_id.",
    status_code=204,
)
async def delete_resume(resume_id: str):
    service = ResumeService()
    try:
        await service.delete_resume(resume_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    return
