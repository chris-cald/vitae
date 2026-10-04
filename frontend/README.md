# Vitae Frontend

React/Vite frontend for Vitae. It lets users upload or select resumes and jobs, choose targeting criteria, create job-fit analyses, and view analysis results from the backend.

## Stack

- React + TypeScript
- Vite development/build tooling
- Tailwind CSS
- Shadcn-style UI primitives
- Relative `/api/v1/...` backend calls proxied by Vite to `http://localhost:8000`

## Architecture

```text
src/main.tsx                         React entry point
src/App.tsx                          Main stepper workflow and selected IDs
src/components/resume/               Resume upload/list/manage UI
src/components/job/                  Job URL/text/file upload and manage UI
src/components/jobfit/               Targeting criteria, analysis creation/list/results UI
src/components/ui/                   Reusable Shadcn-style primitives/icons
src/lib/api.ts                       Shared API helpers for selected endpoints
src/index.css                        Tailwind/theme tokens
```

The app currently uses local React state rather than a router. `App.tsx` coordinates this flow:

1. Upload or select a resume.
2. Upload or select a job description.
3. Select targeting/profile categories.
4. Create a job-fit analysis.
5. View score, mapping, feedback, and previous analyses.

## Setup

```sh
cd frontend
npm install
```

## Run locally

Start the backend first on port 8000, then:

```sh
cd frontend
npm run dev
```

Vite proxies `/api` to `http://localhost:8000`.

## Scripts

```sh
npm run dev      # Vite dev server
npm run build    # Production build / TypeScript build validation
npm run lint     # ESLint
npm run preview  # Preview built app
```

Note: the current ESLint configuration may not cover every TS/TSX source file unless it is updated.

## Backend API areas used by the frontend

- `/api/v1/resume`
- `/api/v1/job`
- `/api/v1/job-fit`
- `/api/v1/application-bundles` for draft JD note, tailored resume draft, manifest, source summary, unsupported claims, and next-action artifacts
- `/api/v1/profile-categories`

Verify exact route names and payloads in `../backend/src/api/router/v1/` when changing API calls.

## Development standards

- Use explicit TypeScript types for backend payloads and component props where practical.
- Prefer shared helpers in `src/lib/api.ts` for new API calls.
- Keep endpoint names synchronized with backend routes.
- Use `@/*` imports, Tailwind utilities, `cn()`, and shared UI components from `src/components/ui/`.
- Do not log sensitive resume/job content except where intentionally shown to the user.

See `../README.md`, `../CONTRIBUTORS.md`, and `AGENTS.md` for repository-wide context.
