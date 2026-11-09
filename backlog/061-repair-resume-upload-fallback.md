---
id: wi-061
title: Repair Resume Upload Fallback
summary: Ensure resume-file uploads use the explicit local parser fallback when LiteLLM is unavailable.
type: work-item
subtype: bug
lifecycle: active
status: completed
status_reason: completed
priority: high
estimated: 1
actual: 2
completed_date: '2026-11-04'
links:
  evidence:
    - '[[record-clean-validation-passed]]'
tags:
  - afk
  - backend
  - resume
  - upload
  - regression
---

# Repair Resume Upload Fallback

## Scope

Repair the `POST /api/v1/resume/file` failure in the integration upload path. Keep model-provider failures behind the existing explicit local parse fallback and do not log raw uploaded documents, prompts, or model responses.

## Acceptance Criteria

- [x] The real upload failure seam has a deterministic regression test.
- [x] With local fallback explicitly enabled, an unavailable LiteLLM provider does not make a valid resume-file upload return 500.
- [ ] Extraction and schema errors remain safely translated to the existing API error response. (Historical completion claim withdrawn by the WI-071 addendum below.)
- [x] The focused regression test and `npm run check` pass.

## Validation

- `cd backend && .venv/bin/python -m pytest -q tests/test_integration_full.py::test_resume_upload_and_list`
- `npm run check` — 130 backend tests plus 16 frontend tests and production build passed.

## WI-071 scope qualification addendum

WI-061 added regression coverage for the existing explicit local parse fallback (already implemented in `bb73c89`); it did not introduce a new production runtime repair. Its historical validation above did not establish database isolation. WI-071 changes only tests/fixtures and targeted evidence, exercising that same fallback against disposable resources.

The original extraction/schema criterion was marked `[x]`; that historical assertion is preserved here but withdrawn above. PR20 comment `4507514686` was verified against current source: `extract_pdf_text_util` returns parser exceptions as text (`backend/src/services/utils.py`), and `ResumeService.process_resume` persists extracted content before falling back after provider failure. Thus the synthetic PDF-header upload returning 200 does not prove extraction failures are translated into API errors, nor comprehensive schema-error handling. The criterion remains unverified/open; no production parser/fallback repair is included in WI-071.
