---
change: CR-001
title: 状态本地化：团队成员各自的私人 state
status: completed
created_at: 2026-08-21
---

# 状态本地化：团队成员各自的私人 state 实现计划

## 实现策略

将"当前焦点 / 下一动作"从全局 `docs/STATE.md` 迁移到本地 `.project-kit/state.md`。核心是脚本层（`INITIAL_FILES` 去掉 STATE、`initializeProject` 新增本地目录创建、`projectStatus` / `nextAction` 改读本地、`contextForMode` 去掉 STATE）+ 模板改造 + 技能文档引用更新 + 示例/测试同步。

不采用的方案：
- **保留全局 STATE 作为"团队级"补充**：Spec 明确不做团队级替代机制。
- **在 `.project-kit/` 内建 `.gitignore` 自忽略**：用户确认只依赖仓库根 `.gitignore` 的 `.project-kit/`。
- **脚本自动迁移旧 `docs/STATE.md`**：Spec 明确旧项目不自动迁移，文档说明即可。

## Tasks

### Task 1: 模板改造 — state.md 改为本地私人 state 模板

- files: `assets/templates/state.md`
- read_first: `assets/templates/proposal.md`（参考 frontmatter 风格）
- action: 将 `assets/templates/state.md` 重写为本地私人 state 模板，frontmatter 含 `active_change` / `next_action` / `last_completed` 三个字段，正文含当前焦点、个人下一步、最近完成、恢复上下文：

```markdown
---
active_change: null
next_action: null
last_completed: null
updated_at: {{DATE}}
---

# 私人 State

## Current Focus

## Next Action

## Last Completed

## Resume Context
```

- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: `validate-plugin` 无 error（模板链接校验通过），`assets/templates/state.md` 包含 `last_completed` 字段
- done: 模板已更新且 validate-plugin 通过

- [x] Task 1

### Task 2: 脚本 — INITIAL_FILES 移除 STATE.md

- files: `scripts/project-docs.cjs`
- read_first: `scripts/project-docs.cjs` 第 33-37 行 `INITIAL_FILES` 定义
- action: 将 `INITIAL_FILES` 中 `'STATE.md': 'state.md'` 一行删除，保留 `constitution.md` / `blueprint.md` / `roadmap.md` 三个：

```js
const INITIAL_FILES = {
  'constitution.md': 'constitution.md',
  'blueprint.md': 'blueprint.md',
  'roadmap.md': 'roadmap.md'
};
```

- verify: `node -e "const s=require('fs').readFileSync('scripts/project-docs.cjs','utf8'); if(/STATE\.md/.test(s.split('INITIAL_FILES')[1].split('DOCUMENT_TYPES')[0])) process.exit(1)"`（INITIAL_FILES 块内无 STATE.md）
- acceptance: INITIAL_FILES 只含 3 个根文档，不含 STATE.md
- done: INITIAL_FILES 已更新

- [x] Task 2

### Task 3: 脚本 — initializeProject 新增本地 `.project-kit/` 创建与根 .gitignore

- files: `scripts/project-docs.cjs`
- read_first: `scripts/project-docs.cjs` 第 240-257 行 `initializeProject` 函数
- action: 在 `initializeProject` 末尾新增创建本地私有目录逻辑：创建 `.project-kit/`，写入 `.project-kit/state.md`（渲染 state.md 模板，DATE 替换），并确保仓库根 `.gitignore` 含 `.project-kit/`（若无则追加；根 `.gitignore` 不存在则创建）：

