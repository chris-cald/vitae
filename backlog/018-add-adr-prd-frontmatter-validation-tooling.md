---
id: wi-018
title: Add ADR PRD Frontmatter Validation Tooling
summary: Add local validation for canonical ADR and PRD frontmatter against the new documentation JSON Schemas.
type: work-item
subtype: task
lifecycle: active
status: ready
status_reason: auto
priority: medium
estimated: 3
links:
  reference:
    - '[[../docs/documentation-standards]]'
    - '[[../schemas/docs/adr.schema.json]]'
    - '[[../schemas/docs/prd.schema.json]]'
tags:
  - documentation
  - schema
  - validation
  - tooling
---

## Goal

Make the canonical ADR and PRD formats enforceable with local validation.

## Background

The ADR and PRD templates now include JSON-schema-backed frontmatter optimized for rendered Markdown and LLM consumption. The repo currently has JSON schemas and templates, but no validation command for Markdown frontmatter.

## Tasks

- [ ] Choose a lightweight validation approach for Markdown frontmatter and JSON Schema draft 2020-12.
- [ ] Add a script or command that validates ADR and PRD frontmatter against declared schemas.
- [ ] Add positive fixtures using the existing PRD and ADR files.
- [ ] Add at least one negative fixture or test for a missing required field.
- [ ] Document the validation command in the documentation standards.

## Deliverables

- Frontmatter validation script or command.
- Fixtures or tests for valid and invalid documents.
- Documentation update with command usage.

## Acceptance Criteria

- [ ] ADR and PRD frontmatter validation runs locally.
- [ ] Existing canonical PRD/ADR files pass validation.
- [ ] Missing required fields fail validation with actionable output.
- [ ] `git diff --check` and the new validation command pass.

## Relationships

- `depends_on`: none
- `references`: `docs/documentation-standards.md`
