---
id: wi-073
title: Restore focus after canceling frontend-draft creation
summary: Restore creation-trigger focus after Cancel without changing mock lifecycle behavior.
type: work-item
subtype: bug
lifecycle: active
status: ready
status_reason: prioritized
priority: critical
links:
  reference:
    - '[[070-validate-connected-mock-dual-lifecycles]]'
    - '[[records/record-wi-073-f1-intake]]'
  depends_on:
    - '[[069-complete-connected-mock-dual-lifecycles]]'
tags:
  - afk
  - frontend
  - mock-only
  - accessibility
---

# Restore focus after canceling frontend-draft creation

## Authorization and boundary

User authorized this separately tracked WI070-F1 remediation. Restore focus to the originating creation trigger on Cancel and preserve natural subsequent Tab order. Cover the shared New application / Add entry path where applicable, without general UX redesign. WI-069 is completed and is not reopened. WI-070 is referenced for independent validation, not a dependency: its completion must not block this fix. F2 ArrowDown remains an unclassified harness/control investigation, not this remediation's scope.

No production frontend, backend, provider, real data, billing or global framework work. Use mock-only data and network isolation. Do not change WI-069 or WI-070 status or scope. Original F1 evidence and limitations are recorded in [[records/record-wi-073-f1-intake]].

## Acceptance Criteria

- [ ] Before implementation, demonstrate actual failing regression coverage for pointer and keyboard creation/Cancel paths at each of 1440, 390 and 480 widths (six paths). Assert focus returns to the originating trigger and the next Tab follows natural order, including shared entry path where applicable.
- [ ] Make the minimum product fix and make those regressions pass. Preserve application counts, material events and effects, drafts, application/context isolation and no unexpected network activity; in particular blocked/Cancel/confirm counts remain 2→2→3 and events 0→0→1 in the applicable case.
- [ ] Obtain independent review; run focused tests, explicit frontend-draft check, root `npm run check` and clean-checkout `npm run pilot:rehearse` with pinned dependencies. Preserve red/green and gate evidence.
- [ ] Complete normal governed provider review, CI, PR squash, post-merge checks and main integration with evidence and closure gates. Do not claim release or live UAT from this mock-only fix.
- [ ] After integration, an independent WI-070 validator reruns affected cases and the full WI-070 acceptance against the integrated head. WI-073 completion alone does not complete WI-070.
