import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import App from "../src/App";
import "../src/styles.css";

const result = document.getElementById("result")!;
function click(label: string, scope: ParentNode = document) {
  const button = [...scope.querySelectorAll("button")].find(
    (node) => node.textContent === label
  );
  if (!button) throw new Error(`Missing control: ${label}`);
  if (
    getComputedStyle(button).display === "none" ||
    button.getClientRects().length === 0
  ) {
    throw new Error(`Hidden control at ${innerWidth}px: ${label}`);
  }
  flushSync(() => button.click());
}
try {
  if (innerWidth > 480)
    throw new Error(`Expected mobile viewport, got ${innerWidth}`);
  flushSync(() =>
    createRoot(document.getElementById("root")!).render(createElement(App))
  );
  click("New application");
  click("Cancel creation");
  click("Open Catalog Development");
  click("Expand Operating cadence");
  let card = document.querySelector('[data-catalog-item="seed-incomplete"]')!;
  click("Publish CatalogAsset", card);
  if (
    !document
      .querySelector('[role="alert"]')
      ?.textContent?.includes("criteria incomplete")
  )
    throw new Error("Missing gate blocker");
  for (const criterion of [
    "objective",
    "responsibility",
    "outcome",
    "significance",
  ]) {
    const input = card.querySelector(
      `input[aria-label="${criterion} seed-incomplete"]`
    ) as HTMLInputElement;
    flushSync(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!.call(input, `Synthetic ${criterion}`);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const select = card.querySelector(
      `select[aria-label="${criterion} evidence seed-incomplete"]`
    ) as HTMLSelectElement;
    if (!select.getClientRects().length)
      throw new Error("Hidden evidence selector");
    flushSync(() => {
      select.value = `ref-${criterion}`;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  click("Review current revision", card);
  click("Publish CatalogAsset", card);
  card = document.querySelector('[data-catalog-item="seed-incomplete"]')!;
  if (!card.textContent?.includes("State: Ready to reuse"))
    throw new Error("Mobile evidence gate did not advance");
  click("Collapse Operating cadence", card);
  click(
    "Applications",
    document.querySelector('nav[aria-label="Primary workbench views"]')!
  );
  click("Open in Catalog Development");
  click("Return to Product strategy application");
  for (const entry of ["Sources & evidence", "Catalog"]) {
    click(
      entry,
      document.querySelector('nav[aria-label="Primary workbench views"]')!
    );
    click("Open Catalog Development");
  }
  if (document.documentElement.scrollWidth > innerWidth)
    throw new Error("Horizontal document overflow");
  result.textContent = `PASS: essential Catalog controls visible and clickable at ${innerWidth}px`;
  result.dataset.result = "pass";
} catch (error) {
  result.textContent = `FAIL: ${String(error)}`;
  result.dataset.result = "fail";
}
