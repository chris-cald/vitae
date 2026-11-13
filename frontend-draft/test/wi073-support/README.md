# WI-073 native regression support (in progress)

The `v3` directory preserves three unmodified modules from the independently reviewed WI-070 v3 harness, frozen at `/tmp/vitae-wi070-harness-review-v3/source/`. These are validation support, not the WI-070 acceptance suite. Review: `/tmp/vitae-wi070-harness-independent-review-v3.md`.

SHA-256:

- `wi070-product.mjs`: `cae20ab207b11afffdf39acb4bba33cbadcf24aeadbafcd986550b75324b81aa`
- `wi070-network.mjs`: `7eacc51ebeb4e1f889c23b8624bcf79677137e6bcf8a48b6946f7c15b4958856`
- `wi070-lifecycle.mjs`: `6fe71b3c9ff3af4d97c957ccc07aeb97ca7ef5df99784267335bed68d4446445`

The narrow `focus-case.patch` and `run-focus.mjs` are WI-073 candidate validation support, not independently reviewed acceptance. With Node 22.17.0/npm 10.9.2, run `npm ci`, then `npm run build` in `frontend-draft`, followed by `node test/wi073-support/run-focus.mjs red` (or `green`). The driver copies those v3 modules and that just-built `dist` to a unique temporary stage, applies the patch, compares build inventories, and records the source and staged module hashes and final per-case receipts. The original harness resolves `../dist/` relative to its staged module, not the current working directory. Verify the receipt and case coverage rather than treating driver completion alone as acceptance. Chromium's installed path is host-specific. This driver is not a WI-070 independent rerun.