```js
function initializeProject(root) {
  const docsRoot = path.join(root, 'docs');
  fs.mkdirSync(docsRoot, { recursive: true });
  for (const directory of MANAGED_DIRECTORIES) fs.mkdirSync(path.join(docsRoot, directory), { recursive: true });
  for (const [outputName, templateName] of Object.entries(INITIAL_FILES)) {
    const outputPath = path.join(docsRoot, outputName);
    if (fs.existsSync(outputPath)) {
      process.stdout.write(`跳过已有文件: ${path.relative(root, outputPath)}\n`);
      continue;
    }
    writeNewFile(outputPath, renderTemplate(templateName, { DATE: currentDate() }));
    process.stdout.write(`创建: ${path.relative(root, outputPath)}\n`);
  }
  // 本地私有状态目录（gitignored，不提交）
  const privateKitDir = path.join(root, '.project-kit');
  fs.mkdirSync(privateKitDir, { recursive: true });
  const privateStatePath = path.join(privateKitDir, 'state.md');
  if (!fs.existsSync(privateStatePath)) {
    writeNewFile(privateStatePath, renderTemplate('state.md', { DATE: currentDate() }));
    process.stdout.write(`创建: ${path.relative(root, privateStatePath)}\n`);
  }
  // 仓库根 .gitignore 追加 .project-kit/
  const gitignorePath = path.join(root, '.gitignore');
  let gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  if (!gitignoreContent.split('\n').some((line) => line.trim() === '.project-kit/')) {
    gitignoreContent = gitignoreContent.replace(/\s*$/, '\n') + '.project-kit/\n';
    fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
  }
}
```

- verify: `node -e "const s=require('fs').readFileSync('scripts/project-docs.cjs','utf8'); if(!s.includes('.project-kit')) process.exit(1)"`
- acceptance: 脚本包含 `.project-kit` 创建逻辑与根 `.gitignore` 追加逻辑
- done: initializeProject 已更新且包含 `.project-kit` 逻辑

- [x] Task 3

### Task 4: 脚本 — projectStatus 改读本地 state 并输出 last_completed

- files: `scripts/project-docs.cjs`
- read_first: `scripts/project-docs.cjs` 第 593-622 行 `projectStatus` 函数
- action: 将 `projectStatus` 中 `const statePath = path.join(root, 'docs', 'STATE.md');` 改为 `const statePath = path.join(root, '.project-kit', 'state.md');`，并在结果中新增 `last_completed` 字段（从 state frontmatter 读取），输出部分新增"最近完成"行：

```js
function projectStatus(root, jsonOutput) {
  const documents = collectDocuments(root);
  const statePath = path.join(root, '.project-kit', 'state.md');
  let state = {};
  if (fs.existsSync(statePath)) state = parseFrontmatter(fs.readFileSync(statePath, 'utf8'));
  const changes = documents
    .filter((item) => item.kind === 'proposal')
    .map((item) => ({
      id: item.metadata.id,
      status: item.metadata.status,
      title: item.metadata.title ?? path.basename(path.dirname(item.relativePath)),
      path: item.relativePath
    }));
  const result = {
    active_change: state.active_change ?? null,
    next_action: state.next_action ?? null,
    last_completed: state.last_completed ?? null,
    changes
  };
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  process.stdout.write('Project Kit Status\n');
  process.stdout.write(`当前焦点: ${result.active_change ?? '无'}\n`);
  process.stdout.write(`下一动作: ${result.next_action ?? '无'}\n`);
  process.stdout.write(`最近完成: ${result.last_completed ?? '无'}\n`);
  process.stdout.write(`\nChanges (${changes.length})\n`);
  for (const change of changes) {
    process.stdout.write(`  - ${change.id} [${change.status}] ${change.title}\n`);
  }
}
```

- verify: `node scripts/project-docs.cjs status --root . 2>&1`（当前无 `.project-kit/state.md` 时不应报错，输出含"最近完成: 无"）
- acceptance: status 输出含"最近完成"行，且不读取 `docs/STATE.md`
- done: projectStatus 已改为读 `.project-kit/state.md` 并输出 last_completed

- [x] Task 4

### Task 5: 脚本 — nextAction 改读本地 state

- files: `scripts/project-docs.cjs`
- read_first: `scripts/project-docs.cjs` 第 744-772 行 `nextAction` 函数
- action: 将 `nextAction` 中 `const statePath = path.join(root, 'docs', 'STATE.md');` 改为 `const statePath = path.join(root, '.project-kit', 'state.md');`，reason 文案 `'STATE.md 记录的下一动作'` 改为 `'本地 state 记录的下一动作'`，末尾 `'没有机械可推导的待办，请检查 Roadmap 与 STATE'` 改为 `'没有机械可推导的待办，请检查 Roadmap 与本地 state'`。
- verify: `node scripts/project-docs.cjs next --root . 2>&1`
- acceptance: next 输出正常，且脚本中不再有 `docs/STATE.md`（`grep -c "docs/STATE.md" scripts/project-docs.cjs` 为 0）
- done: nextAction 已改读 `.project-kit/state.md`

