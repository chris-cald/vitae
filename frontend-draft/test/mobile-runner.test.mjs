import assert from "node:assert/strict";
import test from "node:test";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";

// Stub the OS boundary, never launch Chromium or a deliberately hanging process.
async function withBrowserResult(t, result, check) {
  const previous = process.env.CHROMIUM;
  process.env.CHROMIUM = "/synthetic/chromium";
  const calls = [];
  const spawn = t.mock.method(childProcess, "spawnSync", (...args) => {
    calls.push(args);
    return result;
  });
  const log = t.mock.method(console, "log", () => {});
  syncBuiltinESMExports();
  try {
    await check(() => import(`./mobile.browser.mjs?case=${encodeURIComponent(t.name)}`), calls);
  } finally {
    spawn.mock.restore();
    log.mock.restore();
    syncBuiltinESMExports();
    if (previous === undefined) delete process.env.CHROMIUM;
    else process.env.CHROMIUM = previous;
  }
}

const success = {
  status: 0,
  stderr: "",
  stdout: '<output id="result" data-result="pass">Synthetic pass</output>',
};

test("browser runner bounds both viewport processes to 60 seconds without changing arguments", async (t) => {
  await withBrowserResult(t, success, async (run, calls) => {
    await run();
    assert.equal(calls.length, 2);
    for (const [index, width] of [390, 480].entries()) {
      assert.deepEqual(calls[index], [
        "/synthetic/chromium",
        ["--headless", "--no-sandbox", "--disable-gpu", `--window-size=${width},844`, "--dump-dom", "http://127.0.0.1:5178/test/mobile.html"],
        { encoding: "utf8", timeout: 60_000 },
      ]);
    }
  });
});

for (const [code, status] of [["ETIMEDOUT", null], ["ENOENT", 0]]) {
  test(`browser runner reports ${code} before checking status or parsing stdout`, async (t) => {
    const error = Object.assign(new Error(`Synthetic spawn failure: ${code}`), { code });
    await withBrowserResult(t, { ...success, status, error }, async (run, calls) => {
      await assert.rejects(run, new RegExp(`Synthetic spawn failure: ${code}`));
      assert.equal(calls.length, 1, "a failed spawn must stop before the second viewport");
    });
  });
}

test("browser runner still rejects nonzero status without a spawn error", async (t) => {
  await withBrowserResult(t, { ...success, status: 7, stderr: "Synthetic browser exit" }, async (run, calls) => {
    await assert.rejects(run, /Synthetic browser exit/);
    assert.equal(calls.length, 1);
  });
});
