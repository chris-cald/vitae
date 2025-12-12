import os
import json
import uuid
from typing import Optional
from fastapi import UploadFile
from src.models.job import RawJob, Job
from db.db import AsyncSessionLocal
from src.prompt.job import PROMPT
import httpx
from src.services.utils import (
    extract_pdf_text_util,
    extract_docx_text_util,
    load_schema,
    call_llm_stub,
    strip_code_fence,
)

# Use a module-specific logger
import logging

logger = logging.getLogger(__name__)


class JobService:
    async def delete_job(self, job_id: str):
        from src.models.job import Job

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job = await get_or_404(session, Job, "job_id", job_id)
            await session.delete(job)
            await session.commit()

    async def update_job_name(self, job_id: str, name: str):
        from src.models.job import Job

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job = await get_or_404(session, Job, "job_id", job_id)
            job.name = name
            session.add(job)
            await session.commit()

    async def fetch_job(self, job_id: str):
        from src.models.job import Job

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job = await get_or_404(session, Job, "job_id", job_id)
            return job.model_dump()

    async def fetch_jobs(self, limit: int = 20, offset: int = 0):
        from src.models.job import Job

        async with AsyncSessionLocal() as session:
            from sqlmodel import select

            statement = select(Job).limit(limit).offset(offset)
            result = await session.execute(statement)
            jobs = result.scalars().all()
            return [job.model_dump() for job in jobs]

    async def process_job_input(
        self,
        job_text: Optional[str] = None,
        job_url: Optional[str] = None,
        job_file: Optional["UploadFile"] = None,
        name: Optional[str] = None,
    ) -> None:
        job_id = self._generate_job_id()
        upload_dir = os.getenv(
            "UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "../uploads")
        )
        os.makedirs(upload_dir, exist_ok=True)
        file_path = None
        file_bytes = None
        content_type = None
        filename = None
        try:
            logger.debug(
                f"Job input: job_text={bool(job_text)}, job_url={job_url}, job_file={job_file}"
            )
            if job_text:
                file_bytes = job_text.encode()
                content_type = "text/plain"
                filename = f"{job_id}.txt"
            elif job_url:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(job_url)
                    resp.raise_for_status()
                    file_bytes = resp.content
                content_type = resp.headers.get("content-type", "text/plain")
                ext = ".txt"
                if "pdf" in content_type:
                    ext = ".pdf"
                elif "msword" in content_type or "docx" in content_type:
                    ext = ".docx"
                elif "markdown" in content_type:
                    ext = ".md"
                filename = f"{job_id}{ext}"
            elif job_file:
                await job_file.seek(0)
                file_bytes = await job_file.read()
                content_type = getattr(
                    job_file, "content_type", "application/octet-stream"
                )
                filename = f"{job_id}_{getattr(job_file, 'filename', 'upload')}"
            else:
                raise ValueError("No valid input provided.")

            file_path = os.path.join(upload_dir, filename)
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            abs_path = os.path.abspath(file_path)
            file_exists = os.path.exists(file_path)
            logger.debug(
                f"Saved file to {file_path} (abs: {abs_path}), exists: {file_exists}, size={len(file_bytes)} bytes, content_type={content_type}"
            )

            # Insert RawJob with file_path
            async with AsyncSessionLocal() as session:
                job = RawJob(
                    job_id=job_id, content={}, resume_id="", file_path=file_path
                )
                session.add(job)
                await session.commit()
                await session.refresh(job)
            logger.debug(f"RawJob DB record created for job_id={job_id}")

            # Extract text
            if content_type == "application/pdf":
                text = extract_pdf_text_util(file_bytes)
            elif (
                content_type
                == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ):
                text = extract_docx_text_util(file_bytes)
            elif content_type in ("text/markdown", "text/plain"):
                text = file_bytes.decode(errors="ignore")
            else:
                text = file_bytes.decode(errors="ignore")
            logger.debug(f"Extracted text length: {len(text) if text else 0}")

            if not text or not text.strip():
                logging.error(
                    f"No text extracted from file {file_path}. Aborting LLM call."
                )
                raise ValueError(f"No text extracted from file {file_path}.")

            # Prepare prompt and send to LLM
            schema_path = os.path.join(
                os.path.dirname(__file__), "../../schemas/json/job.schema.json"
            )
            schema = load_schema(schema_path)
            if not schema or not schema.strip():
                logging.error(
                    f"Job schema at {schema_path} is missing or empty. Aborting LLM call."
                )
                raise ValueError(f"Job schema at {schema_path} is missing or empty.")
            prompt = PROMPT.format(schema, text)
            processed_json = call_llm_stub(prompt)
            processed_json_stripped = strip_code_fence(processed_json)
            if not processed_json_stripped or processed_json_stripped.strip() == "{}":
                logging.error(f"LLM returned empty or invalid JSON for job_id={job_id}")
                raise ValueError(
                    f"LLM returned empty or invalid JSON for job_id={job_id}"
                )
            job_data = json.loads(processed_json_stripped)

            # Normalize job_data
            from src.models.job import Job as JobModel
            from src.services.profile_category_detection import (
                detect_profile_categories,
            )

            job_fields = set(JobModel.__fields__.keys())
            normalized = {k: v for k, v in job_data.items() if k in job_fields}
            for field in job_fields:
                if field not in normalized:
                    normalized[field] = None

            # Auto-detect profile categories
            detected_categories = detect_profile_categories(job_data)
            normalized["profile_categories"] = detected_categories

            job_name = name
            if not job_name:
                title = normalized.get("title")
                company = normalized.get("company")
                if title and company:
                    job_name = f"{title} @ {company}"
                elif title:
                    job_name = title
                else:
                    job_name = job_id
            # Remove 'name' and 'job_id' from normalized to avoid duplicate arguments
            normalized.pop("name", None)
            normalized.pop("job_id", None)
            async with AsyncSessionLocal() as session:
                processed_job = Job(job_id=job_id, name=job_name, **normalized)
                session.add(processed_job)
                await session.commit()
            logger.debug(f"Processed Job DB record created for job_id={job_id}")
        except Exception as exc:
            logger.error(f"Job processing failed: {exc}")
            # Only delete the uploaded file if the RawJob DB record was NOT created
            # (i.e., before 'RawJob DB record created for job_id=...' log)
            # If file_path exists and error occurred before DB commit, delete
            import inspect

            exc.__traceback__
            # If error occurred before or at the DB commit, file should be deleted
            # (simple heuristic: check if processed_job is in locals())
            if file_path and os.path.exists(file_path):
                # If processed_job is not in locals(), delete file
                frame = inspect.currentframe()
                outer = frame.f_back if frame else None
                if outer and "processed_job" not in outer.f_locals:
                    os.remove(file_path)
                    logger.debug(
                        f"Deleted file {file_path} due to error before DB commit."
                    )
            raise

    def _generate_job_id(self) -> str:
        return str(uuid.uuid4())
