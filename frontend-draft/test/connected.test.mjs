import test from "node:test";
import assert from "node:assert/strict";
import {
  createConnected,
  createApplication,
  assemble,
  reviewBundle,
  transition,
  place,
  reviewAsset,
  publishAsset,
  editAsset,
  removeProjection,
  refreshProjection,
  resolveClaim,
  primeAsset,
  triageAsset,
  discardAsset,
} from "../src/connected.ts";

test("two independent applications require current supported reviewed bundles and explicit material confirmation", () => {
  const s = createConnected();
  const a = createApplication(
    s,
    { title: "Synthetic platform role", requirements: "Reliability" },
    false
  );
  assert.equal(a, undefined);
  assert.equal(s.applications.length, 2);
  const c = createApplication(
    s,
    { title: "Synthetic new role", requirements: "Delivery" },
    true
  );
  assert.equal(s.applications.length, 3);
  assert.equal(c.status, "draft");
  assert.throws(() => transition(s, "app-a", "ready", {}), /bundle/i);
  place(s, "app-a", "resume", "asset-shared");
  assert.throws(() => place(s, "app-a", "resume", "asset-shared"), /already/i);
  assert.throws(
    () => place(s, "app-a", "resume", "seed-incomplete"),
    /eligible/i
  );
  assemble(s, "app-a");
  assert.throws(() => reviewBundle(s, "app-a"), /unsupported/i);
  s.applications[0].unsupported = "";
  assemble(s, "app-a");
  reviewBundle(s, "app-a");
  transition(s, "app-a", "ready", { confirmed: true, token: "ready-a" });
  assert.throws(
    () => transition(s, "app-a", "submitted", { confirmed: true }),
    /date|channel/i
  );
  const input = {
    confirmed: true,
    date: "2026-02-01",
    channel: "Synthetic portal",
    token: "submit-a",
  };
  transition(s, "app-a", "submitted", input);
  transition(s, "app-a", "submitted", input);
  assert.equal(
    s.applications[0].events.filter((e) => e.kind === "submitted").length,
    1
  );
  assert.equal(s.applications[1].status, "draft");
  const snapshot = JSON.stringify(s.applications[0].submitted);
  editAsset(s, "asset-shared", { scope: "Narrow supported scope" });
  assert.equal(JSON.stringify(s.applications[0].submitted), snapshot);
  assert.equal(s.applications[0].bundle.stale, true);
  assert.throws(
    () => transition(s, "app-a", "interviewing", { confirmed: true }),
    /date|detail/i
  );
  transition(s, "app-a", "interviewing", {
    confirmed: true,
    date: "2026-02-03",
    detail: "Synthetic panel",
    token: "interview",
  });
  transition(s, "app-a", "follow-up", {
    confirmed: true,
    date: "2026-02-04",
    detail: "Synthetic thank you",
    token: "follow",
  });
  transition(s, "app-a", "closed", {
    confirmed: true,
    date: "2026-02-05",
    detail: "Not selected",
    token: "outcome",
  });
  assert.equal(s.applications[0].status, "closed");
});

test("formalization demands evidence for every criterion and human review of current scope", () => {
  const s = createConnected();
  for (const p of [...s.applications[1].projections])
    removeProjection(s, "app-b", p.id);
  assert.throws(() => publishAsset(s, "seed-incomplete"), /review|criteria/i);
  editAsset(s, "seed-incomplete", {
    scope: "Synthetic delivery episode",
    objective: "Improve delivery",
    responsibility: "Owned tests",
    outcome: "Released",
    significance: "Repeatable checks",
    evidence: {
      objective: ["ref-objective"],
      responsibility: ["ref-responsibility"],
      outcome: ["ref-outcome"],
      significance: [],
    },
  });
  assert.throws(() => reviewAsset(s, "seed-incomplete"), /significance/i);
  editAsset(s, "seed-incomplete", {
    evidence: {
      objective: ["ref-objective"],
      responsibility: ["ref-responsibility"],
      outcome: ["ref-outcome"],
      significance: ["ref-significance"],
    },
  });
  reviewAsset(s, "seed-incomplete");
  publishAsset(s, "seed-incomplete");
  place(s, "app-b", "communication", "seed-incomplete");
  assemble(s, "app-b");
  reviewBundle(s, "app-b");
  const unrelated = JSON.stringify(s.applications[1].bundle);
  editAsset(s, "asset-shared", { scope: "Changed scope" });
  assert.equal(JSON.stringify(s.applications[1].bundle), unrelated);
  editAsset(s, "seed-incomplete", { scope: "Changed episode" });
  assert.throws(() => publishAsset(s, "seed-incomplete"), /review/i);
  assert.equal(s.applications[1].bundle.stale, true);
});

