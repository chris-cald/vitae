import requests

BASE_URL = "http://localhost:8000/api/v1"


def test_resume_list():
    resp = requests.get(f"{BASE_URL}/resume")
    assert resp.status_code == 200
    assert "resumes" in resp.json()


def test_job_list():
    resp = requests.get(f"{BASE_URL}/job")
    assert resp.status_code == 200
    assert "jobs" in resp.json() or resp.json() == []


def test_job_fit_post():
    # This is a stub; you should create valid resume/job entries first
    payload = {"resume_id": "fake_id", "job_id": "fake_id"}
    resp = requests.post(f"{BASE_URL}/job-fit", json=payload)
    assert resp.status_code in (400, 404, 422)


if __name__ == "__main__":
    test_resume_list()
    test_job_list()
    test_job_fit_post()
    print("Integration tests completed.")
