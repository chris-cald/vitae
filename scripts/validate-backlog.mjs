#!/usr/bin/env node
import { statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const schemaDir = process.env.DV_WORK_MANAGEMENT_SCHEMA_DIR;
if (!schemaDir) {
  console.error('DV_WORK_MANAGEMENT_SCHEMA_DIR is required.');
  process.exit(1);
}

const authority = path.resolve(schemaDir);
try {
  if (!statSync(authority).isDirectory()) throw Error('not a directory');
} catch {
  console.error('DV_WORK_MANAGEMENT_SCHEMA_DIR must name a directory.');
  process.exit(1);
}

const schemaMap = path.resolve(authority, '..', 'frontmatter', 'schema-map.json');
try {
  if (!statSync(schemaMap).isFile()) throw Error('not a file');
} catch {
  console.error(`Derived schema map is missing or not a file: ${schemaMap}`);
  process.exit(1);
}

const result = spawnSync('dv', [
  'backlog', 'validate', '--dir', 'backlog', '--schema-map', schemaMap,
  '--profile', 'ci', '--format', 'json', '--fail-on', 'error',
], { stdio: 'inherit' });

if (result.error) {
  console.error(`Unable to invoke dv: ${result.error.message}`);
  process.exit(1);
}
if (result.signal) process.kill(process.pid, result.signal);
process.exit(result.status ?? 1);
