import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  assertApplicationNotesAreNotes,
  assertCanCreateProjection,
  assertCanGenerateDeliverable,
  assertCanPromoteSeed,
  assertWorkflowRunApprovals,
  assertWorkflowRunPromotions,
} from '../contract-guards.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const careerDirectory = path.resolve(testDirectory, '..');
const projectDirectory = path.resolve(careerDirectory, '../..');
const require = createRequire(
  path.join(projectDirectory, 'doc-packs/vitae-sdlc/package.json'),
);
const Ajv2020 = require('ajv/dist/2020.js');
const addFormats = require('ajv-formats');
const templjsCli = process.env.TEMPLJS_CLI
  ?? path.join(path.dirname(require.resolve('@templjs/cli')), 'cli.js');

function validateTemplate(templatePath) {
  const template = readFileSync(templatePath, 'utf8');
  assert.equal((template.match(/\{\{/g) ?? []).length, (template.match(/\}\}/g) ?? []).length,
    `unbalanced interpolations in ${templatePath}`);
  assert.equal((template.match(/\{%/g) ?? []).length, (template.match(/%\}/g) ?? []).length,
    `unbalanced directives in ${templatePath}`);
  if (templjsCli) {
    execFileSync('node', [templjsCli, 'validate', '--template', templatePath], { encoding: 'utf8' });
  }
}

function renderTemplate(templatePath, fixturePath) {
  if (templjsCli) {
    return execFileSync(
      'node',
      [templjsCli, 'render', '--template', templatePath, '--input', fixturePath],
      { encoding: 'utf8' },
    );
  }

  const data = JSON.parse(readFileSync(fixturePath, 'utf8'));
  return readFileSync(templatePath, 'utf8').replace(/\{\{\s*([a-zA-Z][\w.]*)\s*\}\}/g, (_, expression) => {
    const value = expression.split('.').reduce((current, key) => current?.[key], data);
    return value === undefined ? '' : String(value);
  });
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(careerDirectory, relativePath), 'utf8'));
}

function createValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(readJson('common.schema.json'));
  return ajv.compile(readJson('source-asset.schema.json'));
}

test('vendored templjs packages include immutable provenance and license notices', () => {
  const vendorDirectory = path.join(projectDirectory, 'vendor/templjs');
  const provenance = JSON.parse(readFileSync(path.join(vendorDirectory, 'PROVENANCE.json'), 'utf8'));

  assert.equal(provenance.source.repository, 'https://github.com/templjs/templ.js.git');
  assert.match(provenance.source.revision, /^[0-9a-f]{40}$/);
  assert.equal(existsSync(path.join(vendorDirectory, 'LICENSE')), true);
  assert.equal(existsSync(path.join(vendorDirectory, 'NOTICE')), true);
});

test('SourceAsset accepts a provenance-addressable career source', () => {
  const validate = createValidator();
  const sourceAsset = readJson('fixtures/valid/source-asset.json');

  assert.equal(validate(sourceAsset), true, JSON.stringify(validate.errors, null, 2));
});

test('SourceAsset rejects a source without an immutable source reference', () => {
  const validate = createValidator();
  const sourceAsset = readJson('fixtures/invalid/source-asset-missing-source-ref.json');

  assert.equal(validate(sourceAsset), false);
  assert.match(JSON.stringify(validate.errors), /sourceRef/);
});

test('the default SourceAsset template is valid templjs and renders the source identity', () => {
  const templatePath = path.join(projectDirectory, 'templates/career/source-asset.md.tmpl');
  const fixturePath = path.join(careerDirectory, 'fixtures/valid/source-asset.json');

  validateTemplate(templatePath);
  const rendered = renderTemplate(templatePath, fixturePath);

  assert.match(rendered, /Platform migration retrospective/);
  assert.match(rendered, /Source asset/);
});

