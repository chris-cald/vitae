# Vitae frontend draft

A standalone, mock-data-only React workbench for wi-060. It does not call an API or share production frontend code.

```sh
cd frontend-draft
npm install
npm run dev
npm test
npm run build
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## Catalog Development regression checks (WI-068)

The Catalog board uses synthetic metadata and in-memory state only. Outcome
references can be selected from local fixtures; supplying one clears its outcome
gap and invalidates prior human review. Application search and placement are
isolated by mock application ID and survive Catalog round trips.

Run `npm --prefix frontend-draft run check` from the repository root for DOM
tests, TypeScript, and the draft build.

The mobile regression uses a real, already-installed Chromium executable (no
browser or dependency download). From the repository root, start the server:

```sh
npm --prefix frontend-draft run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

Then, in another terminal:

```sh
CHROMIUM=/absolute/path/to/chrome-headless-shell node frontend-draft/test/mobile.browser.mjs
```

It checks rendered control visibility and interaction at 390px and 480px. It is
an explicit browser gate, separate from the JSDOM suite; it does not assert Figma
visual parity. Stop the dev server after validation.

## Connected synthetic lifecycles (WI-069)

`src/connected.ts` is the shared, typed in-memory domain for every draft view.
Reloading resets the session. Use invented text only; nothing is uploaded or
fetched. The two initial applications share one published asset and have
separate requirements, drafts, search, surfaces, notes, decisions and events.

- **Application cycle:** New application / Add → confirm Target → choose eligible
  support and surface → assemble → resolve unsupported claims → review → ready →
  confirm submission date/channel → interview/follow-up/outcome, or withdrawal.
  Action forms are incremental. Cancel does not record a material event.
- **Catalog cycle:** Evidence inbox → Triage (choose scope/disposition) → Build
  support (objective, responsibility, outcome, significance, each corroborated)
  → review current revision → publish → Ready to reuse. Reviewed discard retains
  its reason and is never eligible. A gap opens the relevant card and returns to
  the same application and surface.
- **Revision rules:** Support/scope edits revoke source review/publication and
  stale only dependent projections, fits and bundles. Republish the source,
  explicitly refresh each affected projection, reassemble and review. Submitted
  snapshots do not change. Projected wording is never an independent source.
- **Bundle inspection:** Resume, communication and interview blocks expose
  source IDs/revisions and reference IDs, targeting-only JD context, manifest,
  support summary and unresolved claims. Unsupported wording can be excluded or
  replaced with an eligible asset's actual supported scope; review cannot bless
  an unsupported claim. Both resume and communication require factual blocks
  with eligible provenance before review/readiness. Missing surfaces show an
  actionable blocker, not presentation-only filler. Reassembly replaces the
  reviewable artifact, marks fit stale and demotes ready to draft until reviewed
  and explicitly marked ready again.

WI-068's Consider maps to Evidence inbox; Seeds to disposition-focused Triage;
Evidence & gaps and Episodes are reconciled into Build support with explicit
per-criterion formalization; Catalog assets becomes Ready to reuse, separately
labeling factual assets and grounded wording projections. Entity kinds are not
board statuses. Existing Catalog-return, search/surface isolation, local support
selection and human-review gates remain regression-tested under these semantics.

Material activity means confirmed creation and lifecycle actions (ready,
submission, interview, follow-up, outcome, withdrawal). Draft placement, notes,
bundle assembly/review and claim decisions update their inspectable records;
navigation, edits and cancellation do not manufacture lifecycle events.

Validation: `npm --prefix frontend-draft run check` runs domain/DOM tests,
TypeScript and build. The real-Chromium mobile gate above checks 390px and 480px,
including visible creation controls, full evidence promotion and Catalog return.
Figma exports informed board readiness/color grouping; no visual-parity claim.
WI-070 owns independent browser/design validation. This is not live UAT or
completion of WI-050/WI-057.
