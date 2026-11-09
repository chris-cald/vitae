import test from "node:test";
import assert from "node:assert/strict";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import App from "../src/App.tsx";
async function mount(t) {
  const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost/" });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Event: dom.window.Event,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: dom.window.navigator,
  });
  const root = createRoot(document.getElementById("root"));
  await act(() => root.render(createElement(App)));
  t.after(async () => {
    await act(() => root.unmount());
    dom.window.close();
  });
}
const text = () => document.body.textContent;
async function click(label, scope = document) {
  const b = [...scope.querySelectorAll("button")].find(
    (b) => (b.getAttribute("aria-label") || b.textContent) === label
  );
  assert.ok(b, `Missing ${label}`);
  await act(() => b.click());
}
async function input(label, value) {
  const el = document.querySelector(`[aria-label="${label}"]`);
  assert.ok(el, `Missing ${label}`);
  await act(() => {
    Object.getOwnPropertyDescriptor(
      el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype,
      "value"
    ).set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function select(label, value) {
  const el = document.querySelector(`[aria-label="${label}"]`);
  assert.ok(el, `Missing ${label}`);
  await act(() => {
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
const card = (id) => document.querySelector(`[data-catalog-item="${id}"]`);

import {
  createConnected,
  place,
  resolveClaim,
  assemble,
  reviewBundle,
  transition,
} from "../src/connected.ts";

test("P2 reassembly cannot leave ready status paired with an unreviewed bundle", () => {
  const s = createConnected(),
    a = s.applications[0];
  resolveClaim(s, a.id, "exclude");
  place(s, a.id, "resume", "asset-shared");
  place(s, a.id, "communication", "asset-shared");
  assemble(s, a.id);
  reviewBundle(s, a.id);
  transition(s, a.id, "ready", { confirmed: true, token: "ready" });
  assemble(s, a.id);
  assert.ok(
    a.status !== "ready" || (a.bundle.reviewed && !a.fit.stale),
    "ready requires both current bundle and fit review"
  );
  assert.equal(a.status, "draft");
  assert.equal(a.bundle.reviewed, false);
  assert.equal(a.fit.stale, true);
  assert.equal(
    a.events.length,
    1,
    "reassembly must not manufacture a material event"
  );
});
test("P2 a selected unrelated dependency gap opens the affected asset and preserves application/surface", async (t) => {
  await mount(t);
  await click("Applications");
  await select("Select factual asset", "asset-unrelated");
  await click("Add to Resume");
  await click("Sources & evidence");
  await click("Inspect Research synthesis");
  await input(
    "Claim scope asset-unrelated",
    "Narrower synthetic research scope"
  );
  await click("Save revision", card("asset-unrelated"));
  await click("Applications");
  await click("Remediate support gap");
  assert.equal(
    card("asset-unrelated")
      .querySelector("[aria-expanded]")
      .getAttribute("aria-expanded"),
    "true"
  );
  await click("Return to Product strategy application");
  assert.equal(
    document.querySelector(".projection strong").textContent,
    "Resume"
  );
});
test("P2 stale projections leave Ready to reuse until their source is republished and projection refreshed", async (t) => {
  await mount(t);
  await click("Career knowledge");
  await click("Expand Market entry decision");
  await input("Claim scope asset-shared", "Narrower synthetic launch decision");
  await click("Save revision", card("asset-shared"));
  const ready = document.querySelector('[aria-label="Ready to reuse"]');
  assert.doesNotMatch(ready.textContent, /Projection · Product strategy/);
  assert.match(
    document.querySelector('[aria-label="Build support"]').textContent,
    /Projection · Product strategy/
  );
  await click("Review current revision", card("asset-shared"));
  await click("Publish CatalogAsset", card("asset-shared"));
  assert.doesNotMatch(
    document.querySelector('[aria-label="Ready to reuse"]').textContent,
    /Projection · Product strategy/
  );
  await click("Applications");
  await click("Review and refresh interview projection");
  await click("Career knowledge");
  assert.match(
    document.querySelector('[aria-label="Ready to reuse"]').textContent,
    /Projection · Product strategy/
  );
});
test("P2 readiness needs factual resume AND communication blocks in manifest and submitted snapshot", () => {
  const s = createConnected(),
    a = s.applications[0];
  resolveClaim(s, a.id, "exclude");
  assemble(s, a.id);
  assert.throws(() => reviewBundle(s, a.id), /resume.*communication/i);
  place(s, a.id, "resume", "asset-shared");
  assemble(s, a.id);
  assert.throws(() => reviewBundle(s, a.id), /communication/i);
  place(s, a.id, "communication", "asset-unrelated");
  assemble(s, a.id);
  reviewBundle(s, a.id);
  transition(s, a.id, "ready", { confirmed: true, token: "ready" });
  transition(s, a.id, "submitted", {
    confirmed: true,
    token: "submit",
    date: "2026-02-02",
    channel: "Synthetic portal",
  });
  for (const surface of ["resume", "communication"]) {
    assert.ok(
      a.submitted.blocks.some(
        (b) =>
          b.surface === surface &&
          b.assetId &&
          b.referenceIds.length &&
          !b.unresolved
      )
    );
    assert.ok(a.submitted.manifest.some((m) => m.endsWith(surface)));
  }
});