test('anonymized Obsidian Seed fixtures preserve vault metadata and harvest provenance', () => {
  const validateSeed = createValidatorFor('seed.schema.json');
  const sourceAssets = [
    readJson('fixtures/valid/harvest-source-episode.json'),
    readJson('fixtures/valid/harvest-source-projection.json'),
  ];
  const seeds = [
    readJson('fixtures/valid/harvest-seed-episode.json'),
    readJson('fixtures/valid/harvest-seed-projection.json'),
  ];

  for (const [index, seed] of seeds.entries()) {
    assert.equal(validateSeed(seed), true, JSON.stringify(validateSeed.errors, null, 2));
    assert.equal(seed.status, 'incubating');
    assert.ok(seed.promotionCriteria.length > 0, 'Each Seed must state qualifying promotion criteria');
    assert.match(seed.harvestRationale, /adjacent/i, 'A Seed must identify an adjacent, unsubstantiated topic rather than reuse a mature artifact');
    assert.equal(seed.sourceRefs[0].uri, sourceAssets[index].sourceRef.uri);
    assert.equal(seed.catalogId, undefined, 'Seeds must not be assigned to a Catalog');
  }
});

test('one SourceAsset can harvest multiple distinct Seed topics', () => {
  const source = readJson('fixtures/valid/harvest-source-episode.json');
  const seeds = [
    readJson('fixtures/valid/harvest-seed-episode.json'),
    readJson('fixtures/valid/harvest-seed-episode-adjacent-topic.json'),
  ];
  const validateSeed = createValidatorFor('seed.schema.json');

  for (const seed of seeds) {
    assert.equal(validateSeed(seed), true, JSON.stringify(validateSeed.errors, null, 2));
    assert.equal(seed.sourceRefs[0].uri, source.sourceRef.uri);
  }
  assert.notEqual(seeds[0].id, seeds[1].id);
  assert.notEqual(seeds[0].harvestRationale, seeds[1].harvestRationale);
});

test('the six core-loop fixtures validate and render through their default templates', () => {
  const fixtures = [
    ['seed', 'Seed'],
    ['catalog-asset', 'Catalog asset'],
    ['target', 'Target'],
    ['deliverable', 'Deliverable'],
    ['application', 'Application'],
  ];

  for (const [kind, label] of fixtures) {
    const validate = createValidatorFor(`${kind}.schema.json`);
    const fixturePath = path.join(careerDirectory, `fixtures/valid/${kind}.json`);
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
    assert.equal(validate(fixture), true, `${kind}: ${JSON.stringify(validate.errors, null, 2)}`);

    const rendered = renderTemplate(
      path.join(projectDirectory, `templates/career/${kind}.md.tmpl`),
      fixturePath,
    );
    assert.match(rendered, new RegExp(label));
  }
});

test('confirmed Episodes are validated CatalogAssets with structured episode evidence', () => {
  const validateCatalogAsset = createValidatorFor('catalog-asset.schema.json');
  const episode = readJson('fixtures/valid/catalog-asset.json');
  const incompleteEpisode = readJson('fixtures/invalid/catalog-asset-episode-missing-evidence.json');

  assert.equal(episode.assetKind, 'episode');
  assert.equal(episode.confirmationStatus, 'validated');
  assert.equal(validateCatalogAsset(episode), true, JSON.stringify(validateCatalogAsset.errors, null, 2));
  assert.equal(validateCatalogAsset(incompleteEpisode), false);
  assert.match(JSON.stringify(validateCatalogAsset.errors), /episodeEvidence/);
});

test('a Projection requires validated CatalogAsset derivation and cannot be first factual evidence', () => {
  const validateProjection = createValidatorFor('projection.schema.json');
  const projection = readJson('fixtures/valid/projection.json');
  const missingDerivation = readJson('fixtures/invalid/projection-missing-derived-from.json');
  const episode = readJson('fixtures/valid/catalog-asset.json');

  const missingStatus = { ...projection };
  delete missingStatus.status;
  const draftProjection = { ...projection, status: 'draft' };

  assert.equal(validateProjection(projection), true, JSON.stringify(validateProjection.errors, null, 2));
  assert.equal(validateProjection(missingStatus), false);
  assert.match(JSON.stringify(validateProjection.errors), /status/);
  assert.equal(validateProjection(draftProjection), false);
  assert.match(JSON.stringify(validateProjection.errors), /validated/);
  assert.equal(validateProjection(missingDerivation), false);
  assert.doesNotThrow(() => assertCanCreateProjection(projection, [episode]));
  assert.throws(() => assertCanCreateProjection(missingStatus, [episode]), /validated status/);
  assert.throws(() => assertCanCreateProjection(draftProjection, [episode]), /validated status/);
  assert.throws(() => assertCanCreateProjection(projection, []), /validated CatalogAsset/);
});

