---
id: wi-070
title: Validate Connected Mock Dual Lifecycles
summary: Independently validate synthetic dual-flow behavior, browser access, design inspiration and guarded main integration.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: awaits-connected-mock-implementation
priority: critical
estimated: 3
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[069-complete-connected-mock-dual-lifecycles]]'
tags:
  - afk
  - frontend
  - validation
  - mock-only
---

# Validate Connected Mock Dual Lifecycles

Independent validation child for WI-069, not a second implementation of its intertwined features. Use a dedicated worktree rooted at the integrated reviewed implementation; independent reviewer must differ from implementer. Read WI-069 original criteria verbatim. Scope is the local synthetic `frontend-draft/` reference application only. No production APIs/persistence, real data, push, stash changes, unknown worktree deletion or full MVP/live-UAT completion claims.

## Acceptance Criteria

- [ ] Independently review exact implementation revisions against every original WI-069 criterion. Findings receive test-first remediation and re-review; tests assert domain outcomes rather than generic notices or button existence.
- [ ] Real Chromium pointer and keyboard journeys cover create/cancel, blocked and allowed gates, review, submission with date/channel, interview, follow-up, outcome and withdrawal; navigation/cancel/edit emit no material events, repeated confirmation emits no duplicate, and two application records stay isolated.
- [ ] Real Chromium covers application gap -> Catalog priming/substantiation/publication -> original application/surface return -> eligible projection -> inspectable resume/communication bundle -> unsupported-claim correction -> current-revision review. Verify selective staleness and immutable submitted snapshots.
- [ ] Desktop plus 390px and 480px layouts retain essential controls, readable expanding details/forms, visible keyboard focus and sensible focus after dismissal. Capture synthetic screenshots for collapsed/expanded cards, blocked/allowed gates, bundle review and cross-flow return. Assert no external networking or backend/API requests; allow only local assets/tooling.
- [ ] Record genuine read-only Figma-to-screen comparison with intentional differences. Verified board26:754 work columns are Evidence inbox, Triage, Build support, Ready to reuse; entity kinds are not statuses, and grounded Projections are not factual evidence. Inspect page0:1 and frames application21:178, decision21:276, source21:355, deliverable21:428, timeline21:506, catalog21:587, evidence placement29:969. Use live reference or honestly sourced exports/cached verified snapshots; a transport failure remains an explicit visual-evidence gap, never fabricated parity. User requests inspiration, not pixel equality.
- [ ] Focused/domain/DOM tests, explicit draft check, browser gates, root check and clean-checkout pilot pass at recorded SHAs. Root gates do not replace draft gates. Record actual commands, outcomes, warnings, evidence and skipped scope.
- [ ] After independent approval, fetch origin, reconcile any real divergence explicitly, perform normal guarded local integration into main, and validate the integrated result. Preserve user stash/unknown worktrees and record exact committed SHAs and cleanup disposition. No push. Completed-active local closure is distinct from provider/merged-PR archive; do not call provider finalize without real publication evidence.

## Evidence and authority

User authorizes scoped work-item provisioning, implementation/evidence/closure commits and normal main merge after gates. WI-068 is completed foundation024f508 and must not be reopened or represented as unverified work. WI-050/WI-057 remain outside closure. Do not change original acceptance text to fit implementation. Review reports and synthetic screenshots may be tracked in scoped docs/artifacts, never secrets or private runtime state.

The installed Babysitter-DV process is under the original repository `.a5c/processes/babysitter-dv/process.mjs`. Use runtime CLI `/Users/macos/Library/pnpm/doc-vader-runtime/dist/cli/doc-vader.js`. Preserve immutable input and failed evidence if lifecycle transitions make final replay mismatch; supported append-only administrative seal is only available after verified complete local delivery, not as a product gate substitute.