test("shared fixture dependencies invalidate both applications while unrelated revisions stay current", () => {
  const s = createConnected();
  assert.ok(
    s.applications.every((a) =>
      a.projections.some((p) => p.assetId === "asset-shared")
    )
  );
  const c = createApplication(
    s,
    { title: "Independent synthetic role", requirements: "Research" },
    true
  );
  place(s, c.id, "resume", "asset-unrelated");
  assemble(s, c.id);
  reviewBundle(s, c.id);
  const independent = JSON.stringify(c);
  resolveClaim(s, "app-a", "exclude");
  for (const a of s.applications.slice(0, 2)) {
    assemble(s, a.id);
    reviewBundle(s, a.id);
  }
  editAsset(s, "asset-shared", {
    scope: "Narrower synthetic research decision",
  });
  for (const a of s.applications.slice(0, 2)) {
    assert.equal(a.bundle.stale, true);
    assert.equal(a.fit.stale, true);
    assert.throws(() => reviewBundle(s, a.id), /current bundle/);
    assert.throws(
      () => refreshProjection(s, a.id, a.projections[0].id),
      /publish/
    );
  }
  assert.equal(JSON.stringify(c), independent);
  reviewAsset(s, "asset-shared");
  publishAsset(s, "asset-shared");
  const a = s.applications[0];
  refreshProjection(s, a.id, a.projections[0].id);
  assemble(s, a.id);
  reviewBundle(s, a.id);
  assert.equal(a.bundle.stale, false);
  assert.equal(a.fit.stale, false);
  assert.equal(s.applications[1].bundle.stale, true);
  assert.equal(a.projections[0].scope, "Narrower synthetic research decision");
});

test("inbox priming and reviewed discard keep readiness separate from types and reject wrong-criterion evidence", () => {
  const s = createConnected();
  triageAsset(s, "intake");
  assert.throws(() => primeAsset(s, "intake", ""), /scope/);
  primeAsset(s, "intake", "Facilitated synthetic workshop");
  const full = {
    scope: "Facilitated synthetic workshop",
    objective: "Align",
    responsibility: "Facilitated",
    outcome: "Decision",
    significance: "Reusable",
    evidence: {
      objective: ["ref-outcome"],
      responsibility: ["ref-responsibility"],
      outcome: ["ref-outcome"],
      significance: ["ref-significance"],
    },
  };
  editAsset(s, "intake", full);
  assert.throws(() => reviewAsset(s, "intake"), /objective/);
  full.evidence.objective = ["ref-objective"];
  editAsset(s, "intake", full);
  reviewAsset(s, "intake");
  publishAsset(s, "intake");
  place(s, "app-a", "resume", "intake");
  assert.throws(() => discardAsset(s, "intake", "", true), /reason/);
  assert.throws(() => discardAsset(s, "intake", "Redundant", false), /review/);
  discardAsset(s, "intake", "Reviewed duplicate synthetic support", true);
  assert.throws(() => place(s, "app-b", "resume", "intake"), /eligible/);
  assert.equal(s.applications[0].projections.at(-1).stale, true);
  for (const id of ["discarded", "seed", "target", "projection-3"])
    assert.throws(() => place(s, "app-a", "resume", id), /eligible/);
});

test("projection edits are local; unsupported claims need exclusion or supported replacement, not review", () => {
  const s = createConnected();
  const a = s.applications[0],
    b = s.applications[1];
  assemble(s, b.id);
  reviewBundle(s, b.id);
  const before = JSON.stringify(b);
  assemble(s, a.id);
  assert.throws(() => reviewBundle(s, a.id), /unsupported/);
  assert.throws(
    () => resolveClaim(s, a.id, "supported", "seed-incomplete"),
    /eligible/
  );
  resolveClaim(s, a.id, "supported", "asset-unrelated");
  assemble(s, a.id);
  reviewBundle(s, a.id);
  assert.ok(a.bundle.blocks.every((b) => !b.unresolved && b.assetId));
  assert.ok(!a.bundle.blocks.some((b) => b.text.includes("80%")));
  removeProjection(s, a.id, a.projections[0].id);
  assert.equal(a.bundle.stale, true);
  assert.equal(JSON.stringify(b), before);
});

test("invalid transitions, missing confirmation, invalid dates, terminal changes and duplicate material confirmations", () => {
  const s = createConnected();
  const a = s.applications[1];
  assert.throws(
    () =>
      transition(s, a.id, "closed", {
        confirmed: true,
        date: "2026-02-01",
        detail: "Outcome",
        token: "bad",
      }),
    /Cannot/
  );
  assert.equal(a.events.length, 0);
  assert.throws(
    () =>
      transition(s, a.id, "withdrawn", {
        confirmed: true,
        date: "2026-02-30",
        detail: "Reason",
        token: "bad",
      }),
    /date/
  );
  assert.throws(
    () =>
      transition(s, a.id, "withdrawn", {
        date: "2026-02-01",
        detail: "Reason",
        token: "bad",
      }),
    /confirmation/
  );
  const input = {
    confirmed: true,
    date: "2026-02-01",
    detail: "Synthetic priorities",
    token: "withdraw",
  };
  transition(s, a.id, "withdrawn", input);
  transition(s, a.id, "withdrawn", input);
  assert.equal(a.events.length, 1);
  assert.throws(
    () => transition(s, a.id, "interviewing", { ...input, token: "new" }),
    /Cannot/
  );
});
