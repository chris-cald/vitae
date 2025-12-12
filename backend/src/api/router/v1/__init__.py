from fastapi import APIRouter


from .resume import resume_router
from .job import job_router
from .job_fit import router as job_fit_router
from .profile_categories import router as profile_categories_router
