# PR20 Sources links/usage remediation

Provider thread 4507514689, follow-up 4507665285. Base 5560ff8 includes the
approved WI071 consolidation and browser-runner safety correction.

## Narrow change

`src/App.tsx` Sources now renders each asset's current claim scope, revision,
eligibility and blockers; criterion statements and their actual reference IDs;
and local anchor links to inspectable synthetic reference metadata. Empty or
unsupported criterion associations are explicit. Reviewed discard remains
ineligible, with its recorded reason.

Application usage is computed from current shared application projections, not
an independent ledger or static narrative. Each placement shows application,
surface, grounding/stale status, placed source revision and placed reference
snapshot. Opening a placement selects that application and surface, preserving
other per-application state. Source edits therefore update associations and mark
all affected usages stale while unrelated assets/usages remain unchanged.

No domain/backend changes, provider/network calls or new data persistence.
Existing 24 test cases and earlier evidence remain unchanged.

## Red → green

Pinned runtime: Node 22.17.0 / npm 10.9.2.

- Focused command:
  `frontend-draft/node_modules/.bin/tsx --tsconfig frontend-draft/tsconfig.json --test frontend-draft/test/sources-links.test.mjs`
- `provider-sources-red.txt`: fails on absent per-asset Sources support/usage.
- `provider-sources-green.txt`: new DOM regression passes. It verifies all four
  reference associations/anchor targets, shared usage by both applications,
  placement updates, missing support/ineligibility after reference removal,
  three dependent placements becoming stale, unrelated support staying grounded,
  and opening/returning from the correct application/surface.
- `provider-sources-draft-check.txt`: explicit
  `npm --prefix frontend-draft run check` passes all 25 tests, TypeScript and build.
- `git diff --check`: passes; new text receipts normalized for trailing whitespace.

Real-browser/root/release validation was not duplicated for this narrow DOM
change. Independent re-review, provider reply/resolution and publishing remain
parent-owned. Tests passing do not establish provider approval or thread closure.
