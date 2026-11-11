import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
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
const evidence = path.join(repo, 'docs/evidence/wi-072');
const repairCommit = '1ca2cc0936c0aae1dc3f50a6b9ae0200712d7453';
const repairTree = '5eb648200b9173ded2c9348b3053e252ad006d20';
// Update only by deliberately regenerating the immutable snapshot from repairCommit.
const repairSnapshotSha256 = '2e4c1fbfeef48c7cba3c2de8d4c9658d6ccbaeac51ef14b336228b7e91844b91';
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
const manifest = JSON.parse(readFileSync(path.join(evidence, 'original-manifest.json')));
const baseline = JSON.parse(readFileSync(path.join(evidence, 'baseline-candidate.json')));
const snapshotSource = readFileSync(path.join(evidence, 'repair-snapshot.json'), 'utf8');
const snapshot = JSON.parse(snapshotSource);
const split = source => {
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  return { frontmatter: match?.[0] || '', metadata: match ? yaml.load(match[0].replace(/^---\r?\n/, '').replace(/\r?\n---\r?\n?$/, '')) : null,
    body: source.slice(match?.[0].length || 0) };
};
const sha256 = source => createHash('sha256').update(source).digest('hex');
const originals = manifest.files.map(row => ({ ...row, metadata: split(row.frontmatter).metadata }));
const violating = originals.filter(row => baseline.schema_violations.some(v => v.file === row.file));
const repairs = new Map(snapshot.files.map(row => [row.file, { ...row, metadata: split(row.frontmatter).metadata }]));
const categories = {
  'missing actual conditional': row => row.metadata.status === 'completed' && 'estimated' in row.metadata && !('actual' in row.metadata),
  'unknown relationship keys': row => row.metadata.type === 'work-item' && ['parent', 'implements'].some(key => key in (row.metadata.links || {})),
  'empty dependency list': row => row.metadata.links?.depends_on?.length === 0,
  'malformed supporting references': row => row.metadata.links?.supporting_reference?.some(ref => !/^https?:\/\//.test(ref)),
  'record subtype extension': row => row.metadata.subtype === 'review-result',
  'closed status reason compatibility': row => row.metadata.status === 'closed',
};
function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(filename);
    return entry.isFile() && entry.name.endsWith('.md') ? [filename] : [];
  });
}

for (const [category, predicate] of Object.entries(categories)) {
  test(`WI-072 ${category}: authoritative original red and frozen repair green`, () => {
    const rows = violating.filter(predicate);
    assert.ok(rows.length > 0, `No real baseline examples for ${category}`);
    for (const row of rows) {
      const validate = validators[row.metadata.type];
      assert.equal(validate(row.metadata), false, `${row.file}: original must reproduce failure`);
      assert.equal(validate(repairs.get(row.file)?.metadata), true, `${row.file}: frozen repair: ${JSON.stringify(validate.errors)}`);
    }
  });
}

test('WI-072 immutable repair snapshot is exactly the 1ca2cc0 59-file repair', () => {
  assert.equal(sha256(snapshotSource), repairSnapshotSha256, 'repair snapshot digest');
  assert.equal(snapshot.repair_commit, repairCommit);
  assert.equal(snapshot.repair_tree, repairTree);
  assert.equal(snapshot.original_manifest_sha256, sha256(readFileSync(path.join(evidence, 'original-manifest.json'), 'utf8')));
  assert.equal(violating.length, 59);
  assert.equal(snapshot.files.length, 59);
  assert.deepEqual([...repairs.keys()].sort(), violating.map(row => row.file).sort());
  for (const repair of repairs.values()) {
    assert.equal(sha256(repair.frontmatter + repair.body), repair.sha256, `${repair.file}: repair file bytes`);
    assert.equal(sha256(repair.body), repair.body_sha256, `${repair.file}: repair body bytes`);
  }
});

test('WI-072 frozen proof preserves bodies, facts, valid effort, relationships, and original labels', () => {
  const affected = new Set(violating.map(row => row.file));
  for (const row of originals) {
    if (!affected.has(row.file)) continue;
    const current = repairs.get(row.file);
    assert.ok(current, `${row.file}: repair snapshot entry`);
    assert.equal(current.body_sha256, row.body_sha256, `${row.file}: body bytes`);
    const before = row.metadata;
    const after = current.metadata;
    for (const key of Object.keys(before)) {
      if (['links', 'estimated', 'status_reason', 'subtype'].includes(key)) continue;
      assert.deepEqual(after[key], before[key], `${row.file}: preserve ${key}`);
    }
    assert.deepEqual(Object.keys(after).filter(key => !(key in before)), [], `${row.file}: no speculative fields`);
    if (before.status !== 'completed' || 'actual' in before) assert.equal(after.estimated, before.estimated);
    if (before.status !== 'closed') assert.equal(after.status_reason, before.status_reason);
    if (before.subtype !== 'review-result') assert.equal(after.subtype, before.subtype);
    else assert.equal(after.subtype, 'x-review-result');
    for (const [key, values] of Object.entries(before.links || {})) {
      if (['parent', 'implements'].includes(key)) {
        for (const value of values) assert.ok(after.links?.reference.includes(value), `${row.file}: retain original ${key} label target`);
      } else if (key === 'supporting_reference') {
        for (const value of values) {
          if (/^https?:\/\//.test(value)) assert.ok(after.links.supporting_reference.includes(value));
          else assert.ok(current.body.includes(value), `${row.file}: removed reference survives verbatim in body`);
        }
      } else if (key === 'reference') {
        assert.deepEqual(after.links.reference, [...new Set([
          ...values, ...(before.links.parent || []), ...(before.links.implements || []),
        ])], `${row.file}: existing references plus exact original labels`);
      } else if (values.length) assert.deepEqual(after.links[key], values, `${row.file}: preserve ${key}`);
    }
  }
});

test('WI-072 frozen field report accounts for every original-to-repair metadata change', () => {
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
    assert.deepEqual(repairs.get(row.file)?.metadata, expected, `${row.file}: only reported fields differ in repair snapshot`);
    if (original.status === 'closed') {
      assert.equal(expected.status_reason, 'completed');
      assert.equal(expected.status, 'closed');
      assert.equal(expected.lifecycle, 'active');
      assert.equal(expected.estimated, 3);
    }
  }
});

test('WI-072 current live backlog conforms independently of the frozen repair proof', () => {
  for (const filename of markdownFiles(path.join(repo, 'backlog'))) {
    const metadata = split(readFileSync(filename, 'utf8')).metadata;
    // The authoritative schemas apply only to mapped work-management documents.
    // Legacy prose without a `type` is outside that schema family.
    if (!metadata?.type) continue;
    const validate = validators[metadata.type];
    assert.ok(validate, `${path.relative(repo, filename)}: known frontmatter type`);
    assert.equal(validate(metadata), true, `${path.relative(repo, filename)}: ${JSON.stringify(validate.errors)}`);
  }
});