test('embedded fit mappings and application-bundled deliverables preserve claim provenance', () => {
  const fitAnalysis = readJson('fixtures/valid/fit-analysis.json');
  const application = readJson('fixtures/valid/application.json');
  const deliverable = readJson('fixtures/valid/deliverable.json');
  const coverLetter = readJson('fixtures/valid/cover-letter.json');
  const note = readJson('fixtures/valid/note.json');

  assert.equal(createValidatorFor('fit-analysis.schema.json')(fitAnalysis), true);
  assert.equal(createValidatorFor('application.schema.json')(application), true);
  assert.equal(createValidatorFor('note.schema.json')(note), true);
  assert.ok(application.noteIds.includes(note.id));
  assert.equal(createValidatorFor('deliverable.schema.json')(deliverable), true);
  assert.equal(createValidatorFor('cover-letter.schema.json')(coverLetter), true);
  assert.equal(deliverable.applicationId, application.id);
  assert.equal(coverLetter.applicationId, application.id);
  assert.equal(coverLetter.materialCategory, 'communications');
  assert.doesNotThrow(() => assertCanGenerateDeliverable(coverLetter, [readJson('fixtures/valid/catalog-asset.json')]));

  const unsupportedBlock = readJson('fixtures/invalid/deliverable-unsupported-content-block.json');
  assert.equal(createValidatorFor('deliverable.schema.json')(unsupportedBlock), false);
});

test('Fit-analysis requirement mappings accept structured generation gaps and reject extras', () => {
  const fitAnalysis = readJson('fixtures/valid/fit-analysis.json');
  const validateFitAnalysis = createValidatorFor('fit-analysis.schema.json');

  const withGenerationGap = structuredClone(fitAnalysis);
  withGenerationGap.requirementMappings[1].generationGap = {
    reason: 'validated-catalog-asset-required',
    sourceKind: 'job-fit-analysis',
  };
  assert.equal(validateFitAnalysis(withGenerationGap), true, JSON.stringify(validateFitAnalysis.errors, null, 2));

  const nonAuthoritativeMatch = structuredClone(fitAnalysis);
  delete nonAuthoritativeMatch.requirementMappings[0].catalogAssetIds;
  nonAuthoritativeMatch.requirementMappings[0].generationGap = {
    reason: 'validated-catalog-asset-required',
    sourceKind: 'job-fit-analysis',
  };
  assert.equal(validateFitAnalysis(nonAuthoritativeMatch), true, JSON.stringify(validateFitAnalysis.errors, null, 2));

  const matchWithoutAuthorityOrGap = structuredClone(nonAuthoritativeMatch);
  delete matchWithoutAuthorityOrGap.requirementMappings[0].sourceRefs;
  assert.equal(validateFitAnalysis(matchWithoutAuthorityOrGap), false);
  assert.match(JSON.stringify(validateFitAnalysis.errors), /anyOf/);

  const withUnexpectedMappingProperty = structuredClone(withGenerationGap);
  withUnexpectedMappingProperty.requirementMappings[1].unexpected = true;
  assert.equal(validateFitAnalysis(withUnexpectedMappingProperty), false);
  assert.match(JSON.stringify(validateFitAnalysis.errors), /additionalProperties/);

  const withUnexpectedGapProperty = structuredClone(withGenerationGap);
  withUnexpectedGapProperty.requirementMappings[1].generationGap.unexpected = true;
  assert.equal(validateFitAnalysis(withUnexpectedGapProperty), false);
  assert.match(JSON.stringify(validateFitAnalysis.errors), /additionalProperties/);
});

