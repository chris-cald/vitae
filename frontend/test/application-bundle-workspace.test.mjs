import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const apiSource = readFileSync(new URL('../src/lib/api.ts', import.meta.url), 'utf8');
const apiCompiled = ts.transpileModule(apiSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = await import(`data:text/javascript;base64,${Buffer.from(apiCompiled).toString('base64')}`);

const artifact = id => ({ name: `${id}.md`, path: `/drafts/${id}.md`, markdown: id });
const bundle = jobFitId => ({
  bookOfWork: { status: 'unavailable', changeCount: 0 },
  application: { id: `application-${jobFitId}`, status: 'draft' },
  applicationRecords: [],
  draftArtifacts: {
    capturedJdNote: artifact(`${jobFitId}-jd`),
    tailoredResumeDraft: artifact(`${jobFitId}-resume`),
    manifest: artifact(`${jobFitId}-manifest`),
    sourceSummary: { eligibleSourceIds: [], targetSourceRef: null, sourceRefs: [] },
    unsupportedClaims: [], nextAction: 'Review',
  },
});

const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

function textContent(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join('');
  return node?.props ? textContent(node.props.children) : '';
}

function findAction(node, label) {
  if (!node || typeof node !== 'object') return undefined;
  if (node.props?.onClick && textContent(node.props.children) === label) return node.props.onClick;
  for (const child of Array.isArray(node.props?.children) ? node.props.children : [node.props?.children]) {
    const found = findAction(child, label);
    if (found) return found;
  }
}

function findField(node, label) {
  if (!node || typeof node !== 'object') return undefined;
  if (node.props?.['aria-label'] === label) return node;
  for (const child of Array.isArray(node.props?.children) ? node.props.children : [node.props?.children]) {
    const found = findField(child, label);
    if (found) return found;
  }
}

function loadWorkspace(apiMock) {
  const source = readFileSync(new URL('../src/components/jobfit/ApplicationBundleWorkspace.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const state = [];
  const effects = [];
  let hook = 0;
  let pending = [];
  const react = {
    useState(initial) {
      const index = hook++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
    useEffect(effect, dependencies) {
      const index = hook++;
      const previous = effects[index];
      if (!previous || dependencies.some((value, i) => value !== previous.dependencies[i])) {
        previous?.cleanup?.();
        effects[index] = { dependencies, effect };
        pending.push(index);
      }
    },
    useRef(initial) {
      const index = hook++;
      if (!(index in state)) state[index] = { current: initial };
      return state[index];
    },
  };
  const exports = {};
  const require = name => ({
    react,
    '@/lib/api': apiMock,
    '@/components/ui/button': { Button: 'button' },
    '@/components/career/RuntimeExecutionControls': { RuntimeExecutionControls: () => null },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
  })[name];
  vm.runInNewContext(compiled, { exports, require });
  const component = exports.ApplicationBundleWorkspace;
  return {
    render(jobFitId) {
      hook = 0;
      pending = [];
      const view = component({ jobFitId });
      for (const index of pending) effects[index].cleanup = effects[index].effect();
      return view;
    },
  };
}

test('job-fit API flow scopes bundle detail and material events', async () => {
  const byFit = new Map();
  const byApplication = new Map();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const request = new URL(url, 'https://vitae.test');
    if (request.pathname === '/api/v1/application-bundles/draft') {
      const { job_fit_id: jobFitId } = JSON.parse(options.body);
      const created = byFit.get(jobFitId) ?? bundle(jobFitId);
      byFit.set(jobFitId, created);
      byApplication.set(created.application.id, { jobFitId, bundle: created });
      return Response.json(created, { status: 201 });
    }
    if (request.pathname === '/api/v1/application-bundles') {
      const current = byFit.get(request.searchParams.get('job_fit_id'));
      return Response.json(current ? [current] : []);
    }
    const applicationId = request.pathname.split('/').at(-2);
    if (options.method === 'POST' && request.pathname.endsWith('/records')) {
      const { job_fit_id: jobFitId, record_type: recordType } = JSON.parse(options.body);
      const current = byApplication.get(applicationId);
      if (current?.jobFitId !== jobFitId) return Response.json({ detail: 'not found' }, { status: 404 });
      current.bundle.applicationRecords.push({ id: `${applicationId}-record`, recordType, occurredAt: '2025-01-01T00:00:00Z' });
      return Response.json(current.bundle.applicationRecords.at(-1), { status: 201 });
    }
    const current = byApplication.get(request.pathname.split('/').at(-1));
    if (current?.jobFitId !== request.searchParams.get('job_fit_id')) return Response.json({ detail: 'not found' }, { status: 404 });
    return Response.json(current.bundle);
  };

  try {
    const first = await api.createDraftApplicationBundle('fit-first');
    assert.deepEqual(await api.listApplicationBundles('fit-first'), [first]);
    await api.addMaterialApplicationRecord(first.application.id, 'fit-first', 'interview');
    assert.deepEqual((await api.fetchApplicationBundle(first.application.id, 'fit-first')).applicationRecords.map(record => record.recordType), ['interview']);
    await assert.rejects(api.fetchApplicationBundle(first.application.id, 'fit-second'));

    const second = await api.createDraftApplicationBundle('fit-second');
    assert.deepEqual(await api.listApplicationBundles('fit-second'), [second]);
    assert.deepEqual((await api.listApplicationBundles('fit-first')).map(item => item.application.id), [first.application.id]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('runtime execution API sends opaque workflow control only', async () => {
  const requests = [];
  const execution = { execution_id: 'exec_opaque', workflow_type: 'book-of-work-refresh', status_code: 'accepted' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    if (url.endsWith('/cancel')) return Response.json({ execution: { ...execution, status_code: 'cancelled' } });
    if (url.endsWith('/decision')) return Response.json({ execution: { ...execution, status_code: 'completed' } });
    return Response.json({ execution, created: true }, { status: 201 });
  };
  try {
    assert.deepEqual(await api.startRuntimeExecution('book-of-work-refresh', 'runtime-token', 'idem_opaque'), execution);
    assert.equal((await api.cancelRuntimeExecution(execution.execution_id, 'runtime-token')).status_code, 'cancelled');
    assert.equal((await api.decideRuntimeExecution(execution.execution_id, 'approve', 'runtime-token')).status_code, 'completed');
    assert.deepEqual(JSON.parse(requests[0].options.body), { workflow_type: 'book-of-work-refresh', idempotency_key: 'idem_opaque' });
    assert.equal(requests[0].options.headers.Authorization, 'Bearer runtime-token');
    assert.deepEqual(JSON.parse(requests[2].options.body), { decision_code: 'approve' });
    assert.equal(JSON.stringify(requests).includes('resume'), false);
    assert.equal(JSON.stringify(requests).includes('prompt'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function loadRuntimeControls(apiMock, storage = new Map(), randomUUID = () => '00000000-0000-4000-8000-000000000001') {
  const source = readFileSync(new URL('../src/components/career/RuntimeExecutionControls.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const state = [];
  let hook = 0;
  const react = {
    useState(initial) {
      const index = hook++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
  };
  const exports = {};
  const require = name => ({
    react,
    '@/lib/api': apiMock,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
  })[name];
  vm.runInNewContext(compiled, {
    exports,
    require,
    crypto: { randomUUID },
    sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
  });
  return {
    render(props) {
      hook = 0;
      return exports.RuntimeExecutionControls(props);
    },
  };
}

test('runtime controls let a user start and cancel an opaque refresh execution', async () => {
  const calls = [];
  const controls = loadRuntimeControls({
    startRuntimeExecution: async (workflowType, authorization, idempotencyKey) => {
      calls.push(['start', workflowType, authorization, idempotencyKey]);
      return { execution_id: 'exec_opaque', workflow_type: workflowType, status_code: 'accepted' };
    },
    cancelRuntimeExecution: async (executionId, authorization) => {
      calls.push(['cancel', executionId, authorization]);
      return { execution_id: executionId, workflow_type: 'book-of-work-refresh', status_code: 'cancelled' };
    },
    decideRuntimeExecution: async () => { throw new Error('not used'); },
    fetchRuntimeExecution: async () => { throw new Error('not used'); },
  });

  let view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findField(view, 'Runtime authorization token').props.onChange({ target: { value: 'runtime-token' } });
  view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findAction(view, 'Start Refresh Book of Work')();
  await settle();
  await settle();
  view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  assert.match(textContent(view), /exec_opaque.*accepted/);
  findAction(view, 'Cancel execution')();
  await settle();
  view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });

  assert.match(textContent(view), /cancelled/);
  assert.ok(findAction(view, 'Start Refresh Book of Work'));
  assert.deepEqual(calls, [['start', 'book-of-work-refresh', 'runtime-token', 'idem_00000000-0000-4000-8000-000000000001'], ['cancel', 'exec_opaque', 'runtime-token']]);
});

test('runtime controls reuse an idempotency key after an uncertain start error', async () => {
  const calls = [];
  const controls = loadRuntimeControls({
    startRuntimeExecution: async (...args) => {
      calls.push(args);
      if (calls.length === 1) throw new Error('network error');
      return { execution_id: 'exec_opaque', workflow_type: 'book-of-work-refresh', status_code: 'accepted' };
    },
    cancelRuntimeExecution: async () => { throw new Error('not used'); },
    decideRuntimeExecution: async () => { throw new Error('not used'); },
    fetchRuntimeExecution: async () => { throw new Error('not used'); },
  });

  let view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findField(view, 'Runtime authorization token').props.onChange({ target: { value: 'runtime-token' } });
  view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findAction(view, 'Start Refresh Book of Work')();
  await settle();
  view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findAction(view, 'Start Refresh Book of Work')();
  await settle();

  assert.equal(calls.length, 2);
  assert.equal(calls[0][2], calls[1][2]);
});

function loadCareerInventory(apiMock) {
  const source = readFileSync(new URL('../src/components/career/CareerInventory.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const state = [];
  const effects = [];
  let hook = 0;
  let pending = [];
  const react = {
    useState(initial) {
      const index = hook++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
    useEffect(effect, dependencies) {
      const index = hook++;
      const previous = effects[index];
      if (!previous || dependencies.some((value, i) => value !== previous.dependencies[i])) {
        previous?.cleanup?.();
        effects[index] = { dependencies, effect };
        pending.push(index);
      }
    },
    useRef(initial) {
      const index = hook++;
      if (!(index in state)) state[index] = { current: initial };
      return state[index];
    },
  };
  const exports = {};
  const require = name => ({
    react,
    '@/lib/api': apiMock,
    '@/components/career/RuntimeExecutionControls': { RuntimeExecutionControls: () => null },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
  })[name];
  vm.runInNewContext(compiled, { exports, require });
  return {
    render() {
      hook = 0;
      pending = [];
      const view = exports.CareerInventoryPanel();
      for (const index of pending) effects[index].cleanup = effects[index].effect();
      return view;
    },
  };
}

test('runtime controls reuse a pending idempotency key after remounting', async () => {
  const calls = [];
  const storage = new Map();
  let next = 1;
  const randomUUID = () => `00000000-0000-4000-8000-00000000000${next++}`;
  const apiMock = {
    startRuntimeExecution: async (...args) => {
      calls.push(args);
      if (calls.length === 1) throw new Error('network error');
      return { execution_id: 'exec_opaque', workflow_type: 'book-of-work-refresh', status_code: 'accepted' };
    },
    cancelRuntimeExecution: async () => { throw new Error('not used'); },
    decideRuntimeExecution: async () => { throw new Error('not used'); },
    fetchRuntimeExecution: async () => { throw new Error('not used'); },
  };
  let controls = loadRuntimeControls(apiMock, storage, randomUUID);
  let view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findField(view, 'Runtime authorization token').props.onChange({ target: { value: 'runtime-token' } });
  view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findAction(view, 'Start Refresh Book of Work')();
  await settle();

  controls = loadRuntimeControls(apiMock, storage, randomUUID);
  view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findField(view, 'Runtime authorization token').props.onChange({ target: { value: 'runtime-token' } });
  view = controls.render({ workflowType: 'book-of-work-refresh', label: 'Refresh Book of Work' });
  findAction(view, 'Start Refresh Book of Work')();
  await settle();

  assert.equal(calls.length, 2);
  assert.equal(calls[0][2], calls[1][2]);
});

test('career inventory lets users refresh a displayed Book of Work state', async () => {
  let fetches = 0;
  const inventory = {
    bookOfWork: { status: 'stale', changeCount: 1 },
    sources: [], seeds: [], catalogAssets: [], actions: [],
    counts: { sources: 0, seeds: 0, catalogAssets: 0 },
    generationEligibility: { eligibleSources: [], targetContext: null, gaps: [] },
  };
  const panel = loadCareerInventory({
    fetchCareerInventory: async () => { fetches += 1; return inventory; },
    harvestCareerInventory: async () => { throw new Error('not used'); },
    primeCareerInventorySeed: async () => { throw new Error('not used'); },
  });

  panel.render();
  await settle();
  let view = panel.render();
  findAction(view, 'Refresh inventory')();
  await settle();

  assert.equal(fetches, 2);
});

test('career inventory API uses metadata-only AFK actions', async () => {
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    if (url === '/api/v1/career-inventory') {
      return Response.json({
        sources: [{ id: 'source-synthetic-platform', title: 'Synthetic platform record', sourceType: 'synthetic', sourceRef: { uri: 'vitae://synthetic/career-source/platform' }, capturedAt: '2026-01-01T00:00:00+00:00', seedCount: 0 }],
        seeds: [], catalogAssets: [], actions: [], counts: { sources: 1, seeds: 0, catalogAssets: 0 }, generationEligibility: { eligibleSources: [], targetContext: null, gaps: [] },
      });
    }
    return Response.json({ id: 'seed-synthetic-1', sourceId: 'source-synthetic-platform', status: url.endsWith('/prime') ? 'primed' : 'incubating', provenanceRef: { uri: 'vitae://synthetic/career-source/platform' } });
  };
  try {
    const inventory = await api.fetchCareerInventory();
    await api.harvestCareerInventory(inventory.sources[0].id);
    await api.primeCareerInventorySeed('seed-synthetic-1');
    assert.deepEqual(inventory.counts, { sources: 1, seeds: 0, catalogAssets: 0 });
    assert.deepEqual(requests.map(request => request.url), [
      '/api/v1/career-inventory',
      '/api/v1/career-inventory/harvest',
      '/api/v1/career-inventory/seeds/seed-synthetic-1/prime',
    ]);
    assert.equal(JSON.parse(requests[1].options.body).source_id, 'source-synthetic-platform');
    assert.equal(requests.some(request => /cull|publish|provider/i.test(request.url)), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('workspace ignores create, refresh, and event responses from a prior job fit', async () => {
  const create = deferred();
  const refresh = deferred();
  const event = deferred();
  let fetches = 0;
  const workspace = loadWorkspace({
    listApplicationBundles: async () => [],
    createDraftApplicationBundle: () => create.promise,
    fetchApplicationBundle: () => { fetches += 1; return refresh.promise; },
    addMaterialApplicationRecord: () => event.promise,
  });

  let view = workspace.render('fit-first');
  await settle();
  view = workspace.render('fit-first');
  findAction(view, 'Create or retrieve draft bundle')();
  workspace.render('fit-second');
  create.resolve(bundle('fit-first'));
  await settle();
  view = workspace.render('fit-second');
  assert.ok(!textContent(view).includes('fit-first'));

  const current = loadWorkspace({
    listApplicationBundles: async () => [],
    createDraftApplicationBundle: async () => bundle('fit-current'),
    fetchApplicationBundle: () => { fetches += 1; return refresh.promise; },
    addMaterialApplicationRecord: () => event.promise,
  });
  view = current.render('fit-current');
  await settle();
  view = current.render('fit-current');
  await findAction(view, 'Create or retrieve draft bundle')();
  view = current.render('fit-current');
  findAction(view, 'Refresh bundle')();
  current.render('fit-next');
  refresh.resolve(bundle('fit-current'));
  await settle();
  view = current.render('fit-next');
  assert.ok(!textContent(view).includes('fit-current'));

  const eventWorkspace = loadWorkspace({
    listApplicationBundles: async () => [],
    createDraftApplicationBundle: async () => bundle('fit-event'),
    fetchApplicationBundle: () => { fetches += 1; return Promise.resolve(bundle('fit-event')); },
    addMaterialApplicationRecord: () => event.promise,
  });
  view = eventWorkspace.render('fit-event');
  await settle();
  view = eventWorkspace.render('fit-event');
  await findAction(view, 'Create or retrieve draft bundle')();
  view = eventWorkspace.render('fit-event');
  findAction(view, 'Record material event')();
  eventWorkspace.render('fit-later');
  event.resolve();
  await settle();
  view = eventWorkspace.render('fit-later');
  assert.ok(!textContent(view).includes('fit-event'));
  assert.equal(fetches, 1);
});

test('workspace marks a stale Book of Work source without exposing its path', async () => {
  const staleBundle = { ...bundle('fit-stale'), bookOfWork: { status: 'stale', changeCount: 1 } };
  const workspace = loadWorkspace({
    listApplicationBundles: async () => [],
    createDraftApplicationBundle: async () => staleBundle,
    fetchApplicationBundle: async () => staleBundle,
    addMaterialApplicationRecord: async () => undefined,
  });

  let view = workspace.render('fit-stale');
  await settle();
  view = workspace.render('fit-stale');
  await findAction(view, 'Create or retrieve draft bundle')();
  view = workspace.render('fit-stale');

  assert.match(textContent(view), /Book of Work source state: stale \(1 changes\)/);
  assert.equal(textContent(view).includes('/book-of-work/'), false);
});

test('workspace labels target context as non-evidence after creating a bundle', async () => {
  const workspace = loadWorkspace({
    listApplicationBundles: async () => [],
    createDraftApplicationBundle: async () => bundle('fit-context'),
    fetchApplicationBundle: async () => bundle('fit-context'),
    addMaterialApplicationRecord: async () => undefined,
  });

  let view = workspace.render('fit-context');
  await settle();
  view = workspace.render('fit-context');
  await findAction(view, 'Create or retrieve draft bundle')();
  view = workspace.render('fit-context');

  assert.match(textContent(view), /Target context \(not candidate evidence\):/);
});
