---
id: wi-053
title: Generate Draft Application Bundle Artifacts
summary: Produce the draft JD note, tailored resume note, role manifest, source summary, unsupported claims, and next action for one application bundle.
type: work-item
subtype: story
lifecycle: active
status: ready
status_reason: auto
priority: critical
estimated: 3
links:
  parent:
    - '[[050-deliver-job-search-application-funnel-slice]]'
  depends_on:
    - '[[052-enforce-generation-source-eligibility]]'
  reference:
    - '[[../templates/career/deliverable.md.tmpl]]'
    - '[[../templates/career/cover-letter.md.tmpl]]'
    - '[[../docs/career/canonical-domain-model]]'
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

- [ ] Generate a captured JD note from the Target/JD source with source URL/access metadata when available.
- [ ] Generate a tailored resume draft using only WI-052-approved inputs.
- [ ] Generate a role-level manifest linking the JD note and resume draft.
- [ ] Include sources used, unsupported claims, and recommended next action in the bundle output.
- [ ] Store artifacts in Vitae-controlled test/application storage, not the canonical Obsidian vault.
- [ ] Add focused tests for artifact names, manifest links, unsupported claims, and no-write behavior.

## Deliverables

- Draft artifact generation service.
- Synthetic fixture/test proving JD note, resume note, manifest, source summary, unsupported claims, and next action are produced.
- Updated frontend/API docs for the draft bundle flow.

## Acceptance Criteria

- [ ] Output includes all minimum Job Search artifacts for one opportunity.
- [ ] Manifest links the generated JD and resume draft.
- [ ] Unsupported or weak claims are visible in the bundle and not silently inserted into the resume.
- [ ] Artifact generation never writes to the canonical Obsidian vault path.
- [ ] Focused tests pass with synthetic data only.

## Relationships

- `parent`: WI-050
- `depends_on`: WI-052
- `references`: templates/career/deliverable.md.tmpl, templates/career/cover-letter.md.tmpl, docs/career/canonical-domain-model.md
