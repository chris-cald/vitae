import os
from typing import Any, Optional
from src.models.resume import RawResume, Resume

from db.db import AsyncSessionLocal
from src.prompt.resume import PROMPT
import json
from src.services.utils import (
    extract_pdf_text_util,
    extract_docx_text_util,
    load_schema,
    call_llm_stub,
    strip_code_fence,
)


class ResumeService:
    async def delete_resume(self, resume_id: str):
        from src.models.resume import Resume

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            resume = await get_or_404(session, Resume, "resume_id", resume_id)
            await session.delete(resume)
            await session.commit()

    async def update_resume_name(self, resume_id: str, name: str):
        from src.models.resume import Resume

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            resume = await get_or_404(session, Resume, "resume_id", resume_id)
            resume.name = name
            session.add(resume)
            await session.commit()

    async def fetch_resume(self, resume_id: str):
        from src.models.resume import Resume

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            resume = await get_or_404(session, Resume, "resume_id", resume_id)
            data = resume.model_dump()

            if data.get("profile_categories") is None:
                from src.services.profile_category_detection import (
                    detect_profile_categories,
                )

                text = ""
                if data.get("basics"):
                    text += str(data["basics"])
                if data.get("work"):
                    text += str(data["work"])
                if data.get("education"):
                    text += str(data["education"])
                categories = detect_profile_categories({"description": text})
                data["profile_categories"] = categories
                resume.profile_categories = categories
                session.add(resume)
                await session.commit()
            return data

    async def fetch_resumes(self, limit: int = 20, offset: int = 0):
        from src.models.resume import Resume
        from sqlmodel import select

        async with AsyncSessionLocal() as session:
            statement = select(Resume).limit(limit).offset(offset)
            result = await session.execute(statement)
            resumes = result.scalars().all()
            return [resume.model_dump() for resume in resumes]

    async def process_resume(
        self,
        file_bytes: bytes,
        content_type: str,
        filename: str,
        name: Optional[str] = None,
    ) -> str:
        import logging

        logger = logging.getLogger(__name__)

        resume_id = self._generate_resume_id(filename)
        file_path = self._save_file(file_bytes, content_type, resume_id)
        logger.info("Saved resume upload for resume_id=%s", resume_id)
        extracted_content = self._extract_content(file_bytes, content_type)
        logger.debug(
            "Extracted resume content for resume_id=%s, content_length=%s",
            resume_id,
            len(extracted_content),
        )

        resume_persisted = False
        try:
            logger.info(f"Inserting raw resume record for resume_id={resume_id}")
            await self._insert_resume_record(
                resume_id, file_path, extracted_content, content_type
            )
            resume_persisted = True
            logger.info(f"Raw resume record inserted for resume_id={resume_id}")
        except Exception as e:
            logger.error("Failed to insert raw resume record for resume_id=%s", resume_id)
            self._delete_file_if_exists(file_path)
            raise

        try:
            logger.info(f"Calling LLM for resume_id={resume_id}")
            used_local_fallback = False
            try:
                processed_json = self._call_llm_and_strip(extracted_content)
                logger.debug(
                    "LLM response received for resume_id=%s, response_length=%s",
                    resume_id,
                    len(processed_json),
                )
                parsed_json = json.loads(processed_json)
            except Exception:
                if os.getenv("VITAE_LOCAL_PARSE_FALLBACK") != "1":
                    raise
                logger.warning("Using local resume parse fallback for resume_id=%s", resume_id)
                parsed_json = self._local_resume_fallback(name or filename)
                used_local_fallback = True
            logger.debug(
                "Parsed resume JSON for resume_id=%s with top_level_keys=%s",
                resume_id,
                sorted(parsed_json.keys()),
            )
            if not parsed_json or parsed_json == {}:
                logger.error(
                    f"LLM call failed or returned invalid JSON for resume_id={resume_id}"
                )
                raise Exception(
                    "LLM call failed or returned invalid JSON. Resume not processed."
                )
            # Determine name: user-provided, basics.name, or fallback to filename
            resume_name = name
            if not resume_name:
                resume_name = parsed_json.get("basics", {}).get("name")
            if not resume_name:
                resume_name = filename or resume_id

            # Store processed resume immediately after LLM parsing (without categories)
            logger.info(
                "Inserting processed resume for resume_id=%s", resume_id
            )
            await self._insert_processed_resume(resume_id, parsed_json, resume_name)
            logger.info(
                f"Processed resume (LLM only) inserted for resume_id={resume_id}"
            )

            # Now try to detect categories and update the processed resume
            if not used_local_fallback:
                try:
                    from src.services.profile_category_detection import (
                        detect_profile_categories,
                    )

                    text = ""
                    if parsed_json.get("basics"):
                        text += str(parsed_json["basics"])
                    if parsed_json.get("work"):
                        text += str(parsed_json["work"])
                    if parsed_json.get("education"):
                        text += str(parsed_json["education"])
                    profile_categories = detect_profile_categories({"description": text})
                    parsed_json["profile_categories"] = profile_categories
                    logger.info(
                        f"Updating processed resume with categories for resume_id={resume_id}"
                    )
                    await self._insert_processed_resume(resume_id, parsed_json, resume_name)
                    logger.info(
                        f"Processed resume updated with categories for resume_id={resume_id}"
                    )
                except Exception:
                    if os.getenv("VITAE_LOCAL_PARSE_FALLBACK") == "1":
                        logger.warning("Skipping local resume category detection for resume_id=%s", resume_id)
                    else:
                        logger.error(
                            "Category detection failed for resume_id=%s", resume_id
                        )
                        # Do not delete file or processed resume; allow for recovery
                        raise
            return resume_id
        except Exception as e:
            logger.error("Failed to process resume_id=%s", resume_id)
            if not resume_persisted:
                self._delete_file_if_exists(file_path)
            raise

    def _save_file(self, file_bytes: bytes, content_type: str, resume_id: str) -> str:
        upload_dir = os.getenv(
            "UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "../uploads")
        )
        os.makedirs(upload_dir, exist_ok=True)
        file_name = resume_id
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
            resume = RawResume(
                resume_id=resume_id,
                file_path=file_path,
                extracted_content=extracted_content,
                content_type=content_type,
            )
            session.add(resume)
            await session.commit()
            await session.refresh(resume)

    def _local_resume_fallback(self, name: str) -> dict[str, Any]:
        # ponytail: local/demo fallback only; remove when local model provider is mandatory.
        return {
            "basics": {"name": name},
            "work": [{"summary": "Local parse fallback used."}],
            "profile_categories": {"special_requirements": []},
        }

    def _call_llm_and_strip(self, extracted_content: str) -> str:
        schema_path = os.path.join(
            os.path.dirname(__file__), "../../schemas/json/resume.schema.json"
        )
        schema = load_schema(schema_path)
        prompt = PROMPT.format(schema, extracted_content)
        processed_json = call_llm_stub(prompt)

        return strip_code_fence(processed_json)

    async def _insert_processed_resume(
        self, resume_id: str, parsed_json: dict[str, Any], name: str
    ) -> None:
        async with AsyncSessionLocal() as session:
            processed_resume = Resume(resume_id=resume_id, name=name, **parsed_json)
            session.add(processed_resume)
            await session.commit()

    def _delete_file_if_exists(self, file_path: str) -> None:
        if os.path.exists(file_path):
            os.remove(file_path)

    def _generate_resume_id(self, filename: str) -> str:
        import uuid

        return f"{uuid.uuid4()}_{filename}"
