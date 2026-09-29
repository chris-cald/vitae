from fastapi.testclient import TestClient

from src.main import app
from src.api.router.v1 import job as job_router_module
from src.api.router.v1 import resume as resume_router_module


def test_job_text_route_accepts_json_name_and_returns_id(monkeypatch):
    captured = {}

    async def fake_process(self, *, job_text=None, job_url=None, job_file=None, name=None):
        captured.update(job_text=job_text, name=name)
        return "job-123"

    monkeypatch.setattr(job_router_module.JobService, "process_job_input", fake_process)

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/job/text",
            json={"job_text": "Backend engineer role", "name": "Backend Engineer"},
        )

    assert response.status_code == 200
    assert response.json()["job_id"] == "job-123"
    assert captured == {"job_text": "Backend engineer role", "name": "Backend Engineer"}


def test_resume_file_route_returns_id_and_keeps_errors_generic(monkeypatch):
    async def fake_process(self, file_bytes, content_type, filename, name=None):
        assert name == "Resume Name"
        return "resume-123"

    monkeypatch.setattr(resume_router_module.ResumeService, "process_resume", fake_process)

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/resume/file",
            files={"file": ("resume.md", b"plain text", "text/markdown")},
            data={"name": "Resume Name"},
        )

    assert response.status_code == 200
    assert response.json()["resume_id"] == "resume-123"

    async def fail_process(self, file_bytes, content_type, filename, name=None):
        raise ValueError("raw candidate@example.test")

    monkeypatch.setattr(resume_router_module.ResumeService, "process_resume", fail_process)

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/resume/file",
            files={"file": ("resume.md", b"plain text", "text/markdown")},
        )

    assert response.status_code == 500
    assert "candidate@example.test" not in response.text
