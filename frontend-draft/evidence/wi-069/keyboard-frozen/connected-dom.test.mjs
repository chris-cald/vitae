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
test("creation is inline, cancellable, distinct and does not fabricate activity", async (t) => {
  await mount(t);
  assert.equal(document.querySelectorAll("nav").length, 1);
  await click("New application");
  await input("Target title", "Synthetic third role");
  await input("Target requirements", "Synthetic delivery");
  await click("Cancel creation");
  await click("Applications");
  assert.equal(document.querySelectorAll("[data-application]").length, 2);
  await click("+ Add");
  await input("Target title", "Synthetic third role");
  await input("Target requirements", "Synthetic delivery");
  await click("Confirm creation");
  assert.equal(document.querySelectorAll("[data-application]").length, 3);
  assert.match(text(), /Synthetic third role/);
  await click("Activity");
  assert.match(text(), /created/);
  assert.doesNotMatch(text(), /Mock action recorded/);
});
test("two complete application flows share catalog remediation without sharing drafts, search or surface", async (t) => {
  await mount(t);
  await click("Applications");
  await click("Cover letter");
  await input("Search applications", "operating");
  await click("Open Operating systems application");
  assert.equal(
    document.querySelector('[aria-label="Search applications"]').value,
    ""
  );
  await click("Interview");
  await input("Application notes", "note-synthetic-b");
  await click("Save note reference");
  await click("Open in Catalog Development");
  assert.equal(
    card("seed-incomplete")
      .querySelector("[aria-expanded]")
      .getAttribute("aria-expanded"),
    "true"
  );
  await click("Review current revision", card("seed-incomplete"));
  assert.match(text(), /Blocked:.*objective/);
  for (const criterion of [
    "objective",
    "responsibility",
    "outcome",
    "significance",
  ]) {
    await input(`${criterion} seed-incomplete`, `Synthetic ${criterion}`);
    await select(`${criterion} evidence seed-incomplete`, `ref-${criterion}`);
  }
  await click("Review current revision", card("seed-incomplete"));
  await click("Publish CatalogAsset", card("seed-incomplete"));
  await click("Return to Operating systems application");
  assert.equal(
    document.querySelector(".projection strong").textContent,
    "Interview"
  );
  await select("Select factual asset", "seed-incomplete");
  await click("Add to Interview");
  await click("Cover letter");
  await click("Add to Cover letter");
  await click("Assemble bundle");
  await click("Review bundle");
  await click("Mark ready");
  await click("Confirm ready");
  await click("Withdraw");
  await click("Confirm withdrawn");
  assert.match(text(), /Blocked:.*date/);
  await input("Action date", "2026-02-04");
  await input("Action detail", "Synthetic changed priorities");
  await click("Confirm withdrawn");
  assert.match(text(), /Canonical status: withdrawn/);
  await click("Open Product strategy application");
  assert.equal(
    document.querySelector(".projection strong").textContent,
    "Cover letter"
  );
  assert.equal(
    document.querySelector('[aria-label="Search applications"]').value,
    "operating"
  );
  await input("Search applications", "");
  await select("Select factual asset", "asset-shared");
  await click("Add to Cover letter");
  await click("Assemble bundle");
  await click("Review bundle");
  assert.match(text(), /Blocked:.*unsupported/i);
  await click("Exclude unsupported claim");
  await click("Resume");
  await click("Add to Resume");
  await click("Assemble bundle");
  await click("Review bundle");
  await click("Mark ready");
  await click("Confirm ready");
  await click("Submit");
  await input("Action date", "2026-02-05");
  await input("Submission channel", "Synthetic portal");
  await click("Cancel action");
  assert.match(text(), /Canonical status: ready/);
  await click("Submit");
  await input("Action date", "2026-02-05");
  await input("Submission channel", "Synthetic portal");
  await click("Confirm submitted");
  assert.match(text(), /Canonical status: submitted/);
  await click("Record interview");
  await input("Action date", "2026-02-06");
  await input("Action detail", "Synthetic panel");
  await click("Confirm interviewing");
  await click("Record follow-up");
  await input("Action date", "2026-02-07");
  await input("Action detail", "Synthetic thank you");
  await click("Confirm follow-up");
  await click("Record outcome");
  await input("Action date", "2026-02-08");
  await input("Action detail", "Synthetic offer declined");
  await click("Confirm closed");
  assert.match(text(), /Canonical status: closed/);
  await click("Activity");
  for (const kind of [
    "submitted",
    "interviewing",
    "follow-up",
    "closed",
    "withdrawn",
  ])
    assert.match(text(), new RegExp(kind));
});
