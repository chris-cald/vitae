# Seed Compatibility and Promotion Contract

This contract is derived from the local Career Knowledge `Seeds/README.md` and anonymized structural fixtures. It does not copy vault content.

## Adapter mapping

| Obsidian field | Canonical Seed field | Rule |
| --- | --- | --- |
| `type: seed` | `kind: seed` | Required. |
| `status: incubating` | `status: incubating` | Active default. Terminal vault states `promoted` and `rejected` are retained. |
| `quality: weak \| emerging \| rooted` | `quality` | Preserve vocabulary exactly. |
| `incubation_mode` | `incubationMode` | Preserve `growth-opportunity`, `fidelity`, or `granularity`. |
| `matures_to` | `maturesTo` | Preserve one or more possible mature forms: Episode, Projection, Technology, Domain, or Boundary. |
| `provenance` | `obsidianProvenance` + `sourceRefs` | Adapter history remains separate; canonical source references are required for use outside the vault. |
| `## Promotion Criteria` | `promotionCriteria` | Every Seed requires one or more observable qualifying conditions. |
| Adjacent gap discovered while reviewing a mature artifact | `harvestRationale` | A mature Episode or downstream Projection may surface a Seed only by identifying a separate, unsubstantiated topic. |

## Harvest cardinality

A SourceAsset may yield zero, one, or many transient topics. In a given iteration, each topic has exactly one outcome: a Seed, a CatalogAsset, or a pebble. Multiple Seeds may therefore retain distinct, underdeveloped topics from the same SourceAsset; neither a Seed nor a pebble is generation-eligible.

## Promotion rule

An Episode is a confirmed, substantiated `CatalogAsset`; a Projection is downstream from that asset. Neither is a Seed input or a promotable Seed target. They may be cited only when review of that mature artifact surfaces a **separate, adjacent, unsubstantiated** topic, recorded in `harvestRationale`.

A Seed may promote only when **every** declared `promotionCriteria` condition is met, its `sourceRefs` identify supporting SourceAssets, and the resulting artifact has a bounded mature form. Promotion creates the mature canonical artifact; it does not make the Seed itself usable in generation.

Seeds never enter a Catalog. They remain excluded from resume, cover-letter, and application generation until their mature artifact is substantiated. Terminal `promoted` and `rejected` Seeds are archived in the Obsidian adapter while retained as process history.

## Dispositions

- `incubating`: passive candidate under cultivation.
- `parked`: valid candidate, intentionally deferred.
- `culled` / `rejected`: fails the pebble filter or lacks a plausible durable path.
- `merged` / `split`: reconciled into one or more better-granulated Seeds.
- `primed`: has a credible growth path but is not yet substantiated.
- `substantiated`: evidence and scope are sufficient for a promotion decision.
- `promoted`: mature artifact created and linked; Seed remains history only.

## Open questions

None block the current contract. A later adapter implementation must decide how a multi-target `maturesTo` list selects the single artifact created at promotion time; that is a workflow-run decision, not a Seed-schema ambiguity.
