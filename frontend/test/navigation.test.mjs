import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

function textContent(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).join('');
  return node?.props ? textContent(node.props.children) : '';
}

function findNode(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of Array.isArray(node.props?.children) ? node.props.children : [node.props?.children]) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
}

function loadApp(isDesktop = true) {
  const compiled = ts.transpileModule(app, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const state = [];
  let hook = 0;
  const react = {
    useState(initial) {
      const index = hook++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
  };
  const exports = {};
  const component = () => null;
  const require = name => ({
    react,
    '@/components/resume/ResumeUpload': { ResumeUpload: component },
    '@/components/resume/ResumeListInline': { ResumeListInline: component },
    '@/components/job/JobUpload': { JobUpload: component },
    '@/components/job/JobListInline': { JobListInline: component },
    '@/components/jobfit/JobFitCreate': { JobFitCreate: component },
    '@/components/jobfit/JobFitResult': { JobFitResult: component },
    '@/components/jobfit/JobFitList': { JobFitList: component },
    '@/components/career/CareerInventory': { CareerInventoryPanel: component },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
  })[name];
  vm.runInNewContext(compiled, {
    exports,
    require,
    window: { matchMedia: () => ({ matches: isDesktop }) },
  });
  return () => {
    hook = 0;
    return exports.default();
  };
}

test('uses one accessible responsive collapsible left navigation', () => {
  assert.match(app, /<aside[^>]+aria-label="Main navigation"/);
  assert.match(app, /flex-col md:flex-row/);
  assert.match(app, /sidebarOpen \? 'w-full md:w-56' : 'w-16'/);
  assert.doesNotMatch(app, /<ol/);
  assert.doesNotMatch(app, /Stepper/);
});

test('collapses and changes the active view through native buttons', () => {
  const render = loadApp();
  let view = render();
  assert.equal(findNode(view, node => node.type === 'aside')?.props['aria-label'], 'Main navigation');
  const collapseButton = findNode(view, node => node.props?.['aria-label'] === 'Collapse navigation');
  assert.equal(collapseButton.type, 'button');
  collapseButton.props.onClick();
  view = render();
  assert.equal(findNode(view, node => node.props?.['aria-label'] === 'Expand navigation').props['aria-expanded'], false);
  assert.equal(textContent(findNode(view, node => node.props?.['aria-label'] === 'Job Description')), 'Job');
  assert.equal(textContent(findNode(view, node => node.props?.['aria-label'] === 'Expand navigation')), '›');
  const jobButton = findNode(view, node => node.props?.['aria-label'] === 'Job Description');
  assert.equal(jobButton.type, 'button');
  jobButton.props.onClick();
  view = render();
  const activeButton = findNode(view, node => node.props?.['aria-current'] === 'page');
  assert.equal(activeButton.props['aria-label'], 'Job Description');
  assert.equal(textContent(activeButton), 'Job');
});

test('starts collapsed on mobile with distinct visible navigation labels', () => {
  const view = loadApp(false)();
  assert.equal(findNode(view, node => node.props?.['aria-label'] === 'Expand navigation').props['aria-expanded'], false);
  assert.equal(textContent(findNode(view, node => node.props?.['aria-label'] === 'Resume')), 'Rsm');
  assert.equal(textContent(findNode(view, node => node.props?.['aria-label'] === 'Results')), 'Rsl');
});
