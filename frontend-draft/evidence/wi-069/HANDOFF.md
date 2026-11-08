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

Root `npm run check` was dispatched with pinned Node/npm and offline uv. Its result
is tracked separately as `root-check.txt`; it is not replaced by the draft check.
Clean-checkout `npm run pilot:rehearse`, independent review, WI-070 validation,
closure and integration remain parent-owned gates. This worktree initially had
neither backend/.venv nor production frontend/node_modules. No claim of root or
release-gate success is made before actual results.

The model intentionally uses explicit fixture reference metadata and human
attestation, not semantic fact verification or provider output. Source-kind,
per-criterion references and revision gates are enforced; real-world truth is not
inferred from synthetic text. State is session-local and resets on reload.
