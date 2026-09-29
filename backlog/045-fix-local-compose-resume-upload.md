---
id: wi-045
title: Fix Local Compose Resume Upload
type: work-item
subtype: bug
lifecycle: active
status: completed
status_reason: accepted
priority: high
links:
  parent:
    - '[[044-add-local-compose-instance]]'
tags:
  - compose
  - upload
  - privacy
---

## Symptom

Uploading a resume in the local compose instance showed the frontend message `Upload failed.`

## Cause

The local compose backend was configured for the local Pi OpenAI bridge, but the bridge is an optional host process. When unavailable, resume upload failed the model-processing path and returned a generic 500.

## Fix

- [x] Add a local-only parse fallback guarded by `VITAE_LOCAL_PARSE_FALLBACK=1`.
- [x] Enable that fallback in `compose.local.yml`.
- [x] Add a regression test proving local upload can complete when the model provider is unavailable.

## Evidence

- `cd backend && .venv/bin/python -m pytest -q tests/test_resume_service_local_fallback.py tests/test_upload_routes.py tests/test_privacy_logging.py`
- `curl -F file=@... -F name=... http://localhost:8000/api/v1/resume/file` returned 200 on the running local compose instance.
- Headless browser upload advanced to `Upload or Select Job Description`.
