import os

from fastapi import UploadFile
import json
import uuid
from typing import Optional
from models.job import Job, ProcessedJob
from db import AsyncSessionLocal
from prompt.job import PROMPT
import httpx
from services.utils import (
    extract_pdf_text_util,
    extract_docx_text_util,
    load_schema,
    call_llm_stub,
)


class JobService:
    async def fetch_job(self, job_id: str):
        from models.job import ProcessedJob

        async with AsyncSessionLocal() as session:
            from sqlmodel import select

            statement = select(ProcessedJob).where(ProcessedJob.job_id == job_id)
            result = await session.execute(statement)
            job = result.scalar_one_or_none()
            if job:
                return job.model_dump()
            return None

    async def fetch_jobs(self, limit: int = 20, offset: int = 0):
        from models.job import ProcessedJob

        async with AsyncSessionLocal() as session:
            from sqlmodel import select

            statement = select(ProcessedJob).limit(limit).offset(offset)
            result = await session.execute(statement)
            jobs = result.scalars().all()
            return [job.model_dump() for job in jobs]

    async def process_job_input(
        self,
        job_text: Optional[str] = None,
        job_url: Optional[str] = None,
        job_file: Optional["UploadFile"] = None,
    ) -> None:
        # Persist original input
        job_id = self._generate_job_id()
        async with AsyncSessionLocal() as session:
            file_bytes = None
            if job_text:
                content_type = "text/plain"
            elif job_url:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(job_url)
                    resp.raise_for_status()
                content_type = "text/html"
            elif job_file:
                file_bytes = await job_file.read()
                content_type = getattr(
                    job_file, "content_type", "application/octet-stream"
                )
            else:
                raise ValueError("No valid input provided.")

            job = Job(job_id=job_id, content={}, resume_id="")
            session.add(job)
            await session.commit()
            await session.refresh(job)

            # 2. Extract text if binary
            if job_file and file_bytes and content_type == "application/pdf":
                text = extract_pdf_text_util(file_bytes)
            elif (
                job_file
                and file_bytes
                and content_type
                == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ):
                text = extract_docx_text_util(file_bytes)
            else:
                text = job.content

            # 3. Prepare prompt and send to LLM
            schema_path = os.path.join(
                os.path.dirname(__file__), "../schemas/json/job.schema.json"
            )
            schema = load_schema(schema_path)
            prompt = PROMPT.format(schema, text)
            processed_json = call_llm_stub(prompt)

            # Strip code block fencing if present
            import re

            def strip_code_fence(text: str) -> str:
                match = re.match(r"^```[a-zA-Z]*\n([\s\S]*?)```$", text.strip())
                if match:
                    return match.group(1).strip()
                if text.strip().startswith("```") and text.strip().endswith("```"):
                    return text.strip().strip("`").strip()
                return text.strip()

            processed_json_stripped = strip_code_fence(processed_json)

            # 4. Persist processed JSON
            processed_job = ProcessedJob(
                job_id=job.job_id, **json.loads(processed_json_stripped)
            )
            session.add(processed_job)
            await session.commit()

    def _generate_job_id(self) -> str:
        return str(uuid.uuid4())
