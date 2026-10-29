---
id: wi-058
title: Repair Babysitter-DV Run Closeout
summary: Make a completed implementation effect advance through evidence, review, closure, integration, and cleanup gates instead of leaving a halted run.
type: work-item
subtype: bug
lifecycle: active
status: ready
status_reason: planned
priority: high
estimated: 3
links:
  reference:
    - '[[055-add-application-bundle-workspace]]'
tags:
  - afk
  - delivery
  - babysitter
  - doc-vader
---

## Goal

Repair the Babysitter-DV process so an externally posted successful implementation result advances deterministically to its remaining delivery gates and can produce an auditable closeout.

## Acceptance Criteria

- [x] A reproduced run advances after `task:post --status ok` instead of re-requesting the same effect.
- [x] Evidence, independent review, closure, integration, and cleanup gates remain fail-closed.
- [x] A focused regression test covers the external effect-result continuation path.
- [x] `npm run check` and `dv backlog validate --dir backlog --fail-on error` pass.
