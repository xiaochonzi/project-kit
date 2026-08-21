const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'scripts', 'project-docs.cjs');

function run(args, allowFail = false) {
  try {
    return execFileSync('node', [cli, ...args], { cwd: root, encoding: 'utf8' });
  } catch (error) {
    if (allowFail) return error.stdout || '';
    throw error;
  }
}

function makeTmpProject() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-test-'));
  fs.mkdirSync(tmp, { recursive: true });
  run(['init', '--root', tmp]);
  return tmp;
}

test('help includes validate-plugin', () => {
  const output = run(['help']);
  assert.match(output, /validate-plugin/);
});

test('validate-plugin passes for current plugin', () => {
  const output = run(['validate-plugin', '--root', '.', '--json']);
  const result = JSON.parse(output);
  assert.equal(result.valid, true);
  assert.equal(result.skillCount, 11);
  assert.equal(result.templateCount, 8);
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
  assert.equal(result.changeCount, 1);
});

test('new change creates three artifacts and validates', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '测试变更', '--root', tmp]);
    const dir = fs.readdirSync(path.join(tmp, 'docs', 'changes')).find((d) => d.startsWith('CR-'));
    const change = path.join(tmp, 'docs', 'changes', dir);
    run(['new', 'spec', '--change', 'CR-001', '--root', tmp]);
    run(['new', 'plan', '--change', 'CR-001', '--root', tmp]);
    assert.ok(fs.existsSync(path.join(change, 'proposal.md')));
    assert.ok(fs.existsSync(path.join(change, 'spec.md')));
    assert.ok(fs.existsSync(path.join(change, 'plan.md')));
    const result = JSON.parse(run(['validate', '--root', tmp, '--json']));
    assert.equal(result.valid, true);
    assert.equal(result.changeCount, 1);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('full change missing spec/plan fails validation', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '不完整变更', '--root', tmp]);
    const result = JSON.parse(run(['validate', '--root', tmp, '--json'], true));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes('Full 变更缺少 spec.md')));
    assert.ok(result.errors.some((error) => error.includes('Full 变更缺少 plan.md')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('quick project without changes validates', () => {
  const tmp = makeTmpProject();
  try {
    const result = JSON.parse(run(['validate', '--root', tmp, '--json']));
    assert.equal(result.valid, true);
    assert.equal(result.changeCount, 0);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('init creates local .project-kit/state.md and ignores it', () => {
  const tmp = makeTmpProject();
  try {
    assert.ok(fs.existsSync(path.join(tmp, '.project-kit', 'state.md')));
    assert.ok(!fs.existsSync(path.join(tmp, 'docs', 'STATE.md')));
    const gitignore = fs.readFileSync(path.join(tmp, '.gitignore'), 'utf8');
    assert.match(gitignore, /\.project-kit\//);
    const status = JSON.parse(run(['status', '--root', tmp, '--json']));
    assert.equal(status.active_change, null);
    assert.equal(status.next_action, null);
    assert.equal(status.last_completed, null);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('status degrades gracefully without .project-kit/state.md', () => {
  const tmp = makeTmpProject();
  try {
    fs.rmSync(path.join(tmp, '.project-kit'), { recursive: true, force: true });
    const status = JSON.parse(run(['status', '--root', tmp, '--json']));
    assert.equal(status.active_change, null);
    assert.equal(status.next_action, null);
    assert.equal(status.last_completed, null);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
