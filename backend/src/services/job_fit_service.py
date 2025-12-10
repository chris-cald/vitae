import os
import uuid

from sqlalchemy import text
from models.job_fit import JobFit, FeedbackItem
from db.db import AsyncSessionLocal
from services.utils import call_llm_stub, load_schema, strip_code_fence
from models.resume import Resume
from models.job import Job
from prompt.job_fit import PROMPT


class JobFitService:
    async def fetch_skill(self, job_fit_id: str) -> list[dict[str, str]]:
        async with AsyncSessionLocal() as session:
            from services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            skill = getattr(job_fit, "skill", [])
            return skill

    async def analyze_fit(self, resume_id: str, job_id: str) -> JobFit:
        async with AsyncSessionLocal() as session:
            from services.utils import get_or_404

            await get_or_404(session, Resume, "resume_id", resume_id)
            await get_or_404(session, Job, "job_id", job_id)
            job_fit_id = self._generate_job_fit_id()

            schema_path = os.path.join(
                os.path.dirname(__file__),
                "../../schemas/json/job-fit-analysis.schema.json",
            )
            # Prepare prompt and send to LLM
            schema = load_schema(schema_path)
            prompt = PROMPT.format(schema, text)
            # Call LLM and parse result (extend as needed)
            processed_json = call_llm_stub(prompt)
            processed_json_stripped = strip_code_fence(processed_json)

            # Persist JobFit analysis
            import json

            parsed_json = json.loads(processed_json_stripped)
            job_fit = JobFit(id=job_fit_id, **parsed_json)
            session.add(job_fit)
            await session.commit()
            await session.refresh(job_fit)
            return job_fit

    async def fetch_job_fit(self, job_fit_id: str) -> JobFit:
        async with AsyncSessionLocal() as session:
            from services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            return job_fit

    async def fetch_feedback(self, job_fit_id: str) -> list[FeedbackItem]:
        async with AsyncSessionLocal() as session:
            from services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            feedback = getattr(job_fit, "feedback", [])
            return feedback

    def _generate_job_fit_id(self) -> str:
        return str(uuid.uuid4())
