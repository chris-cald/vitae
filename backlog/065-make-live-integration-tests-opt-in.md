---
id: wi-065
title: Make Live Integration Tests Opt-In
type: work-item
subtype: bug
lifecycle: active
status: completed
status_reason: completed
priority: high
estimated: 1
actual: 1
completed_date: '2026-11-06'
links:
  parent: []
  depends_on: []
  implements: []
  evidence:
    - '[[record-wi-065-deterministic-integration-validation]]'
tags:
  - afk
  - backend
  - testing
---

# Make Live Integration Tests Opt-In

`npm run check` must not hang or contact a running localhost backend. Live backend integration tests must run only when explicitly opted in, and every network call must have a finite timeout.

## Acceptance Criteria

- [x] `npm run check` does not run live-backend requests by default, even when localhost:8000 responds.
- [x] An explicit environment opt-in enables live integration tests.
- [x] Live integration HTTP requests use finite timeouts.
- [x] `npm run check` passes.
