# WI-072 metadata repair evidence

Scope: publisher-selected WI-072, parent-owned run `01M7402W3F5G4WGWZ9KV2R6JSV`, dedicated branch `worktree/wi-072-metadata-normalization`.

## Red baseline

- Implementation base: `1d64b6246bbe269089d5f6040f1bd26754a6cc54` (clean before tests).
- `baseline-candidate.json` and `baseline-published.json` are byte-for-byte copies of the parent-supplied `/tmp/vitae-fixed-loader-{candidate,base}.json`. Each reports 160 files and exactly 59 schema-violating files, zero parse/duplicate/unresolved errors; no schema-load errors.
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

Only the 59 diagnostic files may change. Remove estimated only for the 27 completed items whose actual is absent; never invent hours or remove schema-valid pairs. Preserve ready estimates and closed-item estimates. Merge unsupported parent/implements targets into reference, retaining the labeled originals in the manifest and mapping report; never reinterpret them as dependencies. Remove empty unsupported/depends_on lists. Remove malformed supporting references only when the exact value survives in the unchanged body, keeping valid URLs. Use the installed `x-review-result` extension token without inventing an approval outcome.

Parent retains review, publication, closure, integration and cleanup authority. Root check, explicit draft check and clean-checkout pilot rehearsal are parent gates; this repair alone is not live UAT evidence.

## Green result

- User selected `normalize-reasons` in the explicit decision: WI-028/029 change **only** the invalid `status_reason` to `completed`; keep `active/closed`, `estimated: 3`, and byte-identical development-only qualification prose. Their original reason strings remain in the manifest and report. No completion, production, or approval claims are upgraded.
- `changes.json` records all 59 filenames, original diagnostics, exact before/after values per changed field, and reasons. JSON null means the field is omitted, never a YAML null. Empty `links` wrappers are removed only when their final child is removed. All 27 missing-actual cases lose only `estimated`; valid completed effort pairs and ready/closed estimates remain.
- Focused schema and preservation tests pass (see `green-tests.tap`); full doc-pack tests pass (`green-doc-pack.tap`). The preservation assertion was corrected to allow precisely the approved reference merge rather than incorrectly requiring references to remain unchanged. The field-report test additionally reconstructs each expected metadata object from the original and exact declared changes.
- Exact global command above exits **0**. `green-global.json`: **161 files; zero schema violations, parse errors, duplicate IDs, unresolved wikilinks; zero schema-load errors** (no entries). Six no-inbound advisories remain intentionally. CLI warnings are retained in `green-global.stderr`.
- Interim evidence is retained: after mechanical repairs, global violations were exactly the two closed-status reasons; doc-pack 14/17 passed. No green assertion was made until their explicit adjudication.
- All tracked backlog Markdown body hashes match the original manifest; files outside the 59-file baseline are unchanged, including WI-069/070/071/072 and the clean records. No product source, runtime, schemas, lockfiles, or workflow policy changed.
- `git diff --check` passes. Parent must still run explicit draft validation, root `npm run check`, clean-checkout `npm run pilot:rehearse`, independent review and remaining publication/closure/integration gates. No push, publication, merge, or work-item closure performed.
