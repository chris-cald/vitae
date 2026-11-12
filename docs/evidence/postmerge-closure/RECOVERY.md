# Postmerge closure recovery — 2026-11-09

PR20 is genuinely merged at `d422e0c98d1ab523102c25baa0611b9487bb3709` from approved source `058c46247b6393da005b4160fdf018132cc0ce5b`. Local main `4ed9adb71451a9084e82450303c6757cc5e446bc` has exactly the same tree; explicit draft/schema/root/pilot postmerge gates passed.

Local closure commits `8c288fd` (WI069) and `5fa6d98` (WI071) contain supported completed-active transitions and genuine PR evidence. They are **unpublished and not integrated into main**. Their delivery effects remain pending. Do not interpret local terminal metadata as completed end-to-end delivery.

## Blocking schema gate

The pre-closure real audit in `backlog/audit/auditing-backlog-report.json` contains 86 legacy schema-load errors. Adding two canonical records through `dv record create` produces 88 errors, zero violations. `after-records-audit.json` preserves the actual report. `delta.json` compares diagnostics after normalizing only checkout roots and identifies exactly the two new record paths. `two-records-schema-lint.txt` demonstrates both pass the installed authoritative direct schema linter. This is **not** a global validation pass or a closure publication exception.

Parent subsequently verified DV TTR's explicit user WAIT decision in its separate direct session. Its narrow scope prohibits closure publication relying on the two new record loader errors and WI070 selection until WI-60527 eliminates the issue; other work may continue. WI-60527 has active isolated writer session prefix `82ac5d69-a05a-423`, covering external-consumer reproduction, schema URI routing and schema-load-error fail-on-error semantics through TDD/review/CI/PR. Resume only after a merged and installed fix and the same global audit no longer introduces those two canonical-record loader errors. DV TTR owns notification; do not poll. Do not copy/mask schemas, remove canonical schema references, or whitelist errors. The earlier effort-only migration zero-added proof remains valid for its original scope.

## Claim reconciliation

DV TTR's safe preflight reports `missing` for the original WI069 receipt in BOTH the dedicated WI069 runtime store and the foundation workspace runtime store. No release was invoked. No token was exposed, and no claim was reconstructed. Record this as absent-at-release, not successfully released. Preserve the original protected receipt. Parent relayed DV TTR guidance: use a supported missing-claim reconciliation policy if one exists; otherwise release is a no-op, NOT a terminal gate. Do not retain an invented claim blocker or reconstruct a claim to release it.

## Remaining work

- Install/verify the upstream schema-loader fix and rerun actual reports, scoped lint and composed-schema tests.
- Preserve sanitized absent-at-release evidence; no release is required for the missing claim under TTR guidance, and no successful release is claimed.
- Independently review and publish closure evidence through current-head CI/provider gates using required squash policy.
- Complete pending delivery effects only after actual closure/integration gates.
- Publisher-select WI070 in a dedicated worktree/run, then genuine full desktop/390/480 pointer/keyboard/focus, two-application lifecycle, network-isolation and Figma comparison acceptance.
- Archive remains separately deferred: finalize still unconditionally requires numeric actual contrary to the user-authorized optional-effort schema. Do not invent effort or bypass provider/lock gates.
- Preserve sealed WI068, all source refs/journals, unrelated local artifacts and stash. WI050/WI057 live UAT remain HITL.

## Superseding verified recovery — 2026-11-11

The loader is installed at de10e6d; `resolved/` preserves the exact published-base/closure comparison showing zero added diagnostics and 59 historical violations. TTR cleared the narrow loader WAIT. The user then separately authorized WI072 metadata normalization to eliminate the historical baseline rather than grandfather it. Independently reviewed repair preserves all 59 historical bodies and produces a real zero-error global audit, now stored at `backlog/audit/auditing-backlog-report.json`. The old 86-error snapshot remains at `pre-records-audit.json`; original delta path meanings reflect their recording time and are not rewritten.

At source3370356, clean pinned setup, 22 doc-pack tests, 27 draft tests/build, unmodified root check, unmodified pilot rehearsal and unmodified backlog validation all passed with the documented external authority environment. Independent exact-source review approved the immutable proof and explicit-map wrapper; receipts are in `docs/evidence/wi-072/`. PR22 carries repair and PR20-backed closure evidence. Provider review/CI/merge, delivery-effect completion and full independent WI070 acceptance remain pending; this is not a full-scope completion claim. Missing claim remains a nonblocking no-op. Archive remains separately deferred.

## Current PR23 recovery — 2026-11-12

