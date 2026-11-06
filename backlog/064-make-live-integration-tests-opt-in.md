---
id: wi-064
title: Make Live Integration Tests Opt-In
type: work-item
subtype: bug
lifecycle: active
status: ready
status_reason: planned
priority: high
estimated: 1
links:
  parent: []
  depends_on: []
  implements: []
tags:
  - afk
  - backend
  - testing
---

# Make Live Integration Tests Opt-In

`npm run check` must not hang or contact a running localhost backend. Live backend integration tests must run only when explicitly opted in, and every network call must have a finite timeout.

## Acceptance Criteria

- [ ] `npm run check` does not run live-backend requests by default, even when localhost:8000 responds.
- [ ] An explicit environment opt-in enables live integration tests.
- [ ] Live integration HTTP requests use finite timeouts.
- [ ] `npm run check` passes.