- [x] Task 5

### Task 6: 脚本 — contextForMode 根文档列表移除 STATE

- files: `scripts/project-docs.cjs`
- read_first: `scripts/project-docs.cjs` 第 574 行 `contextForMode` 中根文档数组
- action: 将 `for (const fileName of ['constitution.md', 'blueprint.md', 'roadmap.md', 'STATE.md']) add(fileName);` 中的 `'STATE.md'` 移除。
- verify: `grep -n "contextForMode" -A 8 scripts/project-docs.cjs` 确认根文档数组不含 STATE.md
- acceptance: contextForMode 不再输出 STATE.md
- done: contextForMode 已更新

- [x] Task 6

### Task 7: 更新 init 技能文档

- files: `skills/init/SKILL.md`
- read_first: `skills/init/SKILL.md` 全文（已读）
- action: 修改以下内容：
  - 第 109 行核对清单：`4 个根文档:constitution.md、blueprint.md、roadmap.md、STATE.md` → `3 个根文档:constitution.md、blueprint.md、roadmap.md` + 新增核对 `.project-kit/state.md` 已创建
  - 第 130 行：`根文档(4): constitution / blueprint / roadmap / STATE` → `根文档(3): constitution / blueprint / roadmap`，并新增本地私有目录说明
  - 第 164 行目录契约树：删除 `STATE.md` 行，新增 `.project-kit/` 说明
  - 第 171 行：`记录 = git commit + STATE 一行` → `记录 = git commit + 本地 state 一行`
  - Step 8 Handoff 报告模板中 `根文档(4)` → `根文档(3)`，新增 `.project-kit/` 创建报告
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: init SKILL.md 不再含 `docs/STATE.md`（`grep -c "STATE.md" skills/init/SKILL.md` 为 0，但可含"本地 state"字样）
- done: init 技能文档已更新

- [x] Task 7

### Task 8: 更新 status 技能文档

- files: `skills/status/SKILL.md`
- read_first: `skills/status/SKILL.md` 全文
- action: 修改以下内容：
  - 第 22 行：输出描述改为 `.project-kit/state.md` 的 `active_change` / `next_action` / `last_completed`
  - 第 27 行：`cat docs/STATE.md` → `cat .project-kit/state.md`
  - 第 30 行：`STATE.md` 是 AI 接力入口 → `.project-kit/state.md` 是本地人员接力入口（团队看 changes,个人看本地 state）
  - 第 52 行：`只读 STATE` → `只读本地 state`
  - Overview 增加"status 是个人视角,团队进度看 changes"说明
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: status SKILL.md 不再含 `docs/STATE.md`
- done: status 技能文档已更新

- [x] Task 8

### Task 9: 更新 change 技能文档

- files: `skills/change/SKILL.md`
- read_first: `skills/change/SKILL.md` 全文
- action: 修改以下内容：
  - 第 20 行 Iron Law 注释：`记录 = git commit + STATE 一行` → `记录 = git commit + 本地 state 一行`
  - 第 48 行：`→ STATE.md 记一行(最近完成)` → `→ 本地 state 记一行(最近完成)`
  - 第 52 行：`记录 = git commit + docs/STATE.md 一行` → `记录 = git commit + .project-kit/state.md 一行`
  - 第 130 行：`Quick:直接完成,更新 STATE` → `Quick:直接完成,更新本地 state`
  - 第 138 行：`记录在 git + STATE` → `记录在 git + 本地 state`
  - Quick 流程图中 `STATE.md 记一行(最近完成)` → `本地 state 记一行(最近完成)`
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: change SKILL.md 不再含 `docs/STATE.md`
- done: change 技能文档已更新

- [x] Task 9

### Task 10: 更新 bug 技能文档

- files: `skills/bug/SKILL.md`
- read_first: `skills/bug/SKILL.md` 全文
- action: 修改以下内容：
  - 第 40 行：`→ STATE.md 记一行` → `→ 本地 state 记一行`
  - 第 44 行：`记录 = git commit + docs/STATE.md 一行` → `记录 = git commit + .project-kit/state.md 一行`
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: bug SKILL.md 不再含 `docs/STATE.md`
- done: bug 技能文档已更新

