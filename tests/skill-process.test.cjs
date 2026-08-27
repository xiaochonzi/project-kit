const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function readSkill(name) {
  return fs.readFileSync(path.join(root, 'skills', name, 'SKILL.md'), 'utf8');
}

test('plan requires constitution-first constraints mapping', () => {
  const skill = readSkill('plan');
  const template = fs.readFileSync(path.join(root, 'assets', 'templates', 'plan.md'), 'utf8');
  assert.match(skill, /完整读取.*constitution\.md/);
  assert.match(skill, /适用规范清单/);
  assert.match(skill, /规范.*验证/);
  assert.match(template, /## Constitution 规范映射清单/);
});

test('execute-plan requires a code-standards preflight before implementation', () => {
  const skill = readSkill('execute-plan');
  assert.match(skill, /代码规范预检/);
  assert.match(skill, /写代码前/);
  assert.match(skill, /constitution\.md/);
});

test('verify-plan independently audits constitution compliance', () => {
  const skill = readSkill('verify-plan');
  assert.match(skill, /代码规范符合性/);
  assert.match(skill, /规范.*清单/);
  assert.match(skill, /规范.*fail.*blocked|fail.*blocked.*规范/s);
  assert.match(skill, /不得.*verified|不得.*completed/);
  assert.match(skill, /transition 脚本只负责/);
  assert.match(skill, /不替 AI 判断代码规范/);
});

test('change routes from explicit user intent before risk inference', () => {
  const skill = readSkill('change');
  assert.match(skill, /用户意图优先/);
  assert.match(skill, /Quick.*全部满足|全部满足.*Quick/s);
  assert.match(skill, /Full.*任一命中|任一命中.*Full/s);
  assert.match(skill, /使用 change.*Full|Full.*使用 change/s);
  assert.match(skill, /多个模块|多个独立结果/);
  assert.match(skill, /意图.*不明确.*澄清|澄清.*意图/s);
  assert.match(skill, /Full.*proposal.*spec.*plan/s);
  assert.doesNotMatch(skill, /new spec --change/);
  assert.match(skill, /Spec.*→.*spec|spec.*技能/);
});

test('spec owns business design and hands off implementation planning', () => {
  const skill = readSkill('spec');
  assert.match(skill, /代码现实/);
  assert.match(skill, /REQ-##|REQ-\d/);
  assert.match(skill, /BR-##|BR-\d/);
  assert.match(skill, /AC-##|AC-\d/);
  assert.match(skill, /必填核心/);
  assert.match(skill, /按适用性/);
  assert.match(skill, /文件路径.*函数名.*代码步骤|禁止.*文件路径/s);
  assert.match(skill, /plan.*技能/);
});

test('plan fills the existing placeholder and maps all spec contracts', () => {
  const skill = readSkill('plan');
  const template = fs.readFileSync(path.join(root, 'assets', 'templates', 'plan.md'), 'utf8');
  assert.doesNotMatch(skill, /new plan --change/);
  assert.match(skill, /已有.*plan\.md|plan\.md.*已存在/s);
  assert.match(skill, /REQ-##|REQ.*BR.*AC/s);
  for (const concept of ['系统入口与调用链', '关键文件与符号', 'Current Behavior', 'Target Behavior', '全局不变量', '条件技术设计']) {
    assert.match(skill, new RegExp(concept));
  }
  for (const field of ['files', 'symbols', 'read_first', 'depends_on', 'interfaces', 'current_behavior', 'target_behavior', 'implementation', 'invariants', 'verify', 'acceptance', 'done']) {
    assert.match(template, new RegExp(`- ${field}:`));
  }
});

test('full change skills persist complete context and reject ambiguous references', () => {
  const change = readSkill('change');
  const spec = readSkill('spec');
  assert.match(change, /已确认.*决定|决定.*取舍/s);
  assert.match(change, /未采用.*原因/);
  assert.match(spec, /术语与业务对象/);
  assert.match(spec, /按之前讨论|模糊引用/);
  assert.doesNotMatch(spec, /跨模型|跨 AI|跨AI|交接自检/);
});

test('execution and verification audit the plan technical baseline', () => {
  const execute = readSkill('execute-plan');
  const verify = readSkill('verify-plan');
  for (const concept of ['路径', 'Symbol', '调用链', 'Current Behavior', 'interfaces']) {
    assert.match(execute, new RegExp(concept));
  }
  for (const concept of ['Target Behavior', '不变量', '条件技术设计', '契约映射']) {
    assert.match(verify, new RegExp(concept));
  }
});

test('lifecycle commands are thin skill routers', () => {
  for (const name of ['change', 'spec', 'plan', 'execute', 'verify']) {
    const command = fs.readFileSync(path.join(root, 'commands', 'project-kit', `${name}.md`), 'utf8');
    assert.match(command, /SKILL\.md/);
    assert.ok(command.split(/\r?\n/).length <= 12, `${name} command 不应复制技能流程`);
  }
});

test('current lifecycle guidance does not require spec hash', () => {
  const spec = readSkill('spec');
  const plan = readSkill('plan');
  const verify = readSkill('verify-plan');
  const verifyCommand = fs.readFileSync(path.join(root, 'commands', 'project-kit', 'verify.md'), 'utf8');
  const lifecycle = fs.readFileSync(path.join(root, 'project-lifecycle.md'), 'utf8');
  const agents = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');

  for (const content of [spec, plan, verify, verifyCommand, lifecycle, agents]) {
    assert.doesNotMatch(content, /spec_hash/);
  }
  assert.match(spec, /缺少 REQ\/BR\/AC|REQ\/BR\/AC/);
  assert.match(plan, /Spec.*approved/);
  assert.match(plan, /全部.*REQ.*BR.*AC|REQ.*BR.*AC.*全部/s);
  assert.match(verify, /Plan.*completed/);
  assert.match(verify, /代码规范/);
});
