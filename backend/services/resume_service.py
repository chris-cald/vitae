import os
from typing import Any
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
        resume_id = self._generate_resume_id(filename)
        file_path = self._save_file(file_bytes, content_type, resume_id)
        extracted_content = self._extract_content(file_bytes, content_type)

        resume_persisted = False
        try:
            await self._insert_resume_record(
                resume_id, file_path, extracted_content, content_type
            )
            resume_persisted = True
        except Exception:
            self._delete_file_if_exists(file_path)
            raise

        try:
            processed_json = self._call_llm_and_strip(extracted_content)
            parsed_json = json.loads(processed_json)
            if not parsed_json or parsed_json == {}:
                raise Exception(
                    "LLM call failed or returned invalid JSON. Resume not processed."
                )
            await self._insert_processed_resume(resume_id, parsed_json)
        except Exception:
            if not resume_persisted:
                self._delete_file_if_exists(file_path)
            raise

    def _save_file(self, file_bytes: bytes, content_type: str, resume_id: str) -> str:
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
        return file_path

    def _extract_content(self, file_bytes: bytes, content_type: str) -> str:
        if content_type == "application/pdf":
            return extract_pdf_text_util(file_bytes)
        elif (
            content_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):
            return extract_docx_text_util(file_bytes)
        elif content_type in ("text/markdown", "text/plain"):
            return file_bytes.decode(errors="ignore")
        else:
            return file_bytes.decode(errors="ignore")

    async def _insert_resume_record(
        self, resume_id: str, file_path: str, extracted_content: str, content_type: str
    ) -> None:
        async with AsyncSessionLocal() as session:
            resume = Resume(
                resume_id=resume_id,
                file_path=file_path,
                extracted_content=extracted_content,
                content_type=content_type,
            )
            session.add(resume)
            await session.commit()
            await session.refresh(resume)

    def _call_llm_and_strip(self, extracted_content: str) -> str:
        import re

        schema_path = os.path.join(
            os.path.dirname(__file__), "../schemas/json/resume.schema.json"
        )
        schema = load_schema(schema_path)
        prompt = PROMPT.format(schema, extracted_content)
        processed_json = call_llm_stub(prompt)

        def strip_code_fence(text: str) -> str:
            match = re.match(r"^```[a-zA-Z]*\n([\s\S]*?)```$", text.strip())
            if match:
                return match.group(1).strip()
            if text.strip().startswith("```") and text.strip().endswith("```"):
                return text.strip().strip("`").strip()
            return text.strip()

        return strip_code_fence(processed_json)

    async def _insert_processed_resume(
        self, resume_id: str, parsed_json: dict[str, Any]
    ) -> None:
        async with AsyncSessionLocal() as session:
            processed_resume = ProcessedResume(resume_id=resume_id, **parsed_json)
            session.add(processed_resume)
            await session.commit()

    def _delete_file_if_exists(self, file_path: str) -> None:
        if os.path.exists(file_path):
            os.remove(file_path)

    def _generate_resume_id(self, filename: str) -> str:
        import uuid

        return f"{uuid.uuid4()}_{filename}"
