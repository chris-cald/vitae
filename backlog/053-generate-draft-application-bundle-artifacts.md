---
id: wi-053
title: Generate Draft Application Bundle Artifacts
summary: Produce the draft JD note, tailored resume note, role manifest, source summary, unsupported claims, and next action for one application bundle.
type: work-item
subtype: story
lifecycle: active
status: completed
status_reason: implemented
priority: critical
estimated: 3
actual: 3
completed_date: '2026-10-04'
commits:
  00054ba3b681ab2d9f0b193fc69dc97335135a1b: Generate draft application bundle artifacts
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[052-enforce-generation-source-eligibility]]'
  reference:
    - '[[../templates/career/deliverable.md.tmpl]]'
    - '[[../templates/career/cover-letter.md.tmpl]]'
    - '[[../docs/career/canonical-domain-model]]'
  evidence:
    - '[[record-wi-053-draft-bundle-artifacts-validation-and-review-passed]]'
tags:
  - afk
  - p0
  - deliverables
  - markdown
  - application-funnel
  - job-search
---

## Goal

Turn the guarded application-bundle data into draft markdown artifacts that match the Job Search stopgap deliverable contract.

## Background

The Job Search ChatGPT project requires each opportunity to produce a captured Job Description markdown note, tailored Resume markdown note, role-level deliverable manifest, and a brief summary of sources used, unsupported claims, and recommended follow-up. Vitae has canonical templates, but the product flow does not yet create these artifacts.

## Tasks

- [x] Generate a captured JD note from the Target/JD source with source URL/access metadata when available.
- [x] Generate a tailored resume draft using only WI-052-approved inputs.
- [x] Generate a role-level manifest linking the JD note and resume draft.
- [x] Include sources used, unsupported claims, and recommended next action in the bundle output.
- [x] Store artifacts in Vitae-controlled test/application storage, not the canonical Obsidian vault.
- [x] Add focused tests for artifact names, manifest links, unsupported claims, and no-write behavior.

## Deliverables

- Draft artifact generation service.
- Synthetic fixture/test proving JD note, resume note, manifest, source summary, unsupported claims, and next action are produced.
- Updated frontend/API docs for the draft bundle flow.

## Acceptance Criteria

- [x] Output includes all minimum Job Search artifacts for one opportunity.
- [x] Manifest links the generated JD and resume draft.
- [x] Unsupported or weak claims are visible in the bundle and not silently inserted into the resume.
- [x] Artifact generation never writes to the canonical Obsidian vault path.
- [x] Focused tests pass with synthetic data only.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-052
- `references`: templates/career/deliverable.md.tmpl, templates/career/cover-letter.md.tmpl, docs/career/canonical-domain-model.md
