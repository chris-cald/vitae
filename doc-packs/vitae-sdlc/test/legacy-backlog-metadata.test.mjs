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
const work = loadSchema(path.join(schemaDir, 'frontmatter/work-item.json'));
const record = loadSchema(path.join(schemaDir, 'frontmatter/record.json'));
const validators = { 'work-item': ajv.getSchema(work.$id), record: ajv.getSchema(record.$id) };
const evidence = path.join(repo, 'docs/evidence/wi-072');
const manifest = JSON.parse(readFileSync(path.join(evidence, 'original-manifest.json')));
const baseline = JSON.parse(readFileSync(path.join(evidence, 'baseline-candidate.json')));
const split = source => {
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  return { metadata: match ? yaml.load(match[0].replace(/^---\r?\n/, '').replace(/\r?\n---\r?\n?$/, '')) : null,
    body: source.slice(match?.[0].length || 0) };
};
const originals = manifest.files.map(row => ({ ...row, metadata: split(row.frontmatter).metadata }));
const violating = originals.filter(row => baseline.schema_violations.some(v => v.file === row.file));
const categories = {
  'missing actual conditional': row => row.metadata.status === 'completed' && 'estimated' in row.metadata && !('actual' in row.metadata),
  'unknown relationship keys': row => row.metadata.type === 'work-item' && ['parent', 'implements'].some(key => key in (row.metadata.links || {})),
  'empty dependency list': row => row.metadata.links?.depends_on?.length === 0,
  'malformed supporting references': row => row.metadata.links?.supporting_reference?.some(ref => !/^https?:\/\//.test(ref)),
  'record subtype extension': row => row.metadata.subtype === 'review-result',
  'closed status reason compatibility': row => row.metadata.status === 'closed',
};
for (const [category, predicate] of Object.entries(categories)) {
  test(`WI-072 ${category}: authoritative baseline red, repository green`, () => {
    const rows = violating.filter(predicate);
    assert.ok(rows.length > 0, `No real baseline examples for ${category}`);
    for (const row of rows) {
      const validate = validators[row.metadata.type];
      assert.equal(validate(row.metadata), false, `${row.file}: original must reproduce failure`);
      const current = split(readFileSync(path.join(repo, row.file), 'utf8')).metadata;
      assert.equal(validate(current), true, `${row.file}: ${JSON.stringify(validate.errors)}`);
    }
  });
}
test('WI-072 all 59 actual baseline files conform; authority is not skipped', () => {
  assert.equal(violating.length, 59);
  for (const row of violating) {
    const validate = validators[row.metadata.type];
    assert.equal(validate(split(readFileSync(path.join(repo, row.file), 'utf8')).metadata), true,
      `${row.file}: ${JSON.stringify(validate.errors)}`);
  }
});
test('WI-072 historical bodies, facts, valid effort and relationships are preserved', () => {
  const affected = new Set(violating.map(row => row.file));
  for (const row of originals) {
    const source = readFileSync(path.join(repo, row.file), 'utf8');
    const { metadata: current, body } = split(source);
    assert.equal(createHash('sha256').update(body).digest('hex'), row.body_sha256, `${row.file}: body bytes`);
    if (!affected.has(row.file)) {
      assert.equal(createHash('sha256').update(source).digest('hex'), row.sha256, `${row.file}: outside scope`);
      continue;
    }
    const before = row.metadata;
    for (const key of Object.keys(before)) {
      if (['links', 'estimated', 'status_reason', 'subtype'].includes(key)) continue;
      assert.deepEqual(current[key], before[key], `${row.file}: preserve ${key}`);
    }
    assert.deepEqual(Object.keys(current).filter(key => !(key in before)), [], 'No speculative fields');
    if (before.status !== 'completed' || 'actual' in before) assert.equal(current.estimated, before.estimated);
    if (before.status !== 'closed') assert.equal(current.status_reason, before.status_reason);
    if (before.subtype !== 'review-result') assert.equal(current.subtype, before.subtype);
    else assert.equal(current.subtype, 'x-review-result');
    for (const [key, values] of Object.entries(before.links || {})) {
      if (['parent', 'implements'].includes(key)) {
        for (const value of values) assert.ok(current.links?.reference.includes(value), `${row.file}: retain ${key} target`);
      } else if (key === 'supporting_reference') {
        for (const value of values) {
          if (/^https?:\/\//.test(value)) assert.ok(current.links.supporting_reference.includes(value));
          else assert.ok(body.includes(value), `${row.file}: removed reference must survive verbatim in body`);
        }
      } else if (key === 'reference') {
        assert.deepEqual(current.links.reference, [...new Set([
          ...values, ...(before.links.parent || []), ...(before.links.implements || []),
        ])], `${row.file}: existing references plus exact historical targets`);
      } else if (values.length) assert.deepEqual(current.links[key], values, `${row.file}: preserve ${key}`);
    }
  }
});

test('WI-072 field report accounts for every metadata change and preserves original relationship labels', () => {
  const changes = JSON.parse(readFileSync(path.join(evidence, 'changes.json')));
  assert.deepEqual(changes.map(row => row.file).sort(), violating.map(row => row.file).sort());
  assert.equal(changes.flatMap(row => row.fields).filter(field => field.field === 'estimated').length, 27);
  for (const row of changes) {
    const original = originals.find(entry => entry.file === row.file).metadata;
    const expected = structuredClone(original);
    for (const field of row.fields) {
      assert.ok(field.reason.length > 0, `${row.file}: field change needs rationale`);
      const [root, child] = field.field.split('.');
      const target = child ? expected[root] : expected;
      const key = child || root;
      assert.deepEqual(target?.[key] ?? null, field.before, `${row.file}: exact original ${field.field}`);
      if (field.after === null) delete target[key];
      else target[key] = field.after;
    }
    if (expected.links && Object.keys(expected.links).length === 0) delete expected.links;
    assert.deepEqual(split(readFileSync(path.join(repo, row.file), 'utf8')).metadata, expected,
      `${row.file}: only explicitly reported fields may differ`);
    if (original.status === 'closed') {
      assert.equal(expected.status_reason, 'completed');
      assert.equal(expected.status, 'closed');
      assert.equal(expected.lifecycle, 'active');
      assert.equal(expected.estimated, 3);
    }
  }
});
