# Authorized WI-069/070/071 optional effort migration

Scope: remove exactly three `estimated` frontmatter entries (8, 5, 2).
No `actual` or `original` values were added. Status, reasons, dependencies,
acceptance, PR/review/CI/evidence/publication gates and all work-item body content
are unchanged. No schema, runtime, provider, production code or workflow override.

## Regression and schema authority

`doc-packs/vitae-sdlc/test/work-effort.test.mjs` uses the existing pack's AJV 2020,
ajv-formats and js-yaml dependencies. It compiles the real installed composed
work-item schema and recursively loads its referenced contracts, policy, generated
status compatibility and base schemas from the same authoritative installation.
No schema is vendored, rewritten, fetched remotely or replaced by an inline copy.
Missing files, unsupported external references or compilation errors fail closed.

The synthetic completed fixture omits both effort fields and passes. Adding only
`estimated` fails specifically because `actual` is required. Omitting required
terminal `links` still fails; an invented `original` key also fails. Each scoped
repository item is checked for absent (not null/zero) effort fields and validated
against that same compiled schema. Schema SHA256s are emitted into red/green logs.

Red-first commit: cba1196. Before migration, the schema-contract test passed and
all three scoped-item tests failed on their existing estimated fields. After
migration, all four pass; the broader doc-pack suite passes 9/9.

## Exact commands / portability

From the existing WI-069 checkout, using Node 22.17.0 / npm 10.9.2:

```sh
export PATH=/Users/macos/.local/share/fnm/node-versions/v22.17.0/installation/bin:$PATH
export DV_WORK_MANAGEMENT_SCHEMA_DIR=/Users/macos/Library/pnpm/doc-vader-runtime/schemas/work-management
export DV_CLI_PATH=/Users/macos/Library/pnpm/doc-vader-runtime/dist/cli/doc-vader.js
node --test doc-packs/vitae-sdlc/test/work-effort.test.mjs
npm --prefix doc-packs/vitae-sdlc test
node "$DV_CLI_PATH" work-management lint-frontmatter \
  backlog/069-complete-connected-mock-dual-lifecycles.md \
  backlog/070-validate-connected-mock-dual-lifecycles.md \
  backlog/071-isolate-mock-prerequisite-test-resources.md
node "$DV_CLI_PATH" work-management lint-frontmatter
node "$DV_CLI_PATH" backlog validate --dir backlog --profile ci --fail-on error --format json
```

Override `DV_WORK_MANAGEMENT_SCHEMA_DIR` and `DV_CLI_PATH` for another installation;
the test defaults only the schema directory to the user's installed runtime path.
Existing lockfile dependencies were already present; no dependency setup or
lockfile edit was needed. Missing authority is not skipped.

## Actual gate results — broader gates NOT green

- `effort-migration-red.txt`: 1 pass / 3 fail before migration, exit 1.
- `effort-migration-green.txt`: full doc-pack 9/9 pass, exit 0.
- `effort-migration-scoped-lint.txt`: actual authoritative lint of 3 files passes,
  exit 0, explicitly reports JSON schema validation (not missing-schema fallback).
- `effort-migration-project-lint.txt`: actual project-wide schema lint fails,
  exit 1, 158 files considered, 132 failing files outside the three scoped items.
  Examples include unsupported legacy `links.parent`/`links.implements`, empty
  depends_on, missing terminal actual when estimated remains (e.g. WI-068), old
  documents without frontmatter, and invalid supporting-reference shapes. These
  unrelated files were not modified or exempted.
- `effort-migration-backlog-ci.txt`: CI profile returns exit 0 but reports **86
  schema_load_errors**, including all three scoped items, because it searches
  repository-local schemas/work-management/frontmatter/work-item.json. This is
  **not accepted as a passing schema/CI gate**. Zero schema_violations does not
  establish validity when schemas failed to load. Its 158-file report is retained
  in full, including these errors. Supported routing and loader source were
  inspected read-only; no runtime/config override or schema shadow copy was added.
- `git diff --check`: passes after trailing-whitespace normalization of new logs.

Root application tests/rehearsal were not duplicated for a three-line metadata
migration; their gates and prior receipts remain intact. Project-wide validation
and the CI schema-loader issue require parent handling, not unrelated migration
or silent downgrades by this worker. No publication, closure, push or merge.
