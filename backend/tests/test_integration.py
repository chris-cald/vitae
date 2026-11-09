import os

import pytest
import requests

BASE_URL = "http://localhost:8000/api/v1"
REQUEST_TIMEOUT = 5

pytestmark = pytest.mark.skipif(
    os.getenv("VITAE_LIVE_INTEGRATION") != "1",
    reason="set VITAE_LIVE_INTEGRATION=1 to run live backend tests",
)


def test_resume_list():
    resp = requests.get(f"{BASE_URL}/resume", timeout=REQUEST_TIMEOUT)
    assert resp.status_code == 200
    assert "resumes" in resp.json()


def test_job_list():
    resp = requests.get(f"{BASE_URL}/job", timeout=REQUEST_TIMEOUT)
    assert resp.status_code == 200
    assert "jobs" in resp.json() or resp.json() == []


def test_job_fit_post():
    # This is a stub; you should create valid resume/job entries first
    payload = {"resume_id": "fake_id", "job_id": "fake_id"}
    resp = requests.post(f"{BASE_URL}/job-fit", json=payload, timeout=REQUEST_TIMEOUT)
    assert resp.status_code in (400, 404, 422)


if __name__ == "__main__":
    test_resume_list()
    test_job_list()
    test_job_fit_post()
    print("Integration tests completed.")
