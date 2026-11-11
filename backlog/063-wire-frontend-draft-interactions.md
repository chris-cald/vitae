---
id: wi-063
title: Wire Frontend Draft Interactions
type: work-item
subtype: bug
lifecycle: active
status: completed
status_reason: completed
priority: high
estimated: 2
actual: 2
completed_date: '2026-11-06'
links:
  evidence:
    - '[[record-wi-063-mock-interaction-validation]]'
tags:
  - afk
  - frontend
  - ux
---

# Wire Frontend Draft Interactions

Visible frontend-draft buttons and links currently do not consistently cause a mock state change or navigation. Wire meaningful mock-only behavior for visible controls.

## Acceptance Criteria

- [x] Every visible action control either changes mock state, navigates to a relevant view, or is removed.
- [x] Interaction behavior is covered by focused DOM tests.
- [x] No API calls or real documents are added.
- [x] Focused frontend test and `npm run check` pass.
