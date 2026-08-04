from fastapi import APIRouter


from .resume import resume_router
from .job import job_router
from .job_fit import router as job_fit_router
from .profile_categories import router as profile_categories_router

__all__ = [
    "resume_router",
    "job_router",
    "job_fit_router",
    "profile_categories_router",
]
v1_router = APIRouter()
v1_router.include_router(resume_router, prefix="/resume", tags=["resume"])
v1_router.include_router(job_router, prefix="/job", tags=["job"])
v1_router.include_router(job_fit_router, tags=["jobfit"])
v1_router.include_router(
    profile_categories_router, prefix="/profile-categories", tags=["profile-categories"]
)
