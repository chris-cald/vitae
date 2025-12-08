import os

from fastapi import UploadFile
import json
import uuid
from typing import Optional
from backend.models.job import Job, ProcessedJob
from backend.db import AsyncSessionLocal
from backend.prompt.job import PROMPT
import httpx
from backend.services.utils import (
    extract_pdf_text_util,
    extract_docx_text_util,
    load_schema,
    call_llm_stub,
)


class JobService:
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
                original_content = job_text
                content_type = "text/plain"
            elif job_url:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(job_url)
                    resp.raise_for_status()
                    original_content = resp.text
                content_type = "text/html"
            elif job_file:
                file_bytes = await job_file.read()
                original_content = file_bytes.decode(errors="ignore")
                content_type = getattr(
                    job_file, "content_type", "application/octet-stream"
                )
            else:
                raise ValueError("No valid input provided.")

            job = Job(job_id=job_id, content=original_content, resume_id="")
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

            # 4. Persist processed JSON
            processed_job = ProcessedJob(
                job_id=job.job_id, **json.loads(processed_json)
            )
            session.add(processed_job)
            await session.commit()

    def _generate_job_id(self) -> str:
        return str(uuid.uuid4())
