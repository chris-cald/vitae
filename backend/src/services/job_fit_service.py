import os
import uuid
from typing import Optional, Any
from sqlalchemy import text
from src.category_config import CATEGORY_CONFIG, SelectedCategories
from src.models.job_fit import JobFit, FeedbackItem
from db.db import AsyncSessionLocal
from src.services.utils import call_llm_stub, load_schema, strip_code_fence
from src.models.resume import Resume
from src.models.job import Job
from src.prompt.job_fit import PROMPT


class JobFitService:
    async def generate_targeted_feedback(
        self,
        mapping_id: str,
        name: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Stage 2: Use requirement mapping to generate targeted feedback, persist as JobFitAnalysis.
        """
        from src.models.job_fit import JobFit, JobRequirementMapping
        from src.services.utils import get_or_404
        import json
        import uuid

        async with AsyncSessionLocal() as session:
            mapping = await get_or_404(session, JobRequirementMapping, "id", mapping_id)
            resume_id = mapping.resume_id
            job_id = mapping.job_id
            # Load schema for JobFitAnalysis
            schema_path = os.path.join(
                os.path.dirname(__file__),
                "../../schemas/json/job-fit-analysis.schema.json",
            )
            schema = load_schema(schema_path)
            # Enhanced recruiter-grade prompt for feedback generation
            prompt = (
                "CRITICAL: Output only the raw JSON object. Do NOT use triple backticks, Markdown, code blocks, or any commentary. Only return the JSON.\n\n"
                "You are an expert resume writer and career coach specializing in the technology industry. "
                "Adapt your persona based on the job level in the mapping: "
                "- For executive roles, act as an Executive Recruiter for C-suite and senior leadership. "
                "- For people leader roles, act as a Technical Recruiting Manager for engineering leadership. "
                "- For senior IC roles, act as a Senior Technical Recruiter for high-impact ICs. "
                "Your feedback must reflect the standards, expectations, and evaluation criteria of the identified role.\n\n"
                "Instructions (follow stepwise):\n"
                "1. For each requirement in the mapping, provide as much actionable, specific, and insightful feedback as possible. Do not limit yourself to the minimum—surface all strengths, gaps, and opportunities for improvement, even if the match is strong. Multiple feedback points per requirement are encouraged and valued.\n"
                "2. For each feedback item, provide a clear rationale explaining why the feedback was given, referencing resume evidence and job requirement.\n"
                "3. Preserve authenticity: All feedback must be traceable to the original resume content. Do not fabricate or speculate.\n"
                "4. Maintain formatting: Feedback should be compatible with ATS systems and use clear, standard section headers and bullet points.\n"
                "5. Optimize for ATS: Ensure keyword alignment and formatting compatibility with Applicant Tracking Systems.\n"
                "6. Provide a comprehensive analysis and fit score (0-100), referencing the mapping.\n"
                "7. Extract and compare relevant keywords and skills.\n"
                "8. Summarize your decision process: For each requirement, briefly explain experience selection, wording changes, and any rationale for prioritization.\n"
                "9. Recommend additional improvements: Suggest formatting, content, or alignment opportunities, and identify any content gaps or red flags.\n"
                "10. If you cannot extract valid JSON, return {}.\n\n"
                f"Schema:\n{schema}\n\nRequirement Mapping:\n{json.dumps(mapping.requirements, ensure_ascii=False, indent=2)}\n"
            )
            llm_response = call_llm_stub(prompt)
            llm_json = strip_code_fence(llm_response)
            parsed = json.loads(llm_json)
            job_fit_id = str(uuid.uuid4())
            parsed["id"] = job_fit_id
            parsed["resume_id"] = resume_id
            parsed["job_id"] = job_id
            parsed["mapping_id"] = mapping_id
            parsed["feedback"] = self._feedback_items_with_job_fit_id(
                parsed.get("feedback", []), job_fit_id
            )

            # Optionally set name
            parsed["name"] = name or parsed.get("name") or job_fit_id

            job_fit = JobFit(**parsed)
            session.add(job_fit)
            await session.commit()
            await session.refresh(job_fit)
            return job_fit.model_dump()

    async def extract_requirement_mapping(
        self,
        resume_id: str,
        job_id: str,
        name: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Stage 1: Extract and map job requirements to resume evidence using LLM, persist as JobRequirementMapping.
        """
        from src.models.job_fit import JobRequirementMapping
        from src.services.utils import get_or_404
        import json
        import uuid

        async with AsyncSessionLocal() as session:
            resume = await get_or_404(session, Resume, "resume_id", resume_id)
            job = await get_or_404(session, Job, "job_id", job_id)
            schema_path = os.path.join(
                os.path.dirname(__file__),
                "../../schemas/json/job-requirement-mapping.schema.json",
            )
            schema = load_schema(schema_path)
            prompt = (
                "CRITICAL: Output only the raw JSON object. Do NOT use triple backticks, Markdown, code blocks, or any commentary. Only return the JSON.\n\n"
                "You are an expert resume writer and career coach specializing in the technology industry. "
                "Adapt your persona based on the job level in the job description: "
                "- For executive roles, act as an Executive Recruiter for C-suite and senior leadership. "
                "- For people leader roles, act as a Technical Recruiting Manager for engineering leadership. "
                "- For senior IC roles, act as a Senior Technical Recruiter for high-impact ICs. "
                "Your requirement mapping must reflect the standards, expectations, and evaluation criteria of the identified role.\n\n"
                "Instructions (follow stepwise):\n"
                "1. Extract all explicit and implicit job requirements from the job description. For each requirement, generate a unique requirement_id (string, e.g., 'req-1', 'req-2', ...).\n"
                "2. For each requirement, find and quote the most relevant evidence from the resume (or state 'none').\n"
                "3. For each requirement, assign a match_level: strong, partial, weak, or none.\n"
                "4. For each requirement, provide a brief rationale for why it was included, referencing job description language and recruiter priorities.\n"
                "5. Preserve authenticity: Do not fabricate requirements or evidence. Only use information present in the job description and resume.\n"
                "6. Optimize for ATS: Phrase requirements and evidence in clear, standard language suitable for downstream ATS and recruiter review.\n"
                "7. Add notes if clarification is needed.\n"
                "8. If you cannot extract valid JSON, return {}.\n\n"
                f"Schema:\n{schema}\n\nResume:\n{resume}\n\nJob Description:\n{job}\n"
            )
            llm_response = call_llm_stub(prompt)
            llm_json = strip_code_fence(llm_response)
            parsed = json.loads(llm_json)
            parsed["id"] = str(uuid.uuid4())
            parsed["resume_id"] = resume_id
            parsed["job_id"] = job_id
            mapping = JobRequirementMapping(**parsed)
            session.add(mapping)
            await session.commit()
            await session.refresh(mapping)
            return mapping.model_dump()

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

            # 1. Create requirement mapping and persist
            mapping = await self.extract_requirement_mapping(resume_id, job_id)
            mapping_id = mapping["id"]

            # 2. Prepare prompt for job fit analysis (can use mapping if needed)
            categories = (
                profile_categories or getattr(job, "profile_categories", None) or {}
            )
            prompt_context = assemble_prompt_fragments(categories)

            schema_path = os.path.join(
                os.path.dirname(__file__),
                "../../schemas/json/job-fit-analysis.schema.json",
            )
            schema = load_schema(schema_path)
            prompt = PROMPT.format(schema, resume, job)
            if prompt_context:
                prompt = f"{prompt_context}\n\n" + prompt
            processed_json = call_llm_stub(prompt)
            processed_json_stripped = strip_code_fence(processed_json)

            import json

            parsed_json = json.loads(processed_json_stripped)
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

            # Set mapping_id in job fit
            parsed_json["mapping_id"] = mapping_id

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

    async def fetch_job_fit_mapping(self, job_fit_id: str) -> dict[str, Any]:
        """Fetch the requirement mapping for a given job fit."""
        from src.models.job_fit import JobFit, JobRequirementMapping
        from src.services.utils import get_or_404

        async with AsyncSessionLocal() as session:
            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            mapping_id = getattr(job_fit, "mapping_id", None)
            if not mapping_id:
                raise ValueError("No mapping_id found for this job fit.")
            mapping = await get_or_404(session, JobRequirementMapping, "id", mapping_id)
            return mapping.model_dump()

    async def fetch_job_fit(self, job_fit_id: str) -> JobFit:
        async with AsyncSessionLocal() as session:
            from src.services.utils import get_or_404

            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            return job_fit

    async def fetch_feedback(self, job_fit_id: str) -> list[FeedbackItem]:
        """Fetch feedback for a job fit. If not present, generate using LLM and persist."""
        from src.models.job_fit import JobFit, FeedbackItem
        from src.services.utils import get_or_404
        import json

        async with AsyncSessionLocal() as session:
            job_fit = await get_or_404(session, JobFit, "id", job_fit_id)
            feedback = getattr(job_fit, "feedback", None)
            if feedback and len(feedback) > 0:
                fixed_feedback = self._feedback_items_with_job_fit_id(
                    feedback, job_fit.id
                )
                return [
                    FeedbackItem(**item) if isinstance(item, dict) else item
                    for item in fixed_feedback
                ]
            # If not present, generate feedback using mapping
            mapping_id = getattr(job_fit, "mapping_id", None)
            if not mapping_id:
                raise ValueError("No mapping_id found for this job fit.")
            # Use the same logic as generate_targeted_feedback, but only for feedback
            from src.models.job_fit import JobRequirementMapping

            mapping = await get_or_404(session, JobRequirementMapping, "id", mapping_id)
            schema_path = os.path.join(
                os.path.dirname(__file__),
                "../../schemas/json/job-fit-analysis.schema.json",
            )
            schema = load_schema(schema_path)
            prompt = (
                "CRITICAL: Output only the raw JSON object. Do NOT use triple backticks, Markdown, code blocks, or any commentary. Only return the JSON.\n\n"
                "Instructions:\n"
                "1. For each job requirement in the mapping, generate at least one actionable feedback item (preserve, add, clarify, etc.) based on the match_level and resume evidence. Each feedback item MUST include the corresponding requirement_id from the mapping.\n"
                "2. Provide a comprehensive analysis and fit score (0-100), referencing the mapping.\n"
                "3. Extract and compare relevant keywords and skills.\n"
                "4. If you cannot extract valid JSON, return {}.\n\n"
                f"Schema:\n{schema}\n\nRequirement Mapping:\n{json.dumps(mapping.requirements, ensure_ascii=False, indent=2)}\n"
            )
            llm_response = call_llm_stub(prompt)
            llm_json = strip_code_fence(llm_response)
            parsed = json.loads(llm_json)
            feedback_items = self._feedback_items_with_job_fit_id(
                parsed.get("feedback", []), job_fit.id
            )
            # Persist feedback in job_fit
            job_fit.feedback = feedback_items
            session.add(job_fit)
            await session.commit()
            return [
                FeedbackItem(**item) if isinstance(item, dict) else item
                for item in feedback_items
            ]

    def _feedback_items_with_job_fit_id(
        self, feedback_items: list[Any], job_fit_id: str
    ) -> list[Any]:
        fixed_feedback = []
        for item in feedback_items:
            if isinstance(item, dict) and "job_fit_id" not in item:
                fixed_feedback.append({**item, "job_fit_id": job_fit_id})
            else:
                fixed_feedback.append(item)
        return fixed_feedback

    def _generate_job_fit_id(self) -> str:
        return str(uuid.uuid4())
