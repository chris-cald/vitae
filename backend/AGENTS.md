# Backend agent guide

This file applies to `backend/`.

## Overview

The backend is a FastAPI service for resume/job ingestion, profile category detection, and job-fit analysis. It uses SQLModel/SQLAlchemy for persistence and LiteLLM-facing services for model calls.

## Start points

- App entry: `src/main.py` (`uvicorn src.main:app --reload`).
- Routers: `src/api/router/v1/`.
- Services: `src/services/`.
- Models: `src/models/`.
- Prompts: `src/prompt/`.
- JSON schemas: `schemas/json/`.
- DB setup: `db/db.py`; migrations under `db/alembic/`.

## Commands

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload
pytest
```

Some tests may require a live server, LiteLLM/model configuration, embedding dependencies, or local fixtures. Call this out in handoffs when relevant.

## Standards

- Keep routers thin: request validation, status codes, and exception translation only.
- Put business logic in services.
- Use async DB sessions from `db.db.AsyncSessionLocal`.
- Keep raw uploaded data and processed structured records conceptually separate.
- Keep schemas/prompts/services/tests synchronized when LLM output shape changes.
- Prefer deterministic validation and schema checks around model responses.
- Do not log raw resumes, job descriptions, extracted content, prompts, model responses, secrets, or API keys.
- Avoid relying on stale docs; verify current endpoints in router files.

## Common endpoint areas

- `/api/v1/resume` — resume upload/list/fetch/update/delete.
- `/api/v1/job` — job URL/text/file ingestion and management.
- `/api/v1/job-fit` — analysis creation, scores, mapping, feedback, skills, and management.
- `/api/v1/profile-categories` — targeting/profile category metadata.

## Validation notes

- Use focused pytest tests for service/router changes.
- For API changes, update frontend callers and documentation examples.
- For model/schema changes, check migrations and existing data compatibility.
- Run `git diff --check` for whitespace before handoff.
