import os
import uuid
from typing import Optional
from sqlalchemy import text
from src.category_config import CATEGORY_CONFIG, SelectedCategories
from src.models.job_fit import JobFit, FeedbackItem
from db.db import AsyncSessionLocal
from src.services.utils import call_llm_stub, load_schema, strip_code_fence
from src.models.resume import Resume
from src.models.job import Job
from src.prompt.job_fit import PROMPT


class JobFitService:
    async def delete_job_fit(self, job_fit_id: str):
        from src.models.job_fit import JobFit

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            await session.delete(job_fit)
            await session.commit()

    async def update_job_fit_name(self, job_fit_id: str, name: str):
        from src.models.job_fit import JobFit

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            job_fit.name = name
            session.add(job_fit)
            await session.commit()

    async def list_job_fits(self, limit: int = 10, offset: int = 0) -> list[JobFit]:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                text("SELECT * FROM jobfit LIMIT :limit OFFSET :offset").bindparams(
                    limit=limit, offset=offset
                )
            )
            rows = result.fetchall()
            job_fits = [JobFit(**dict(row._mapping)) for row in rows]  # pyright: ignore[reportPrivateUsage] # this is the approach recommended in SQLAlchemy docs
            return job_fits

    async def fetch_skill(self, job_fit_id: str) -> list[dict[str, str]]:
        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            skill = getattr(job_fit, "skill", [])
            return skill

    async def analyze_fit(
        self,
        resume_id: str,
        job_id: str,
        name: Optional[str] = None,
        profile_categories: Optional[SelectedCategories] = None,
    ) -> JobFit:
        def assemble_prompt_fragments(
            selected_categories: SelectedCategories,
        ) -> str:
            """Compose a prompt string from selected profile categories using modular fragments, using fallbacks if needed."""
            fragments = [str()]
            for category, value in selected_categories.items():
                if not value:
                    continue
                cat_conf = CATEGORY_CONFIG.get(category, {})
                value_map = {
                    v["value"]: v["fragment"] for v in cat_conf.get("values", [])
                }
                fallback = value_map.get("__default__")
                if isinstance(value, list):
                    found = False
                    for v in value:
                        frag = value_map.get(v)
                        if frag:
                            fragments.append(frag)
                            found = True
                    if not found and fallback:
                        fragments.append(fallback)
                else:
                    frag = value_map.get(value)
                    if frag:
                        fragments.append(frag)
                    elif fallback:
                        fragments.append(fallback)
            return "\n".join(fragments)

        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            resume = await get_or_404(session, Resume, "resume_id", resume_id)
            job = await get_or_404(session, Job, "job_id", job_id)
            job_fit_id = self._generate_job_fit_id()

            # Use provided or job-stored profile_categories
            categories = (
                profile_categories or getattr(job, "profile_categories", None) or {}
            )
            prompt_context = assemble_prompt_fragments(categories)

            schema_path = os.path.join(
                os.path.dirname(__file__),
                "../../schemas/json/job-fit-analysis.schema.json",
            )
            # Prepare prompt and send to LLM
            schema = load_schema(schema_path)
            prompt = PROMPT.format(schema, resume, job)
            if prompt_context:
                prompt = f"{prompt_context}\n\n" + prompt
            processed_json = call_llm_stub(prompt)
            processed_json_stripped = strip_code_fence(processed_json)

            # Persist JobFit analysis
            import json

            parsed_json = json.loads(processed_json_stripped)
            # Remove 'id' from parsed_json if present, use backend-generated job_fit_id
            parsed_json.pop("id", None)

            # Normalize score to 0-1 if present and >1 (assume LLM returned 0-100 scale)
            if "score" in parsed_json:
                try:
                    score_val = float(parsed_json["score"])
                    if score_val > 1:
                        parsed_json["score"] = score_val / 100.0
                except Exception:
                    pass

            # Normalize each skill score to 0-1 if present and >1
            if "skills" in parsed_json and isinstance(parsed_json["skills"], list):
                for skill in parsed_json["skills"]:
                    if isinstance(skill, dict) and "score" in skill:
                        try:
                            from typing import cast

                            score_val_raw = cast(float | int | str, skill["score"])
                            score_val: float = float(score_val_raw)
                            if score_val > 1:
                                skill["score"] = score_val / 100.0
                        except Exception:
                            pass

            # Determine name: user-provided, or resume name + job name, or fallback
            job_fit_name = name
            if not job_fit_name:
                resume_name = getattr(resume, "name", None)
                job_name = getattr(job, "name", None)
                if resume_name and job_name:
                    job_fit_name = f"{resume_name} + {job_name}"
                elif resume_name:
                    job_fit_name = resume_name
                elif job_name:
                    job_fit_name = job_name
                else:
                    job_fit_name = job_fit_id
            job_fit = JobFit(id=job_fit_id, name=job_fit_name, **parsed_json)
            session.add(job_fit)
            await session.commit()
            await session.refresh(job_fit)
            return job_fit

    async def fetch_job_fit(self, job_fit_id: str) -> JobFit:
        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            return job_fit

    async def fetch_feedback(self, job_fit_id: str) -> list[FeedbackItem]:
        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            feedback = getattr(job_fit, "feedback", [])
            from src.models.job_fit import FeedbackItem

            from typing import Any

            feedback_items: list[FeedbackItem] = []
            for item in feedback:
                if isinstance(item, dict):
                    item_typed: dict[str, Any] = item  # type: ignore
                    job_fit_id_val: str = str(job_fit_id)
                    intent_val = item_typed.get("intent")
                    if intent_val is None:
                        # Provide a default FeedbackIntent if possible, else fallback to string
                        try:
                            from src.models.job_fit import FeedbackIntent

                            intent_val = list(FeedbackIntent)[0]
                        except Exception:
                            FeedbackIntent = None
                            try:
                                from src.models.job_fit import FeedbackIntent

                                intent_val = list(FeedbackIntent)[0].value
                            except Exception:
                                intent_val = "preserve"
                    message_val: str = str(item_typed.get("message", ""))
                    line_number_val: str = str(item_typed.get("lineNumber", ""))
                    weight_val: float = 0.0
                    try:
                        weight_raw: Any = item_typed.get("weight", 0.0)
                        weight_val = float(weight_raw)
                    except Exception:
                        weight_val = 0.0
                    try:
                        if intent_val is not None:
                            from src.models.job_fit import FeedbackIntent

                            if not isinstance(intent_val, FeedbackIntent):
                                try:
                                    intent_val = FeedbackIntent(intent_val)
                                except Exception:
                                    intent_val = list(FeedbackIntent)[0]
                            feedback_items.append(
                                FeedbackItem(
                                    job_fit_id=job_fit_id_val,
                                    intent=intent_val,
                                    message=message_val,
                                    lineNumber=line_number_val,
                                    weight=weight_val,
                                )
                            )
                    except Exception:
                        pass
                elif isinstance(item, FeedbackItem):
                    feedback_items.append(item)
            return feedback_items

    def _generate_job_fit_id(self) -> str:
        return str(uuid.uuid4())
