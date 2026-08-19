export type TopicKind = "catalog-asset" | "seed" | "pebble";

export interface TopicProposal {
  kind: TopicKind;
  evidenceRefs?: readonly string[];
}

export interface TopicCandidate {
  id: string;
  proposal: TopicProposal;
  humanConfirmation?: { decision: "approve" | "reject" };
}

export interface ResolveTopicsInput {
  sourceAssetId: string;
  topics: readonly TopicCandidate[];
}

export interface TopicDisposition {
  topicId: string;
  kind: TopicKind;
  sourceAssetId: string;
  evidenceRefs: readonly string[];
  generationEligible: boolean;
}

const topicKinds = new Set<TopicKind>(["catalog-asset", "seed", "pebble"]);

export function resolveTopics({ sourceAssetId, topics }: ResolveTopicsInput): TopicDisposition[] {
  const topicIds = new Set<string>();

  return topics.map((topic) => {
    if (topicIds.has(topic.id)) {
      throw new Error(`duplicate topic ID: ${topic.id}`);
    }
    topicIds.add(topic.id);

    if (!topicKinds.has(topic.proposal.kind)) {
      throw new Error(`unsupported topic outcome: ${topic.proposal.kind}`);
    }

    const evidenceRefs = [...(topic.proposal.evidenceRefs ?? [])];
    const hasEvidence = evidenceRefs.some((reference) => reference.trim().length > 0);

    if (
      topic.proposal.kind === "catalog-asset" &&
      (topic.humanConfirmation?.decision !== "approve" || !hasEvidence)
    ) {
      throw new Error("A CatalogAsset requires human approval and at least one evidence reference.");
    }

    return {
      topicId: topic.id,
      kind: topic.proposal.kind,
      sourceAssetId,
      evidenceRefs,
      generationEligible: topic.proposal.kind === "catalog-asset",
    };
  });
}
