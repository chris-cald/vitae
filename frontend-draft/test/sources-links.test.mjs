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

const source = (title) =>
  document.querySelector(`article[aria-label="${title} source links"]`);
const usage = (title) =>
  source(title).querySelector('[aria-label="Current application placements"]');

test("Sources links criteria to references and live two-application usage, including stale placements", async (t) => {
  await mount(t);
  await click("Sources & evidence");
  assert.ok(
    source("Market entry decision"),
    "Sources must expose per-asset support and usage"
  );
  for (const criterion of [
    "objective",
    "responsibility",
    "outcome",
    "significance",
  ]) {
    const association = source("Market entry decision").querySelector(
      `[aria-label="${criterion} support"]`
    );
    assert.match(association.textContent, new RegExp(`ref-${criterion}`));
    const link = association.querySelector("a");
    assert.ok(
      document.querySelector(link.getAttribute("href")),
      "source reference links must resolve to inspectable metadata"
    );
  }
  assert.match(
    usage("Market entry decision").textContent,
    /Product strategy.*Interview.*Grounded/
  );
  assert.match(
    usage("Market entry decision").textContent,
    /Operating systems.*Resume.*Grounded/
  );
  assert.match(source("Operating cadence").textContent, /Not eligible/);
  assert.match(
    source("Operating cadence").textContent,
    /objective.*No supporting reference/
  );
  assert.match(
    source("Research synthesis").textContent,
    /No application placements/
  );
  await click("Applications");
  await click("Add to Resume");
  await click("Open Operating systems application");
  await click("Cover letter");
  await select("Select factual asset", "asset-unrelated");
  await click("Add to Cover letter");
  await click("Sources & evidence");
  assert.match(
    usage("Market entry decision").textContent,
    /Product strategy.*Resume.*Grounded/
  );
  assert.match(
    usage("Research synthesis").textContent,
    /Operating systems.*Cover letter.*Grounded/
  );
  assert.doesNotMatch(
    usage("Research synthesis").textContent,
    /Product strategy/
  );
  await click("Inspect Market entry decision");
  await select("objective evidence asset-shared", "");
  await click(
    "Save revision",
    document.querySelector('[data-catalog-item="asset-shared"]')
  );
  await click("Sources & evidence");
  assert.match(source("Market entry decision").textContent, /Not eligible/);
  assert.match(
    source("Market entry decision").querySelector(
      '[aria-label="objective support"]'
    ).textContent,
    /No supporting reference/
  );
  assert.equal(
    source("Market entry decision").querySelector(
      '[aria-label="objective support"] a'
    ),
    null
  );
  const entries = [...usage("Market entry decision").querySelectorAll("li")];
  assert.equal(entries.length, 3);
  assert.ok(entries.every((e) => e.textContent.includes("Stale")));
  assert.match(usage("Market entry decision").textContent, /Product strategy/);
  assert.match(usage("Market entry decision").textContent, /Operating systems/);
  assert.match(source("Research synthesis").textContent, /Eligible/);
  assert.match(usage("Research synthesis").textContent, /Grounded/);
  assert.doesNotMatch(usage("Research synthesis").textContent, /Stale/);
  await click("Open Product strategy Resume placement");
  assert.equal(
    document.querySelector(".evidence-panel h2").textContent,
    "Product strategy"
  );
  assert.equal(
    document.querySelector(".projection strong").textContent,
    "Resume"
  );
  await click("Sources & evidence");
  assert.ok(
    [...usage("Market entry decision").querySelectorAll("li")].every((e) =>
      e.textContent.includes("Stale")
    )
  );
});
