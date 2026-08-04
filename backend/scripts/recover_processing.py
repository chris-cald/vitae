"""
Recovery utility for resuming resume/job processing from last persisted point of failure.

- For resumes: If processed resume exists without categories, attempts category detection and updates the record.
- For jobs: If processed job exists without categories, attempts category detection and updates the record.

Usage (example):
    python recover_processing.py --type resume --id <resume_id>
    python recover_processing.py --type job --id <job_id>

"""

import argparse
import logging
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def recover_resume(resume_id: str, force: bool = False):
    patch_url = f"http://localhost:8000/api/v1/resume/{resume_id}"
    logger.info(f"PATCHing resume to null profile_categories: {patch_url}")
    resp = requests.patch(patch_url, json={"profile_categories": None})
    if resp.status_code == 404:
        logger.error(f"No processed resume found for id={resume_id}")
        return
    resp.raise_for_status()
    # Now GET to trigger recalculation and persistence
    get_url = f"http://localhost:8000/api/v1/resume/{resume_id}"
    logger.info(f"GETting resume to trigger recalculation: {get_url}")
    resp = requests.get(get_url)
    resp.raise_for_status()
    data = resp.json()
    categories = data.get("resume", {}).get("profile_categories")
    if categories:
        logger.info(f"Recalculated resume {resume_id} with categories.")
    else:
        logger.warning(f"Resume {resume_id} has no categories after recalculation.")


def recover_job(job_id: str, force: bool = False):
    patch_url = f"http://localhost:8000/api/v1/job/{job_id}"
    logger.info(f"PATCHing job to null profile_categories: {patch_url}")
    resp = requests.patch(patch_url, json={"profile_categories": None})
    if resp.status_code == 404:
        logger.error(f"No processed job found for id={job_id}")
        return
    resp.raise_for_status()
    # Now GET to trigger recalculation and persistence
    get_url = f"http://localhost:8000/api/v1/job/{job_id}"
    logger.info(f"GETting job to trigger recalculation: {get_url}")
    resp = requests.get(get_url)
    resp.raise_for_status()
    data = resp.json()
    categories = data.get("job", {}).get("profile_categories")
    if categories:
        logger.info(f"Recalculated job {job_id} with categories.")
    else:
        logger.warning(f"Job {job_id} has no categories after recalculation.")


def main():
    import sys

    parser = argparse.ArgumentParser(description="Resume failed resume/job processing.")
    parser.add_argument("--type", choices=["resume", "job"], required=True)
    parser.add_argument("--id", required=True, help="Resume or Job ID")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force overwrite of profile_categories even if already present.",
    )
    args = parser.parse_args()

    try:
        if args.type == "resume":
            recover_resume(args.id, force=args.force)
        elif args.type == "job":
            recover_job(args.id, force=args.force)
        sys.exit(0)
    except Exception as e:
        logger.exception(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
