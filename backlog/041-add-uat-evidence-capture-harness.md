---
id: wi-041
title: Add UAT Evidence Capture Harness
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: accepted
priority: high
estimated: 2
links:
  parent:
    - '[[040-complete-production-hardening-and-temporal-adoption-decision]]'
  depends_on:
    - '[[027-adopt-privacy-safe-durable-temporal-execution]]'
  implements:
    - '[[../docs/uat-readiness]]'
tags:
  - uat
  - temporal
  - privacy
  - evidence
---

## Goal

Provide a small local harness for collecting and validating full UAT evidence without faking live Temporal, provider, browser, or canonical-vault results.

## Background

WI-040 requires an artifact bundle containing Temporal history inspection, retry/restart/cancel/human-wait evidence, provider/browser UAT result, and canonical-vault no-write proof. The harness should make those artifacts machine-checkable while keeping raw career/model content out of repository fixtures and logs.

## Tasks

- Add a canonical-vault inventory helper that records hashed relative path, size, and mtime metadata only.
- Add an inventory diff helper that fails if canonical vault files are added, modified, deleted, renamed, or rewritten.
- Add a Temporal history/privacy inspection helper for exported synthetic history JSON.
- Reject raw resume/JD/prompt/completion/secret/reviewer prose, filenames, URLs, vault paths, and source locators in UAT evidence artifacts.
- Document that the harness validates evidence; it does not generate live Temporal/provider/browser evidence by itself.

## Deliverables

- Focused tests for inventory diff and Temporal history privacy inspection.
- Minimal implementation used by future live UAT runs.
- Updated UAT readiness docs referencing the harness.

## Acceptance Criteria

- [x] Canonical-vault before/after inventory diff reports no changes for unchanged trees and fails on add/modify/delete.
- [x] Temporal history inspection passes opaque synthetic IDs and fails on forbidden content/field names.
- [x] Tests use temporary synthetic files only and never touch `~/Obsidian Vaults/loft/1 Projects/Job Search/`.
- [x] Doc-Vader validation passes.

## Test and Evidence

- `cd backend && .venv/bin/python -m pytest -q tests/test_uat_evidence.py` — passed.
- `dv backlog validate --dir backlog --fail-on error` — passed.

## Exclusions

- No live Temporal server, model provider, browser automation, or canonical-vault access is required by this item.
- No raw UAT evidence artifacts are committed.

## Relationships

- `parent`: WI-040
- `depends_on`: WI-027
- `implements`: docs/uat-readiness
