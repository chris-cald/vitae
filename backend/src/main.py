from fastapi import FastAPI
from src.api.router.v1 import (
    resume_router,
    job_router,
    job_fit_router,
    profile_categories_router,
    mvp_router,
    runtime_execution_router,
)
from db.db import init_db
from contextlib import asynccontextmanager

import logging

logging.basicConfig(level=logging.INFO)

# Set DEBUG logging only for job_service
# logging.getLogger("src.services.job_service").setLevel(logging.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize DB
    await init_db()
    yield
    # Shutdown: nothing needed


app = FastAPI(title="Vitae Backend API", version="1.0.0", lifespan=lifespan)


app.include_router(resume_router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(job_router, prefix="/api/v1/job", tags=["Job"])
app.include_router(job_fit_router, prefix="/api/v1", tags=["JobFit"])
app.include_router(
    profile_categories_router, prefix="/api/v1", tags=["ProfileCategories"]
)
app.include_router(mvp_router, prefix="/api/v1", tags=["MVP"])
app.include_router(runtime_execution_router, prefix="/api/v1", tags=["RuntimeExecution"])
