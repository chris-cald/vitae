# Vitae SDLC Doc-Vader Pack

This standalone Doc-Vader document type pack contributes Vitae's SDLC documentation routes:

- `vitae.sdlc:adr` for Architecture Decision Records
- `vitae.sdlc:prd` for Product Requirements Documents

The namespace carries the SDLC/governance vocabulary owner. ADR and PRD remain separate `type` values because they are separate document families with different statuses, required metadata, and section expectations.

## Contents

- `document-type-pack.json` — Doc-Vader pack manifest.
- `schemas/metadata/adr.json` — routed ADR metadata schema composed with Doc-Vader `/metadata/base`.
- `schemas/metadata/prd.json` — routed PRD metadata schema composed with Doc-Vader `/metadata/base`.
- `schemas/metadata/common.json` — shared Vitae SDLC metadata definitions.
- `schemas/content/adr.json` — semantic ADR body/content payload schema.
- `schemas/content/prd.json` — semantic PRD body/content payload schema.
- `schemas/content/common.json` — shared body/content schema definitions.
- `templates/adr.md` — Markdown ADR template that emits explicit route metadata and content schema metadata.
- `templates/prd.md` — Markdown PRD template that emits explicit route metadata and content schema metadata.

## Routing Metadata

Templates emit explicit route metadata instead of relying on directory inference:

```yaml
namespace: vitae.sdlc
type: adr
$content_schema: ../schemas/content/adr.json
```

```yaml
namespace: vitae.sdlc
type: prd
$content_schema: ../schemas/content/prd.json
```

Existing repo-local templates under `templates/docs/` remain compatible with the original Vitae frontmatter schemas. Use this pack when generating or validating documents through Doc-Vader's document-pack registry.

## Validation

Install and run the pack-local validation tests from this directory:

```sh
npm install
npm test
```

The test package depends on `@calan-co/doc-vader` as a dev dependency and resolves Doc-Vader's pack/config/base metadata schemas from that package instead of from a hardcoded checkout path. The current dependency uses the sibling checkout (`file:../../../tiab/doc-vader`) because the required document-pack schemas are ahead of the public GitHub `main` branch at the time this pack was authored. Replace it with a pinned GitHub tag or commit once those schemas are available upstream.

## Body Content Schemas

The content schemas model semantic JSON payloads that can render to Markdown. They intentionally do not model raw Markdown AST nodes. Markdown validators can separately check heading presence, table columns, and ID cross-references after rendering or extraction.

- ADR payloads require context, decision outcome, and consequences, with optional drivers, options, confirmation, references, and open questions.
- PRD payloads require problem statement, goals, non-goals, users/use cases, requirements, success metrics, risks, and open questions, with optional UX notes, data/contracts, backlog mappings, and validation gates.
