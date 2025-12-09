import os
from models.resume import Resume, ProcessedResume

from db import AsyncSessionLocal
from prompt.resume import PROMPT
import json
from services.utils import (
    extract_pdf_text_util,
    extract_docx_text_util,
    load_schema,
    call_llm_stub,
)


class ResumeService:
    async def fetch_resume(self, resume_id: str):
        from models.resume import ProcessedResume
        from sqlmodel import select

        async with AsyncSessionLocal() as session:
            statement = select(ProcessedResume).where(
                ProcessedResume.resume_id == resume_id
            )
            result = await session.execute(statement)
            resume = result.scalar_one_or_none()
            if resume:
                return resume.model_dump()
            return None

    async def fetch_resumes(self, limit: int = 20, offset: int = 0):
        from models.resume import ProcessedResume
        from sqlmodel import select

        async with AsyncSessionLocal() as session:
            statement = select(ProcessedResume).limit(limit).offset(offset)
            result = await session.execute(statement)
            resumes = result.scalars().all()
            return [resume.model_dump() for resume in resumes]

    async def process_resume(
        self, file_bytes: bytes, content_type: str, filename: str
    ) -> None:
        # 1. Persist original resume
        resume_id = self._generate_resume_id(filename)
        async with AsyncSessionLocal() as session:
            # 1. Save uploaded file to disk and extract text
            upload_dir = os.getenv(
                "UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "../uploads")
            )
            os.makedirs(upload_dir, exist_ok=True)
            file_ext = {
                "application/pdf": ".pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
                "text/markdown": ".md",
                "text/plain": ".txt",
            }.get(content_type, "")
            file_name = f"{resume_id}{file_ext}"
            file_path = os.path.join(upload_dir, file_name)
            with open(file_path, "wb") as f:
                f.write(file_bytes)

            if content_type == "application/pdf":
                extracted_content = extract_pdf_text_util(file_bytes)
            elif (
                content_type
                == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ):
                extracted_content = extract_docx_text_util(file_bytes)
            elif content_type in ("text/markdown", "text/plain"):
                extracted_content = file_bytes.decode(errors="ignore")
            else:
                extracted_content = file_bytes.decode(errors="ignore")

            resume = Resume(
                resume_id=resume_id,
                file_path=file_path,
                extracted_content=extracted_content,
                content_type=content_type,
            )
            session.add(resume)
            await session.commit()
            await session.refresh(resume)

            # 3. Prepare prompt and send to LLM
            schema_path = os.path.join(
                os.path.dirname(__file__), "../schemas/json/resume.schema.json"
            )
            schema = load_schema(schema_path)
            prompt = PROMPT.format(schema, extracted_content)
            processed_json = call_llm_stub(prompt)

            # 4. Persist processed JSON only if valid
            try:
                parsed_json = json.loads(processed_json)
            except Exception:
                parsed_json = None
            if not parsed_json or parsed_json == {}:
                raise Exception(
                    "LLM call failed or returned invalid JSON. Resume not processed."
                )
            processed_resume = ProcessedResume(
                resume_id=resume.resume_id, **parsed_json
            )
            session.add(processed_resume)
            await session.commit()

    def _generate_resume_id(self, filename: str) -> str:
        import uuid

        return f"{uuid.uuid4()}_{filename}"
