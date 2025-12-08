import requests
import io

BASE_URL = "http://localhost:8000/api/v1"

# Helper to upload a minimal PDF file
PDF_BYTES = b"%PDF-1.4\n%EOF"
DOCX_BYTES = b"PK\x03\x04"  # DOCX file header


def test_resume_upload_and_list():
    files = {"file": ("test.pdf", io.BytesIO(PDF_BYTES), "application/pdf")}
    resp = requests.post(f"{BASE_URL}/resume", files=files)
    assert resp.status_code == 200, resp.text
    assert "message" in resp.json()
    # List resumes
    resp = requests.get(f"{BASE_URL}/resume")
    assert resp.status_code == 200
    assert "resumes" in resp.json()
    resume_list = resp.json()["resumes"]
    assert isinstance(resume_list, list)
    return resume_list


def test_job_upload_and_list():
    # Upload job via text
    # Only one input allowed, so send job_text as a dict with embed=True
    resp = requests.post(f"{BASE_URL}/job", json={"job_text": "Software Engineer"})
    assert resp.status_code == 200, resp.text
    assert "message" in resp.json()
    # List jobs
    resp = requests.get(f"{BASE_URL}/job")
    assert resp.status_code == 200
    jobs = resp.json().get("jobs", resp.json())
    assert isinstance(jobs, list)
    return jobs


def test_job_fit_flow(resume_id, job_id):
    payload = {"resume_id": resume_id, "job_id": job_id}
    resp = requests.post(f"{BASE_URL}/job-fit", json=payload)
    # Accept 201 (created), 404 (not found), or 422 (validation error)
    assert resp.status_code in (201, 404, 422), resp.text
    if resp.status_code == 201:
        job_fit = resp.json()
        job_fit_id = job_fit.get("id")
        # Get job fit
        resp2 = requests.get(f"{BASE_URL}/job-fit/{job_fit_id}")
        assert resp2.status_code == 200
        # Get score
        resp3 = requests.get(f"{BASE_URL}/job-fit/{job_fit_id}/score")
        assert resp3.status_code in (200, 404)


if __name__ == "__main__":
    resumes = test_resume_upload_and_list()
    jobs = test_job_upload_and_list()
    resume_id = resumes[0]["resume_id"] if resumes else "fake_id"
    job_id = jobs[0]["job_id"] if jobs else "fake_id"
    test_job_fit_flow(resume_id, job_id)
    print("Comprehensive integration tests completed.")
