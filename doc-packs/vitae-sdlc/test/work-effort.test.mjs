import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';

// Required external authority, never a vendored approximation or a skipped gate.
// Override for other installations; missing files/refs fail the test immediately.
const schemaDir = path.resolve(process.env.DV_WORK_MANAGEMENT_SCHEMA_DIR ||
  path.join(homedir(), 'Library/pnpm/doc-vader-runtime/schemas/work-management'));
const repo = path.resolve(import.meta.dirname, '../../..');
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const loaded = new Map();
const remotePrefix = 'https://raw.githubusercontent.com/calan-co/doc-vader/main/schemas/';
function loadSchema(file) {
  const source = readFileSync(file, 'utf8');
  const schema = JSON.parse(source);
  if (loaded.has(schema.$id)) return schema;
  assert.ok(schema.$id, `Authoritative schema lacks $id: ${file}`);
  loaded.set(schema.$id, createHash('sha256').update(source).digest('hex'));
  ajv.addSchema(schema);
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.$ref === 'string') {
      const ref = value.$ref.split('#')[0];
      if (ref && !loaded.has(ref)) {
        let target;
        if (ref.startsWith('/work-management/')) target = path.join(schemaDir, ref.slice('/work-management/'.length) + '.json');
        else if (ref.startsWith(remotePrefix)) target = path.join(schemaDir, '..', ref.slice(remotePrefix.length) + '.json');
        else throw Error(`Unsupported external schema reference (no network fallback): ${ref}`);
        loadSchema(target);
      }
    }
    for (const child of Object.values(value)) visit(child);
  }
  visit(schema);
  return schema;
}
const schema = loadSchema(path.join(schemaDir, 'frontmatter/work-item.json'));
const validate = ajv.getSchema(schema.$id);
assert.equal(typeof validate, 'function', 'Authoritative work-item schema must compile');
const completed = {
  id: 'wi-999999', title: 'Synthetic optional effort contract', type: 'work-item',
  subtype: 'task', lifecycle: 'active', status: 'completed', status_reason: 'completed',
  priority: 'low', links: { evidence: ['[[synthetic-proof]]'] },
};

test('real authoritative completed-item schema permits omitted effort but enforces conditional actual', t => {
  t.diagnostic(`Authoritative schema directory: ${schemaDir}`);
  for (const id of [schema.$id, '/work-management/contracts/work-item-structure', '/work-management/workflows/default/status-policy']) {
    assert.ok(loaded.has(id), `Required authority was not loaded: ${id}`);
    t.diagnostic(`${id} sha256=${loaded.get(id)}`);
  }
  assert.equal(validate(completed), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...completed, estimated: 2 }), false);
  assert.ok(validate.errors.some(error => error.keyword === 'required' && error.params.missingProperty === 'actual'), JSON.stringify(validate.errors));
  // Removing effort must not disable other required terminal/schema gates.
  const withoutLinks = { ...completed }; delete withoutLinks.links;
  assert.equal(validate(withoutLinks), false);
  assert.ok(validate.errors.some(error => error.keyword === 'required' && error.params.missingProperty === 'links'));
  assert.equal(validate({ ...completed, original: 2 }), false, 'No invented original field');
});

for (const file of [
  '069-complete-connected-mock-dual-lifecycles.md',
  '070-validate-connected-mock-dual-lifecycles.md',
  '071-isolate-mock-prerequisite-test-resources.md',
]) {
  test(`${file} omits both optional effort fields and conforms to authority`, () => {
    const source = readFileSync(path.join(repo, 'backlog', file), 'utf8');
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(match, 'Expected YAML frontmatter');
    const metadata = yaml.load(match[1]);
    assert.equal(Object.hasOwn(metadata, 'estimated'), false, 'estimated must be omitted');
    assert.equal(Object.hasOwn(metadata, 'actual'), false, 'actual must be omitted, not null/zero/inferred');
    assert.equal(validate(metadata), true, JSON.stringify(validate.errors));
  });
}
