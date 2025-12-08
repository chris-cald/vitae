from fastapi import FastAPI
from api.router.v1 import (
    resume_router,
    job_router,
    job_fit_router,
)

app = FastAPI(title="Vitae Backend API", version="1.0.0")


app.include_router(resume_router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(job_router, prefix="/api/v1/job", tags=["Job"])
app.include_router(job_fit_router, prefix="/api/v1", tags=["JobFit"])
