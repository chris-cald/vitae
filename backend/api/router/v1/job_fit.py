from fastapi import APIRouter, HTTPException, Request
from fastapi import Body
from models.job_fit import JobFit, ScoreResult, FeedbackItem
from services.job_fit_service import JobFitService

router = APIRouter()


@router.post(
    "/job-fit",
    summary="Create a job-fit analysis between a candidate profile and a job description",
    response_model=JobFit,
    status_code=201,
)
async def create_job_fit(
    request: Request,
    resume_id: str = Body(..., embed=True),
    job_id: str = Body(..., embed=True),
):
    service = JobFitService()
    try:
        job_fit = await service.analyze_fit(resume_id=resume_id, job_id=job_id)
    except Exception as e:
        msg = str(e)
        if "not found" in msg:
            raise HTTPException(status_code=404, detail=msg)
        raise HTTPException(status_code=400, detail=msg)
    return job_fit


@router.get("/job-fit/{job_fit_id}", response_model=JobFit)
async def get_job_fit(job_fit_id: str):
    service = JobFitService()
    job_fit = await service.fetch_job_fit(job_fit_id)
    if not job_fit:
        raise HTTPException(status_code=404, detail="JobFit not found")
    return job_fit


@router.get("/job-fit/{job_fit_id}/score", response_model=ScoreResult)
async def get_score(job_fit_id: str):
    service = JobFitService()
    score_result = await service.fetch_score(job_fit_id)
    if not score_result:
        raise HTTPException(status_code=404, detail="Score not found")
    return score_result


@router.get("/job-fit/{job_fit_id}/feedback", response_model=list[FeedbackItem])
async def get_feedback(job_fit_id: str):
    service = JobFitService()
    feedback = await service.fetch_feedback(job_fit_id)
    return feedback
