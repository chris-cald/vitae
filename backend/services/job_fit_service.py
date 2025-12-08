import json
import uuid
from models.job_fit import JobFit, ScoreResult, FeedbackItem
from db import AsyncSessionLocal
from services.utils import call_llm_stub
from models.resume import Resume
from models.job import Job


class JobFitService:
    async def analyze_fit(self, resume_id: str, job_id: str) -> JobFit:
        from sqlmodel import select

        async with AsyncSessionLocal() as session:
            resume_result = await session.execute(
                select(Resume).where(Resume.resume_id == resume_id)
            )
            resume = resume_result.scalars().one_or_none()
            if resume is None:
                raise ValueError(f"Resume with id {resume_id} not found.")
            job_result = await session.execute(select(Job).where(Job.job_id == job_id))
            job = job_result.scalars().one_or_none()
            if job is None:
                raise ValueError(f"Job with id {job_id} not found.")
            job_fit_id = self._generate_job_fit_id()

            # Prepare prompt and send to LLM
            prompt = f"""Analyze the fit between the following resume and job. Return a JSON document adhering to job-fit-analysis.schema.json.\nResume: {json.dumps(resume.content)}\nJob: {json.dumps(job.content)}"""
            # Call LLM and parse result (extend as needed)
            call_llm_stub(prompt)

            # Persist JobFit analysis
            job_fit = JobFit(
                id=job_fit_id,
                resume_id=resume_id,
                job_id=job_id,
                links=[
                    {"rel": "self", "href": f"/api/v1/job-fit/{job_fit_id}"},
                    {"rel": "score", "href": f"/api/v1/job-fit/{job_fit_id}/score"},
                    {
                        "rel": "feedback",
                        "href": f"/api/v1/job-fit/{job_fit_id}/feedback",
                    },
                    {"rel": "resume", "href": f"/api/v1/resume/{resume_id}"},
                    {"rel": "job", "href": f"/api/v1/job/{job_id}"},
                ],
            )
            session.add(job_fit)
            await session.commit()
            await session.refresh(job_fit)
            return job_fit

    async def fetch_job_fit(self, job_fit_id: str) -> JobFit:
        from sqlmodel import select

        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(JobFit).where(JobFit.id == job_fit_id)
            )
            job_fit = result.scalars().one_or_none()
            if job_fit is None:
                raise ValueError(f"JobFit with id {job_fit_id} not found.")
            return job_fit

    async def fetch_score(self, job_fit_id: str) -> ScoreResult:
        from sqlmodel import select

        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(JobFit).where(JobFit.id == job_fit_id)
            )
            job_fit = result.scalars().one_or_none()
            if job_fit is None:
                raise ValueError(f"JobFit with id {job_fit_id} not found.")
            score = getattr(job_fit, "score", 0)
            return ScoreResult(
                score=score,
                links=[
                    {"rel": "self", "href": f"/api/v1/job-fit/{job_fit_id}/score"},
                    {
                        "rel": "improvements",
                        "href": f"/api/v1/job-fit/{job_fit_id}/improvements",
                    },
                ],
            )

    async def fetch_feedback(self, job_fit_id: str) -> list[FeedbackItem]:
        from sqlmodel import select

        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(JobFit).where(JobFit.id == job_fit_id)
            )
            job_fit = result.scalars().one_or_none()
            if job_fit is None:
                raise ValueError(f"JobFit with id {job_fit_id} not found.")
            feedback = getattr(job_fit, "feedback", [])
            return feedback

    def _generate_job_fit_id(self) -> str:
        return str(uuid.uuid4())
