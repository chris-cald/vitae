---
$schema: schemas/work-management/frontmatter/record.json
id: record:wi-065-deterministic-integration-validation
title: WI-065 deterministic integration validation
summary: WI-065 deterministic integration validation
type: record
subtype: test-result
lifecycle: active
status: ready
status_reason: recorded
---

## Recorded At

2026-11-06T11:44:49.259Z

## Outcome

passed

## Observation

Live integration tests are explicit opt-in and every live HTTP request has a finite timeout. The repository check and pilot rehearsal pass without contacting a live backend.

## Subject References

- wi-065
- claim:c3c4afb416379fcff4bd550ac893e8846362cc906a0752dea88c2b35864d5e15
- wi:065

## Notes

- npm run check: 125 passed, 5 skipped.
- npm run pilot:rehearse passed.

## WI-071 correction addendum

The original title and summary were both `WI-064 deterministic integration validation`, and the original subject included `wi:064`. Those prior historical statements are retained in this addendum; the metadata and subject above are explicitly corrected to WI-065 (live-integration opt-in), not WI-064 navigation. The earlier passing commands did not prove database isolation: the always-run upload regression still initialized and wrote through the configured database. WI-071 supersedes that safety assumption with synthetic connection-trap and per-test cleanup validation; this does not retroactively change the earlier command results.
