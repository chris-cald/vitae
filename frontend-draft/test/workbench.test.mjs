import assert from "node:assert/strict";
import test from "node:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import App from "../src/App.tsx";

const button = (root, label) =>
  [...root.querySelectorAll("button")].find((element) => element.textContent === label);
const sidebarButton = (document, label) =>
  button(document.querySelector('nav[aria-label="Primary workbench views"]'), label);

async function renderApp() {
  const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
    url: "http://localhost/",
  });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Event: dom.window.Event,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

  const root = createRoot(document.getElementById("root"));
  await act(async () => root.render(createElement(App)));
  return { dom, root };
}

test("sidebar navigation and Product strategy evidence placement are interactive", async (t) => {
  const { dom, root } = await renderApp();
  t.after(async () => {
    await act(async () => root.unmount());
    dom.window.close();
  });

  assert.equal(sidebarButton(document, "Today")?.getAttribute("aria-current"), "page");
  assert.match(document.body.textContent, /Today’s priorities/);
  assert.doesNotMatch(document.body.textContent, /Evidence placement/);

  await act(async () => sidebarButton(document, "Career knowledge").click());
  assert.equal(document.querySelector("h1")?.textContent, "Career knowledge");
  assert.match(document.body.textContent, /Catalog Development/);
  assert.equal(sidebarButton(document, "Career knowledge")?.getAttribute("aria-current"), "page");

  await act(async () => sidebarButton(document, "Today").click());
  await act(async () => button(document, "Start next priority").click());
  assert.match(document.body.textContent, /Priority in progress/);

  await act(async () => sidebarButton(document, "Applications").click());
  assert.match(document.body.textContent, /Application pipeline/);
  assert.match(document.body.textContent, /Product strategy/);
  const search = document.querySelector('input[aria-label="Search applications"]');
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(search, "operating");
    search.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const records = [...document.querySelectorAll(".applications-panel .application")].map((item) => item.textContent);
  assert.equal(records.some((record) => record.includes("Product strategy")), false);
  assert.equal(records.some((record) => record.includes("Operating systems")), true);

  await act(async () => button(document, "Cover letter").click());
  assert.match(document.querySelector(".projection")?.textContent, /Cover letter/);
  assert.equal(button(document, "Add to Cover letter")?.textContent, "Add to Cover letter");
});

test("mock action controls publish a status", async (t) => {
  const { dom, root } = await renderApp();
  t.after(async () => { await act(async () => root.unmount()); dom.window.close(); });
  await act(async () => button(document, "New application").click());
  assert.match(document.querySelector('[role="status"]')?.textContent, /Mock application created/);
  await act(async () => sidebarButton(document, "Applications").click());
  for (const label of ["+ Add", "View all applications →", "Review", "Cover letter", "Add to Cover letter"]) {
    await act(async () => button(document, label).click());
    assert.match(document.querySelector('[role="status"]')?.textContent, /Mock action recorded/);
  }
});

const card = (id) => document.querySelector(`[data-catalog-item="${id}"]`);
async function click(label, scope = document) {
  assert.ok(button(scope, label), `Missing button: ${label}`);
  await act(async () => button(scope, label).click());
}
async function fixture(t) {
  const { dom, root } = await renderApp();
  t.after(async () => { await act(async () => root.unmount()); dom.window.close(); });
}

test("Catalog Development is reachable from each workbench entry and exposes safe expandable cards", async (t) => {
  await fixture(t);
  for (const entry of ["Today", "Sources & evidence", "Catalog"]) {
    await act(async () => sidebarButton(document, entry).click());
    await click("Open Catalog Development");
    assert.ok(document.querySelector('[aria-label="Catalog Development board"]'));
  }
  await act(async () => sidebarButton(document, "Career knowledge").click());
  for (const stage of ["Consider", "Seeds", "Evidence & gaps", "Episodes", "Catalog assets"]) {
    assert.ok(document.querySelector(`[aria-label="${stage}"]`));
  }
  for (const id of ["intake", "seed", "gaps", "episode", "market-entry"]) {
    const item = card(id);
    const toggle = item.querySelector('button[aria-expanded]');
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    await act(async () => toggle.click());
    for (const label of ["State", "Source metadata", "Supporting evidence", "Unresolved gaps", "Related target", "Next action"]) assert.match(item.textContent, new RegExp(label));
    assert.match(item.textContent, /Synthetic/);
    await act(async () => toggle.click());
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
  }
});

test("gates block missing evidence and require human review before advancing eligible episodes", async (t) => {
  await fixture(t);
  await act(async () => sidebarButton(document, "Career knowledge").click());
  await click("Expand Operating cadence", card("gaps"));
  await click("Advance to Episodes", card("gaps"));
  assert.match(card("gaps").textContent, /Blocked: Add an outcome evidence reference/);
  assert.equal(card("gaps").closest('section[aria-label]').getAttribute("aria-label"), "Evidence & gaps");
  await click("Confirm human review", card("gaps"));
  await click("Advance to Episodes", card("gaps"));
  assert.match(card("gaps").textContent, /Blocked: Add an outcome evidence reference/);
  assert.equal(card("gaps").closest('section[aria-label]').getAttribute("aria-label"), "Evidence & gaps");
  await click("Expand Research synthesis", card("episode"));
  await click("Advance to Catalog assets", card("episode"));
  assert.match(card("episode").textContent, /Blocked: Confirm human review/);
  await click("Confirm human review", card("episode"));
  await click("Advance to Catalog assets", card("episode"));
  assert.equal(card("episode").closest('section[aria-label]').getAttribute("aria-label"), "Catalog assets");
  assert.match(card("episode").textContent, /State: Catalog assets/);
  await act(async () => sidebarButton(document, "Today").click());
  await click("Open Catalog Development");
  assert.equal(card("episode").closest('section[aria-label]').getAttribute("aria-label"), "Catalog assets");
});

