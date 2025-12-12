from fastapi import APIRouter
from src.profile_categories import PROFILE_CATEGORIES

router = APIRouter()


@router.get("/profile-categories")
def get_profile_categories():
    """Return available profile categories and values for customization."""
    return PROFILE_CATEGORIES
