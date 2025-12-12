# Simple rule-based auto-detection for profile categories from job data
from src.profile_categories import PROFILE_CATEGORIES
import re


from typing import Dict, Any

def detect_profile_categories(job_data: Dict[str, Any]) -> Dict[str, Any]:
    detected: Dict[str, Any] = {}
    title = (job_data.get("title") or "").lower()
    description = (job_data.get("description") or "").lower()
    text = f"{title} {description}"

    # Industry (very basic, can be improved)
    for industry in PROFILE_CATEGORIES["industry"]:
        if industry.lower() in text:
            detected["industry"] = industry
            break

    # Function
    for function in PROFILE_CATEGORIES["function"]:
        if any(word in text for word in re.split(r"[ /]", function.lower())):
            detected["function"] = function
            break

    # Seniority
    for seniority in PROFILE_CATEGORIES["seniority"]:
        if seniority.lower().split()[0] in text:
            detected["seniority"] = seniority
            break

    # Company size (not usually in JD, skip or set None)
    detected["company_size"] = None

    # Geography
    for geo in PROFILE_CATEGORIES["geography"]:
        if geo.lower() in text:
            detected["geography"] = geo
            break

    # Special requirements
    detected["special_requirements"] = [
        req for req in PROFILE_CATEGORIES["special_requirements"] if req.lower() in text
    ]

    return detected
