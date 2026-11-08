# PR20 keyboard focus correction (PRRT_kwDOUSiznc61EKb_)

Base: 0800ebe. Effort metadata migration and all other source remain intact.
Scope: CatalogDevelopment UI, focused/regression browser/DOM tests, and evidence.

## Behavior

- Scope, criterion statements and criterion evidence selections are local drafts.
  Keystrokes/select changes do not call editAsset, change revisions, demote the
  published source/applications, stale dependencies, or emit material events.
- **Save revision** applies all changed fields in one editAsset call. Existing
  domain invalidation runs once for affected applications only. Moving the saved
  card from Ready to reuse to Build support explicitly restores focus to its
  Save revision button after the DOM commit.
- **Cancel edits**, reverting fields to original values, and repeated/no-op saves
  leave the entire shared domain state unchanged. Leaving Catalog discards local
  unsaved edits; this is stated beside the edit controls.
- Review, publication, triage, development and discard require saved state. An
  unsaved draft produces a specific Save-or-cancel blocker; it is never silently
  ignored or approved. Existing published readiness stays valid until Save.

## Red/green proof

- `keyboard-dom-red.txt`: two tests fail on actual focus loss after the first
  character. `keyboard-dom-harness-initial.txt` preserves the first attempt with
  JSDOM/React input-polyfill diagnostics. The harness was corrected to import
  ReactDOM only after installing the DOM; no attachEvent shim or fake focus added.
- `keyboard-browser-red.txt`: real installed Chromium/CDP reproduces focus loss
  while typing the first character into the Ready asset's scope.
- `keyboard-dom-green.txt`: two tests pass, including multi-character same-node
  focus, unchanged complete domain state while drafting, unsaved review/publication
  blockers, one source revision and one dependent revision per Save, focus restored
  after the card moves, no material events, and unrelated ready application intact.
  Criterion/select cancellation and type-then-revert/no-op saves are also covered.
- `keyboard-browser-green.txt` and `keyboard-browser-{1440,390,480}.txt`: actual
  Chromium pointer clicks and per-character CDP keyboard input pass for scope and
  objective fields. They also verify no premature revision/demotion, unsaved
  publication blocker, cancellation, one saved revision, restored Save focus,
  repeat save no-op and no fabricated application events. Text values are not
  assigned as a whole; cursor positioning is followed by browser keyboard input.
- Native select-popup keyboard attempts did not change the selected option in
  this headless harness; both attempts are preserved as
  `keyboard-browser-select-harness{,-2}.txt`, not counted as product evidence.
  Select clearing/focus/cancellation is verified by the DOM regression, while
  the real-browser focus gate covers the reported text-entry remount defect.
- `keyboard-draft-check.txt`: explicit draft check passes 27 tests plus TypeScript
  and Vite build under Node 22.17.0/npm 10.9.2.

Previous impacted tests are preserved byte-for-byte under `keyboard-frozen/`
with SHA256SUMS verified. Active prior tests only add named Save revision actions;
none of their assertions were removed or weakened. Original domain edit/review
rules, runtime application behavior, and all backlog metadata are unchanged.

## Reproduce

```sh
export PATH=/Users/macos/.local/share/fnm/node-versions/v22.17.0/installation/bin:$PATH
frontend-draft/node_modules/.bin/tsx --tsconfig frontend-draft/tsconfig.json --test frontend-draft/test/catalog-edit.test.mjs
npm --prefix frontend-draft run check
npm --prefix frontend-draft run dev -- --host 127.0.0.1 --port 5190 --strictPort
# Separate shell, same checkout:
CHROMIUM=/Users/macos/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell DRAFT_WIDTH=390 node frontend-draft/test/catalog-focus.browser.mjs
```

The real-browser script accepts CHROMIUM, DRAFT_URL (default localhost:5190), and
DRAFT_WIDTH (default 1440). It uses a temporary profile and CDP pipe, existing
browser only, a 60-second browser-process safety bound, and cleanup in finally.
No downloads/providers or real data. Local test server is stopped after evidence.

Root/release gates and the old mobile.browser.mjs command were not duplicated;
this narrow change has new real browser focus evidence at all three widths.
Independent exact-source review/provider resolution and publishing remain with
parent. No push, merge, orchestration, closure or approval claim.
