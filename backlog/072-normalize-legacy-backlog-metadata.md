---
id: wi-072
title: Normalize Legacy Backlog Metadata
summary: Repair the 59-file historical schema baseline with factual metadata-only normalization and regression coverage.
type: work-item
subtype: bug
lifecycle: active
status: completed
status_reason: completed
priority: critical
completed_date: '2026-11-12'
links:
  reference:
    - '[[069-complete-connected-mock-dual-lifecycles]]'
    - '[[070-validate-connected-mock-dual-lifecycles]]'
    - '[[071-isolate-mock-prerequisite-test-resources]]'
tags:
  - afk
  - metadata-only
  - validation
---

# Normalize Legacy Backlog Metadata

## Explicit authorization

User selected `repair-metadata`: repair the exact historical malformed metadata, including omission of historical estimated/actual fields rather than inventing missing hours. This extends the earlier three-item effort policy only as needed for these repairs. Preserve all bodies, documented effort/evidence in prose, and historical facts. No product/runtime scope expansion, force push, stash changes, fabricated effort, schema masking or validation waiver. Existing scoped publication and required provider squash authorization applies.

## Baseline and boundaries

Installed DV runtime de10e6d1531b5943d46cf1291a8e00fb4f1d75a3 with explicit installed schema-map, ci profile and fail-on-error reports 59 violating files on both published source058c462 (tree=d422e0c) and closurecandidate98e144c, zero schema-load errors and zero introduced violations. The older unintegrated foundation's 60-file report is not this baseline. WI069/070/071 and their two new records already pass; do not broaden corrections to valid fields or erase factual narrative. Changes must be explained by exact diagnostics and canonical schema semantics.

## Acceptance Criteria

- [x] Preserve exact base audit, command, exit status, runtime identity and file/field classification; identify all 59 files without conflating older 60-file evidence.
- [x] Add red-first regressions per error category using authoritative schemas: missing actual conditional, unknown link keys, empty depends_on, malformed supporting references, invalid record subtype and any remaining status/lifecycle schema failures.
- [x] Apply smallest mechanical metadata-only corrections; omit necessary estimated/actual fields per user decision, normalize link names/values and extension subtypes while preserving relationships and all markdown bodies byte-for-byte. Return genuine semantic ambiguities to parent rather than guessing.
- [x] Achieve real global audit zero schema-load errors, zero schema violations, zero parse/duplicate/unresolved-link errors and process exit zero with installed schema-map/profile ci/fail-on-error; preserve full report.
- [x] Focused tests, relevant doc-pack tests, explicit draft check, root check and clean-checkout pilot rehearsal pass. Independent reviewer verifies unchanged bodies/product source, scope and current-head evidence.
- [x] Publish through real PR/CI/provider review and required squash; preserve source-to-squash mappings, supported closure and integration evidence. Do not claim WI070 acceptance, WI050/WI057 live UAT or archive gate completion from metadata repair.

## Delivery

Use dedicated owned worktree and installed Babysitter-DV process with publisher selection and frozen inputs. Parent owns orchestration, review, publication, closure and integration. Missing WI069 claim is a documented nonblocking no-op, not a reason to reconstruct a claim. Archival remains separately constrained by actual-effort runtime policy; do not invent values.
