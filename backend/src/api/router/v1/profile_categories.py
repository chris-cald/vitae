from fastapi import APIRouter

from src.category_config import CATEGORY_CONFIG, ProfileCategoriesResponse

router = APIRouter()


@router.get("/profile-categories")
def get_profile_categories() -> ProfileCategoriesResponse:
    """Return available profile categories with display names and values only (no fragments)."""
    # Return: { category_key: { display_name: str, values: [str, ...] }, ... }
    result: ProfileCategoriesResponse = {}
    for key, conf in CATEGORY_CONFIG.items():
        result[key] = {
            "display_name": conf["display_name"],
            "values": [v["value"] for v in conf["values"]],
        }
    return result
