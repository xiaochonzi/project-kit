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
  assert.match(skill, /先.*读取.*constitution\.md/);
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
  assert.match(skill, /用户明确.*路径意图/);
  assert.match(skill, /Quick.*全部满足|全部满足.*Quick/s);
  assert.match(skill, /Full.*任一命中|任一命中.*Full/s);
  assert.match(skill, /使用 change.*Full|Full.*使用 change/s);
  assert.match(skill, /多个模块|多个独立结果/);
  assert.match(skill, /意图.*不明确.*澄清|澄清.*意图/s);
  assert.match(skill, /Full.*proposal.*spec.*plan/s);
});
