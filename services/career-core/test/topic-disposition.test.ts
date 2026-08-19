import assert from "node:assert/strict";
import test from "node:test";

import { resolveTopics } from "@vitae/career-core";

test("keeps model-proposed Seed, CatalogAsset, and pebble outcomes distinct for one source", () => {
  const results = resolveTopics({
    sourceAssetId: "source-portfolio",
    topics: [
      {
        id: "topic-leadership",
        proposal: { kind: "catalog-asset", evidenceRefs: ["source-portfolio#leadership"] },
        humanConfirmation: { decision: "approve" },
      },
      {
        id: "topic-graphql",
        proposal: { kind: "seed", evidenceRefs: ["source-portfolio#graphql"] },
      },
      {
        id: "topic-unrelated",
        proposal: { kind: "pebble" },
      },
    ],
  });

  assert.deepEqual(results, [
    {
      topicId: "topic-leadership",
      kind: "catalog-asset",
      sourceAssetId: "source-portfolio",
      evidenceRefs: ["source-portfolio#leadership"],
      generationEligible: true,
    },
    {
      topicId: "topic-graphql",
      kind: "seed",
      sourceAssetId: "source-portfolio",
      evidenceRefs: ["source-portfolio#graphql"],
      generationEligible: false,
    },
    {
      topicId: "topic-unrelated",
      kind: "pebble",
      sourceAssetId: "source-portfolio",
      evidenceRefs: [],
      generationEligible: false,
    },
  ]);
});

test("does not materialize a model-proposed CatalogAsset without human approval and evidence", () => {
  assert.throws(
    () =>
      resolveTopics({
        sourceAssetId: "source-portfolio",
        topics: [
          {
            id: "topic-unconfirmed",
            proposal: { kind: "catalog-asset", evidenceRefs: [] },
          },
        ],
      }),
    /human approval and at least one evidence reference/,
  );
});

test("rejects duplicate topic IDs so one topic has only one current outcome", () => {
  assert.throws(
    () =>
      resolveTopics({
        sourceAssetId: "source-portfolio",
        topics: [
          { id: "topic-duplicate", proposal: { kind: "seed" } },
          { id: "topic-duplicate", proposal: { kind: "pebble" } },
        ],
      }),
    /duplicate topic ID: topic-duplicate/,
  );
});

test("rejects blank evidence and unknown model-proposed outcomes", () => {
  assert.throws(
    () =>
      resolveTopics({
        sourceAssetId: "source-portfolio",
        topics: [
          {
            id: "topic-blank-evidence",
            proposal: { kind: "catalog-asset", evidenceRefs: ["  "] },
            humanConfirmation: { decision: "approve" },
          },
        ],
      }),
    /human approval and at least one evidence reference/,
  );

  assert.throws(
    () =>
      resolveTopics({
        sourceAssetId: "source-portfolio",
        topics: [
          { id: "topic-invalid", proposal: { kind: "unclassified" as "seed" } },
        ],
      }),
    /unsupported topic outcome: unclassified/,
  );
});

test("does not provide automatic Seed promotion", () => {
  const [seed] = resolveTopics({
    sourceAssetId: "source-portfolio",
    topics: [
      {
        id: "topic-underdeveloped",
        proposal: { kind: "seed", evidenceRefs: ["source-portfolio#note"] },
      },
    ],
  });

  assert.equal(seed.kind, "seed");
  assert.equal(seed.generationEligible, false);
  assert.equal("promote" in seed, false);
});
