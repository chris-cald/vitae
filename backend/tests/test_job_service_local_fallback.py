import pytest

from src.services import job_service as job_service_module
from src.services.job_service import JobService


@pytest.mark.asyncio
async def test_job_upload_uses_local_parse_fallback_when_model_unavailable(monkeypatch, tmp_path):
    def fail_llm(prompt):
        raise RuntimeError("provider unavailable")

    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path))
    monkeypatch.setenv("VITAE_LOCAL_PARSE_FALLBACK", "1")
    monkeypatch.setattr(job_service_module, "call_llm_stub", fail_llm)

    job_id = await JobService().process_job_input(
        job_text="Software Engineer",
        name="Software Engineer",
    )

    assert job_id
    jobs = await JobService().fetch_jobs()
    created = [job for job in jobs if job["job_id"] == job_id][0]
    assert created["name"] == "Software Engineer"
    assert created["title"] == "Software Engineer"
    assert created["company"] == "Local UAT"
    assert created["profile_categories"]["special_requirements"] == []
