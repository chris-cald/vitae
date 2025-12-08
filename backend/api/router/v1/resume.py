# Minimal API route for resume upload
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Request, Query
from services import ResumeService

resume_router = APIRouter()


@resume_router.post(
    "",
    summary="Create a resume in PDF or DOCX format and store it into DB in HTML/Markdown format",
)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
):
    allowed_content_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF and DOCX files are allowed.",
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
    await service.process_resume(file_bytes, file.content_type, filename)
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
