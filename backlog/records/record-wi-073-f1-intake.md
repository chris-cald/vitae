---
$schema: schemas/work-management/frontmatter/record.json
id: record:wi-073-f1-intake
title: WI070-F1 cancel focus intake
summary: Bounded original mock-browser finding and provenance for WI-073.
type: record
subtype: test-result
lifecycle: active
status: ready
status_reason: recorded
---

## Recorded At

2026-11-13T07:32:29.010Z

## Outcome

failed (F1 focus return; partial evidence, not full acceptance)

## Observation

At 1440, 390 and 480, pointer and keyboard Cancel returned focus to BODY; the next Tab after keyboard cancellation targeted Open Catalog Development, not the originating creation trigger. Creation count evidence records 2→2→3 for blocked, canceled and confirmed actions, with material events 0→0→1. Mock-only per-case network verdicts reported no unexpected requests. This count pass excludes focus return and is not full creation acceptance; full lifecycles, native-select proof, shared-asset/snapshot scenarios and visual comparisons were not run in this packet. Harness changes after v3 were not re-reviewed as a new boundary.

Source HEAD `917003105f896baa1127a78608bc4dab9e0eff5c`, tree `7819d3bb64c6fbabfce34215061c3308ab95c33b`. The original packet came from `/tmp/vitae-wi070-case-evidence.HXUTys/` (a transient source); its complete byte-preserved copy is in the [Durable F1 packet](../../docs/evidence/wi-073-f1/README.md). Its `SHA256SUMS` SHA-256 is `6028b45ae662b57775fb3e9b8b3609866f1b4aeb95e0e453cdc7df5ff3d79f93`; verification passed at intake. Focus JSON SHA-256: 1440 `30bff080f328949f5efada5b91d329892ace3b8ca8cdefd7f294ec6fe507422d`, 390 `baebacccc4a1181efc66b3a68bba6828c7285f50163e4b206d44b2a67250dd96`, 480 `c1d07f46706d029020fa5150b3788e631c768ce65a0738e907586a7b8671484a`. Finalized network and served-byte ledgers are in those hash-bound case JSON files; the 1440 served hashes are HTML `31f416fe369832c2851ca17d14154a8e01582bc1d9905d058e9e97a57659835c`, CSS `8760e2ec21b840d11840731f924a8034581d9e3d0fc855d30c73b9ca5b9705b2`, JS `c14c34722c040603ba62fea275b80e28852e56ffdabd38f8839335592c2ab0a3`. Consult each case for its own finalized ledger.

WI-070's current, read-only matrix and progress are at `/Users/macos/dev/personal/chris-cald/vitae/.a5c/worktrees/wi-070/frontend-draft/evidence/wi-070/acceptance-matrix.md` and `progress.json`. They remain in progress, not acceptance. F2 ArrowDown is unclassified, outside WI-073.

## Subject References

- wi-073
- wi-070

## Artifact References

- docs/evidence/wi-073-f1/README.md
- docs/evidence/wi-073-f1/source-inventory.sha256
- docs/evidence/wi-073-f1/packet/README.txt
- docs/evidence/wi-073-f1/packet/SHA256SUMS
- docs/evidence/wi-073-f1/packet/focus/case-1440.json
- docs/evidence/wi-073-f1/packet/focus/case-390.json
- docs/evidence/wi-073-f1/packet/focus/case-480.json
