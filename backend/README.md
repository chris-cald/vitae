# Vitae Backend

FastAPI backend for Vitae: structured resume/job ingestion, profile category detection, and transparent job-fit analysis.

## Purpose

The backend converts resumes and job descriptions into structured records, compares candidate evidence against job requirements, and returns scores, mappings, gaps, and feedback that can guide resume tailoring.

Core goals:

- Parse uploaded resumes and job descriptions into structured JSON.
- Store raw input separately from processed resume/job records.
- Detect targeting/profile categories such as industry, role, seniority, company stage, geography, and special requirements.
- Generate requirement-level job-fit analysis with evidence, gaps, skills, scores, and recommendations.
- Keep AI/model-provider calls behind service seams.
- Handle resume/job content as sensitive PII.

## Architecture

```text
src/main.py                  FastAPI app and router mounting
src/api/router/v1/           HTTP routers for resume, job, job-fit, profile categories
src/services/                Parsing, persistence, LLM calls, category detection, scoring/feedback
src/models/                  SQLModel persistence models
src/prompt/                  Prompt builders/templates
schemas/json/                JSON schemas for structured LLM outputs
src/category_config.py       Profile/targeting category definitions
db/db.py                     Async SQLModel database setup
db/alembic/                  Alembic migrations
```

Default storage is local SQLite unless `DATABASE_URL` is configured. Docker and optional service composition notes are in `README_DOCKER.md` and `docker/`.

## Setup

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Configure `.env` as needed for database and model-provider settings. Do not commit secrets.

## Run locally

```sh
cd backend
uvicorn src.main:app --reload
```

The API defaults to `http://localhost:8000`.

## Main API areas

Verify exact request/response shapes in `src/api/router/v1/` before publishing examples.

- `GET /api/v1/resume`
- `POST /api/v1/resume/file`
- `GET /api/v1/resume/{resume_id}`
- `PATCH /api/v1/resume/{resume_id}`
- `DELETE /api/v1/resume/{resume_id}`
- `GET /api/v1/job`
- `POST /api/v1/job/url`
- `POST /api/v1/job/text`
- `POST /api/v1/job/file`
- `GET /api/v1/job/{job_id}`
- `PATCH /api/v1/job/{job_id}/name`
- `DELETE /api/v1/job/{job_id}`
- `GET /api/v1/job-fit`
- `POST /api/v1/job-fit`
- `GET /api/v1/job-fit/{job_fit_id}`
- `GET /api/v1/job-fit/{job_fit_id}/mapping`
- `GET /api/v1/job-fit/{job_fit_id}/feedback`
- `GET /api/v1/profile-categories`

## Tests

```sh
cd backend
pytest
```

Some tests may require a running backend, LiteLLM/model configuration, embedding dependencies, or local fixture data. Document environment blockers in handoffs.

## Development standards

- Use TDD for code changes when practical.
- Keep routers thin and services focused.
- Validate LLM outputs against expected schemas before storing/returning data.
- Keep prompt, schema, service, model, migration, frontend, and docs changes synchronized.
- Do not log raw resumes, job descriptions, extracted text, prompts, model responses, secrets, or full PII-bearing payloads.
- Avoid committing `.env`, `.venv`, SQLite databases, uploads, caches, or generated artifacts.

See `../README.md`, `../CONTRIBUTORS.md`, and `AGENTS.md` for repository-wide context.
