import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { After, Before, Given, Then, When, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber';
import { chromium } from 'playwright';

setDefaultTimeout(90_000);

const REQUIRED_WORKFLOWS = new Set([
  'book-of-work-refresh',
  'curation',
  'target-catalog-fit',
  'deliverable-generation',
  'application-automation',
]);

const PRIVATE_RESPONSE_FIELDS = [
  'payload',
  'tenant_key',
  'workflow_definition_id',
  'workflow_run_id',
  'correlation_id',
  'idempotency_key',
];

const FORBIDDEN_KEYS = [
  'resume',
  'jobdescription',
  'prompt',
  'completion',
  'secret',
  'password',
  'token',
  'credential',
  'content',
  'body',
  'text',
  'message',
  'error',
  'exception',
  'reviewer',
  'comment',
  'filename',
  'filepath',
  'url',
  'source',
  'document',
  'artifact',
  'input',
  'result',
  'memo',
  'searchattributes',
  'fields',
  'candidate',
];

const FORBIDDEN_VALUES = [
  /@/,
  /https?:\/\//i,
  /Obsidian Vaults|Job Search/i,
  /\.(pdf|docx?|md|txt)\b/i,
  /\b(resume|job description|prompt|completion|secret|reviewer)\b/i,
];

class UatWorld {
  constructor() {
    this.apiUrl = process.env.VITAE_API_URL || 'http://localhost:8000';
    this.runtimeAuthorization = process.env.VITAE_RUNTIME_AUTHORIZATION;
    this.baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    this.vaultPath = process.env.CANONICAL_VAULT_PATH;
    this.temporalHistoryPath = process.env.TEMPORAL_HISTORY_PATH;
    this.tempDir = mkdtempSync(path.join(tmpdir(), 'vitae-uat-'));
    this.runtimeExecutions = [];
  }

  async request(route, options = {}) {
    const response = await fetch(new URL(route, this.apiUrl), {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(route.startsWith('/api/v1/runtime-executions') && this.runtimeAuthorization ? { Authorization: this.runtimeAuthorization } : {}),
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    return { response, body, text };
  }
}

setWorldConstructor(UatWorld);

Before(async function () {
  this.browser = await chromium.launch({ headless: process.env.PLAYWRIGHT_HEADLESS !== 'false' });
  this.page = await this.browser.newPage();
});

After(async function () {
  await this.page?.close();
  await this.browser?.close();
  rmSync(this.tempDir, { recursive: true, force: true });
});

Given('the Vitae API is reachable', async function () {
  const { response } = await this.request('/api/v1/mvp/application-loop/demo');
  assert.equal(response.ok, true);
});

Given('the frontend is reachable', async function () {
  await this.page.goto(this.baseUrl);
  await this.page.getByText('Upload or Select Resume').waitFor();
});

Given('the canonical vault baseline is captured', function () {
  if (!this.vaultPath) return;
  this.vaultBaseline = snapshotFileInventory(this.vaultPath);
});

Given('a Temporal history export path is configured', function () {
  assert(this.temporalHistoryPath, 'TEMPORAL_HISTORY_PATH is required for full WI-040 UAT');
});

When('I request the expanded MVP UAT contract', async function () {
  const { response, body } = await this.request('/api/v1/mvp/application-loop/expanded-uat');
  assert.equal(response.ok, true);
  this.expandedUat = body;
});

When('I start a runtime execution for {string}', async function (workflowType) {
  const { response, body } = await this.request('/api/v1/runtime-executions', {
    method: 'POST',
    body: JSON.stringify({ workflow_type: workflowType, idempotency_key: `idem_${randomUUID()}` }),
  });
  assert.equal(response.ok, true, JSON.stringify(body));
  this.runtimeExecution = body.execution;
  this.runtimeExecutions.push(body.execution);
});

When('I approve the runtime execution', async function () {
  const { response, body } = await this.request(`/api/v1/runtime-executions/${this.runtimeExecution.execution_id}/decision`, {
    method: 'POST',
    body: JSON.stringify({ decision_code: 'approve' }),
  });
  assert.equal(response.ok, true, JSON.stringify(body));
  this.runtimeExecution = body.execution;
});

When('I cancel the runtime execution', async function () {
  const { response, body } = await this.request(`/api/v1/runtime-executions/${this.runtimeExecution.execution_id}/cancel`, {
    method: 'POST',
  });
  assert.equal(response.ok, true, JSON.stringify(body));
  this.runtimeExecution = body.execution;
});

When('I complete the browser job-fit flow with synthetic material', async function () {
  await this.page.goto(this.baseUrl);
  await this.page.getByRole('button', { name: '4' }).click();
  const fit = this.page.getByText('Synthetic UAT Fit').last();
  await fit.waitFor({ state: 'visible', timeout: 30_000 });
  await fit.click();
  await this.page.getByText('Synthetic UAT analysis passed.').waitFor({ timeout: 30_000 });
});

When('I inspect the Temporal history export', function () {
  const history = JSON.parse(readFileSync(this.temporalHistoryPath, 'utf8'));
  assertNoForbiddenTemporalHistory(history);
});

When('I capture the canonical vault final inventory', function () {
  if (!this.vaultPath) return;
  this.vaultFinal = snapshotFileInventory(this.vaultPath);
});

Then('at least two applications are present', function () {
  assert(this.expandedUat.applications.length >= 2);
});

Then('required Temporal workflow types are advertised', function () {
  const actual = new Set(this.expandedUat.temporal.workflowTypes);
  for (const workflowType of REQUIRED_WORKFLOWS) assert(actual.has(workflowType), workflowType);
});

Then('the Book of Work refresh reports no canonical vault mutation', function () {
  assert.equal(this.expandedUat.bookOfWorkRefresh.canonicalVaultMutated, false);
});

Then('the runtime execution is accepted for {string}', function (workflowType) {
  assert.equal(this.runtimeExecution.workflow_type, workflowType);
  assert.equal(this.runtimeExecution.status_code, 'accepted');
});

Then('the public runtime response contains no private Temporal payload fields', function () {
  for (const field of PRIVATE_RESPONSE_FIELDS) assert(!(field in this.runtimeExecution), field);
});

Then('the runtime execution is completed', function () {
  assert.equal(this.runtimeExecution.status_code, 'completed');
});

Then('the runtime execution is cancelled', function () {
  assert.equal(this.runtimeExecution.status_code, 'cancelled');
});

Then('the browser shows job-fit results', async function () {
  await this.page.getByRole('heading', { name: 'Results' }).waitFor();
});

Then('no browser-visible error includes synthetic private source text', async function () {
  const bodyText = await this.page.locator('body').innerText();
  assert(!bodyText.includes('SYNTHETIC_PRIVATE_SOURCE_SENTINEL'));
});

Then('the Temporal history contains no forbidden UAT evidence', function () {
  assert.equal(true, true);
});

Then('the canonical vault inventory is unchanged', function () {
  if (!this.vaultPath) return;
  assert.deepEqual(diffFileInventory(this.vaultBaseline, this.vaultFinal), []);
});

function snapshotFileInventory(root) {
  const entries = {};
  const visit = dir => {
    for (const name of readdirSync(dir)) {
      const fullPath = path.join(dir, name);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) visit(fullPath);
      if (stat.isFile()) {
        const relativeHash = createHash('sha256')
          .update(path.relative(root, fullPath).split(path.sep).join('/'))
          .digest('hex');
        entries[relativeHash] = { size: stat.size, mtimeMs: stat.mtimeMs };
      }
    }
  };
  visit(root);
  return entries;
}

function diffFileInventory(before = {}, after = {}) {
  const beforeKeys = new Set(Object.keys(before));
  const afterKeys = new Set(Object.keys(after));
  const changes = [];
  for (const pathHash of afterKeys) if (!beforeKeys.has(pathHash)) changes.push({ change: 'added', pathHash });
  for (const pathHash of beforeKeys) if (!afterKeys.has(pathHash)) changes.push({ change: 'deleted', pathHash });
  for (const pathHash of beforeKeys) {
    if (afterKeys.has(pathHash) && JSON.stringify(before[pathHash]) !== JSON.stringify(after[pathHash])) {
      changes.push({ change: 'modified', pathHash });
    }
  }
  return changes.sort((a, b) => `${a.pathHash}:${a.change}`.localeCompare(`${b.pathHash}:${b.change}`));
}

export function assertNoForbiddenTemporalHistory(value) {
  scanHistory(value);
}

function isEncodedTemporalPayloads(value) {
  return Boolean(value)
    && typeof value === 'object'
    && Array.isArray(value.payloads)
    && value.payloads.every(payload => Boolean(payload)
      && typeof payload === 'object'
      && Object.keys(payload).every(key => key === 'metadata' || key === 'data')
      && (payload.data === undefined || typeof payload.data === 'string'));
}

function scanHistory(value, key = '') {
  if (Array.isArray(value)) {
    value.forEach(item => scanHistory(item, key));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      const normalized = childKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (FORBIDDEN_KEYS.some(part => normalized.includes(part))) {
        if ((normalized === 'input' || normalized === 'result') && isEncodedTemporalPayloads(childValue)) continue;
        throw new Error(`forbidden UAT evidence key: ${childKey}`);
      }
      scanHistory(childValue, childKey);
    }
    return;
  }
  if (typeof value === 'string' && FORBIDDEN_VALUES.some(pattern => pattern.test(value))) {
    if (key === 'identity' && /^[A-Za-z0-9_.:-]+@[A-Za-z0-9_.:-]+$/.test(value)) return;
    if (/^\d+@[a-f0-9-]+$/.test(value)) return;
    throw new Error(`forbidden UAT evidence value at ${key || 'value'}`);
  }
}

