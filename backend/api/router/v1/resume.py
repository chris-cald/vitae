# Minimal API route for resume upload
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Request
from backend.services import ResumeService

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
