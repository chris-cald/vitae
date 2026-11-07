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
