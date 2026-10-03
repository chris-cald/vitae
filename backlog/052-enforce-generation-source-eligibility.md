---
id: wi-052
title: Enforce Generation Source Eligibility
summary: Add the guardrail that allows application deliverable generation only from validated Catalog/Projection material plus current target context.
assignee: pi-babysitter
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: implemented
priority: critical
estimated: 2
actual: 2
completed_date: '2026-10-03'
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[051-add-application-bundle-record-slice]]'
  reference:
    - '[[../docs/career/canonical-domain-model]]'
    - '[[../schemas/career/catalog-asset.schema.json]]'
    - '[[../schemas/career/projection.schema.json]]'
  evidence:
    - '[[record-wi-052-source-eligibility-validation-and-independent-review-passed-after-remediation]]'
tags:
  - afk
  - p0
  - generation
  - provenance
  - source-eligibility
  - privacy
---

## Goal

Prevent the product from generating resume or communication claims from non-authoritative Career Knowledge sources.

## Background

The Job Search ChatGPT process allows validated Catalog artifacts, validated Projections, the current job description as targeting context, and existing manifests as boundaries. It excludes Seeds, Tests, draft Episodes/Projections, evidence notes, Work Orders, unsupported historical resume wording, and testing artifacts as factual or wording sources.

## Tasks

- [x] Add a generation-input resolver with explicit allowed and denied source classes.
- [x] Require validated CatalogAsset/Projection status for reusable facts or wording.
- [x] Permit the current JD/Target as targeting context, not as proof of candidate experience.
- [x] Return unsupported/weak requirements as structured gaps instead of fabricating content.
- [x] Add tests covering allowed validated sources and denied Seeds/Tests/Work Orders/drafts.

## Deliverables

- Generation-input resolver or equivalent service seam.
- Denylist/allowlist tests with synthetic fixtures.
- Updated docs for generation authority.

## Acceptance Criteria

- [x] Seeds, Tests, Work Orders, evidence notes, and draft artifacts cannot contribute facts or polished wording.
- [x] Unsupported claims are surfaced as gaps/questions on the bundle, not hidden in generated text.
- [x] Resolver output is PII-safe for logs and runtime telemetry.
- [x] Existing job-fit analysis remains usable for gap analysis without becoming generation authority.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-051
- `references`: docs/career/canonical-domain-model.md, schemas/career/catalog-asset.schema.json, schemas/career/projection.schema.json
