const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
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

function contentHash(content) {
  const stableContent = content
    .replace(/^status:[^\r\n]*$/m, 'status: <lifecycle>')
    .replace(/^spec_hash:[^\r\n]*$/m, 'spec_hash: <hash>');
  return crypto.createHash('sha256').update(stableContent).digest('hex');
}

test('help includes validate-plugin', () => {
  const output = run(['help']);
  assert.match(output, /validate-plugin/);
});

test('validate-plugin passes for current plugin', () => {
  const output = run(['validate-plugin', '--root', '.', '--json']);
  const result = JSON.parse(output);
  assert.equal(result.valid, true);
  assert.equal(result.skillCount, 12);
  assert.equal(result.templateCount, 9);
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

test('new change leaves spec and plan as draft placeholders', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '占位变更', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-占位变更');
    const spec = fs.readFileSync(path.join(changeDir, 'spec.md'), 'utf8');
    const plan = fs.readFileSync(path.join(changeDir, 'plan.md'), 'utf8');
    assert.match(spec, /status: draft/);
    assert.match(spec, /由 spec 技能填写/);
    assert.match(plan, /status: draft/);
    assert.match(plan, /由 plan 技能填写/);
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

test('next routes an accepted change with draft spec to spec', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '业务设计', '--root', tmp]);
    const proposalPath = path.join(tmp, 'docs', 'changes', 'CR-001-业务设计', 'proposal.md');
    fs.writeFileSync(proposalPath, '---\nid: CR-001\ntitle: 业务设计\nstatus: proposed\n---\n\n# 业务设计\n\n## 背景与问题\n\n背景。\n\n## 期望结果\n\n结果。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n脚本。\n\n## 决定\n\n接受。\n', 'utf8');
    run(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]);
    const next = JSON.parse(run(['next', '--root', tmp, '--json']));
    assert.equal(next.mode, 'spec');
    assert.equal(next.target, 'CR-001');
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

test('new diagrams creates diagrams.md for accepted change', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '数据模型变更', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-数据模型变更');
    fs.writeFileSync(
      path.join(changeDir, 'proposal.md'),
      '---\nid: CR-001\ntitle: 数据模型变更\nstatus: proposed\n---\n\n# 数据模型变更\n\n## 背景与问题\n\n背景。\n\n## 期望结果\n\n期望。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n影响。\n\n## 决定\n\n已确认。\n',
      'utf8'
    );
    run(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]);
    run(['new', 'diagrams', '--change', 'CR-001', '--root', tmp]);
    assert.ok(fs.existsSync(path.join(changeDir, 'diagrams.md')));
    const diagrams = fs.readFileSync(path.join(changeDir, 'diagrams.md'), 'utf8');
    assert.match(diagrams, /数据模型清单/);
    assert.match(diagrams, /模型间关系/);
    assert.match(diagrams, /设计依据/);
    assert.match(diagrams, /前后端操作时机/);
    assert.doesNotMatch(diagrams, /\{\{/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('change without diagrams validates (non-mandatory)', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '无数据模型', '--root', tmp]);
    // 走完完整三件套但无 diagrams
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-无数据模型');
    fs.writeFileSync(
      path.join(changeDir, 'proposal.md'),
      '---\nid: CR-001\ntitle: 无数据模型\nstatus: proposed\n---\n\n# 无数据模型\n\n## 背景与问题\n\n背景。\n\n## 期望结果\n\n期望。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n影响。\n\n## 决定\n\n已确认。\n',
      'utf8'
    );
    run(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]);
    // 不创建 diagrams —— validate 应通过（diagrams 非强制）
    const result = JSON.parse(run(['validate', '--root', tmp, '--json']));
    assert.equal(result.valid, true);
    assert.ok(!fs.existsSync(path.join(changeDir, 'diagrams.md')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('spec approval rejects placeholders and unresolved questions', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '契约门禁', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-契约门禁');
    const proposalPath = path.join(changeDir, 'proposal.md');
    fs.writeFileSync(
      proposalPath,
      '---\nid: CR-001\ntitle: 契约门禁\nstatus: proposed\n---\n\n# 契约门禁\n\n## 背景与问题\n\n背景。\n\n## 期望结果\n\n结果。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n脚本。\n\n## 决定\n\n接受。\n\n## 未决问题\n\n无\n',
      'utf8'
    );
    run(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]);
    assert.throws(() => run(['transition', 'CR-001', '--to', 'approved', '--kind', 'spec', '--root', tmp]));

    const specPath = path.join(changeDir, 'spec.md');
    const completeSpec = '---\nchange: CR-001\ntitle: 契约门禁\nstatus: draft\ncreated_at: 2026-08-26\nspec_hash: null\n---\n\n# 契约门禁\n\n## 问题与依据\n\n当前行为。\n\n## 目标\n\n目标行为。\n\n## 用户流程\n\n用户触发。\n\n## 范围\n\n### 包含\n\n范围内。\n\n### 不包含\n\n范围外。\n\n## 输入与输出\n\n输入和输出。\n\n## 业务规则\n\n- BR-01：规则。\n\n### REQ-01：需求\n\n目标。\n\n- Business Rules：BR-01\n- Acceptance：AC-01\n\n## 失败与边界情况\n\n失败行为。\n\n## 禁止事项\n\n禁止越界。\n\n## 验收标准\n\n- [ ] AC-01：可以验证。\n\n## 未决问题\n\n还需要决定。\n';
    fs.writeFileSync(specPath, completeSpec, 'utf8');
    assert.throws(() => run(['transition', 'CR-001', '--to', 'approved', '--kind', 'spec', '--root', tmp]));
    fs.writeFileSync(specPath, completeSpec.replace('还需要决定。', '无'), 'utf8');
    run(['transition', 'CR-001', '--to', 'approved', '--kind', 'spec', '--root', tmp]);
    assert.doesNotMatch(fs.readFileSync(specPath, 'utf8'), /spec_hash: null/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('plan approval requires every spec contract id', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '计划覆盖', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-计划覆盖');
    fs.writeFileSync(path.join(changeDir, 'proposal.md'), '---\nid: CR-001\ntitle: 计划覆盖\nstatus: accepted\n---\n\n# 计划覆盖\n\n## 背景与问题\n\n背景。\n\n## 期望结果\n\n结果。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n脚本。\n\n## 决定\n\n接受。\n', 'utf8');
    const approvedSpec = '---\nchange: CR-001\ntitle: 计划覆盖\nstatus: approved\nspec_hash: test\n---\n\n# 计划覆盖\n\n## 问题与依据\n\n当前。\n\n## 目标\n\n目标。\n\n## 用户流程\n\n流程。\n\n## 范围\n\n范围。\n\n## 输入与输出\n\n输入输出。\n\n## 业务规则\n\nREQ-01、BR-01。\n\n## 失败与边界情况\n\n失败。\n\n## 验收标准\n\nAC-01。\n';
    fs.writeFileSync(path.join(changeDir, 'spec.md'), approvedSpec.replace('spec_hash: test', `spec_hash: ${contentHash(approvedSpec)}`), 'utf8');
    const planPath = path.join(changeDir, 'plan.md');
    const partialPlan = '---\nchange: CR-001\ntitle: 计划覆盖\nstatus: draft\n---\n\n# 计划覆盖\n\n## 实现策略\n\n覆盖 REQ-01、BR-01。\n\n## 技术设计\n\n修改确定性脚本。\n\n## Tasks\n\n### Task 1: 实现\n\n- files: scripts/project-docs.cjs\n- read_first: scripts/project-docs.cjs\n- action: 实现契约。\n- verify: node --test tests/project-docs.test.cjs\n- acceptance: REQ-01、BR-01 已实现。\n- done: 测试通过。\n\n- [ ] Task 1\n\n## 验收标准映射\n\nREQ-01、BR-01 → Task 1。\n\n## Constitution 规范映射清单\n\nAGENTS.md → Task 1。\n\n## 最终验证\n\n运行测试。\n\n## 非目标\n\n无。\n';
    fs.writeFileSync(planPath, partialPlan, 'utf8');
    assert.throws(() => run(['transition', 'CR-001', '--to', 'approved', '--kind', 'plan', '--root', tmp]));
    fs.writeFileSync(planPath, partialPlan.replace('REQ-01、BR-01 → Task 1。', 'REQ-01、BR-01、AC-01 → Task 1。'), 'utf8');
    run(['transition', 'CR-001', '--to', 'approved', '--kind', 'plan', '--root', tmp]);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('new diagrams requires existing proposal (order constraint)', () => {
  const tmp = makeTmpProject();
  try {
    assert.throws(() => run(['new', 'diagrams', '--change', 'CR-999', '--root', tmp]));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
