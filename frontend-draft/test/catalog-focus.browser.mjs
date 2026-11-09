// Real pointer/keyboard Chromium regression using CDP pipe; no browser download.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
assert.ok(process.env.CHROMIUM, "Set CHROMIUM to an existing executable");
const profile = await mkdtemp(path.join(tmpdir(), "vitae-focus-"));
const browser = spawn(
  process.env.CHROMIUM,
  [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--no-first-run",
    "--remote-debugging-pipe",
    `--user-data-dir=${profile}`,
  ],
  { timeout: 60_000, stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] }
);
let serial = 0,
  buffer = "",
  session;
const pending = new Map(),
  events = new Map();
function send(method, params = {}, sessionId = session) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, { resolve, reject });
    browser.stdio[3].write(
      JSON.stringify({
        id,
        method,
        params,
        ...(sessionId ? { sessionId } : {}),
      }) + "\0"
    );
  });
}
function event(method) {
  return new Promise((resolve, reject) => events.set(method, { resolve, reject }));
}
browser.stdio[4].on("data", (data) => {
  buffer += data;
  let boundary;
  while ((boundary = buffer.indexOf("\0")) >= 0) {
    const msg = JSON.parse(buffer.slice(0, boundary));
    buffer = buffer.slice(boundary + 1);
    if (msg.id) {
      const request = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) request?.reject(Error(msg.error.message));
      else request?.resolve(msg.result);
    } else {
      events.get(msg.method)?.resolve(msg.params);
      events.delete(msg.method);
    }
  }
});
const exited = new Promise((resolve) => browser.once("close", resolve));
const fail = (error) => {
  for (const request of pending.values()) request.reject(error);
  pending.clear();
  for (const waiter of events.values()) waiter.reject(error);
  events.clear();
};
browser.on("error", fail);
browser.on("exit", () => fail(Error("Browser exited")));
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
  return result.result.value;
}
async function pointer(expression) {
  const point = await evaluate(
    `(()=>{const el=${expression}; if(!el)throw Error('Missing control');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`
  );
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    ...point,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    ...point,
    button: "left",
    clickCount: 1,
  });
}
const button = (label) =>
  `[...document.querySelectorAll('button')].find(b=>b.textContent===${JSON.stringify(
    label
  )})`;
const card = `document.querySelector('[data-catalog-item="asset-shared"]')`;
const field = (label) => `document.querySelector('[aria-label="${label}"]')`;
async function type(label, suffix) {
  await pointer(field(label));
  await evaluate(
    `{const el=${field(
      label
    )};el.setSelectionRange(el.value.length,el.value.length);}`
  );
  for (const char of suffix) {
    await send("Input.dispatchKeyEvent", { type: "char", text: char });
    assert.equal(
      await evaluate(`document.activeElement===${field(label)}`),
      true,
      `Focus lost while typing ${label}`
    );
  }
}
try {
  const { targetId } = await send(
    "Target.createTarget",
    { url: "about:blank" },
    null
  );
  ({ sessionId: session } = await send(
    "Target.attachToTarget",
    { targetId, flatten: true },
    null
  ));
  await send("Emulation.setDeviceMetricsOverride", {
    width: Number(process.env.DRAFT_WIDTH || 1440),
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.enable");
  const loaded = event("Page.loadEventFired");
  await send("Page.navigate", {
    url: process.env.DRAFT_URL || "http://127.0.0.1:5190/",
  });
  await loaded;
  await pointer(button("Career knowledge"));
  await pointer(button("Expand Market entry decision"));
  const original = await evaluate(`${field("Claim scope asset-shared")}.value`);
  await type("Claim scope asset-shared", " scoped");
  await type("objective asset-shared", " revised");
  assert.equal(
    await evaluate(`${field("Claim scope asset-shared")}.value`),
    original + " scoped"
  );
  assert.match(
    await evaluate(`${card}.textContent`),
    /State: Ready to reuse.*Revision 1/
  );
  await pointer(button("Publish CatalogAsset"));
  assert.match(
    await evaluate(`document.querySelector('[role="alert"]').textContent`),
    /Save or cancel unsaved edits/
  );
  await pointer(button("Cancel edits"));
  assert.equal(
    await evaluate(`${field("Claim scope asset-shared")}.value`),
    original
  );
  assert.equal(
    await evaluate(`${field("objective evidence asset-shared")}.value`),
    "ref-objective"
  );
  await type("Claim scope asset-shared", " saved");
  await pointer(button("Save revision"));
  assert.equal(
    await evaluate(`document.activeElement.textContent`),
    "Save revision"
  );
  assert.match(
    await evaluate(`${card}.textContent`),
    /State: Build support.*Revision 2/
  );
  await pointer(button("Save revision"));
  assert.match(await evaluate(`${card}.textContent`), /Revision 2/);
  await pointer(button("Activity"));
  assert.equal(
    await evaluate(
      `(document.body.textContent.match(/No confirmed material events/g)||[]).length`
    ),
    2
  );
  console.log(
    "PASS: real Chromium pointer/per-character keyboard focus, unsaved guard, cancel, single save, no-op and no fabricated events"
  );
} finally {
  browser.kill();
  await exited;
  await rm(profile, { recursive: true, force: true });
}