- [x] Task 10

### Task 11: 更新 brief 技能文档

- files: `skills/brief/SKILL.md`
- read_first: `skills/brief/SKILL.md` 全文
- action: 第 49 行：`读取 docs/STATE.md,了解当前焦点` → `读取 .project-kit/state.md,了解当前本地人员焦点;团队进度看 docs/changes/`
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: brief SKILL.md 不再含 `docs/STATE.md`
- done: brief 技能文档已更新

- [x] Task 11

### Task 12: 更新 plan 技能文档

- files: `skills/plan/SKILL.md`
- read_first: `skills/plan/SKILL.md` 全文
- action: 第 28 行：`docs/STATE.md(当前焦点)` → `.project-kit/state.md(本地人员当前焦点)`
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: plan SKILL.md 不再含 `docs/STATE.md`
- done: plan 技能文档已更新

- [x] Task 12

### Task 13: 更新 execute-plan 技能文档

- files: `skills/execute-plan/SKILL.md`
- read_first: `skills/execute-plan/SKILL.md` 全文
- action: 修改以下内容：
  - 第 12 行：`结论同步到 STATE.md` → `结论同步到 .project-kit/state.md`
  - 第 42 行：`已读 docs/STATE.md(当前焦点)` → `已读 .project-kit/state.md(本地人员当前焦点)`
  - 第 121 行标题：`### Step 7: 更新 STATE.md` → `### Step 7: 更新本地 state`
  - 第 123 行：`在 docs/STATE.md 中记录...active_change / next_action` → `在 .project-kit/state.md 中记录...active_change / next_action / last_completed`
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: execute-plan SKILL.md 不再含 `docs/STATE.md`
- done: execute-plan 技能文档已更新

- [x] Task 13

### Task 14: 更新 verify-plan 技能文档

- files: `skills/verify-plan/SKILL.md`
- read_first: `skills/verify-plan/SKILL.md` 全文
- action: 修改以下内容：
  - 第 3 行 description：`writing results back into plan.md and STATE.md` → `writing results back into plan.md and local state`
  - 第 14 行：`结论同步 STATE.md` → `结论同步 .project-kit/state.md`
  - 第 95 行：`更新 docs/STATE.md(完成记录、下一动作)` → `更新 .project-kit/state.md(完成记录、下一动作、最近完成)`
  - 第 101 行标题：`### Step 6: 更新 STATE.md` → `### Step 6: 更新本地 state`
  - 第 121 行：`更新 STATE` → `更新本地 state`
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: verify-plan SKILL.md 不再含 `docs/STATE.md`
- done: verify-plan 技能文档已更新

- [x] Task 14

### Task 15: 更新 roadmap 技能文档

- files: `skills/roadmap/SKILL.md`
- read_first: `skills/roadmap/SKILL.md` 全文
- action: 修改以下内容：
  - 第 14 行：`归 docs/STATE.md 的 active_change / next_action` → `归 .project-kit/state.md 的 active_change / next_action`
  - 第 21 行：`ROADMAP PLANS — STATE TRACKS` → `ROADMAP PLANS — LOCAL STATE TRACKS`
  - 第 24 行：`那是 STATE.md 的职责` → `那是 .project-kit/state.md 的职责`
  - 第 64 行：`由 STATE.md 的 active_change / next_action 承担` → `由 .project-kit/state.md 承担`
  - 第 128 行：`并在 STATE.md 更新 active_change / next_action` → `并在 .project-kit/state.md 更新`
  - 第 139 行：`动态状态在 STATE` → `动态状态在 .project-kit/state.md`
  - 第 149 行：`更新 STATE` → `更新 .project-kit/state.md`
  - 第 169 行：`动态状态属于 STATE.md` → `动态状态属于 .project-kit/state.md`
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: roadmap SKILL.md 不再含 `docs/STATE.md`
- done: roadmap 技能文档已更新

- [x] Task 15

### Task 16: 更新 constitution 技能文档

- files: `skills/constitution/SKILL.md`
- read_first: `skills/constitution/SKILL.md` 全文
- action: 第 65 行：`回归证据写入 git commit 与 STATE` → `回归证据写入 git commit 与本地 state`
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: constitution SKILL.md 不再含 `docs/STATE.md`
- done: constitution 技能文档已更新

