import test from "node:test";
import assert from "node:assert/strict";
import { act, createElement } from "react";
import { JSDOM } from "jsdom";
import { CatalogDevelopment } from "../src/CatalogDevelopment.tsx";
import {
  createConnected,
  createApplication,
  place,
  resolveClaim,
  assemble,
  reviewBundle,
  transition,
} from "../src/connected.ts";

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
  let state = createConnected(),
    error = "";
  const independent = createApplication(
    state,
    { title: "Unrelated synthetic role", requirements: "Research" },
    true
  );
  resolveClaim(state, "app-a", "exclude");
  for (const app of state.applications) {
    const asset =
      app.id === independent.id ? "asset-unrelated" : "asset-shared";
    for (const surface of ["resume", "communication"])
      if (!app.projections.some((p) => p.surface === surface))
        place(state, app.id, surface, asset);
    assemble(state, app.id);
    reviewBundle(state, app.id);
    transition(state, app.id, "ready", {
      confirmed: true,
      token: `ready-${app.id}`,
    });
  }
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const render = () =>
    root.render(
      createElement(CatalogDevelopment, {
        state,
        run: (action) => {
          const draft = structuredClone(state);
          try {
            action(draft);
            state = draft;
            error = "";
            render();
          } catch (e) {
            error = e.message;
          }
        },
        expanded: ["asset-shared"],
        setExpanded: () => {},
      })
    );
  await act(render);
  t.after(async () => {
    await act(() => root.unmount());
    dom.window.close();
  });
  return { state: () => state, error: () => error };
}
const field = (label) => document.querySelector(`[aria-label="${label}"]`);
async function click(label) {
  const button = [
    ...document.querySelectorAll('[data-catalog-item="asset-shared"] button'),
  ].find((b) => b.textContent === label);
  assert.ok(button, `Missing ${label}`);
  await act(() => button.click());
}
async function input(el, value) {
  await act(() => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

test("typing retains focus and published state; save applies one revision and only dependent invalidation", async (t) => {
  const fixture = await mount(t),
    before = structuredClone(fixture.state());
  const el = field("Claim scope asset-shared");
  el.focus();
  const original = el.value;
  for (const c of " scoped") {
    await input(el, el.value + c);
    assert.equal(document.activeElement, el);
    assert.equal(field("Claim scope asset-shared"), el);
  }
  assert.equal(el.value, original + " scoped");
  assert.deepEqual(
    fixture.state(),
    before,
    "draft editing must not change domain state"
  );
  await click("Review current revision");
  assert.match(fixture.error(), /Save or cancel unsaved edits/);
  await click("Publish CatalogAsset");
  assert.match(fixture.error(), /Save or cancel unsaved edits/);
  assert.deepEqual(fixture.state(), before);
  await click("Save revision");
  const after = fixture.state(),
    asset = after.assets.find((a) => a.id === "asset-shared");
  assert.equal(asset.revision, 2);
  assert.equal(asset.scope, original + " scoped");
  assert.equal(asset.stage, "Build support");
  assert.equal(asset.reviewed, undefined);
  assert.equal(document.activeElement.textContent, "Save revision");
  for (const app of after.applications.slice(0, 2)) {
    const old = before.applications.find((a) => a.id === app.id);
    assert.equal(app.revision, old.revision + 1);
    assert.equal(app.status, "draft");
    assert.equal(app.fit.stale, true);
    assert.deepEqual(app.events, old.events);
  }
  assert.deepEqual(after.applications[2], before.applications[2]);
  const saved = structuredClone(after);
  await click("Save revision");
  assert.deepEqual(fixture.state(), saved, "repeated save is a no-op");
});

test("criterion and evidence drafts cancel or revert without revision/demotion/events", async (t) => {
  const fixture = await mount(t),
    before = structuredClone(fixture.state());
  const el = field("objective asset-shared"),
    original = el.value;
  el.focus();
  for (const c of " revised") {
    await input(el, el.value + c);
    assert.equal(document.activeElement, el);
  }
  const select = field("objective evidence asset-shared");
  select.focus();
  await act(() => {
    select.value = "";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  assert.equal(document.activeElement, select);
  assert.deepEqual(fixture.state(), before);
  await click("Cancel edits");
  assert.equal(field("objective asset-shared").value, original);
  assert.equal(field("objective evidence asset-shared").value, "ref-objective");
  assert.deepEqual(fixture.state(), before);
  await input(field("objective asset-shared"), original + "x");
  await input(field("objective asset-shared"), original);
  await click("Save revision");
  assert.deepEqual(fixture.state(), before);
});
