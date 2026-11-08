---
id: wi-070
title: Validate Connected Mock Dual Lifecycles
summary: Independently validate WI-069 mock journeys, visual intent, isolation and release gates.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: prioritized
priority: critical
estimated: 5
links:
  reference:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[069-complete-connected-mock-dual-lifecycles]]'
tags:
  - afk
  - frontend
  - mock-only
  - validation
  - privacy
---

# Validate Connected Mock Dual Lifecycles

Independent validator, not WI-069 implementer, must read WI-069 acceptance verbatim and verify every criterion against artifacts. Use a dedicated worktree. No production code, provider/vault/real data access, push or stash operations. WI-050 and WI-057 remain HITL live UAT, not completed by mock evidence.

## Parent / Context

This authorized independent mock-validation scope supports WI-050. The supported metadata reference preserves that context; it is not a hierarchy or completion of WI-050. Original authorization: `user-authorized-independent-mock-validation`.

## Acceptance Criteria

- [ ] Real Chromium journeys at desktop, 390 and 480 widths exercise pointer and keyboard focus, two independent applications, guided creation/cancel, required-field blockers, every canonical transition and event deduplication.
- [ ] Exercise Catalog priming, criterion evidence, episode formalization, current-revision publication review, reviewed discard, application/surface-specific placement, gap remediation return, eligibility exclusions, grounded projections, unsupported bundle claims, selective revision invalidation and immutable submitted snapshots.
- [ ] Verify Today, Sources, Decisions, Deliverables and Activity derive consistent shared state; no generic Mock action recorded proof or false success.
- [ ] Capture screenshots of blocked and allowed gates and cross-flow. Compare genuinely with live read-only Figma channel 7kka page 0:1 board26:754 and frames21:178,21:276,21:355,21:428,21:506,21:587,29:969. Document intentional differences; no unsupported pixel parity claim. Entity types are not sequential statuses; board uses readiness/disposition/support/validation gates.
- [ ] Prove mock-network isolation with browser request evidence; local tooling/assets only.
- [ ] Run focused tests, explicit npm --prefix frontend-draft run check, root npm run check and clean-checkout npm run pilot:rehearse using pinned dependencies. Preserve logs, screenshots and inspectable evidence manifest.
- [ ] Independent acceptance/review identifies failures honestly. Record evidence and scoped commits with supported DV transition/finalize/claim release. Main integration only after evidence/review/closure gates, fetch origin before normal merge, rerun gates, no push or stash changes.

WI-069 owns implementation; report remediation to orchestrator rather than silently implementing it here. Missing Figma access or failed validation is a blocker, not permission to fabricate evidence.
