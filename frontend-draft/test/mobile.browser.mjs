// Real Chromium check, not JSDOM. Start the draft Vite server on port 5178 first.
// CHROMIUM must point to an existing Chromium/headless-shell executable.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
assert.ok(process.env.CHROMIUM, "Set CHROMIUM to an installed browser executable");
for (const width of [390, 480]) {
  const run = spawnSync(process.env.CHROMIUM, ["--headless", "--no-sandbox", "--disable-gpu", `--window-size=${width},844`, "--dump-dom", "http://127.0.0.1:5178/test/mobile.html"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const result = run.stdout.match(/<output[^>]*id="result"[^>]*>.*?<\/output>/s)?.[0];
  console.log(result ?? run.stdout);
  assert.match(result ?? "", /data-result="pass"/, "Real-browser mobile controls failed");
}
