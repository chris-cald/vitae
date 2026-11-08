---
id: wi-071
title: Isolate Mock Prerequisite Test Resources
summary: Prevent the synthetic upload regression from accessing configured databases and qualify historical prerequisite evidence before publication.
type: work-item
subtype: bug
lifecycle: active
status: ready
status_reason: prioritized
priority: critical
estimated: 2
links:
  reference:
    - '[[050-deliver-job-search-application-funnel-slice]]'
    - '[[061-repair-resume-upload-fallback]]'
    - '[[065-make-live-integration-tests-opt-in]]'
    - '[[067-make-sources-and-evidence-actionable]]'
tags:
  - afk
  - privacy
  - test-safety
  - mock-only
---

# Isolate Mock Prerequisite Test Resources

## Intake and authorization

Independent prerequisite reviewer session09745b5c-0fe1-4729-8f06-6e62a7ef9e8c found that backend/tests/test_integration_full.py's always-run TestClient upload regression isolates uploaded files but initializes and writes through the configured database. User explicitly authorized narrowly tracked test-only database/upload/temp isolation plus historical evidence corrections. No production backend runtime changes, real database access, provider calls, force-push or stash changes. PR20 and PR21 remain blocked until revised prerequisite source is independently approved and actual CI passes.

## Acceptance Criteria

- [ ] Add a safe red-first regression proving the upload test cannot initialize, connect to or mutate an environment-configured database. Use only synthetic traps/temp fixtures; never inspect real connection values or data.
- [ ] Isolate both database and upload/temp resources across app startup, service writes and cleanup; temporary synthetic rows/files must not escape test scope. Exercise actual upload/list regression against the isolated seam.
- [ ] Change tests/fixtures only; no production backend/frontend runtime changes. Read backend/AGENTS.md before editing. Do not run the unsafe original integration test before isolation safeguards exist.
- [ ] Preserve original review/failure and red-green receipts. Qualify historical WI067 Sources evidence as earlier snapshots superseded by later code, WI061 as testing existing fallback, and WI065 mislabel as a correction/addendum retaining history. Do not reopen unrelated WI058 or fabricate prior validation.
- [ ] Focused safety tests, relevant backend tests, root npm run check and explicit draft gate pass with pinned dependencies; independent prerequisite reviewer reapproves exact revised PR20 source. Clean-checkout rehearsal remains required for delivery.
- [ ] Publish through scoped normal commits/branches and real PR links only. No force or published-history rewrite. Existing zero-net WI058 history is not permission for new repairs; document ancestry/net scope rather than silently republishing it as new work.

## Delivery boundary

This is a required safety prerequisite to the already authorized dual-lifecycle delivery, not a production feature or live UAT. WI050/WI057 remain HITL. Parent owns Babysitter orchestration, publisher selection, independent review, real provider/CI gates and closure. Record actual measured effort from evidence rather than inventing an estimate as actual.
