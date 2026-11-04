---
id: wi-062
title: Separate Today From Applications
type: work-item
subtype: bug
lifecycle: active
status: running
status_reason: implementation
priority: high
estimated: 1
links:
  parent: []
  depends_on: []
  implements: []
tags:
  - afk
  - frontend
  - ux
---

# Separate Today From Applications

The mock frontend currently presents substantially identical Today and Applications views. Make their responsibilities visibly distinct using mock data only: Today is a personal, prioritized work queue; Applications is a searchable/staged collection of application records.

## Acceptance Criteria

- [x] Today and Applications have distinct headings, content models, and primary actions.
- [x] Both views retain mock-only data and no backend/API calls.
- [x] Navigation to either view is test-covered.
- [x] Focused frontend test and `npm run check` pass.