test("application evidence opens the relevant asset and returns with placement and search intact", async (t) => {
  await fixture(t);
  await act(async () => sidebarButton(document, "Applications").click());
  await click("Interview");
  const search = document.querySelector('input[aria-label="Search applications"]');
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(search, "product");
    search.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await click("Open in Catalog Development");
  assert.equal(card("market-entry").querySelector('[aria-expanded]').getAttribute("aria-expanded"), "true");
  await click("Return to Product strategy application");
  assert.match(document.querySelector(".projection").textContent, /Interview/);
  assert.equal(document.querySelector('input[aria-label="Search applications"]').value, "product");
});

async function searchApplications(value) {
  const search = document.querySelector('input[aria-label="Search applications"]');
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(search, value);
    search.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function supplyEvidence(id) {
  const select = card(id).querySelector('select[aria-label="Synthetic outcome evidence"]');
  assert.ok(select, "Missing synthetic evidence selector");
  await act(async () => {
    select.value = "outcome";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

test("blocked evidence can be supplied locally, clears its gap and requires fresh human review", async (t) => {
  await fixture(t);
  await act(async () => sidebarButton(document, "Career knowledge").click());
  await click("Expand Operating cadence", card("gaps"));
  await click("Advance to Episodes", card("gaps"));
  assert.match(card("gaps").textContent, /Blocked: Add an outcome evidence reference/);
  await click("Confirm human review", card("gaps"));
  await supplyEvidence("gaps");
  assert.match(card("gaps").textContent, /EV-SYN-gaps/);
  assert.match(card("gaps").textContent, /Unresolved gapsNone recorded/);
  await click("Advance to Episodes", card("gaps"));
  assert.match(card("gaps").textContent, /Blocked: Confirm human review/);
  await click("Confirm human review", card("gaps"));
  await click("Advance to Episodes", card("gaps"));
  assert.match(card("gaps").textContent, /State: Episodes/);
  assert.match(card("seed").textContent, /State: Seeds/);
});

test("Workshop reflection can complete the entire lifecycle without a dead end", async (t) => {
  await fixture(t);
  await act(async () => sidebarButton(document, "Career knowledge").click());
  await click("Expand Workshop reflection", card("intake"));
  for (const next of ["Seeds", "Evidence & gaps"]) {
    await click("Confirm human review", card("intake"));
    await click(`Advance to ${next}`, card("intake"));
  }
  await click("Advance to Episodes", card("intake"));
  assert.match(card("intake").textContent, /Blocked: Add an outcome evidence reference/);
  await supplyEvidence("intake");
  for (const next of ["Episodes", "Catalog assets"]) {
    await click("Confirm human review", card("intake"));
    await click(`Advance to ${next}`, card("intake"));
    assert.match(card("intake").textContent, new RegExp(`State: ${next}`));
  }
});

test("two application contexts retain their own search and placement through Catalog round trips", async (t) => {
  await fixture(t);
  await act(async () => sidebarButton(document, "Applications").click());
  await click("Interview");
  await searchApplications("systems");
  await act(async () => document.querySelector('[aria-label="Open Operating systems application"]').click());
  assert.equal(document.querySelector(".evidence-panel h2").textContent, "Operating systems");
  assert.equal(document.querySelector('input[aria-label="Search applications"]').value, "");
  assert.equal(document.querySelector(".projection strong").textContent, "Resume");
  await click("Cover letter");
  await searchApplications("product");
  await click("Open in Catalog Development");
  assert.equal(card("gaps").querySelector('[aria-expanded]').getAttribute("aria-expanded"), "true");
  assert.equal(card("market-entry").querySelector('[aria-expanded]').getAttribute("aria-expanded"), "false");
  await click("Return to Operating systems application");
  assert.equal(document.querySelector(".evidence-panel h2").textContent, "Operating systems");
  assert.equal(document.querySelector(".projection strong").textContent, "Cover letter");
  assert.equal(document.querySelector('input[aria-label="Search applications"]').value, "product");
  await act(async () => document.querySelector('[aria-label="Open Product strategy application"]').click());
  assert.equal(document.querySelector(".evidence-panel h2").textContent, "Product strategy");
  assert.equal(document.querySelector(".projection strong").textContent, "Interview");
  assert.equal(document.querySelector('input[aria-label="Search applications"]').value, "systems");
  await click("Open in Catalog Development");
  assert.equal(card("market-entry").querySelector('[aria-expanded]').getAttribute("aria-expanded"), "true");
  assert.equal(card("gaps").querySelector('[aria-expanded]').getAttribute("aria-expanded"), "false");
  await click("Return to Product strategy application");
  assert.equal(document.querySelector(".projection strong").textContent, "Interview");
  assert.equal(document.querySelector('input[aria-label="Search applications"]').value, "systems");
});
