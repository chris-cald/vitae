# AGENTS.md

Guidance for AI coding agents working in this repository.

## Mission context

Vitae helps users parse resumes and job descriptions, detect targeting criteria, compute transparent job-fit analysis, and produce actionable resume improvement feedback. Optimize for correctness, privacy, and explainability over flashy model output.

## Read first

- `README.md` — repository objectives, architecture, commands, and comparison anchors.
- `CONTRIBUTORS.md` — contributor workflow and validation expectations.
- `backend/AGENTS.md` before backend changes.
- `frontend/AGENTS.md` before frontend changes.
- Relevant `backlog/` files for product intent, but treat backlog as roadmap unless code/tests confirm implementation.

## Working-tree safety

- Check `git status --short` before editing.
- Do not overwrite unrelated user changes.
- Do not commit unless explicitly asked.
- Treat `.env`, local DBs, uploads, caches, virtualenvs, `node_modules`, and `.pi-subagents/` as local artifacts.

## Default implementation workflow

Use TDD for code changes unless impractical:

1. Add/update a focused failing test.
2. Implement the smallest change.
3. Refactor after green tests.
4. Run focused validation, then relevant broader checks.

For documentation-only changes, TDD does not apply; validate with `git diff --check` and any available markdown/doc checks.

## Privacy and security invariants

Resume and job data can contain PII and confidential employer information.

- Do not add logs of raw documents, prompts, model responses, secrets, or full extracted text.
- Prefer identifiers/counts/statuses over content in logs.
- Keep upload and temporary file handling scoped and explicit.
- Fail safely on malformed LLM output.

## Architectural standards

- Backend routers should validate/translate HTTP concerns, not hold business logic.
- Backend services own parsing, persistence, LLM calls, scoring, and category detection.
- JSON schemas and prompts are part of the API/model contract; keep them synchronized with services and tests.
- Frontend API calls must stay aligned with backend route names and response shapes.
- Keep provider/model dependencies behind seams to preserve LiteLLM/local-provider flexibility.

## Handoff expectations

Final responses should include:

- Changed files.
- Tests added/updated.
- Commands run and results.
- Tests not run and why.
- Residual risks or follow-up opportunities.
