import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import App from "../src/App";
import "../src/styles.css";

const result = document.getElementById("result")!;
function click(label: string, scope: ParentNode = document) {
  const button = [...scope.querySelectorAll("button")].find((node) => node.textContent === label);
  if (!button) throw new Error(`Missing control: ${label}`);
  if (getComputedStyle(button).display === "none" || button.getClientRects().length === 0) {
    throw new Error(`Hidden control at ${innerWidth}px: ${label}`);
  }
  flushSync(() => button.click());
}
try {
  if (innerWidth > 480) throw new Error(`Expected mobile viewport, got ${innerWidth}`);
  flushSync(() => createRoot(document.getElementById("root")!).render(createElement(App)));
  click("Open Catalog Development");
  click("Expand Operating cadence");
  let card = document.querySelector('[data-catalog-item="gaps"]')!;
  click("Advance to Episodes", card);
  const select = card.querySelector("select")!;
  if (getComputedStyle(select).display === "none" || !select.getClientRects().length) throw new Error("Hidden evidence selector");
  flushSync(() => {
    select.value = "outcome";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  click("Confirm human review", card);
  click("Advance to Episodes", card);
  card = document.querySelector('[data-catalog-item="gaps"]')!;
  if (!card.textContent?.includes("State: Episodes")) throw new Error("Mobile evidence gate did not advance");
  click("Collapse Operating cadence");
  click("Applications", document.querySelector('nav[aria-label="Primary workbench views"]')!);
  click("Open in Catalog Development");
  click("Return to Product strategy application");
  for (const entry of ["Sources & evidence", "Catalog"]) {
    click(entry, document.querySelector('nav[aria-label="Primary workbench views"]')!);
    click("Open Catalog Development");
  }
  result.textContent = `PASS: essential Catalog controls visible and clickable at ${innerWidth}px`;
  result.dataset.result = "pass";
} catch (error) {
  result.textContent = `FAIL: ${String(error)}`;
  result.dataset.result = "fail";
}
