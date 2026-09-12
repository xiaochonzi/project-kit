const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function readSkill(name) {
  return fs.readFileSync(path.join(root, 'skills', name, 'SKILL.md'), 'utf8');
}

function readTemplate(name) {
  return fs.readFileSync(path.join(root, 'assets', 'templates', `${name}.md`), 'utf8');
}

test('change spec and plan templates are minimal scaffolds', () => {
  for (const name of ['proposal', 'spec', 'plan']) {
    const template = readTemplate(name);
    assert.match(template, /status:/);
    assert.match(template, /schema_version: 2/);
    assert.match(template, /^# /m);
    assert.doesNotMatch(template, /^## /m);
    assert.doesNotMatch(template, /<!--|TODO|TBD|<任务名>|由 (?:change|spec|plan) 技能填写/);
  }
});

test('change routes risk and writes a context-free proposal from scratch', () => {
  const skill = readSkill('change');
  assert.match(skill, /Quick[\s\S]*全部满足|以下全部满足/);
  assert.match(skill, /Full[\s\S]*任一命中/);
  assert.match(skill, /最小骨架/);
  assert.match(skill, /从空正文/);
  assert.match(skill, /EVD-##/);
  assert.match(skill, /DEC-##/);
  assert.match(skill, /没有原始对话/);
  assert.match(skill, /Proposal accepted → `spec`/);
  assert.doesNotMatch(skill, /高级模型|低级模型/);
});

test('spec builds a single-source business contract for context-free execution', () => {
  const skill = readSkill('spec');
  for (const concept of ['术语与业务对象', '数据权威表', '核心契约', '条件契约块', 'BR-##', 'AC-##', '单一事实来源', '第二种合理']) {
    assert.match(skill, new RegExp(concept));
  }
  assert.match(skill, /Normative/);
  assert.match(skill, /Illustrative/);
  assert.match(skill, /内部类名.*文件路径|文件路径.*内部类名/s);
  assert.match(skill, /Spec approved.*`plan`/);
  assert.doesNotMatch(skill, /高级模型|低级模型/);
});

test('plan creates an executable handoff with baseline bindings and complete tasks', () => {
  const skill = readSkill('plan');
  for (const concept of ['代码基线', '系统入口与技术调用链', 'Current Behavior', '全局不变量', '执行环境', 'Implementation Binding', '条件技术设计', '原始对话']) {
    assert.match(skill, new RegExp(concept));
  }
  for (const field of ['files', 'file_actions', 'symbols', 'read_first', 'depends_on', 'interfaces', 'current_behavior', 'target_behavior', 'implementation', 'outputs', 'decisions', 'invariants', 'prerequisites', 'stop_if', 'verify', 'acceptance', 'done']) {
    assert.match(skill, new RegExp(`- ${field}:`));
  }
  assert.match(skill, /全部 DEC \/ BR \/ AC/);
  assert.match(skill, /Plan approved → `execute-plan`/);
  assert.doesNotMatch(skill, /new plan --change/);
  assert.doesNotMatch(skill, /高级模型|低级模型/);
});

test('plan requires constitution constraints and machine-independent verification', () => {
  const skill = readSkill('plan');
  assert.match(skill, /Constitution/);
  assert.match(skill, /适用规范清单/);
  assert.match(skill, /机器无关/);
  assert.match(skill, /用户主目录和盘符绝对路径/);
});

test('execute-plan treats persisted documents as the only requirement input', () => {
  const skill = readSkill('execute-plan');
  for (const concept of ['唯一需求与实施上下文', '代码基线', 'file_actions', 'outputs', 'prerequisites', 'stop_if', 'Implementation Binding']) {
    assert.match(skill, new RegExp(concept));
  }
  assert.match(skill, /代码规范预检/);
  assert.match(skill, /写代码前/);
  assert.match(skill, /constitution\.md/);
  assert.doesNotMatch(skill, /高级模型|低级模型/);
});

test('verify-plan audits decisions contracts outputs and constitution with fresh evidence', () => {
  const skill = readSkill('verify-plan');
  for (const concept of ['新鲜证据', 'DEC \/ BR \/ AC', 'file_actions', 'outputs', 'Implementation Binding', '代码规范符合性']) {
    assert.match(skill, new RegExp(concept));
  }
  assert.match(skill, /规范.*fail.*blocked|fail.*blocked.*规范/s);
  assert.match(skill, /不得.*verified|不得.*completed/);
  assert.match(skill, /transition 脚本只负责/);
  assert.match(skill, /不替 AI 判断代码规范/);
});

test('lifecycle commands are thin skill routers', () => {
  for (const name of ['change', 'spec', 'plan', 'execute', 'verify']) {
    const command = fs.readFileSync(path.join(root, 'commands', 'project-kit', `${name}.md`), 'utf8');
    assert.match(command, /SKILL\.md/);
    assert.ok(command.split(/\r?\n/).length <= 12, `${name} command 不应复制技能流程`);
  }
});

test('current lifecycle guidance does not require spec hash', () => {
  const contents = [
    readSkill('spec'),
    readSkill('plan'),
    readSkill('verify-plan'),
    fs.readFileSync(path.join(root, 'commands', 'project-kit', 'verify.md'), 'utf8'),
    fs.readFileSync(path.join(root, 'project-lifecycle.md'), 'utf8'),
    fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'),
  ];
  for (const content of contents) assert.doesNotMatch(content, /spec_hash/);
  assert.match(readSkill('plan'), /Spec.*approved/);
  assert.match(readSkill('verify-plan'), /Plan.*completed/);
});
