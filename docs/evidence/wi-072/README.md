# WI-072 metadata repair evidence

Scope: publisher-selected WI-072, parent-owned run `01M7402W3F5G4WGWZ9KV2R6JSV`, dedicated branch `worktree/wi-072-metadata-normalization`.

## Red baseline

- Implementation base: `1d64b6246bbe269089d5f6040f1bd26754a6cc54` (clean before tests).
- `baseline-candidate.json` and `baseline-published.json` are byte-for-byte copies of the parent-supplied `/tmp/vitae-fixed-loader-{candidate,base}.json`. The published-base report contains 158 files; the closure-candidate report contains 160 files. Both report exactly 59 schema-violating files, zero parse/duplicate/unresolved errors and no schema-load errors.
- `original-manifest.json` preserves the original frontmatter (including delimiters), whole-file SHA-256 and body SHA-256 of every tracked backlog Markdown file. Original relationship labels and targets remain losslessly recoverable here.
- `red-global.json`: same 59 violating files on the implementation base, now 161 files including WI-072. Six no-inbound advisories (versus seven in the supplied baseline) are not errors. No graph edges are invented.
- Node `22.17.0`, npm `10.9.2`; installed Doc-Vader authority identified by parent as `de10e6d1531b5943d46cf1291a8e00fb4f1d75a3`.

Commands (from the dedicated worktree):

```sh
export PATH=/Users/macos/.local/share/fnm/node-versions/v22.17.0/installation/bin:$PATH
export DV_WORK_MANAGEMENT_SCHEMA_DIR=/Users/macos/Library/pnpm/doc-vader-runtime/schemas/work-management
npm --prefix doc-packs/vitae-sdlc ci --ignore-scripts
node --test doc-packs/vitae-sdlc/test/legacy-backlog-metadata.test.mjs
node /Users/macos/Library/pnpm/doc-vader-runtime/dist/cli/doc-vader.js backlog validate --dir backlog --schema-map /Users/macos/Library/pnpm/doc-vader-runtime/schemas/frontmatter/schema-map.json --profile ci --format json --fail-on error
```

Both red commands exited 1 on unchanged backlog. Tests exercise all six actual error categories against recursively loaded installed schemas, without mocked validators, network fallback, vendored schema substitution, or skips. Full TAP is retained. Installation succeeded; npm reported two high dependency vulnerabilities, not remediated in this metadata-only item.

The CLI emitted existing unknown-date-format warnings; focused AJV validation explicitly registers formats. No runtime/schema changes are made here.

## Repair policy

Only the 59 diagnostic files may change. Remove estimated only for the 27 completed items whose actual is absent; never invent hours or remove schema-valid pairs. Preserve ready estimates and closed-item estimates. Merge unsupported parent/implements targets into reference, retaining the labeled originals in the manifest and mapping report; never reinterpret them as dependencies. Preserved body sections such as `parent: WI-050` describe the historical conceptual relationship, not a supported current frontmatter key. The canonical schema-compatible `links.reference` is its storage representation; retaining historical prose labels is intentional under the byte-identical-body requirement, not a claim that `links.parent` remains valid. Remove empty unsupported/depends_on lists. Remove malformed supporting references only when the exact value survives in the unchanged body, keeping valid URLs. Use the installed `x-review-result` extension token without inventing an approval outcome.

Parent retains review, publication, closure, integration and cleanup authority. Root check, explicit draft check and clean-checkout pilot rehearsal are parent gates; this repair alone is not live UAT evidence.

## Green result

