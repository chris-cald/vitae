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
  assert.match(document.body.textContent, /Evidence library/);
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

test("sources link mock records to evidence and let users mark it for a deliverable", async (t) => {
  const { dom, root } = await renderApp();
  t.after(async () => {
    await act(async () => root.unmount());
    dom.window.close();
  });

  await act(async () => sidebarButton(document, "Sources & evidence").click());
  assert.match(document.body.textContent, /Customer research notes/);
  assert.match(document.body.textContent, /Launch decision evidence/);
  assert.match(document.body.textContent, /Ready to use in a deliverable/);
  assert.match(document.body.textContent, /This evidence has not been added to a deliverable yet/);

  await act(async () => button(document, "Use in Resume").click());
  assert.match(document.body.textContent, /Used in Resume/);
  assert.match(document.body.textContent, /This evidence is now linked to the Resume deliverable/);

  await act(async () => sidebarButton(document, "Today").click());
  await act(async () => sidebarButton(document, "Sources & evidence").click());
  assert.match(document.body.textContent, /Used in Resume/);
  assert.match(document.body.textContent, /This evidence is now linked to the Resume deliverable/);

  const planningEvidence = document.querySelector('button[aria-label="View evidence for Planning retrospective"]');
  await act(async () => planningEvidence.click());
  assert.equal(planningEvidence.getAttribute("aria-pressed"), "true");
  assert.match(document.querySelector("#selected-evidence")?.textContent, /Stakeholder alignment evidence/);
  assert.match(document.body.textContent, /Ready to use in a deliverable/);
  assert.match(document.body.textContent, /This evidence has not been added to a deliverable yet/);
});
