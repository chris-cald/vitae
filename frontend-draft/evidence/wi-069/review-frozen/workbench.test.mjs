import assert from "node:assert/strict";
import test from "node:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import App from "../src/App.tsx";

const button = (root, label) =>
  [...root.querySelectorAll("button")].find(
    (element) => element.textContent === label
  );
const sidebarButton = (document, label) =>
  button(
    document.querySelector('nav[aria-label="Primary workbench views"]'),
    label
  );

async function renderApp() {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div></body></html>',
    {
      url: "http://localhost/",
    }
  );
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
  await act(async () => root.render(createElement(App)));
  return { dom, root };
}

// WI-068 regression intents retained; WI-069 replaces entity-type columns and
// generic success notices with readiness semantics and real guarded actions.
const card = (id) => document.querySelector(`[data-catalog-item="${id}"]`);
async function click(label, scope = document) {
  const b = button(scope, label);
  assert.ok(b, `Missing ${label}`);
  await act(() => b.click());
}
async function fixture(t) {
  const { dom, root } = await renderApp();
  t.after(async () => {
    await act(() => root.unmount());
    dom.window.close();
  });
}
async function input(label, value) {
  const el = document.querySelector(`[aria-label="${label}"]`);
  assert.ok(el);
  await act(() => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function supply(id, criterion) {
  const el = card(id).querySelector(
    `[aria-label="${criterion} evidence ${id}"]`
  );
  await act(() => {
    el.value = `ref-${criterion}`;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
async function support(id) {
  for (const c of ["objective", "responsibility", "outcome", "significance"]) {
    await input(`${c} ${id}`, `Synthetic ${c}`);
    await supply(id, c);
  }
}

test("single accessible navigation, priorities and placement remain interactive", async (t) => {
  await fixture(t);
  assert.equal(document.querySelectorAll("nav").length, 1);
  assert.equal(
    sidebarButton(document, "Today").getAttribute("aria-current"),
    "page"
  );
  await click("Start next priority");
  assert.match(document.body.textContent, /Application pipeline/);
  await click("Cover letter");
  assert.match(
    document.querySelector(".projection").textContent,
    /Cover letter/
  );
  await input("Search applications", "operating");
  assert.equal(document.querySelectorAll("[data-application]").length, 1);
});
test("navigation and cancelled creation never manufacture material events", async (t) => {
  await fixture(t);
  await click("New application");
  await click("Cancel creation");
  for (const label of [
    "Applications",
    "Sources & evidence",
    "Decisions",
    "Deliverables",
    "Activity",
  ])
    await act(() => sidebarButton(document, label).click());
  assert.equal(
    (document.body.textContent.match(/No confirmed material events/g) || [])
      .length,
    2
  );
  assert.doesNotMatch(
    document.body.textContent,
    /Mock action recorded|Mock application created/
  );
});
test("all entry points expose four readiness columns with expandable safe metadata", async (t) => {
  await fixture(t);
  for (const entry of ["Today", "Sources & evidence", "Catalog"]) {
    await act(() => sidebarButton(document, entry).click());
    await click("Open Catalog Development");
    assert.ok(
      document.querySelector('[aria-label="Catalog Development board"]')
    );
  }
  for (const stage of [
    "Evidence inbox",
    "Triage",
    "Build support",
    "Ready to reuse",
  ])
    assert.ok(document.querySelector(`[aria-label="${stage}"]`));
  for (const id of [
    "intake",
    "seed",
    "seed-incomplete",
    "asset-unrelated",
    "asset-shared",
  ]) {
    const toggle = card(id).querySelector("[aria-expanded]");
    await act(() => toggle.click());
    for (const label of [
      "State",
      "Source metadata",
      "Supporting evidence",
      "Unresolved gaps",
      "Related target",
      "Next action",
    ])
      assert.match(card(id).textContent, new RegExp(label));
    await act(() => toggle.click());
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
  }
});
test("publication blocks incomplete evidence and requires current human review", async (t) => {
  await fixture(t);
  await click("Career knowledge");
  await click("Expand Operating cadence", card("seed-incomplete"));
  await click("Publish CatalogAsset", card("seed-incomplete"));
  assert.match(
    document.querySelector('[role="alert"]').textContent,
    /criteria incomplete/
  );
  await support("seed-incomplete");
  await click("Publish CatalogAsset", card("seed-incomplete"));
  assert.match(
    document.querySelector('[role="alert"]').textContent,
    /Human review/
  );
  await click("Review current revision", card("seed-incomplete"));
  await click("Publish CatalogAsset", card("seed-incomplete"));
  assert.match(card("seed-incomplete").textContent, /State: Ready to reuse/);
});
test("application evidence round trip retains selected surface and search", async (t) => {
  await fixture(t);
  await click("Applications");
  await click("Interview");
  await input("Search applications", "product");
  await click("Open in Catalog Development");
  assert.equal(
    card("asset-shared")
      .querySelector("[aria-expanded]")
      .getAttribute("aria-expanded"),
    "true"
  );
  await click("Return to Product strategy application");
  assert.equal(
    document.querySelector(".projection strong").textContent,
    "Interview"
  );
  assert.equal(
    document.querySelector('[aria-label="Search applications"]').value,
    "product"
  );
});
test("editing support clears prior publication review, never the evidence requirement", async (t) => {
  await fixture(t);
  await click("Career knowledge");
  await click("Expand Operating cadence", card("seed-incomplete"));
  await support("seed-incomplete");
  await click("Review current revision", card("seed-incomplete"));
  await input("outcome seed-incomplete", "Revised synthetic outcome");
  await click("Publish CatalogAsset", card("seed-incomplete"));
  assert.match(
    document.querySelector('[role="alert"]').textContent,
    /Human review/
  );
  await click("Review current revision", card("seed-incomplete"));
  await click("Publish CatalogAsset", card("seed-incomplete"));
  assert.match(card("seed-incomplete").textContent, /State: Ready to reuse/);
});
test("Workshop reflection completes disposition, per-criterion support, review and publication", async (t) => {
  await fixture(t);
  await click("Career knowledge");
  await click("Expand Workshop reflection", card("intake"));
  await click("Move to Triage", card("intake"));
  await click("Develop scoped claim", card("intake"));
  assert.match(document.querySelector('[role="alert"]').textContent, /scope/);
  await input("Claim scope intake", "Facilitated a synthetic workshop");
  await click("Develop scoped claim", card("intake"));
  await support("intake");
  await click("Review current revision", card("intake"));
  await click("Publish CatalogAsset", card("intake"));
  assert.match(card("intake").textContent, /State: Ready to reuse/);
  await click("Applications");
  const option = document.querySelector(
    '[aria-label="Select factual asset"] option[value="intake"]'
  );
  assert.match(option.textContent, /Eligible/);
});
test("two application contexts retain independent search and surface through Catalog return", async (t) => {
  await fixture(t);
  await click("Applications");
  await click("Interview");
  await input("Search applications", "systems");
  await act(() =>
    document
      .querySelector('[aria-label="Open Operating systems application"]')
      .click()
  );
  assert.equal(
    document.querySelector('[aria-label="Search applications"]').value,
    ""
  );
  await click("Cover letter");
  await input("Search applications", "product");
  await click("Open in Catalog Development");
  assert.equal(
    card("seed-incomplete")
      .querySelector("[aria-expanded]")
      .getAttribute("aria-expanded"),
    "true"
  );
  await click("Return to Operating systems application");
  assert.equal(
    document.querySelector(".projection strong").textContent,
    "Cover letter"
  );
  assert.equal(
    document.querySelector('[aria-label="Search applications"]').value,
    "product"
  );
  await act(() =>
    document
      .querySelector('[aria-label="Open Product strategy application"]')
      .click()
  );
  assert.equal(
    document.querySelector(".projection strong").textContent,
    "Interview"
  );
  assert.equal(
    document.querySelector('[aria-label="Search applications"]').value,
    "systems"
  );
});
