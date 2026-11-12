---
id: wi-071
title: Isolate Mock Prerequisite Test Resources
summary: Prevent the synthetic upload regression from accessing configured databases and qualify historical prerequisite evidence before publication.
type: work-item
subtype: bug
lifecycle: active
status: completed
status_reason: completed
priority: critical
completed_date: '2026-11-09'
commits:
  f17329135a1a175cd1cb4c9484ab7775f07b5308: Independently reviewed test-only DB/upload isolation and historical evidence corrections, merged via PR20
links:
  reference:
    - '[[050-deliver-job-search-application-funnel-slice]]'
    - '[[061-repair-resume-upload-fallback]]'
    - '[[065-make-live-integration-tests-opt-in]]'
    - '[[067-make-sources-and-evidence-actionable]]'
  pull_requests:
    - https://github.com/chris-cald/vitae/pull/20
  evidence:
    - '[[record-wi-071-provider-merged]]'
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

- [x] Add a safe red-first regression proving the upload test cannot initialize, connect to or mutate an environment-configured database. Use only synthetic traps/temp fixtures; never inspect real connection values or data.
- [x] Isolate both database and upload/temp resources across app startup, service writes and cleanup; temporary synthetic rows/files must not escape test scope. Exercise actual upload/list regression against the isolated seam.
- [x] Change tests/fixtures only; no production backend/frontend runtime changes. Read backend/AGENTS.md before editing. Do not run the unsafe original integration test before isolation safeguards exist.
- [x] Preserve original review/failure and red-green receipts. Qualify historical WI067 Sources evidence as earlier snapshots superseded by later code, WI061 as testing existing fallback, and WI065 mislabel as a correction/addendum retaining history. Do not reopen unrelated WI058 or fabricate prior validation.
- [x] Focused safety tests, relevant backend tests, root npm run check and explicit draft gate pass with pinned dependencies; independent prerequisite reviewer reapproves exact revised PR20 source. Clean-checkout rehearsal remains required for delivery.
- [x] Publish through scoped normal commits/branches and real PR links only. No force or published-history rewrite. Existing zero-net WI058 history is not permission for new repairs; document ancestry/net scope rather than silently republishing it as new work.

## Delivery boundary

This is a required safety prerequisite to the already authorized dual-lifecycle delivery, not a production feature or live UAT. WI050/WI057 remain HITL. Parent owns Babysitter orchestration, publisher selection, independent review, real provider/CI gates and closure. The user subsequently authorized omission of both estimated and actual effort; the real composed-schema regression verifies omission without changing other gates. No values are invented.

## Provider-backed completion

- 2026-11-09: Closed as completed with evidence in backlog/audit/auditing-backlog-report.json.
- The global audit is NOT green:86 legacy schema-load errors are preserved. Clean-base/candidate diagnostics are identical; scoped WI069/070/071 lint and composed-schema tests pass under DV TTR guidance.
- Independent exact-source approvalf173291 and consolidated confirmation, provider approval058c462, required CI and real PR20 squashd422e0c are linked in record-wi-071-provider-merged. Clean postmerge root/draft/schema/pilot gates pass. Earlier intake blocking statements are historical, not current provider state.
- Completed-active only: archive deferred because finalizeWorkItem unconditionally demands actual despite optional-effort schema. No invented effort or archive bypass. WI070 browser/Figma acceptance and WI050/WI057 live UAT remain separate.

## Closure review correction — 2026-11-09

The identical/zero-added comparison above applies ONLY to the earlier effort-metadata migration, not current unpublished closure. Two new canonical records produce 86 → 88 schema-load errors; see `docs/evidence/postmerge-closure/delta.json` and `docs/evidence/postmerge-closure/RECOVERY.md`. Both new records pass authoritative direct schema lint, but that does not waive the global loader gate. Closure publication and WI070 selection remain on the verified narrow WAIT until the upstream fix is merged, installed and verified. Test-count precision: 9 doc-pack tests passed, including four authoritative work-item schema tests—not nine composed-work-item tests. Original receipts remain unchanged.

## Superseding resolver verification

The preceding loader WAIT is historical. Installed resolver verification at `de10e6d1531b5943d46cf1291a8e00fb4f1d75a3` superseded that narrow WAIT for both WI069 and WI071: the comparable published base and closure candidate had zero schema-load errors and identical 59 historical schema-violation files. See the matching verification in `069-complete-connected-mock-dual-lifecycles.md` and `docs/evidence/postmerge-closure/RECOVERY.md`. This does not claim WI070 browser/Figma validation, WI072 closure, a release, or delivery-effect completion; independent review, CI, and dependency gates remain required.
