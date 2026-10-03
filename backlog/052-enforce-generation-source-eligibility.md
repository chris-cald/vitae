---
id: wi-052
title: Enforce Generation Source Eligibility
summary: Add the guardrail that allows application deliverable generation only from validated Catalog/Projection material plus current target context.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: auto
priority: critical
estimated: 2
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[051-add-application-bundle-record-slice]]'
  reference:
    - '[[../docs/career/canonical-domain-model]]'
    - '[[../schemas/career/catalog-asset.schema.json]]'
    - '[[../schemas/career/projection.schema.json]]'
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

- [ ] Add a generation-input resolver with explicit allowed and denied source classes.
- [ ] Require validated CatalogAsset/Projection status for reusable facts or wording.
- [ ] Permit the current JD/Target as targeting context, not as proof of candidate experience.
- [ ] Return unsupported/weak requirements as structured gaps instead of fabricating content.
- [ ] Add tests covering allowed validated sources and denied Seeds/Tests/Work Orders/drafts.

## Deliverables

- Generation-input resolver or equivalent service seam.
- Denylist/allowlist tests with synthetic fixtures.
- Updated docs for generation authority.

## Acceptance Criteria

- [ ] Seeds, Tests, Work Orders, evidence notes, and draft artifacts cannot contribute facts or polished wording.
- [ ] Unsupported claims are surfaced as gaps/questions on the bundle, not hidden in generated text.
- [ ] Resolver output is PII-safe for logs and runtime telemetry.
- [ ] Existing job-fit analysis remains usable for gap analysis without becoming generation authority.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-051
- `references`: docs/career/canonical-domain-model.md, schemas/career/catalog-asset.schema.json, schemas/career/projection.schema.json
