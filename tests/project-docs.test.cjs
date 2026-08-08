const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'scripts', 'project-docs.cjs');

function run(args) {
  return execFileSync('node', [cli, ...args], { cwd: root, encoding: 'utf8' });
}

test('help includes validate-plugin', () => {
  const output = run(['help']);
  assert.match(output, /validate-plugin/);
});

test('validate-plugin passes for current plugin', () => {
  const output = run(['validate-plugin', '--root', '.', '--json']);
  const result = JSON.parse(output);
  assert.equal(result.valid, true);
  assert.equal(result.skillCount, 10);
  assert.equal(result.sharedWorkflowCount, 10);
  assert.equal(result.sharedRuleCount, 11);
  assert.equal(result.sharedTemplateCount, 16);
});

test('validate passes for minimal example', () => {
  const output = run(['validate', '--root', 'examples/minimal-project', '--json']);
  const result = JSON.parse(output);
  assert.equal(result.valid, true);
});

test('validate passes for lifecycle example baseline', () => {
  const output = run(['validate', '--root', 'examples/lifecycle-project', '--json']);
  const result = JSON.parse(output);
  assert.equal(result.valid, true);
});
