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

function loadApp() {
  const compiled = ts.transpileModule(app, {
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
  vm.runInNewContext(compiled, { exports, require });
  return () => {
    hook = 0;
    return exports.default();
  };
}

test('uses one accessible collapsible left navigation', () => {
  assert.match(app, /<aside[^>]+aria-label="Main navigation"/);
  assert.doesNotMatch(app, /<ol/);
  assert.doesNotMatch(app, /Stepper/);
});

test('collapses and changes the active view through native buttons', () => {
  const render = loadApp();
  let view = render();
  assert.equal(findNode(view, node => node.type === 'aside')?.props['aria-label'], 'Main navigation');
  findNode(view, node => node.props?.['aria-label'] === 'Collapse navigation').props.onClick();
  view = render();
  assert.equal(findNode(view, node => node.props?.['aria-label'] === 'Expand navigation').props['aria-expanded'], false);
  findNode(view, node => textContent(node) === 'Job Description' && node.props?.onClick).props.onClick();
  view = render();
  assert.equal(textContent(findNode(view, node => node.props?.['aria-current'] === 'page')), 'Job Description');
});
