---
id: wi-063
title: Wire Frontend Draft Interactions
type: work-item
subtype: bug
lifecycle: active
status: ready
status_reason: auto
priority: high
estimated: 2
links:
  parent: []
  depends_on: []
  implements: []
tags:
  - afk
  - frontend
  - ux
---

# Wire Frontend Draft Interactions

Visible frontend-draft buttons and links currently do not consistently cause a mock state change or navigation. Wire meaningful mock-only behavior for visible controls.

## Acceptance Criteria

- [ ] Every visible action control either changes mock state, navigates to a relevant view, or is removed.
- [ ] Interaction behavior is covered by focused DOM tests.
- [ ] No API calls or real documents are added.
- [ ] Focused frontend test and `npm run check` pass.