PR23 is now provider-merged. The retained provider receipt `/tmp/vitae-pr23-provider-merge.json` has SHA-256 `a47f5870c32a41afab109bc6705c04060057fd5307ff1728fe13cfe3a639c0ab` and records head `77c60af6e9469ab637e0ef85a5e2f701460a488a`, state `MERGED`, timestamp `2026-11-12T15:55:22Z`, and squash merge `04e143ee0e385a43037fa56ee9872ea2246fd4c8`. The authorized delivery record further establishes PR23's current approval, zero discussion threads, and successful CI; this document makes no stronger provider or release claim.

The clean detached postmerge validation was run at `04e143ee0e385a43037fa56ee9872ea2246fd4c8`. Its retained log `/tmp/vitae-pr23-postmerge-clean.log` has SHA-256 `e06b698f4ef966c35c3b3c24afc4036e3e7009408a19e9107f00b54950971000` and records the explicit draft 27-test and build checks, doc-pack wrapper 31, schema, root check, pilot rehearsal, global-zero audit, and diff checks as passing (job 332). The authoritative live audit is regenerated from the current checkout at `backlog/audit/auditing-backlog-report.json`; it supersedes only that generated report.

`pre-records-audit.json`, `after-records-audit.json`, `delta.json`, `resolved/*`, `two-records-schema-lint.txt`, and the WI069 raw evidence are historical, time-scoped reports. Their reported failures or diagnostic counts are not claims about the current checkout. They are preserved byte-for-byte from source except the authoritative live audit named above. WI069 and WI071 remain supported completed-active PR20-backed records; this recovery does **not** claim WI072 closed, WI070 validated, any release, archive completion, or delivery-effect completion. The missing TTR claim remains an authorized no-op, and the deferred archive's actual-effort defect remains unaltered.

### Split-B source provenance

The authority for the exact deferred set is the committed `docs/evidence/wi-072/split-a-manifest.json` at base `04e143ee0e385a43037fa56ee9872ea2246fd4c8`, not a planning-report target header. It lists exactly 20 unique Split-B paths (two present-and-restored and eighteen absent-and-restored against that base). All source bytes remain addressable at immutable commit `e7b84ddf3521cc66506ea4cf17f3921fb2abdc23`; the compact Git blob mapping is:

```text
backlog/069-complete-connected-mock-dual-lifecycles.md e2e85b6e82b1f2921724c7252713634ad87fc616
backlog/071-isolate-mock-prerequisite-test-resources.md dc8d864523bb26a12007ca6b451344ef38c40ef0
backlog/audit/auditing-backlog-report.json ac9a26bbf322897691df850f34538cc5f318a162
backlog/records/record-wi-069-provider-merged.md 0059f02285fc91ac8acc2f1115c9c4f20642bbab
backlog/records/record-wi-071-provider-merged.md ea256d37e004544fbf04aa8945d82d59feb092cb
docs/evidence/postmerge-closure/RECOVERY.md ed06ef25ec4d03a1e5da9ee1c964108075bbc0f8
docs/evidence/postmerge-closure/after-records-audit.json c90351dadf967e78d669188d1901a2e6efd52711
docs/evidence/postmerge-closure/delta.json fcadcf206784f4540945f894fbc5cdbfd45c560c
docs/evidence/postmerge-closure/lint-log-normalization.json 77f17605a43719b707ae435b9a4e39f75bf20e05
docs/evidence/postmerge-closure/pre-records-audit.json 34aae57eba26896279707873177df7adb092c8de
docs/evidence/postmerge-closure/resolved/base.exit d00491fd7e5bb6fa28c517a0bb32b8b506539d4d
docs/evidence/postmerge-closure/resolved/base.json 646430fd3c7f94db6a575b9410732effa854364a
docs/evidence/postmerge-closure/resolved/base.stderr 5496e4135a1b618e172eab58d7a1a84f3a3b0d7c
docs/evidence/postmerge-closure/resolved/candidate.exit d00491fd7e5bb6fa28c517a0bb32b8b506539d4d
docs/evidence/postmerge-closure/resolved/candidate.json 409afd21faf49166597c1cd4530adc5c5190affb
docs/evidence/postmerge-closure/resolved/candidate.stderr 28aed18e9cc2e6c1a8a960f22505e0506b599d77
docs/evidence/postmerge-closure/resolved/delta.json d83d014949ec3ae998e5709c7858ab47a90d9517
docs/evidence/postmerge-closure/two-records-schema-lint.txt 6ef3ced9a002de054363d4ca10d9e496fa40e11c
docs/evidence/wi-069/postmerge-validation.txt 9c085dc411eade40734d234543b758c2e93fe2cd
docs/evidence/wi-069/pr20-provider-merge.json 3b6707d0168c2f6a4150ab9cdc44dd0b1d017f27
```

The independent restoration check resolves these objects directly from `e7b84ddf`; this mapping intentionally preserves the original source objects even where the current authoritative audit and this recovery narrative require current evidence corrections.
