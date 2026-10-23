---
id: wi-059
title: Make Release Validation Reproducible
summary: Make clean-checkout validation deterministic across Python and TypeScript, then add CI evidence for the public MVP gates.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: planned
priority: critical
estimated: 4
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  reference:
    - '[[056-connect-career-refresh-and-runtime-ux]]'
    - '[[057-run-live-full-loop-mvp-uat]]'
    - '[[058-repair-babysitter-dv-run-closeout]]'
tags:
  - afk
  - p0
  - release
  - ci
  - typescript
  - privacy
---

## Goal

Make the documented validation path runnable from a clean checkout without an untracked Python environment, while making TypeScript failures and public demo/documentation drift visible before merge.

## Tasks

- [ ] Pin and document compatible Node, Python, and package-manager versions; provide a reproducible backend test environment from tracked dependency inputs.
- [ ] Make root `npm run check` run backend tests, frontend behavior tests, TypeScript typechecking, and applicable TS/TSX linting without hidden local setup.
- [ ] Add GitHub Actions checks for backend, frontend, schemas/domain/career-core, and practical README/synthetic-demo integrity.
- [ ] Create the root `npm run pilot:rehearse` command as a deterministic release rehearsal.
- [ ] Keep CI and rehearsal checks separate from provider, browser, and Temporal integration evidence; they are never a substitute for WI-057 live UAT. Do not add credentials or raw candidate material to CI.
- [ ] Update public setup and validation documentation with exact clean-checkout commands and explicit live-validation limitations.

## Acceptance Criteria

- [ ] From a clean checkout, documented commands install tracked dependencies into an isolated environment, and `npm run check` uses that environment without falling back to ambient `python3` or an untracked repository virtualenv.
- [ ] `tsc --noEmit` and TS/TSX linting run in the normal reproducible gate.
- [ ] CI executes the documented deterministic checks and fails on a broken synthetic demo/documentation link or contract check.
- [ ] The release rehearsal distinguishes local deterministic evidence from required WI-057 provider, browser, and Temporal UAT evidence.
- [ ] `npm run check`, `npm run pilot:rehearse`, and `dv backlog validate --dir backlog --fail-on error` pass.

## Relationships

- `parent`: WI-050
- `references`: WI-056, WI-057, WI-058