test('promotion requires substantiation and a validated CatalogAsset, never a Projection', () => {
  const seed = readJson('fixtures/valid/seed-ready-for-promotion.json');
  const episode = readJson('fixtures/valid/catalog-asset.json');
  const projection = readJson('fixtures/valid/projection.json');

  assert.doesNotThrow(() => assertCanPromoteSeed(seed, episode));
  assert.throws(() => assertCanPromoteSeed(seed, projection), /CatalogAsset/);

  const directProjectionTarget = readJson('fixtures/invalid/seed-direct-projection-promotion.json');
  assert.equal(createValidatorFor('seed.schema.json')(directProjectionTarget), false);
});

test('Applications and ApplicationRecords reference general Notes rather than embedded prose or SourceAssets', () => {
  const embeddedApplicationNote = readJson('fixtures/invalid/application-embedded-note.json');
  const embeddedRecordNote = readJson('fixtures/invalid/application-record-embedded-note.json');
  const application = readJson('fixtures/valid/application.json');
  const applicationRecord = readJson('fixtures/valid/application-record.json');
  const note = readJson('fixtures/valid/note.json');
  const sourceAsset = readJson('fixtures/valid/source-asset.json');
  const noteAboutTarget = { ...note, subjectRefs: [application.targetId] };
  const wrongKindRecord = { ...sourceAsset, id: note.id };

  assert.equal(createValidatorFor('application.schema.json')(embeddedApplicationNote), false);
  assert.equal(createValidatorFor('application-record.schema.json')(embeddedRecordNote), false);
  assert.equal(createValidatorFor('source-asset.schema.json')(wrongKindRecord), true);
  assert.equal(createValidatorFor('application-record.schema.json')(applicationRecord), true);
  assert.equal(createValidatorFor('note.schema.json')(noteAboutTarget), true);
  assert.doesNotThrow(() => assertApplicationNotesAreNotes(application, [noteAboutTarget]));
  assert.doesNotThrow(() => assertApplicationNotesAreNotes(applicationRecord, [noteAboutTarget]));
  assert.throws(() => assertApplicationNotesAreNotes(application, [wrongKindRecord]), /Expected Note: note-example-staff-platform-follow-up/);
  assert.throws(() => assertApplicationNotesAreNotes(applicationRecord, [wrongKindRecord]), /Expected Note: note-example-staff-platform-follow-up/);
});

test('generic Deliverables cannot claim the cover-letter deliverable type', () => {
  const coverLetterBypass = structuredClone(readJson('fixtures/valid/deliverable.json'));
  coverLetterBypass.deliverableType = 'cover-letter';

  const validateDeliverable = createValidatorFor('deliverable.schema.json');
  assert.equal(validateDeliverable(coverLetterBypass), false);
  assert.match(JSON.stringify(validateDeliverable.errors), /deliverableType/);
});

