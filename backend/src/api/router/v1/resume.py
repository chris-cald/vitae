# Minimal API route for resume upload
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Request, Query
from services import ResumeService

resume_router = APIRouter()


# 1. POST /resume/text
@resume_router.post(
    "/text",
    summary="Create a resume from raw text.",
)
async def create_resume_text(request: Request):
    resume_text = await request.body()
    if not resume_text:
        raise HTTPException(status_code=400, detail="Missing resume_text.")
    if isinstance(resume_text, bytes):
        resume_text = resume_text.decode()
    service = ResumeService()
    try:
        await service.process_resume(resume_text.encode(), "text/plain", "raw.txt")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Resume uploaded and processed successfully."}


# 2. POST /resume/file
@resume_router.post(
    "/file",
    summary="Create a resume from a file (PDF, DOCX, Markdown).",
)
async def create_resume_file(file: UploadFile = File(...)):
    allowed_content_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/markdown",
    ]
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF, DOCX, and Markdown files are allowed.",
        )
    MAX_FILE_SIZE = 2 * 1024 * 1024
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed size of 2.0MB.",
        )
    service = ResumeService()
    filename = file.filename if file.filename is not None else ""
    try:
        await service.process_resume(file_bytes, file.content_type, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Resume uploaded and processed successfully."}


# 3. POST /resume/url (if supported)
@resume_router.post(
    "/url",
    summary="Create a resume from a URL.",
)
async def create_resume_url(input: dict = Body(...)):
    resume_url = input.get("resume_url")
    if not resume_url:
        raise HTTPException(status_code=400, detail="Missing resume_url.")
    # You must implement URL fetching in ResumeService.process_resume if not already supported
    service = ResumeService()
    try:
        await service.process_resume(None, "text/url", resume_url)
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
