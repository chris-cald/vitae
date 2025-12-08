from backend.models.resume import Resume, ProcessedResume

from backend.db import AsyncSessionLocal
from backend.prompt.resume import PROMPT
import json
from backend.services.utils import (
    extract_pdf_text_util,
    extract_docx_text_util,
    load_schema,
    call_llm_stub,
)


class ResumeService:
    async def process_resume(
        self, file_bytes: bytes, content_type: str, filename: str
    ) -> None:
        # 1. Persist original resume
        resume_id = self._generate_resume_id(filename)
        async with AsyncSessionLocal() as session:
            resume = Resume(
                resume_id=resume_id,
                content=file_bytes.decode(errors="ignore")
                if content_type == "text/plain"
                else "",
                content_type=content_type,
            )
            session.add(resume)
            await session.commit()
            await session.refresh(resume)

            # 2. Extract text if binary
            if content_type == "application/pdf":
                text = extract_pdf_text_util(file_bytes)
            elif (
                content_type
                == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ):
                text = extract_docx_text_util(file_bytes)
            else:
                text = resume.content

            # 3. Prepare prompt and send to LLM
            schema_path = os.path.join(
                os.path.dirname(__file__), "../schemas/json/resume.schema.json"
            )
            schema = load_schema(schema_path)
            prompt = PROMPT.format(schema, text)
            processed_json = call_llm_stub(prompt)

            # 4. Persist processed JSON
            processed_resume = ProcessedResume(
                resume_id=resume.resume_id, **json.loads(processed_json)
            )
            session.add(processed_resume)
            await session.commit()

    def _generate_resume_id(self, filename: str) -> str:
        import uuid

        return f"{uuid.uuid4()}_{filename}"