- Decision provenance: implementation child session `83d8d2fe-39e8-46b9-9e6a-211cc0efd2aa` called `functions.ask` with options `normalize-reasons` / `return-blocked`; the actual tool response selected `normalize-reasons`. This was not an ask in the parent conversation. The parent subsequently accepted that direct tool-answer provenance; future gated decisions must return NEEDS_DECISION to the parent. WI-028/029 change **only** invalid `status_reason` to `completed`; keep `active/closed`, `estimated: 3`, and byte-identical development-only qualification prose. Original reasons (`development-only-provisional-approval`, `development-contract-complete`) remain in the manifest and report. This normalizes the existing closed status, not a new completion, production, or approval claim.
- `changes.json` records all 59 filenames, original diagnostics, exact before/after values per changed field, and reasons. JSON null means the field is omitted, never a YAML null. Empty `links` wrappers are removed only when their final child is removed. All 27 missing-actual cases lose only `estimated`; valid completed effort pairs and ready/closed estimates remain.
- `repair-snapshot.json` is a frozen 59-file byte snapshot extracted only from git object `1ca2cc0936c0aae1dc3f50a6b9ae0200712d7453` (tree `5eb648200b9173ded2c9348b3053e252ad006d20`), never from the live backlog. Focused proof validates its pinned digest, original-manifest identity, each repair file/body hash, original-to-repair field report, effort and relationship preservation, and original relationship labels. Current live authoritative-schema conformance is intentionally tested separately, so later valid backlog progress does not rewrite repair history. Fixture coverage proves both later valid progress and snapshot tampering behavior.
- `receipt-whitespace-normalization.json` records the source commit/blob and before/after SHA-256 for the historical TAP receipts whose terminal whitespace was removed solely to satisfy `git diff --check`; their original raw Git blobs remain addressable by the recorded identifiers.
- Focused schema and preservation tests pass (see `green-tests.tap`); full doc-pack tests pass (`green-doc-pack.tap`). The preservation assertion was corrected to allow precisely the approved reference merge rather than incorrectly requiring references to remain unchanged. The field-report test additionally reconstructs each expected metadata object from the original and exact declared changes.
- Exact global command above exits **0**. `green-global.json`: **161 files; zero schema violations, parse errors, duplicate IDs, unresolved wikilinks; zero schema-load errors** (no entries). Six no-inbound advisories remain intentionally. CLI warnings are retained in `green-global.stderr`.
- Interim evidence is retained: after mechanical repairs, global violations were exactly the two closed-status reasons; doc-pack 14/17 passed. No green assertion was made until their explicit adjudication.
- All tracked backlog Markdown body hashes match the original manifest; files outside the 59-file baseline are unchanged, including WI-069/070/071/072 and the clean records. No product source, runtime, schemas, lockfiles, or workflow policy changed.
- `git diff --check` passes. Parent must still run explicit draft validation, root `npm run check`, clean-checkout `npm run pilot:rehearse`, independent review and remaining publication/closure/integration gates. No push, publication, merge, or work-item closure performed.

## Validation-wrapper follow-up

The root `validate:backlog` script now delegates to a portable Node standard-library wrapper. It requires `DV_WORK_MANAGEMENT_SCHEMA_DIR`, validates that directory and its derived sibling `frontmatter/schema-map.json`, and then invokes the external `dv` launcher with the explicit CI map/profile/JSON/fail-on-error arguments. It does not claim that the environment variable configures the Doc-Vader CLI.

The wrapper subprocess fixture originally signaled its parent while retaining an interval, which could leave the focused test job waiting on inherited streams. The corrected fixture self-terminates with `SIGTERM`; this still proves the wrapper preserves a child signal without leaving a child process alive. Its real-subprocess coverage also exercises spaces in `PATH`, absent authority, malformed map, unavailable CLI, and nonzero exit propagation.

## Publication split-A provenance

This publication-only split restores the exact approved A partition from immutable source commit `e7b84ddf3521cc66506ea4cf17f3921fb2abdc23` onto `d422e0c`. Its partition manifest and fresh actual validation receipt are `split-a-manifest.json` and `split-a-validation.log`. All 108 original changed paths were reviewed: A contains 88 paths and the disjoint deferred B closure partition contains 20 paths; there are no unreviewed or silently excluded paths.

The historical WI-072 receipts remain intact, including their full-combined-source 161-file audit context. They are preserved evidence, not a claim that they were freshly generated by split A. The fresh split-A gate records its own actual audit result and hashes: without B's two closure records it audited exactly 159 files. No historical receipt, frozen 59-record proof snapshot, or historical body was altered for this split.

## Provider-readable artifact subdivision

`changes.json` and `repair-snapshot.json` are now transparent indexes over ordered, pretty-printed JSON-array chunks. Their loaders reassemble the exact canonical JSON bytes pinned from `e7b84dd`; per-chunk hashes/counts and canonical payload hashes reject missing, reordered, path-confined, or tampered chunks. This changes evidence transport only: all 59 records and their key/order/content are losslessly preserved, and the immutable source blobs remain addressable from `e7b84dd`.
