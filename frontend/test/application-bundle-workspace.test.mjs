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
  if (typeof node === 'string') return node;
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
    return Response.json({ id: 'seed-synthetic-1', sourceId: 'source-synthetic-platform', status: url.endsWith('/prime') ? 'primed' : 'harvested', provenanceRef: { uri: 'vitae://synthetic/career-source/platform' } });
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
