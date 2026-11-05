---
id: wi-067
title: Make Sources And Evidence Actionable
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
  evidence:
    - '[[record-wi-067-validation-passed]]'
    - '[[record-wi-067-persistence-validation-passed]]'
    - '[[record-wi-067-independent-review-approved]]'
tags:
  - afk
  - frontend
  - ux
---

# Make Sources And Evidence Actionable

Sources & evidence lacks actual source records and uses unexplained signal terminology. Add mock source/evidence records, links, and plain-language evidence status.

## Acceptance Criteria

- [x] Sources & evidence lists linked mock source records and their supporting evidence.
- [x] Evidence status uses plain language and explains its relationship to use in deliverables.
- [x] Source/evidence controls have mock interactions.
- [x] Focused frontend test and `npm run check` pass.
