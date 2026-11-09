# WI-069 implementation evidence

Status: implementation for independent review; not delivered, closed or integrated.
Parent owns governance, review, closure and integration. WI-050/WI-057 remain HITL.

## Scope and implementation

Only frontend-draft source/tests/docs/evidence were changed by the implementation
worker. Parent governance commits 604a031, 8e07298 and b96526d are preserved.
Original red-first commit 715f869 remains in history. No .doc-vader artifacts are
part of implementation commits. No network, providers, vaults, real documents,
production code, stash, push or additional worktrees were used.

- `src/connected.ts`: shared typed synthetic state, canonical status transitions,
  explicit confirmation and deduplication, per-criterion support, revision review,
  publication eligibility, scope-safe projection placement, bundle provenance,
  dependency invalidation, immutable submitted snapshots.
- `src/App.tsx`: one navigation model; real inline creation/action forms; application
  expansion; per-application draft/search/surface/notes/decisions/history; connected
  Today, Sources, Decisions, Deliverables and Activity. Delegated success handler
  and static narrative substitutes removed.
- `src/CatalogDevelopment.tsx`: four readiness columns, priming, human-reviewed
  discard, incremental formalization, review/publication and application return.
- `src/styles.css`: readable incremental forms and four-column readiness styling;
  creation is no longer hidden at mobile widths.
- Tests: two complete DOM application flows, full inbox-to-published Catalog
  flow, unsupported-content gating, source/projection eligibility, duplicate
  confirmation/placement, invalid transitions, shared dependency invalidation,
  unrelated application isolation and immutable submission snapshots.

## Red → green evidence

- `red-domain.txt`: original missing-module failure before implementation inspection;
  eight original WI-068 regressions passed at that point.
- `red-dom.txt`: single-nav/creation/connected-flow failures before replacement UI.
- `red-shared.txt`: missing two-application shared fixture/dependency behavior.
- `legacy-reconciliation-red.txt`: old five-column and generic-success assertions
  fail against new semantics. `workbench.test.mjs` retains eight regression intents
  but replaces obsolete transitions/notices with actual evidence/readiness gates.
- `red-mobile.txt`: real Chromium found New application hidden at 390px.
- `green-dom-domain.txt`: 16 passing focused domain/DOM tests.
- `green-mobile.txt`: real Chromium passed creation visibility, all four evidence
  criteria, review/publication, application return and no document overflow at
  390px and 480px.
- `draft-check.txt`: explicit `npm --prefix frontend-draft run check`, passing all
  16 tests, TypeScript and Vite build with Node 22.17.0 / npm 10.9.2.

The Chromium executable was the existing local headless-shell build 1243.
Figma read-only PNG references for application and Catalog board were inspected;
no pixel-parity assertion is made. Independent browser/design review is WI-070.

## Remaining gates / limits

Root `npm run check` FAILED with pinned Node 22.17.0 / npm 10.9.2 and offline uv.
The backend command created its local virtualenv, then failed with
`No module named pytest`. Production frontend tests/typecheck/lint/build were not
reached. The complete receipt is `root-check.txt`; this is a missing-dependency
blocker, not a passing root gate. The draft check does not replace it.
Clean-checkout `npm run pilot:rehearse`, independent review, WI-070 validation,
closure and integration remain parent-owned gates. This worktree initially had
neither backend/.venv nor production frontend/node_modules. No claim of root or
release-gate success is made before actual results.

The model intentionally uses explicit fixture reference metadata and human
attestation, not semantic fact verification or provider output. Source-kind,
per-criterion references and revision gates are enforced; real-world truth is not
inferred from synthetic text. State is session-local and resets on reload.

## Independent review remediation (four P2 findings)

The first implementation was **request changes**, not approved. All four findings
were reproduced in `test/review-regressions.test.mjs` before fixes;
`review-red.txt` records four failures. The corrective behavior is:

1. Reassembly replaces a reviewable artifact, marks fit stale, and demotes `ready`
   to `draft`. It does not manufacture a lifecycle event. Re-review and explicit
   ready confirmation are required; submitted snapshots remain untouched.
2. Gap remediation chooses the actual ungrounded dependency, preferring the
   active surface. Each stale projection also offers a targeted remediation
   control. Application ID, search and placement surface survive the round trip.
3. The board uses the same grounding predicate as remediation. Stale projections
   appear in Build support, never Ready to reuse. Source republication alone is
   insufficient: the dependent projection must be explicitly refreshed.
4. Current bundle review/readiness require factual blocks on **both resume and
   communication**, with provenance. Missing surfaces expose specific blockers
   and placement/reassembly guidance. The presentation-only greeting was removed;
   required output blocks are represented in the manifest and submitted snapshot.

Frozen pre-remediation tests are preserved byte-for-byte in `review-frozen/`
with verified SHA256 hashes. Active success-path tests only gain explicit
placements needed by the stricter output contract; their previous assertions are
retained. Four new regressions are independently executable. Trailing whitespace
in historical text receipts was normalized without changing result meaning.

Post-fix results: `review-green.txt` records the focused regressions;
`review-draft-check.txt` records the explicit draft check (20 domain/DOM tests,
TypeScript, production build) under Node 22.17.0 / npm 10.9.2.

### Root dependency history and parent-owned later evidence

The worker's earlier command was:

```sh
export PATH=/Users/macos/.local/share/fnm/node-versions/v22.17.0/installation/bin:/tmp/vitae-wi068-tools:$PATH UV_OFFLINE=1
npm run check
```

No dependency setup preceded that worker attempt. It failed at
`uv --directory backend run --locked --no-sync python -m pytest` with missing
pytest, as preserved in `root-check.txt`.

Subsequently the parent ran documented `npm run setup` using pinned Node
22.17.0/npm 10.9.2 and locked uv dependencies, then `npm run check`. The parent
reported **both exit 0** after setup; this supersedes the dependency blocker, not
the original historical receipt. Completed parent logs are
`/tmp/vitae-wi069-pinned-setup.log` and
`/tmp/vitae-wi069-root-check-after-setup.log`. Parent will capture these in gated
evidence; the worker did not duplicate setup/check or overwrite the failure.

Independent re-review, clean-checkout rehearsal, WI-070 browser/design validation,
closure and integration still remain parent-owned. No approval or delivery claim.