- [x] Task 16

### Task 17: 更新示例项目 — 删除 STATE.md

- files: `examples/minimal-project/docs/STATE.md`、`examples/lifecycle-project/docs/STATE.md`
- read_first: 无（直接删除文件）
- action: 删除两个示例项目中的 `docs/STATE.md` 文件：
  - `rm examples/minimal-project/docs/STATE.md`
  - `rm examples/lifecycle-project/docs/STATE.md`
- verify: `node scripts/project-docs.cjs validate --root examples/minimal-project && node scripts/project-docs.cjs validate --root examples/lifecycle-project`
- acceptance: 两个 validate 均无 error（validate 遍历 INITIAL_FILES 不再要求 STATE.md）
- done: 两个示例项目 validate 通过

- [x] Task 17

### Task 18: 更新测试 — init 校验 .project-kit 创建

- files: `tests/project-docs.test.cjs`
- read_first: `tests/project-docs.test.cjs` 全文（已读）
- action: 在 `makeTmpProject` 或新增测试中,init 后断言 `.project-kit/state.md` 存在且根 `.gitignore` 含 `.project-kit/`。新增一个测试用例：

```js
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
```

- verify: `node --test tests/project-docs.test.cjs`
- acceptance: 全部测试通过，新测试验证 `.project-kit/state.md` 创建与 status 输出
- done: 测试通过

- [x] Task 18

### Task 19: 更新根 .gitignore

- files: `.gitignore`
- read_first: 当前 `.gitignore`（内容 `.reference/`、`/.claude/`、`*-workspace/`）
- action: 追加一行 `.project-kit/`。但注意本项目根 `.gitignore` 目前不含 `.project-kit/`,Task 3 的 initializeProject 只对新初始化项目生效,本仓库自身的 `.gitignore` 需手动追加:

```text
.reference/
/.claude/
*-workspace/
.project-kit/
```

- verify: `grep -n "project-kit" .gitignore`
- acceptance: 根 `.gitignore` 含 `.project-kit/`
- done: 根 .gitignore 已追加

- [x] Task 19

### Task 20: 更新 README 与文档引用

- files: `README.md`、`CHANGELOG.md`
- read_first: `README.md` 中 docs/ 目录约定部分
- action:
  - README:docs/ 目录树中 `STATE.md` 行删除,新增 `.project-kit/` 说明;Quick 变更记录说明改为"git commit + 本地 state 一行";状态相关描述更新
  - CHANGELOG:新增 0.4.1(或下一版本)条目,记录状态本地化变更
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: validate-plugin 无 error;README 不再含 `docs/STATE.md` 引用
- done: README 与 CHANGELOG 已更新

- [x] Task 20

### Task 21: 全量校验与最终验证

- files: 无（仅验证）
- read_first: 无
- action: 运行全部验证命令确认无回归：
  - `node scripts/project-docs.cjs validate-plugin --root .`
  - `node scripts/project-docs.cjs validate --root examples/minimal-project`
  - `node scripts/project-docs.cjs validate --root examples/lifecycle-project`
  - `node --test tests/project-docs.test.cjs`
  - `node --test tests/opencode-plugin.test.cjs`
  - `node --test tests/pi-package.test.cjs`
- verify: 上述命令全部通过
- acceptance: 全部校验无 error,测试全绿
- done: 全部验证通过

- [x] Task 21

## 验收标准映射

| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| 1. init 创建本地目录与忽略 | Task 2、3、18、19 | Task 21: init 测试断言 `.project-kit/state.md` 与根 `.gitignore` |
| 2. init 不再创建 STATE.md | Task 2、17 | Task 18: 断言 `docs/STATE.md` 不存在;Task 21 validate examples |
| 3. status 读取本地状态 | Task 4 | Task 21: status 输出 `active_change` / `next_action` / `last_completed` |
| 4. status 未初始化降级 | Task 4 | Task 21: 无 `.project-kit/state.md` 时 status 不报错 |
| 5. next 读取本地状态 | Task 5 | Task 21: next 输出正常 |
| 6. validate 忽略本地目录 | Task 3 | Task 21: validate examples 无 `.project-kit` 错误 |
| 7. gitignore 生效 | Task 3、19 | Task 21: `git check-ignore .project-kit/state.md` |
| 8. 技能文档无残留引用 | Task 7-16 | Task 21: `grep -rn "docs/STATE.md" skills/` 为 0 |
| 9. 示例项目同步 | Task 17 | Task 21: validate examples 通过 |
| 10. 测试更新 | Task 18 | Task 21: `node --test tests/` 全绿 |

