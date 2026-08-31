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

function runFailure(args) {
  try {
    run(args);
  } catch (error) {
    return error.stderr || '';
  }
  assert.fail(`命令应失败: ${args.join(' ')}`);
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

test('new change creates minimal scaffolds without authoring placeholders', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '最小骨架', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-最小骨架');
    for (const fileName of ['proposal.md', 'spec.md', 'plan.md']) {
      const content = fs.readFileSync(path.join(changeDir, fileName), 'utf8');
      assert.doesNotMatch(content, /<!--|TODO|TBD|<任务名>|由 (?:change|spec|plan) 技能填写/);
      assert.doesNotMatch(content, /^## /m);
      assert.match(content, /schema_version: 2/);
    }
    const spec = fs.readFileSync(path.join(changeDir, 'spec.md'), 'utf8');
    const plan = fs.readFileSync(path.join(changeDir, 'plan.md'), 'utf8');
    assert.match(spec, /status: draft/);
    assert.doesNotMatch(spec, /spec_hash/);
    assert.match(plan, /status: draft/);
    const result = JSON.parse(run(['validate', '--root', tmp, '--json']));
    assert.equal(result.valid, true);
    assert.match(result.warnings.join('\n'), /缺少章节/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('validate keeps historical completed triples compatible while warning about enhanced sections', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '历史三件套', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-历史三件套');
    fs.writeFileSync(
      path.join(changeDir, 'proposal.md'),
      '---\nid: CR-001\ntitle: 历史三件套\nstatus: completed\n---\n\n# 历史三件套\n\n## 背景与问题\n\n历史背景。\n\n## 期望结果\n\n历史结果。\n\n## 包含\n\n范围内。\n\n## 不包含\n\n范围外。\n\n## 影响范围\n\n脚本。\n\n## 决定\n\n沿用历史方案。\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(changeDir, 'spec.md'),
      '---\nchange: CR-001\ntitle: 历史三件套\nstatus: verified\n---\n\n# 历史三件套\n\n## 问题与依据\n\n历史依据。\n\n## 目标\n\n目标。\n\n## 用户流程\n\n流程。\n\n## 范围\n\n范围。\n\n## 输入与输出\n\n输入输出。\n\n## 业务规则\n\nREQ-01 与 BR-01。\n\n## 失败与边界情况\n\n失败。\n\n## 验收标准\n\nAC-01。\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(changeDir, 'plan.md'),
      '---\nchange: CR-001\ntitle: 历史三件套\nstatus: completed\n---\n\n# 历史三件套\n\n## 实现策略\n\n历史策略。\n\n## Tasks\n\n### Task 1: 历史任务\n\n- files: scripts/example.cjs\n- symbols: run\n- read_first: scripts/example.cjs\n- depends_on: 无\n- interfaces: 输入与输出\n- current_behavior: 历史行为\n- target_behavior: 目标行为\n- implementation: 实现 REQ-01 和 BR-01\n- invariants: 保持兼容\n- verify: node --test\n- acceptance: AC-01\n- done: 测试通过\n\n- [x] Task 1\n\n## 验收标准映射\n\nREQ-01、BR-01、AC-01 → Task 1。\n\n## 最终验证\n\n测试通过。\n',
      'utf8'
    );
    const result = JSON.parse(run(['validate', '--root', tmp, '--json']));
    assert.equal(result.valid, true);
    assert.match(result.warnings.join('\n'), /缺少增强章节/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('schema version 2 makes enhanced sections strict for mature documents', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '增强门禁', '--root', tmp]);
    const proposalPath = path.join(tmp, 'docs', 'changes', 'CR-001-增强门禁', 'proposal.md');
    fs.writeFileSync(proposalPath, fs.readFileSync(proposalPath, 'utf8').replace('status: proposed', 'status: accepted'), 'utf8');
    const result = JSON.parse(run(['validate', '--root', tmp, '--json'], true));
    assert.equal(result.valid, false);
    assert.match(result.errors.join('\n'), /缺少增强章节「证据快照」/);
    assert.match(result.errors.join('\n'), /Proposal 缺少 EVD-##/);
    assert.match(result.errors.join('\n'), /Proposal 缺少 DEC-##/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('proposal acceptance requires complete decisions and no unresolved questions', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '立项门禁', '--root', tmp]);
    const proposalPath = path.join(tmp, 'docs', 'changes', 'CR-001-立项门禁', 'proposal.md');
    fs.writeFileSync(
      proposalPath,
      '---\nid: CR-001\ntitle: 立项门禁\nstatus: proposed\n---\n\n# 立项门禁\n\n## 背景与问题\n\n背景。\n\n## 证据快照\n\n已复核当前行为。\n\n## 期望结果\n\n结果。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n脚本。\n\n## 决定\n\n### 已确认选择\n\n采用三件套。\n\n### 未采用方向与原因\n\n## 未决问题\n\n无\n',
      'utf8'
    );
    assert.match(runFailure(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]), /未采用方向与原因/);
    fs.writeFileSync(proposalPath, fs.readFileSync(proposalPath, 'utf8').replace('### 未采用方向与原因\n\n## 未决问题', '### 未采用方向与原因\n\n不新增第四份文档。\n\n## 未决问题'), 'utf8');
    assert.match(runFailure(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]), /EVD-##/);
    fs.writeFileSync(proposalPath, fs.readFileSync(proposalPath, 'utf8').replace('已复核当前行为。', '- EVD-01：已复核当前行为。'), 'utf8');
    assert.match(runFailure(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]), /DEC-##/);
    fs.writeFileSync(proposalPath, fs.readFileSync(proposalPath, 'utf8').replace('采用三件套。', '- DEC-01：采用三件套。'), 'utf8');
    run(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]);
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
    fs.writeFileSync(proposalPath, '---\nid: CR-001\ntitle: 业务设计\nstatus: proposed\n---\n\n# 业务设计\n\n## 背景与问题\n\n背景。\n\n## 证据快照\n\nEVD-01：已复核当前行为。\n\n## 期望结果\n\n结果。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n脚本。\n\n## 决定\n\n### 已确认选择\n\n- DEC-01：接受。\n\n### 未采用方向与原因\n\n无。\n\n## 未决问题\n\n无\n', 'utf8');
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
      '---\nid: CR-001\ntitle: 数据模型变更\nstatus: proposed\n---\n\n# 数据模型变更\n\n## 背景与问题\n\n背景。\n\n## 证据快照\n\nEVD-01：已复核数据模型。\n\n## 期望结果\n\n期望。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n影响。\n\n## 决定\n\n### 已确认选择\n\n- DEC-01：已确认。\n\n### 未采用方向与原因\n\n无。\n\n## 未决问题\n\n无\n',
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
      '---\nid: CR-001\ntitle: 无数据模型\nstatus: proposed\n---\n\n# 无数据模型\n\n## 背景与问题\n\n背景。\n\n## 证据快照\n\nEVD-01：已复核范围。\n\n## 期望结果\n\n期望。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n影响。\n\n## 决定\n\n### 已确认选择\n\n- DEC-01：已确认。\n\n### 未采用方向与原因\n\n无。\n\n## 未决问题\n\n无\n',
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
      '---\nid: CR-001\ntitle: 契约门禁\nstatus: proposed\n---\n\n# 契约门禁\n\n## 背景与问题\n\n背景。\n\n## 证据快照\n\nEVD-01：已复核契约现状。\n\n## 期望结果\n\n结果。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n脚本。\n\n## 决定\n\n### 已确认选择\n\n- DEC-01：接受。\n\n### 未采用方向与原因\n\n无。\n\n## 未决问题\n\n无\n',
      'utf8'
    );
    run(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]);
    assert.throws(() => run(['transition', 'CR-001', '--to', 'approved', '--kind', 'spec', '--root', tmp]));

    const specPath = path.join(changeDir, 'spec.md');
    const completeSpec = '---\nchange: CR-001\ntitle: 契约门禁\nstatus: draft\ncreated_at: 2026-08-26\n---\n\n# 契约门禁\n\n## 术语与业务对象\n\n沿用现有含义。\n\n## 数据权威表\n\n业务事实由服务端权威维护。\n\n## 问题与依据\n\n当前行为。\n\n## 目标\n\n目标行为。\n\n## 用户流程\n\n用户触发。\n\n## 范围\n\n### 包含\n\n范围内。\n\n### 不包含\n\n范围外。\n\n## 输入与输出\n\n输入和输出。\n\n## 业务规则\n\n- BR-01：规则。\n\n### REQ-01：需求\n\n目标。\n\n- Business Rules：BR-01\n- Acceptance：AC-01\n\n## 失败与边界情况\n\n失败行为。\n\n## 禁止事项\n\n禁止越界。\n\n## 验收标准\n\n- [ ] AC-01：可以验证。\n\n## 未决问题\n\n还需要决定。\n';
    fs.writeFileSync(specPath, completeSpec, 'utf8');
    assert.throws(() => run(['transition', 'CR-001', '--to', 'approved', '--kind', 'spec', '--root', tmp]));
    fs.writeFileSync(specPath, completeSpec.replace('还需要决定。', '无'), 'utf8');
    run(['transition', 'CR-001', '--to', 'approved', '--kind', 'spec', '--root', tmp]);
    assert.doesNotMatch(fs.readFileSync(specPath, 'utf8'), /spec_hash/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('spec approval rejects a missing terminology section', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '术语门禁', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-术语门禁');
    fs.writeFileSync(path.join(changeDir, 'proposal.md'), '---\nid: CR-001\ntitle: 术语门禁\nstatus: accepted\n---\n', 'utf8');
    const spec = '---\nchange: CR-001\ntitle: 术语门禁\nstatus: draft\n---\n\n## 问题与依据\n\n证据。\n\n## 目标\n\n目标。\n\n## 用户流程\n\n流程。\n\n## 范围\n\n范围。\n\n## 输入与输出\n\n契约。\n\n## 业务规则\n\n- BR-01：规则。\n\n### REQ-01：需求\n\n- Business Rules：BR-01\n- Acceptance：AC-01\n\n## 失败与边界情况\n\n失败。\n\n## 禁止事项\n\n禁止。\n\n## 验收标准\n\n- [ ] AC-01：通过。\n\n## 未决问题\n\n无\n';
    fs.writeFileSync(path.join(changeDir, 'spec.md'), spec, 'utf8');
    assert.match(runFailure(['transition', 'CR-001', '--to', 'approved', '--kind', 'spec', '--root', tmp]), /术语与业务对象/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('plan approval requires the complete implementation task contract', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '任务门禁', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-任务门禁');
    fs.writeFileSync(path.join(changeDir, 'proposal.md'), '---\nid: CR-001\ntitle: 任务门禁\nstatus: accepted\n---\n', 'utf8');
    fs.writeFileSync(path.join(changeDir, 'spec.md'), '---\nchange: CR-001\ntitle: 任务门禁\nstatus: approved\n---\n\nREQ-01 BR-01 AC-01\n', 'utf8');
    const planPath = path.join(changeDir, 'plan.md');
    fs.writeFileSync(planPath, '---\nchange: CR-001\ntitle: 任务门禁\nstatus: draft\n---\n\n## 实施目标\n\n目标。\n\n## 实现策略\n\n策略。\n\n## 技术设计\n\n### 当前技术现状\n\n现状。\n\n### 目标技术设计\n\n目标。\n\n## 全局不变量\n\n不变量。\n\n## 条件技术设计\n\n十类适用性均已说明。\n\n## Tasks\n\n### Task 1: 实现\n\n- files: file.js\n- read_first: file.js\n- verify: node --test\n- acceptance: REQ-01 BR-01 AC-01\n- done: 测试通过\n\n- [ ] Task 1\n\n## 验收标准映射\n\nREQ-01 BR-01 AC-01\n\n## Constitution 规范映射清单\n\nAGENTS.md。\n\n## 最终验证\n\nnode --test\n\n## 非目标\n\n无。\n\n## 未决问题\n\n无\n', 'utf8');
    const failure = runFailure(['transition', 'CR-001', '--to', 'approved', '--kind', 'plan', '--root', tmp]);
    for (const field of ['file_actions', 'symbols', 'depends_on', 'interfaces', 'current_behavior', 'target_behavior', 'implementation', 'outputs', 'decisions', 'invariants', 'prerequisites', 'stop_if']) {
      assert.match(failure, new RegExp(`缺少 ${field}`));
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('plan approval requires every spec contract id', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '计划覆盖', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-计划覆盖');
    fs.writeFileSync(path.join(changeDir, 'proposal.md'), '---\nid: CR-001\ntitle: 计划覆盖\nstatus: accepted\n---\n\n# 计划覆盖\n\n## 背景与问题\n\n背景。\n\n## 证据快照\n\nEVD-01：已复核当前行为。\n\n## 期望结果\n\n结果。\n\n## 包含\n\n包含。\n\n## 不包含\n\n不包含。\n\n## 影响范围\n\n脚本。\n\n## 决定\n\n### 已确认选择\n\n- DEC-01：接受。\n\n### 未采用方向与原因\n\n无。\n\n## 未决问题\n\n无\n', 'utf8');
    const approvedSpec = '---\nchange: CR-001\ntitle: 计划覆盖\nstatus: approved\n---\n\n# 计划覆盖\n\n## 术语与业务对象\n\n沿用现有定义。\n\n## 数据权威表\n\n文档状态由 CLI 权威维护。\n\n## 问题与依据\n\n当前。\n\n## 目标\n\n目标。\n\n## 用户流程\n\n流程。\n\n## 范围\n\n范围。\n\n## 输入与输出\n\n输入输出。\n\n## 业务规则\n\nREQ-01、BR-01。\n\n## 失败与边界情况\n\n失败。\n\n## 禁止事项\n\n不得漏掉契约。\n\n## 验收标准\n\nAC-01。\n\n## 未决问题\n\n无\n';
    const specPath = path.join(changeDir, 'spec.md');
    fs.writeFileSync(specPath, approvedSpec, 'utf8');
    const planPath = path.join(changeDir, 'plan.md');
    const partialPlan = '---\nchange: CR-001\ntitle: 计划覆盖\nstatus: draft\n---\n\n# 计划覆盖\n\n## 代码基线\n\n当前测试仓库。\n\n## 实施目标\n\n实现契约。\n\n## 实现策略\n\n覆盖 REQ-01、BR-01。\n\n## 技术设计\n\n### 当前技术现状\n\n脚本负责门禁。\n\n### 目标技术设计\n\n修改确定性脚本。\n\n## 全局不变量\n\n保持状态机。\n\n## 条件技术设计\n\n状态机、错误策略、并发与幂等、数据与事务、API / 事件、配置、兼容与迁移、权限与安全、可观测性、参考实现均已判断。\n\n## 执行环境\n\nNode.js 可用，缺失时停止。\n\n## Implementation Binding\n\nDEC-01、REQ-01、BR-01 绑定到 Task 1。\n\n## Tasks\n\n### Task 1: 实现\n\n- files: scripts/project-docs.cjs\n- file_actions: modify scripts/project-docs.cjs\n- symbols: transitionDocument\n- read_first: scripts/project-docs.cjs；已确认该函数执行状态门禁\n- depends_on: 无\n- interfaces: 输入文档，输出门禁结果\n- current_behavior: 未覆盖 AC-01\n- target_behavior: 覆盖全部契约\n- implementation: 实现契约。\n- outputs: 更新后的状态门禁和测试\n- decisions: DEC-01\n- invariants: 保持状态机。\n- prerequisites: Node.js 可用\n- stop_if: 脚本结构与基线不一致\n- verify: node --test tests/project-docs.test.cjs\n- acceptance: REQ-01、BR-01 已实现。\n- done: 测试通过。\n\n- [ ] Task 1\n\n## 验收标准映射\n\nREQ-01、BR-01 → Task 1。\n\n## Constitution 规范映射清单\n\nAGENTS.md → Task 1。\n\n## 最终验证\n\n运行测试。\n\n## 非目标\n\n无。\n\n## 未决问题\n\n无\n';
    fs.writeFileSync(planPath, partialPlan, 'utf8');
    assert.throws(() => run(['transition', 'CR-001', '--to', 'approved', '--kind', 'plan', '--root', tmp]));
    const mappedPlan = partialPlan.replace('REQ-01、BR-01 → Task 1。', 'REQ-01、BR-01、AC-01 → Task 1。');
    fs.writeFileSync(planPath, mappedPlan, 'utf8');
    assert.match(runFailure(['transition', 'CR-001', '--to', 'approved', '--kind', 'plan', '--root', tmp]), /Implementation Binding/);
    fs.writeFileSync(
      planPath,
      mappedPlan.replace('DEC-01、REQ-01、BR-01 绑定到 Task 1。', 'DEC-01、REQ-01、BR-01、AC-01 绑定到 Task 1。'),
      'utf8'
    );
    run(['transition', 'CR-001', '--to', 'approved', '--kind', 'plan', '--root', tmp]);
    fs.writeFileSync(specPath, fs.readFileSync(specPath, 'utf8').replace('status: approved', 'status: approved\nspec_hash: stale'), 'utf8');
    assert.equal(JSON.parse(run(['validate', '--root', tmp, '--json'])).valid, true);
    fs.writeFileSync(planPath, fs.readFileSync(planPath, 'utf8').replace('- [ ] Task 1', '- [x] Task 1'), 'utf8');
    run(['transition', 'CR-001', '--to', 'completed', '--kind', 'plan', '--root', tmp]);
    run(['transition', 'CR-001', '--to', 'verified', '--kind', 'spec', '--root', tmp]);
    assert.match(fs.readFileSync(specPath, 'utf8'), /spec_hash: stale/);
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

test('validate rejects contract id letter-suffix variants (AC-09a)', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '编号变体', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-编号变体');
    fs.writeFileSync(
      path.join(changeDir, 'spec.md'),
      '---\nchange: CR-001\ntitle: 编号变体\nstatus: draft\n---\n\n## 验收标准\n\n- [ ] AC-01：通过。\n- [ ] AC-09a：变体。\n- [ ] AC-09b：变体。\n',
      'utf8'
    );
    const result = JSON.parse(run(['validate', '--root', tmp, '--json'], true));
    assert.equal(result.valid, false);
    assert.match(result.errors.join('\n'), /非法契约编号/);
    assert.match(result.errors.join('\n'), /AC-09a/);
    assert.match(result.errors.join('\n'), /AC-09b/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('validate warns on machine absolute paths in plan', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '绝对路径', '--root', tmp]);
    const changeDir = path.join(tmp, 'docs', 'changes', 'CR-001-绝对路径');
    fs.writeFileSync(
      path.join(changeDir, 'plan.md'),
      '---\nchange: CR-001\ntitle: 绝对路径\nstatus: draft\n---\n\n## 实施目标\n\n目标。\n\n## 实现策略\n\n策略。\n\n## 技术设计\n\n### 当前技术现状\n\n现状。\n\n### 目标技术设计\n\n目标。\n\n## 全局不变量\n\n不变。\n\n## 条件技术设计\n\n状态机、错误策略、并发与幂等、数据与事务、API / 事件、配置、兼容与迁移、权限与安全、可观测性、参考实现。\n\n## Tasks\n\n### Task 1: 实现\n\n- files: file.js\n- symbols: run\n- read_first: file.js\n- depends_on: 无\n- interfaces: 输入输出\n- current_behavior: 当前\n- target_behavior: 目标\n- implementation: 实现\n- invariants: 不变\n- verify: node /Users/stone/project-kit/scripts/project-docs.cjs validate --root .\n- acceptance: 通过\n- done: 通过\n\n- [ ] Task 1\n\n## 验收标准映射\n\nREQ-01 BR-01 AC-01 → Task 1\n\n## Constitution 规范映射清单\n\nAGENTS.md → Task 1\n\n## 最终验证\n\n验证。\n\n## 非目标\n\n无。\n\n## 未决问题\n\n无\n',
      'utf8'
    );
    const result = JSON.parse(run(['validate', '--root', tmp, '--json']));
    assert.equal(result.valid, true);
    assert.match(result.warnings.join('\n'), /机器绝对路径/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
