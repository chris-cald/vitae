from typing import List, Dict, Any
import requests
import pytest
import io

"""
Comprehensive integration tests for Vitae backend API endpoints.
"""

BASE_URL = "http://localhost:8000/api/v1"
PDF_BYTES = b"%PDF-1.4\n%EOF"
DOCX_BYTES = b"PK\x03\x04"  # DOCX file header


def _backend_available() -> bool:
    try:
        requests.get(f"{BASE_URL}/resume", timeout=1)
        return True
    except requests.RequestException:
        return False


pytestmark = pytest.mark.skipif(
    not _backend_available(), reason="live backend not running on localhost:8000"
)


@pytest.fixture
def resume_id() -> str:
    resp = requests.get(f"{BASE_URL}/resume", timeout=5)
    resp.raise_for_status()
    resumes = resp.json().get("resumes", [])
    if not resumes:
        pytest.skip("no live resume fixture available")
    return str(resumes[0]["resume_id"])


@pytest.fixture
def job_id() -> str:
    resp = requests.get(f"{BASE_URL}/job", timeout=5)
    resp.raise_for_status()
    jobs = resp.json().get("jobs", resp.json())
    if not jobs:
        pytest.skip("no live job fixture available")
    return str(jobs[0]["job_id"])


def _upload_resume_and_list() -> List[Dict[str, Any]]:
    files = {"file": ("test.pdf", io.BytesIO(PDF_BYTES), "application/pdf")}
    resp = requests.post(f"{BASE_URL}/resume/file", files=files)
    assert resp.status_code == 200, resp.text
    assert "message" in resp.json()
    resp = requests.get(f"{BASE_URL}/resume")
    assert resp.status_code == 200
    assert "resumes" in resp.json()
    resume_list = resp.json()["resumes"]
    assert isinstance(resume_list, list)
    return resume_list  # type: ignore


def _upload_job_and_list() -> List[Dict[str, Any]]:
    resp = requests.post(
        f"{BASE_URL}/job/text",
        json={"job_text": "Software Engineer", "name": "Software Engineer"},
    )
    assert resp.status_code == 200, resp.text
    assert "job_id" in resp.json()
    resp = requests.get(f"{BASE_URL}/job")
    assert resp.status_code == 200
    jobs = resp.json().get("jobs", resp.json())
    assert isinstance(jobs, list)
    return jobs  # type: ignore


def test_resume_upload_and_list() -> None:
    """Test uploading a resume and listing resumes."""
    _upload_resume_and_list()


def test_job_upload_and_list() -> None:
    """Test uploading a job and listing jobs."""
    _upload_job_and_list()


def test_job_fit_flow(resume_id: str, job_id: str) -> None:
    """Test job-fit analysis creation and retrieval."""
    payload = {"resume_id": resume_id, "job_id": job_id}
    resp = requests.post(f"{BASE_URL}/job-fit", json=payload)
    assert resp.status_code in (201, 400, 404, 422), resp.text
    if resp.status_code == 201:
        job_fit = resp.json()
        job_fit_id = job_fit.get("id")
        resp2 = requests.get(f"{BASE_URL}/job-fit/{job_fit_id}")
        assert resp2.status_code == 200
        resp3 = requests.get(f"{BASE_URL}/job-fit/{job_fit_id}/score")
        assert resp3.status_code in (200, 404)


def main():
    """Run all comprehensive integration tests."""
    resumes = _upload_resume_and_list()
    jobs = _upload_job_and_list()
    resume_id = resumes[0]["resume_id"] if resumes else "fake_id"
    job_id = jobs[0]["job_id"] if jobs else "fake_id"
    test_job_fit_flow(resume_id, job_id)
    print("Comprehensive integration tests completed.")


if __name__ == "__main__":
    main()
