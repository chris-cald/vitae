# Contributors

This guide orients human and agent contributors working in Vitae.

## Project intent

Vitae is a resume/job-fit analysis system. Contributions should preserve the core product promise: structured parsing, transparent matching, actionable feedback, and privacy-conscious handling of resume/job data.

## Start here

1. Read `README.md` for objectives and architecture.
2. For backend changes, inspect `backend/src/main.py`, then the relevant router, service, model, prompt, and schema files.
3. For frontend changes, inspect `frontend/src/App.tsx`, then the relevant component and `frontend/src/lib/api.ts`.
4. For roadmap context, read the matching `backlog/` epic or task, but verify implementation status in code.

## Development workflow

- Use TDD for code changes whenever practical:
  1. Add or update a focused failing test.
  2. Implement the smallest change that makes it pass.
  3. Refactor only after tests are green.
  4. Run focused validation before broader validation.
- If TDD is impractical, state why in your handoff before implementing.
- Keep changes scoped. Do not mix documentation cleanup, refactors, dependency upgrades, and product behavior changes unless requested.
- Do not overwrite unrelated local changes. This repository may contain active work in progress.

## Backend contribution notes

- Run from `backend/` with `uvicorn src.main:app --reload`.
- Keep routers in `backend/src/api/router/v1/` thin.
- Put business logic in `backend/src/services/`.
- Keep persistence models in `backend/src/models/` and use async sessions from `backend/db/db.py`.
- Keep prompts in `backend/src/prompt/` and JSON schemas in `backend/schemas/json/`.
- Validate LLM output before storing or returning it.
- Do not log raw resumes, job descriptions, prompts, model responses, API keys, or other PII/secrets.

## Frontend contribution notes

- Run from `frontend/` with `npm run dev`.
- Keep the high-level flow understandable from `frontend/src/App.tsx`.
- Use TypeScript types instead of `any` for backend payloads where feasible.
- Prefer shared API helpers when adding or changing endpoints.
- Use `@/*` imports, Tailwind utilities, and Shadcn-style primitives under `src/components/ui/`.
- Keep frontend endpoint assumptions aligned with backend routes.

## Validation expectations

Use the narrowest relevant command first. Common checks:

```sh
# backend
cd backend && pytest

# frontend
cd frontend && npm run lint
cd frontend && npm run build
```

If validation cannot run because of missing services, model providers, secrets, or local dependencies, include the command attempted and the blocker in your final handoff.

## Documentation expectations

- Update `README.md`, child README files, schemas, or API docs when behavior or commands change.
- Do not copy stale endpoint examples; verify current routes in `backend/src/api/router/v1/`.
- Mark roadmap/backlog items as intended work unless source/tests prove they are implemented.
- Keep quick-reference docs concise enough for another session to orient quickly.

## Review checklist

Before handing off, verify or disclose:

- What files changed.
- What tests were added or updated.
- What validation commands ran and their results.
- Any tests not run and why.
- Any residual risks, especially around PII logging, API drift, migrations, generated artifacts, and environment-dependent tests.