test('Deliverable templates render each content block support or confirmation state', () => {
  const deliverableTemplate = path.join(projectDirectory, 'templates/career/deliverable.md.tmpl');
  const coverLetterTemplate = path.join(projectDirectory, 'templates/career/cover-letter.md.tmpl');
  const deliverableFixture = path.join(careerDirectory, 'fixtures/valid/deliverable.json');
  const coverLetterFixture = path.join(careerDirectory, 'fixtures/valid/cover-letter.json');

  const deliverable = renderTemplate(deliverableTemplate, deliverableFixture);
  const coverLetter = renderTemplate(coverLetterTemplate, coverLetterFixture);

  for (const rendered of [deliverable, coverLetter]) {
    assert.match(rendered, /catalog-asset-platform-reliability/);
    assert.match(rendered, /projection-platform-reliability-positioning/);
    assert.match(rendered, /vault:\/\/career\/sources\/platform-reliability/);
    assert.match(rendered, /#validated-detail/);
    assert.match(rendered, /Requires human confirmation/);
  }
});

test('Notes capture general discovered details without becoming Evidence', () => {
  const note = readJson('fixtures/valid/note.json');
  const validateNote = createValidatorFor('note.schema.json');
  const templatePath = path.join(projectDirectory, 'templates/career/note.md.tmpl');
  const fixturePath = path.join(careerDirectory, 'fixtures/valid/note.json');
  const purportedEvidence = { ...note, claim: 'This must not be accepted as evidence.' };

  assert.equal(validateNote(note), true, JSON.stringify(validateNote.errors, null, 2));
  assert.equal(validateNote(purportedEvidence), false);
  assert.match(JSON.stringify(validateNote.errors), /additionalProperties/);
  assert.match(renderTemplate(templatePath, fixturePath), /application-example-staff-platform/);
});

test('catalog-distillation Workflows declare the ordered Harvest, Cull, Prime, and Substantiate stage contracts', () => {
  const workflow = readJson('fixtures/valid/workflow.json');
  const invalidOrder = readJson('fixtures/invalid/workflow-stages-out-of-order.json');
  const illegalStageKind = structuredClone(workflow);
  illegalStageKind.stages[2].outputKinds.push('application');
  const validateWorkflow = createValidatorFor('workflow.schema.json');

  assert.equal(validateWorkflow(workflow), true, JSON.stringify(validateWorkflow.errors, null, 2));
  assert.deepEqual(workflow.stages.map(({ verb }) => verb), ['harvest', 'cull', 'prime', 'substantiate']);
  assert.equal(workflow.stages[0].executionMode, 'afk');
  assert.equal(workflow.stages[1].humanReview, 'required-for-destructive-actions');
  assert.equal(workflow.stages[3].humanReview, 'required-for-publication');
  assert.equal(validateWorkflow(invalidOrder), false);
  assert.match(JSON.stringify(validateWorkflow.errors), /harvest/);
  assert.equal(validateWorkflow(illegalStageKind), false);
  assert.match(JSON.stringify(validateWorkflow.errors), /allowedValues/);
});

test('WorkflowRuns distinguish one execution from its definition and retain only safe output telemetry', () => {
  const workflow = readJson('fixtures/valid/workflow.json');
  const run = readJson('fixtures/valid/workflow-run.json');
  const invalidPublication = readJson('fixtures/invalid/workflow-run-unapproved-publication.json');
  const invalidStageOrder = readJson('fixtures/invalid/workflow-run-stages-out-of-order.json');
  const unsafeDiagnostic = readJson('fixtures/invalid/workflow-run-unsafe-diagnostic.json');
  const contentLikeDiagnostic = structuredClone(run);
  contentLikeDiagnostic.diagnostics[0].code = 'raw source content';
  const oversizedDiagnostic = structuredClone(run);
  oversizedDiagnostic.diagnostics[0].code = `diagnostic-${'x'.repeat(64)}`;
  const validateRun = createValidatorFor('workflow-run.schema.json');
  const workflowTemplate = path.join(projectDirectory, 'templates/career/workflow.md.tmpl');
  const runTemplate = path.join(projectDirectory, 'templates/career/workflow-run.md.tmpl');

  assert.equal(validateRun(run), true, JSON.stringify(validateRun.errors, null, 2));
  assert.equal(run.workflowId, workflow.id);
  assert.equal(run.name, undefined);
  assert.equal(run.inputs.sourceAssetIds.length, 1);
  assert.equal(run.outputs.seedIds.length, 1);
  assert.equal(run.diagnostics[0].code, 'harvested-candidate-count');
  assert.equal(validateRun(invalidPublication), false);
  assert.match(JSON.stringify(validateRun.errors), /approved/);
  assert.equal(validateRun(invalidStageOrder), false);
  assert.match(JSON.stringify(validateRun.errors), /harvest/);
  assert.equal(validateRun(unsafeDiagnostic), false);
  assert.match(JSON.stringify(validateRun.errors), /additionalProperties/);
  assert.equal(validateRun(contentLikeDiagnostic), false);
  assert.match(JSON.stringify(validateRun.errors), /pattern/);
  assert.equal(validateRun(oversizedDiagnostic), false);
  assert.match(JSON.stringify(validateRun.errors), /maxLength/);
  assert.match(renderTemplate(workflowTemplate, path.join(careerDirectory, 'fixtures/valid/workflow.json')), /substantiate/);
  const renderedRun = renderTemplate(runTemplate, path.join(careerDirectory, 'fixtures/valid/workflow-run.json'));
  for (const inputId of [
    'profile-career-example', 'book-of-work-career-example', 'note-example-staff-platform-follow-up',
    'target-staff-platform-engineer', 'application-example-staff-platform',
  ]) assert.match(renderedRun, new RegExp(inputId));
  assert.match(renderedRun, /Human review/);
});

test('WorkflowRun approval and promotion guards preserve destructive-cull and validated-CatalogAsset boundaries', () => {
  const run = readJson('fixtures/valid/workflow-run.json');
  const seed = readJson('fixtures/valid/seed-ready-for-promotion.json');
  const catalogAsset = readJson('fixtures/valid/catalog-asset.json');
  const unapprovedCull = structuredClone(run);
  unapprovedCull.reviewDecisions[0] = { stage: 'cull', decision: 'discard', status: 'pending' };
  const unapprovedPublication = structuredClone(run);
  unapprovedPublication.reviewDecisions[1] = { stage: 'substantiate', decision: 'publish-catalog-asset', status: 'pending' };

  assert.doesNotThrow(() => assertWorkflowRunApprovals(run));
  assert.throws(() => assertWorkflowRunApprovals(unapprovedCull), /Cull decision requires human approval/);
  assert.throws(() => assertWorkflowRunApprovals(unapprovedPublication), /CatalogAsset publication requires human approval/);
  assert.doesNotThrow(() => assertWorkflowRunPromotions(run, [{ seed, catalogAsset }]));
  assert.throws(
    () => assertWorkflowRunPromotions(run, []),
    /exactly one promotion mapping/,
  );
  assert.throws(
    () => assertWorkflowRunPromotions(run),
    /exactly one promotion mapping/,
  );
  assert.throws(
    () => assertWorkflowRunPromotions(
      { ...run, outputs: { ...run.outputs, catalogAssetIds: [] } },
      [{ seed, catalogAsset }],
    ),
    /WorkflowRun output/,
  );
  assert.throws(
    () => assertWorkflowRunPromotions(run, [{ seed, catalogAsset }, { seed, catalogAsset }]),
    /exactly one promotion mapping/,
  );
  assert.throws(
    () => assertWorkflowRunPromotions(run, [{ seed, catalogAsset: { ...catalogAsset, id: 'catalog-asset-not-published' } }]),
    /WorkflowRun output/,
  );
  assert.throws(
    () => assertWorkflowRunPromotions({ ...run, reviewDecisions: unapprovedPublication.reviewDecisions }, [{ seed, catalogAsset }]),
    /CatalogAsset publication requires human approval/,
  );
});

test('the canonical registry gives every MVP type its own schema and default templjs template', () => {
  const manifest = readJson('manifest.json');
  const expectedTypes = [
    'profile', 'book-of-work', 'source-asset', 'seed', 'catalog', 'catalog-asset',
    'target', 'requirement', 'fit-analysis', 'misalignment', 'recommendation',
    'deliverable', 'cover-letter', 'application', 'application-record', 'workflow',
    'workflow-run', 'projection', 'evidence', 'note', 'relationship', 'source-ref',
  ];

  assert.deepEqual(manifest.types.map(({ kind }) => kind), expectedTypes);
  for (const { schema, template, templateBindings } of manifest.types) {
    assert.equal(existsSync(path.join(careerDirectory, schema)), true, schema);
    assert.equal(existsSync(path.join(projectDirectory, template)), true, template);
    assert.doesNotThrow(() => createValidatorFor(schema));
    const templatePath = path.join(projectDirectory, template);
    validateTemplate(templatePath);
    const templateText = readFileSync(templatePath, 'utf8');
    for (const binding of templateBindings) {
      assert.match(templateText, new RegExp(`\\{\\{\\s*${binding.replace('.', '\\.')}\\b`), `${template} must render ${binding}`);
    }
  }
});

function createValidatorFor(schemaPath) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(readJson('common.schema.json'));
  return ajv.compile(readJson(schemaPath));
}
