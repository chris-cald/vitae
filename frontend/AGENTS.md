# Frontend agent guide

This file applies to `frontend/`.

## Overview

The frontend is a Vite + React + TypeScript single-page app for uploading/selecting resumes and jobs, choosing targeting criteria, creating job-fit analyses, and viewing feedback.

## Start points

- App entry: `src/main.tsx`.
- Main workflow/state: `src/App.tsx`.
- Resume UI: `src/components/resume/`.
- Job UI: `src/components/job/`.
- Job-fit UI: `src/components/jobfit/`.
- Shared API helpers: `src/lib/api.ts`.
- UI primitives: `src/components/ui/`.
- Styling/theme: `src/index.css`, Tailwind utilities, Shadcn-style components.

## Commands

```sh
cd frontend
npm install
npm run dev
npm run lint
npm run build
```

Local dev expects the backend at `http://localhost:8000`; `vite.config.js` proxies `/api` to that backend.

## Standards

- Keep the user journey readable from `App.tsx`.
- Prefer explicit TypeScript types for backend payloads and component props; avoid adding new `any` where practical.
- Prefer central/shared API helpers when adding endpoint calls.
- Keep route names and payload shapes synchronized with `backend/src/api/router/v1/`.
- Use `@/*` imports, `cn()` for class merging, Tailwind utilities, and Shadcn-style primitives in `src/components/ui/`.
- Avoid logging or rendering sensitive resume/job content outside intentional UI surfaces.

## Validation notes

- Run `npm run build` after TypeScript or component changes.
- Run `npm run lint`, but be aware the current ESLint configuration may not cover all TS/TSX files unless it is updated.
- For API contract changes, validate with a running backend or document why that was not possible.
