from src.services.job_fit_service import JobFitService


def test_feedback_items_with_job_fit_id_injects_missing_ids():
    service = JobFitService()

    feedback = [
        {
            "requirement_id": "req-1",
            "intent": "add",
            "message": "Add measurable impact.",
            "lineNumber": "12",
            "weight": 0.7,
        },
        {
            "job_fit_id": "existing",
            "requirement_id": "req-2",
            "intent": "preserve",
            "message": "Keep relevant leadership evidence.",
            "lineNumber": "20",
            "weight": 0.9,
        },
    ]

    result = service._feedback_items_with_job_fit_id(feedback, "job-fit-1")

    assert result[0]["job_fit_id"] == "job-fit-1"
    assert result[1]["job_fit_id"] == "existing"
