# Provider comment 4507514710 (PR20): mobile runner process safety

Base: b4a5c12, existing worktree/wi-069-connected-mock including WI071.
Only the browser runner, its synthetic regression tests and new evidence changed.

- `mobile.browser.mjs`: `spawnSync` now receives `timeout: 60_000`;
  `assert.ifError(run.error)` runs before the existing status assertion.
  Executable, browser arguments, viewport widths, encoding, status and output
  checks are unchanged.
- `mobile-runner.test.mjs`: mocks only the child-process boundary. Tests verify
  both viewport timeouts/arguments, ETIMEDOUT and ENOENT error reporting before
  status/output handling, and the retained nonzero-exit guard. No real browser
  or hanging process is launched. Builtin export mocks, console and environment
  are restored after each test.

Pinned validation: Node 22.17.0, npm 10.9.2.

1. `node --test frontend-draft/test/mobile-runner.test.mjs` before implementation:
   3 fail / 1 pass (`provider-runner-red.txt`).
2. Same focused command after implementation: 4 pass
   (`provider-runner-green.txt`).
3. `npm --prefix frontend-draft run check`: 24 pass, TypeScript and Vite build
   pass (`provider-runner-draft-check.txt`).
4. `git diff --check`: pass after normalizing trailing whitespace in these new
   receipts only. Earlier review/CI evidence was not overwritten.

Real-browser rerun, root/release gates and provider re-review/republish remain
with the parent. No push, merge, thread resolution or orchestration performed.
