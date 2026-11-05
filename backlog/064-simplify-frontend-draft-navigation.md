---
id: wi-064
title: Simplify Frontend Draft Navigation
type: work-item
subtype: bug
lifecycle: active
status: completed
status_reason: completed
priority: high
estimated: 1
actual: 1
completed_date: '2026-11-05'
commits:
  25d3e8e142ce92570cebd7689d775921f6430f8f: Simplify frontend draft navigation
  83f78087c540e66df536d795bd80744186168a52: Record wi-064 validation and closure
links:
  parent: []
  depends_on: []
  implements: []
  evidence:
    - '[[record-wi-064-frontend-navigation-validation]]'
    - '[[record-wi-064-independent-review]]'
tags:
  - afk
  - frontend
  - ux
---

# Simplify Frontend Draft Navigation

Remove redundant top navigation and make the left navigation collapsible while preserving accessible view selection.

## Acceptance Criteria

- [x] The redundant top navigation is removed.
- [x] The left navigation has a keyboard-accessible collapse/expand control.
- [x] Navigation remains usable with clear active-view state.
- [x] Focused frontend test and `npm run check` pass.
