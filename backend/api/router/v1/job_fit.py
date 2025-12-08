from fastapi import APIRouter
from backend.models.job_fit import JobFit, ScoreResult, FeedbackItem

router = APIRouter()


@router.post("/job-fit", response_model=JobFit, status_code=201)
def create_job_fit(resume_id: str, job_id: str):
    # ...create job-fit logic...
    job_fit_id = "jobfit_001"  # Example
    links = [
        {"rel": "self", "href": f"/api/v1/job-fit/{job_fit_id}"},
        {"rel": "score", "href": f"/api/v1/job-fit/{job_fit_id}/score"},
        {"rel": "feedback", "href": f"/api/v1/job-fit/{job_fit_id}/feedback"},
        {"rel": "resume", "href": f"/api/v1/resume/{resume_id}"},
        {"rel": "job", "href": f"/api/v1/job/{job_id}"},
    ]
    return JobFit(id=job_fit_id, resume_id=resume_id, job_id=job_id, links=links)


@router.get("/job-fit/{job_fit_id}", response_model=JobFit)
def get_job_fit(job_fit_id: str):
    # ...fetch job-fit logic...
    # Example response
    return JobFit(id=job_fit_id, resume_id="123", job_id="456", links=[])


@router.get("/job-fit/{job_fit_id}/score", response_model=ScoreResult)
def get_score(job_fit_id: str):
    # ...score logic...
    links = [
        {"rel": "self", "href": f"/api/v1/job-fit/{job_fit_id}/score"},
        {"rel": "feedback", "href": f"/api/v1/job-fit/{job_fit_id}/feedback"},
    ]
    return ScoreResult(score=85, links=links)


@router.get("/job-fit/{job_fit_id}/feedback", response_model=list[FeedbackItem])
def get_feedback(job_fit_id: str):
    # ...feedback logic...
    feedback = [
        FeedbackItem(
            intent="preserve",
            message="Great summary section, keep it!",
            lineNumber="5",
            weight=0.8,
        ),
        FeedbackItem(
            intent="add",
            message="Include a certification in healthcare compliance.",
            lineNumber="45",
            weight=1.0,
        ),
        FeedbackItem(
            intent="remove",
            message="This section does not relate to the job requirements.",
            lineNumber="22",
            weight=0.7,
        ),
        FeedbackItem(
            intent="reword",
            message="Clarify your role in the project.",
            lineNumber="15",
            weight=0.6,
        ),
        FeedbackItem(
            intent="reformat",
            message="Use bullet points for easier reading.",
            lineNumber="10",
            weight=0.5,
        ),
        FeedbackItem(
            intent="move",
            message="Move education section above work experience.",
            lineNumber="60",
            weight=0.4,
        ),
        FeedbackItem(
            intent="clarify",
            message="Add more details about your leadership role.",
            lineNumber="30",
            weight=0.9,
        ),
    ]
    return feedback
