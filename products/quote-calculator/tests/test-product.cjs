'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const configSource = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
const calculatorSource = fs.readFileSync(path.join(root, 'calculator.js'), 'utf8');
let checks = 0;

function test(label, run) {
  run();
  checks += 1;
  console.log(`PASS ${label}`);
}

const context = vm.createContext({
  window: {},
  document: {},
  Intl,
  Number,
  Object,
  Set,
  Error,
  console
});
vm.runInContext(configSource, context);
const modelSource = calculatorSource
  .slice(calculatorSource.indexOf('(function () {') + '(function () {'.length, calculatorSource.indexOf('function createBaseOptions()'));
const model = vm.runInContext(`${modelSource};({ config, calculate, summaryText, money, validateConfiguration })`, context);

test('all product files are linked locally', () => {
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="config\.js"/);
  assert.match(html, /src="calculator\.js"/);
  assert.doesNotMatch(html, /chatgpt\.site|<form|<iframe|https?:\/\/[^\s"']+\.(?:js|css)/i);
});

test('privacy-oriented static page policy is present', () => {
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.match(html, /No customer data is collected/i);
});

test('a direct written-project enquiry is available', () => {
  assert.match(html, /mailto:andrewkarch1995@gmail\.com/);
  assert.match(html, /Request a written quote/);
  assert.match(html, /No call is required/);
});

test('three distinct themes are implemented', () => {
  for (const theme of ['atelier', 'signal', 'ledger']) {
    assert.match(html, new RegExp(`data-set-theme="${theme}"`));
  }
  assert.match(css, /body\[data-theme="signal"\]/);
  assert.match(css, /body\[data-theme="ledger"\]/);
  assert.match(css, /grid-column: 2/);
  assert.match(css, /grid-template-columns: 1fr;/);
});

test('example calculation is exact in integer minor units', () => {
  const result = model.calculate({ base: 'two-bed', quantities: { oven: 1, windows: 3 } });
  assert.equal(result.total, 19400);
  assert.equal(result.rows.length, 3);
  assert.equal(result.hasQuoteOnly, false);
});

test('minimum charge is enforced', () => {
  const result = model.calculate({ base: '', quantities: { bathroom: 1 } });
  assert.equal(result.subtotal, 1800);
  assert.equal(result.minimumAdjustment, 5700);
  assert.equal(result.total, 7500);
});

test('from-prices and unpriced requirements are disclosed', () => {
  const result = model.calculate({ base: 'three-bed', quantities: { special: 1 } });
  const summary = model.summaryText(result);
  assert.equal(result.hasFromPrice, true);
  assert.equal(result.hasQuoteOnly, true);
  assert.match(summary, /from £190/);
  assert.match(summary, /price to confirm/);
  assert.match(summary, /items to confirm/);
});

test('unknown and invalid input is rejected', () => {
  assert.throws(() => model.calculate({ base: 'missing', quantities: {} }));
  assert.throws(() => model.calculate({ base: 'studio', quantities: { missing: 1 } }));
  assert.throws(() => model.calculate({ base: 'studio', quantities: { oven: -1 } }));
  assert.throws(() => model.calculate({ base: 'studio', quantities: { oven: 1.5 } }));
  assert.throws(() => model.calculate({ base: 'studio', quantities: { oven: 3 } }));
});

test('money formatting follows configured locale and currency', () => {
  assert.equal(model.money(19400), '£194');
});

console.log(`${checks} product checks passed.`);
