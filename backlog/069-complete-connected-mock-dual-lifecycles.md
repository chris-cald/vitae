---
id: wi-069
title: Complete Connected Mock Dual Lifecycles
summary: Complete synthetic Application lifecycle and shared Catalog-to-projection-to-bundle flow in frontend-draft without production wiring.
type: work-item
subtype: story
lifecycle: active
status: running
status_reason: review
priority: critical
commits:
  557ddb5: Independently reviewed connected mock lifecycles and four red-first acceptance fixes
links:
  depends_on:
    - '[[068-build-catalog-development-board]]'
  reference:
    - '[[050-deliver-job-search-application-funnel-slice]]'
    - '[[064-simplify-frontend-draft-navigation]]'
    - '[[067-make-sources-and-evidence-actionable]]'
  evidence:
    - '[[record-wi-069-local-validation]]'
tags:
  - afk
  - frontend
  - mock-only
  - privacy
---

# Complete Connected Mock Dual Lifecycles

Implement intertwined Application lifecycle and Catalog-to-bundle work as ONE bounded stateful synthetic reference implementation in `frontend-draft/`. Start from reviewed WI-068 foundation 024f508. Preserve its working evidence gates and application-return behavior; adapt the board framing deliberately. No backend/API calls, real documents, remote content, production frontend changes, persistence requirement, generalized workflow engine, or claim of full MVP/live UAT completion. WI-050 and WI-057 remain outside closure scope.

## Parent / Context

This authorized mock-only child scope supports WI-050. The supported metadata reference preserves that context; it is not a hierarchy or completion of WI-050. Original authorization: `user-authorized-mock-dual-lifecycle`.

## Design and provenance

Verified Figma page 0:1 board 26:754 uses work columns **Evidence inbox -> Triage -> Build support -> Ready to reuse**. Domain kinds SourceAsset, Seed, Evidence, CatalogAsset and Projection are NOT sequential statuses. Work readiness means disposition chosen, corroborating support supplied, validation reviewed, publication approved. Ready-to-reuse distinguishes validated factual CatalogAssets from grounded wording Projections; a Projection never becomes factual evidence. Reconcile WI-068's five columns through these semantics, not blind renaming. Other frame references: application21:178, decision21:276, source21:355, deliverable21:428, timeline21:506, catalog21:587, evidence-placement29:969. These are inspiration; no pixel-parity claim without verification. Figma is read-only; independent visual evidence is WI-070.

Do not duplicate closed WI-064/067 blindly. Provenance inspection: WI-064 commit25d3e8e modified production `frontend/src/App.tsx`, not draft; the draft therefore still needs a single accessible navigation model within this connected scope. WI-067 draft source work commit0a8ea57 is in main history; later draft changes, including341af6c, reduced the source view to static rows. Reuse appropriate source semantics/fixtures; do not cherry-pick unrelated production work or reopen closed items.

## Acceptance Criteria

- [x] New application and Add share an inline synthetic Target/context creation flow; confirmation creates a distinct application and cancellation creates nothing. At least two independent application records retain separate drafts, status, decisions, material events, notes references, search and placement.
- [x] Application cards expand to expose Target requirements, canonical status, supporting assets, gaps, bundle, decisions, events and next action. Canonical statuses are draft, ready, submitted, interviewing, closed and withdrawn; working steps are separate from status.
- [x] Review and ready require a current reviewed bundle with blocking claims resolved. Submission collects date and channel plus explicit confirmation. Interview, follow-up, outcome and withdrawal collect required information inline; absent information explains the blocker without advancing.
- [x] Material events are application-specific and emitted exactly once per confirmed material action. Navigation, expansion, form edits and cancellation emit none; repeated confirmation cannot duplicate an event.
- [x] Remove delegated generic click-success notices as substitutes for functionality. Retained controls perform their named action or expose a specific blocker. Use a single accessible navigation model and shared mock state for Today, Sources, Decisions, Deliverables and Activity instead of hardcoded narrative panels.
- [x] Catalog columns use Evidence inbox, Triage, Build support and Ready to reuse as work readiness, not entity types. Preserve expandable safe details and application return. Priming supplies claim scope and explicit promotion criteria; a reviewed discard/cull path exists without generalized merge/split tooling.
- [x] Episode formalization requires objective, responsibility, outcome and significance, with evidence references covering each promotion criterion. Publication requires explicit human review of the current revision. Editing support or claim scope invalidates that review; unsupported publication is blocked.
- [x] Seeds, Notes, drafts, unreviewed assets and Target requirements are ineligible factual generation sources. Target/JD content is targeting context only; grounded Projections remain wording derived from eligible CatalogAssets, never independent evidence.
- [x] Promoted eligible assets become selectable in application/surface-specific placement. A projection records asset/reference IDs, claim scope and source revision, rejects duplicate placement, and explains unsupported selections. A gap opens relevant Catalog remediation and returns to the original application and surface with updated support, without affecting unrelated applications.
- [x] Assemble inspectable synthetic resume and communication blocks, manifest, JD-context summary, source/support summary, unsupported claims and next action. Every factual block has eligible provenance or an explicit unresolved confirmation flag. Readiness stays blocked until unsupported claims are supported, meaningfully revised to supported scope, or excluded; review alone cannot turn an unsupported claim into evidence.
- [x] Changing an asset's evidence/claim scope or an application's projection invalidates only affected dependent publication reviews, fits and bundles. Explicit review of current revisions clears stale state; unrelated applications stay unchanged and submitted bundle snapshots remain immutable.
- [x] Red-first domain/DOM tests cover both complete cycles, invalid and allowed transitions, cancellation, duplicate confirmation/placement, per-criterion evidence, revision invalidation, submitted snapshot preservation and at least two-application isolation. Focused tests and explicit `npm --prefix frontend-draft run check` pass; root `npm run check` and clean-checkout `npm run pilot:rehearse` pass with pinned dependencies.

## Fixtures and execution

Use explicit small typed local state, stable IDs and controlled synthetic dates. Include two distinct Targets/requirements, incomplete and eligible Catalog examples, reviewed discard, an unsupported content block, a shared asset referenced by two applications, and unrelated support. Keep forms incremental at the transition needing input, not an upfront omnibus form. No network other than local app assets/tooling; no logs of document content.

Read this specification at runtime verbatim for implementation/review. Author failing focused tests before code. Independent review and WI-070 browser/design validation are required before final main integration. Run long gates via background jobs without discretionary timeouts. Use the installed Babysitter-DV process and authoritative runtime DV CLI; never forge closure evidence or rewrite immutable run input to mask a replay issue.

## Publication authorized — review in progress

The user explicitly authorized scoped branch publication, real pull requests and merges after required CI/review gates. Force-push and stash changes remain prohibited. No policy exception is being used: terminal completion requires a real linked PR, measured actual effort and genuine timestamped terminal evidence. The rejected local-only closure and lint failure are preserved; supported transition restored running/review. The leftover attempted completion date was removed as metadata cleanup, not a lifecycle transition. Source approval and validation evidence remain genuine. Prerequisite publication and WI-069 provider-gated merge precede dependent WI-070 independent browser/visual validation; WI-050 and WI-057 remain HITL.

## Acceptance evidence

The twelve implementation criteria above were independently reviewed against source557ddb5 (unchanged at c5f2632); see frontend-draft/evidence/wi-069/independent-review.md. Twenty domain/DOM regressions, explicit draft check, root check and clean-checkout pilot rehearsal pass; validation-manifest.json records hashes and clean checkout identity. These checks support implementation acceptance, not WI-070 browser/visual acceptance or full live UAT. Main integration remains gated on WI-070.