## 最终验证

```bash
# 1. 插件结构校验
node scripts/project-docs.cjs validate-plugin --root .

# 2. 示例项目校验
node scripts/project-docs.cjs validate --root examples/minimal-project
node scripts/project-docs.cjs validate --root examples/lifecycle-project

# 3. 单元测试
node --test tests/*.test.cjs

# 4. 残留引用扫描
grep -rn "docs/STATE.md" skills/ scripts/ README.md examples/ || echo "无残留引用"

# 5. gitignore 生效
git check-ignore .project-kit/state.md

# 6. 实机验证 status / next
node scripts/project-docs.cjs status --root .
node scripts/project-docs.cjs next --root .
```

### 执行验证结果(2026-08-21)

| 命令 | 结果 |
| --- | --- |
| `validate-plugin --root .` | 模板数 8,错误 0,提醒 0 ✅ |
| `validate --root examples/minimal-project` | Changes 0,错误 0 ✅ |
| `validate --root examples/lifecycle-project` | Changes 1,错误 0 ✅ |
| `node --test tests/*.test.cjs` | 19 个测试全部通过(project-docs 9 / opencode 4 / pi-package 6)✅ |
| `grep -rn "docs/STATE.md" skills/ scripts/ README.md examples/` | 无残留引用 ✅ |
| `git check-ignore .project-kit/state.md` | 输出 `.project-kit/state.md`,忽略生效 ✅ |
| `status --root .` | 当前焦点: 无 / 下一动作: 无 / 最近完成: 无,changes 列表正常 ✅ |
| `next --root .` | 下一模式: change CR-001(机械推导回退)✅ |

> 注:`node --test tests/` 在 Node v22 下会把目录当模块报错,实际使用 glob `tests/*.test.cjs` 运行,19 个测试全绿。

### 独立验收结果(verify-plan,2026-08-21)

| Spec 验收标准 | 新鲜证据(本轮重跑) | 结果 |
| --- | --- | --- |
| 1. init 创建本地目录与忽略 | 临时目录实测 init:创建 `.project-kit/state.md`,根 `.gitignore` 含 `.project-kit/` | ✅ pass |
| 2. init 不再创建 STATE.md | 临时目录实测:docs/ 仅 3 根文档,无 STATE.md | ✅ pass |
| 3. status 读取本地状态 | `status --root .` 输出"当前焦点: CR-001"、"下一动作: verify-plan CR-001";json 含 last_completed | ✅ pass |
| 4. status 未初始化降级 | 删 `.project-kit/` 后 status exit 0,输出"无"+ changes 列表 | ✅ pass |
| 5. next 读取本地状态 | 设 next_action 后 next 输出"本地 state 记录的下一动作" | ✅ pass |
| 6. validate 忽略本地目录 | validate 输出无 .project-kit(collectDocuments 不扫描) | ✅ pass |
| 7. gitignore 生效 | `git check-ignore .project-kit/state.md` 成功 | ✅ pass |
| 8. 技能文档无残留引用 | 全仓库 grep `docs/STATE.md` 为 0 | ✅ pass |
| 9. 示例项目同步 | 两个 examples validate 均 0 错误 | ✅ pass |
| 10. 测试更新 | `node --test tests/*.test.cjs` 19 个全绿 | ✅ pass |

回归:validate-plugin 0 错误;改动范围与 plan files 一致(git status 18 个文件 + 2 个 STATE.md 删除),无越界。结论:全部 10 条验收标准 pass,spec verified,change completed。

## 非目标

- 不创建 `.project-kit/.gitignore`（用户确认只用根 `.gitignore`）
- 不自动迁移旧项目的 `docs/STATE.md`
- 不做个人路线 / roadmap 子集
- 不产生个人验证记录、个人变更记录
- 不改 change 三件套与状态机
- 不改 blueprint 模块边界
