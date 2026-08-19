import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';

const packRoot = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);

function readJson(relativeOrAbsolutePath) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(packRoot, relativeOrAbsolutePath);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function readTemplateFrontmatter(relativePath) {
  const content = readFileSync(path.join(packRoot, relativePath), 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, `${relativePath} must start with YAML frontmatter`);
  return yaml.load(match[1]);
}

function docVaderSchemaPath(schemaPath) {
  return path.join(packRoot, '../../vendor/doc-vader-schemas', schemaPath);
}

function createAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(readJson(docVaderSchemaPath('schemas/metadata/base.json')));
  ajv.addSchema(readJson('schemas/metadata/common.json'));
  ajv.addSchema(readJson('schemas/content/common.json'));
  return ajv;
}

test('pack uses a pinned Doc-Vader schema bundle instead of a sibling checkout', () => {
  const packageJson = readJson('package.json');
  const provenance = JSON.parse(readFileSync(
    path.join(packRoot, '../../vendor/doc-vader-schemas/PROVENANCE.json'),
    'utf8',
  ));

  assert.equal(packageJson.devDependencies['@calan-co/doc-vader'], undefined);
  assert.equal(provenance.source.repository, 'https://github.com/calan-co/doc-vader.git');
  assert.match(provenance.source.revision, /^[0-9a-f]{40}$/);
});

test('Vitae SDLC document type pack manifest conforms to Doc-Vader pack schema', () => {
  const ajv = createAjv();
  const packSchema = readJson(docVaderSchemaPath('schemas/doc-vader/document-type-pack.json'));
  const configSchema = readJson(docVaderSchemaPath('schemas/doc-vader/config.json'));
  ajv.addSchema(configSchema);
  const validate = ajv.compile(packSchema);
  const manifest = readJson('document-type-pack.json');

  assert.equal(validate(manifest), true, JSON.stringify(validate.errors, null, 2));
  assert.equal(manifest.namespace, 'vitae.sdlc');
  assert.deepEqual(
    manifest.documentTypes.map((documentType) => documentType.type).sort(),
    ['adr', 'prd'],
  );
  assert.deepEqual(
    manifest.documentTypes
      .map(({ type, contentSchema }) => ({ type, contentSchema }))
      .sort((a, b) => a.type.localeCompare(b.type)),
    [
      { type: 'adr', contentSchema: 'schemas/content/adr.json' },
      { type: 'prd', contentSchema: 'schemas/content/prd.json' },
    ],
  );
});

test('pack metadata schemas validate routed ADR and PRD template frontmatter', () => {
  const ajv = createAjv();
  const adrSchema = readJson('schemas/metadata/adr.json');
  const prdSchema = readJson('schemas/metadata/prd.json');
  const validateAdr = ajv.compile(adrSchema);
  const validatePrd = ajv.compile(prdSchema);

  const adrFrontmatter = readTemplateFrontmatter('templates/adr.md');
  const prdFrontmatter = readTemplateFrontmatter('templates/prd.md');

  assert.equal(validateAdr(adrFrontmatter), true, JSON.stringify(validateAdr.errors, null, 2));
  assert.equal(validatePrd(prdFrontmatter), true, JSON.stringify(validatePrd.errors, null, 2));
  assert.equal(adrFrontmatter.$content_schema, '../schemas/content/adr.json');
  assert.equal(prdFrontmatter.$content_schema, '../schemas/content/prd.json');
});

test('pack metadata schemas reject cross-routed or unrouted document metadata', () => {
  const ajv = createAjv();
  const validateAdr = ajv.compile(readJson('schemas/metadata/adr.json'));
  const validatePrd = ajv.compile(readJson('schemas/metadata/prd.json'));
  const adrFrontmatter = readTemplateFrontmatter('templates/adr.md');
  const unroutedAdrFrontmatter = { ...adrFrontmatter };
  delete unroutedAdrFrontmatter.namespace;

  assert.equal(validateAdr(readTemplateFrontmatter('templates/prd.md')), false);
  assert.equal(validatePrd(adrFrontmatter), false);
  assert.equal(validateAdr(unroutedAdrFrontmatter), false);
});

test('pack content schemas validate their examples and reject missing core body content', () => {
  const ajv = createAjv();
  const adrSchema = readJson('schemas/content/adr.json');
  const prdSchema = readJson('schemas/content/prd.json');
  const validateAdr = ajv.compile(adrSchema);
  const validatePrd = ajv.compile(prdSchema);
  const [adrExample] = adrSchema.examples;
  const [prdExample] = prdSchema.examples;

  assert.equal(validateAdr(adrExample), true, JSON.stringify(validateAdr.errors, null, 2));
  assert.equal(validatePrd(prdExample), true, JSON.stringify(validatePrd.errors, null, 2));

  const adrWithoutDecision = { ...adrExample };
  delete adrWithoutDecision.decisionOutcome;
  const prdWithoutRequirements = { ...prdExample };
  delete prdWithoutRequirements.requirements;

  assert.equal(validateAdr(adrWithoutDecision), false);
  assert.equal(validatePrd(prdWithoutRequirements), false);
});
