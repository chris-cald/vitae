import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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

test('the canonical registry gives every MVP type its own schema and default templjs template', () => {
  const manifest = readJson('manifest.json');
  const expectedTypes = [
    'profile', 'book-of-work', 'source-asset', 'seed', 'catalog', 'catalog-asset',
    'target', 'requirement', 'fit-analysis', 'misalignment', 'recommendation',
    'deliverable', 'cover-letter', 'application', 'application-record', 'workflow',
    'workflow-run', 'projection', 'evidence', 'relationship', 'source-ref',
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
