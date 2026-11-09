# Authorized publication consolidation

User selected consolidation: normal merge of independently approved WI-069 and WI-071 into PR20, preserve PR21 evidence and close it as superseded, then rerun exact combined CI/provider/independent review before merging main. No force-push or history rewrite.

Merge28928a9910f8332cfa468051d1b4e6bddd992980 combines WI-069 head30985762efb46e7c2942f8edf87f537d66e7c729 with WI-071 headf17329135a1a175cd1cb4c9484ab7775f07b5308. The normal merge had no conflicts.

## Preserved PR21 evidence

- https://github.com/chris-cald/vitae/pull/21
- Source head30985762efb46e7c2942f8edf87f537d66e7c729, original base publish/vitae-mock-foundation.
- Two GitHub `check` runs passed; CodeRabbit skipped, not approved. No provider review approval is claimed for PR21.
- Independent source approval at557ddb5, confirmed unchanged atc5f2632, is in frontend-draft/evidence/wi-069/independent-review.md.
- Full original red/fix/validation history remains in git ancestry and checked-in evidence. PR21 is superseded by https://github.com/chris-cald/vitae/pull/20, not independently merged.

## Provider state correction

After the normal merge was pushed, GitHub automatically recognized PR21 as MERGED into its base `publish/vitae-mock-foundation` at2026-11-08T20:18:13Z, merge commit28928a9910f8332cfa468051d1b4e6bddd992980. The attempted superseded-close command correctly refused because it was already merged. This is consolidation into the open PR20 branch, not a main merge or provider approval. The earlier intended close-as-superseded description above is retained as intent, superseded by this observed provider result. PR20 remains OPEN and BLOCKED pending required reviews/checks.

## Remaining gates

Independent reviewers must confirm their exact source remains unchanged in combined head. Required CI/provider review must approve that head; previous green checks do not waive the combined gates. WI-069/WI-071 remain nonterminal until genuine PR/provider closure conditions are satisfied. WI-070 independent full browser/Figma validation follows dependency closure. No full MVP or live UAT claim.
