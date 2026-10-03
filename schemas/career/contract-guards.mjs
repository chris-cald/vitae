/*
 * In-memory guards for canonical career contracts. Persistence adapters supply
 * the referenced records; these guards deliberately do not inspect raw sources.
 */
function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function recordsById(records) {
  return new Map(records.map((record) => [record.id, record]));
}

function validatedCatalogAsset(id, records) {
  const record = recordsById(records).get(id);
  invariant(
    record?.kind === 'catalog-asset' && record.confirmationStatus === 'validated',
    `Expected validated CatalogAsset: ${id}`,
  );
  return record;
}

export function assertApplicationNotesAreNotes(applicationOrRecord, records) {
  invariant(
    applicationOrRecord?.kind === 'application' || applicationOrRecord?.kind === 'application-record',
    'Only Applications and ApplicationRecords may link Notes.',
  );
  const byId = recordsById(records);

  for (const id of applicationOrRecord.noteIds ?? []) {
    const note = byId.get(id);
    invariant(note?.kind === 'note', `Expected Note: ${id}`);
  }
}

export function assertCanPromoteSeed(seed, promotedAsset) {
  invariant(seed?.kind === 'seed', 'Only a Seed can be promoted.');
  invariant(
    seed.status === 'substantiated' || seed.status === 'promoted',
    'A Seed must be substantiated before promotion.',
  );
  invariant(
    promotedAsset?.kind === 'catalog-asset' && promotedAsset.confirmationStatus === 'validated',
    'A Seed may promote only to a validated CatalogAsset.',
  );
  invariant(
    seed.maturesTo?.includes(promotedAsset.assetKind),
    'The promoted CatalogAsset kind must be declared by the Seed.',
  );
  const evidencedCriteria = new Set(
    (seed.promotionEvidence ?? [])
      .filter(({ sourceRefs }) => sourceRefs?.length)
      .map(({ criterion }) => criterion),
  );
  for (const criterion of seed.promotionCriteria ?? []) {
    invariant(evidencedCriteria.has(criterion), `Promotion criterion lacks evidence: ${criterion}`);
  }
}

export function assertCanCreateProjection(projection, catalogAssets) {
  invariant(projection?.kind === 'projection', 'Only a Projection may use this guard.');
  invariant(projection.status === 'validated', 'A Projection requires validated status.');
  invariant(projection.derivedFromCatalogAssetIds?.length, 'A Projection requires a validated CatalogAsset.');
  for (const id of projection.derivedFromCatalogAssetIds) {
    validatedCatalogAsset(id, catalogAssets);
  }
}

export function assertWorkflowRunApprovals(workflowRun) {
  invariant(workflowRun?.kind === 'workflow-run', 'Only a WorkflowRun may record workflow approvals.');
  const reviews = new Map((workflowRun.reviewDecisions ?? []).map((review) => [review.stage, review]));
  const cull = reviews.get('cull');
  const substantiate = reviews.get('substantiate');

  if (['discard', 'merge', 'split'].includes(cull?.decision)) {
    invariant(cull.status === 'approved' && cull.reviewedAt, 'Cull decision requires human approval.');
  }

  if (workflowRun.outputs?.catalogAssetIds?.length) {
    invariant(
      substantiate?.decision === 'publish-catalog-asset'
        && substantiate.status === 'approved'
        && substantiate.reviewedAt,
      'CatalogAsset publication requires human approval.',
    );
  }
}

export function assertWorkflowRunPromotions(workflowRun, promotions) {
  assertWorkflowRunApprovals(workflowRun);
  const publishedIds = workflowRun.outputs?.catalogAssetIds ?? [];
  const publishedIdSet = new Set(publishedIds);
  invariant(publishedIds.length === publishedIdSet.size, 'WorkflowRun CatalogAsset outputs must be unique.');

  const processedSeedIds = new Set([
    ...(workflowRun.inputs?.seedIds ?? []),
    ...(workflowRun.outputs?.seedIds ?? []),
  ]);
  const promotionCountByAssetId = new Map();
  const promotionCountBySeedId = new Map();

  for (const { seed, catalogAsset } of promotions ?? []) {
    invariant(processedSeedIds.has(seed?.id), 'Promoted Seed must be a WorkflowRun input or output.');
    invariant(publishedIdSet.has(catalogAsset?.id), 'Promoted CatalogAsset must be a WorkflowRun output.');
    promotionCountByAssetId.set(catalogAsset.id, (promotionCountByAssetId.get(catalogAsset.id) ?? 0) + 1);
    promotionCountBySeedId.set(seed.id, (promotionCountBySeedId.get(seed.id) ?? 0) + 1);
    assertCanPromoteSeed(seed, catalogAsset);
  }

  for (const id of publishedIds) {
    invariant(
      promotionCountByAssetId.get(id) === 1,
      `Published CatalogAsset requires exactly one promotion mapping: ${id}`,
    );
  }
  for (const [seedId, count] of promotionCountBySeedId) {
    invariant(count === 1, `Promoted Seed requires exactly one CatalogAsset mapping: ${seedId}`);
  }
}

export function assertCanGenerateDeliverable(deliverable, catalogAssets) {
  invariant(
    deliverable?.kind === 'deliverable' || deliverable?.kind === 'cover-letter',
    'Only Deliverables and cover letters are generation-eligible.',
  );
  invariant(deliverable.applicationId && deliverable.bundleId, 'A deliverable must belong to an Application bundle.');
  invariant(deliverable.contentBlocks?.length, 'A deliverable requires content blocks.');

  for (const block of deliverable.contentBlocks) {
    const supportedByAsset = (block.catalogAssetIds ?? []).every((id) => {
      validatedCatalogAsset(id, catalogAssets);
      return true;
    });
    const hasSupport = supportedByAsset && (
      block.catalogAssetIds?.length
      || block.projectionIds?.length
      || block.sourceRefs?.length
      || block.needsHumanConfirmation === true
    );
    invariant(hasSupport, `Deliverable block ${block.id} lacks support or human confirmation.`);
  }
}
