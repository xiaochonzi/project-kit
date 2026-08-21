---
change: CR-002
title: change 技能新增 diagrams 数据关系文档
status: completed
created_at: 2026-08-21
---

# change 技能新增 diagrams 数据关系文档 实现计划

## 实现策略

新增 change 的可选第四份文档 `diagrams.md`（数据关系文档），置于 `docs/changes/CR-###-<slug>/`。实现核心是复用现有 `createChangeArtifact` 机制——它已通用支持任意 type（`renderTemplate('${type}.md')`），只需把 `createDocument` 的分支数组 `['proposal', 'spec', 'plan']` 加入 `'diagrams'`，并新增模板 `assets/templates/diagrams.md`。diagrams 作为"无 kind 的附件"（documentKind 返回 null），validate 仍会检查模板变量残留但不强制存在。

不采用的方案：
- **新增独立状态机 / REQUIRED_SECTIONS**：Spec 明确 diagrams 无 status、validate 不强制，故不加入 ALLOWED_STATUSES / REQUIRED_SECTIONS / CONTENT_GATES。
- **修改 documentKind 识别 diagrams**：保持 diagrams 为附件（kind=null），避免引入不必要的 kind 语义。
- **强制校验**：Spec 明确非强制，validate 不改。

## Tasks

### Task 1: 新增 diagrams.md 模板

- files: `assets/templates/diagrams.md`
- read_first: `assets/templates/spec.md`（参考 frontmatter 风格）
- action: 新建 `assets/templates/diagrams.md`：

```markdown
---
change: {{CHANGE}}
title: {{TITLE}}
created_at: {{DATE}}
---

# {{TITLE}} 数据关系文档

## 数据模型清单

## 模型间关系（ER）

## 设计依据

## 前后端操作时机

## 未决问题
```

- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: `assets/templates/diagrams.md` 存在，含 4 个核心章节；validate-plugin 0 错误
- done: 模板已创建且 validate-plugin 通过

- [x] Task 1

### Task 2: 脚本 — new 命令加入 diagrams 支持

- files: `scripts/project-docs.cjs`
- read_first: `scripts/project-docs.cjs` 第 288-296 行 `createDocument` 分支数组
- action: 将 `if (['proposal', 'spec', 'plan'].includes(type))` 改为：

```js
  if (['proposal', 'spec', 'plan', 'diagrams'].includes(type)) {
    createChangeArtifact(root, type, options, documents);
    return;
  }
```

（`createChangeArtifact` 已用 `renderTemplate(\`${type}.md\`)` 通用渲染，无需其他改动。）

- verify: `node -e "const s=require('fs').readFileSync('scripts/project-docs.cjs','utf8'); if(!/\[.proposal., .spec., .plan., .diagrams.\]/.test(s)) process.exit(1); console.log('diagrams 已加入分支')"`
- acceptance: 分支数组含 `'diagrams'`
- done: 脚本支持 `new diagrams`

- [x] Task 2
  > 连带:需在 DOCUMENT_TYPES 注册 `diagrams: { directory: null, template: 'diagrams.md' }`，否则 `createDocument` 报"不支持的文档类型"。已补齐。

### Task 3: 实机验证 new diagrams 命令

- files: 无（仅验证，用临时项目）
- read_first: 无
- action: 在临时项目实测：init → new change → transition accepted → new diagrams，确认生成 diagrams.md：

```bash
TMP=$(mktemp -d)
node scripts/project-docs.cjs init --root "$TMP"
node scripts/project-docs.cjs new change --title "测试数据模型" --root "$TMP"
node scripts/project-docs.cjs transition CR-001 --to accepted --root "$TMP"
node scripts/project-docs.cjs new diagrams --change CR-001 --root "$TMP"
```

- verify: `cat "$TMP/docs/changes/CR-001-测试数据模型/diagrams.md"` 含正确 frontmatter 与 4 章节
- acceptance: diagrams.md 生成成功，无 `{{}}` 残留
- done: new diagrams 命令可用

- [x] Task 3

### Task 4: 更新 change 技能文档 — 增加 diagrams 步骤

- files: `skills/change/SKILL.md`
- read_first: `skills/change/SKILL.md` Step 4（约第 88-100 行）、Step 5 Handoff（约第 104-106 行）
- action: 在 Step 4（spec approved）之后、Step 5（Handoff）之前，插入 diagrams 步骤。将 Step 5 之前新增：

```markdown
### Step 5: 数据关系文档（可选）

若该 change 涉及**新的数据模型设计**，在 spec 确认后创建数据关系文档：

```bash
node scripts/project-docs.cjs new diagrams --change CR-### --root <项目根>
```

填写 `docs/changes/CR-###-<slug>/diagrams.md`：数据模型清单、模型间关系（ER）、设计依据、前后端操作时机。与用户确认后进入 Handoff。

不涉及新数据模型的 change，跳过本步骤（diagrams 非强制）。
```

原 Step 5 Handoff 顺延为 Step 6，Handoff Rule 更新提及 diagrams：

- verify: `node scripts/project-docs.cjs validate-plugin --root .` 且 `grep -n "new diagrams" skills/change/SKILL.md`
- acceptance: change SKILL.md 含 `new diagrams` 步骤；validate-plugin 0 错误
- done: change 技能已更新

- [x] Task 4

### Task 5: 更新 plan 技能文档

- files: `skills/plan/SKILL.md`
- read_first: `skills/plan/SKILL.md` Step 1-2（约第 35-38 行）
- action: 在 Step 2 探索代码现实中，补充"读取 diagrams.md（若存在）作为数据依据"：

- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: plan SKILL.md 提及 diagrams 数据依据；validate-plugin 0 错误
- done: plan 技能已更新

- [x] Task 5

### Task 6: 更新 execute-plan / verify-plan 技能文档

- files: `skills/execute-plan/SKILL.md`、`skills/verify-plan/SKILL.md`
- read_first: 两个技能的 Required Inputs / 读取清单
- action: 在 Required Inputs 或相关读取步骤中补充"（若有）读取 `docs/changes/CR-###-<slug>/diagrams.md` 核对数据实现是否符合设计"。
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: 两技能提及 diagrams；validate-plugin 0 错误
- done: execute-plan / verify-plan 技能已更新

- [x] Task 6

### Task 7: 更新测试 — new diagrams 创建与 validate 非强制

- files: `tests/project-docs.test.cjs`
- read_first: `tests/project-docs.test.cjs`（已读）
- action: 新增两个测试用例：

```js
test('new diagrams creates diagrams.md for accepted change', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '数据模型变更', '--root', tmp]);
    run(['transition', 'CR-001', '--to', 'accepted', '--root', tmp]);
    run(['new', 'diagrams', '--change', 'CR-001', '--root', tmp]);
    const dir = fs.readdirSync(path.join(tmp, 'docs', 'changes')).find((d) => d.startsWith('CR-'));
    assert.ok(fs.existsSync(path.join(tmp, 'docs', 'changes', dir, 'diagrams.md')));
    const result = JSON.parse(run(['validate', '--root', tmp, '--json']));
    assert.equal(result.valid, true);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('change without diagrams validates (non-mandatory)', () => {
  const tmp = makeTmpProject();
  try {
    run(['new', 'change', '--title', '无数据模型', '--root', tmp]);
    const result = JSON.parse(run(['validate', '--root', tmp, '--json']));
    assert.equal(result.valid, true);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
```

- verify: `node --test tests/project-docs.test.cjs`
- acceptance: 新增测试通过，原测试全部通过
- done: 测试更新

- [x] Task 7

### Task 8: 更新 README 与 CHANGELOG

- files: `README.md`、`CHANGELOG.md`
- read_first: `README.md` docs/ 目录约定与可用技能区
- action:
  - README：docs/ 目录约定 tree 中 `changes/` 说明补充 `diagrams.md`（可选）；change 技能流程描述提及"涉及新数据模型时生成 diagrams"。
  - CHANGELOG：新增 0.6.0 条目，记录"change 技能新增 diagrams 数据关系文档（可选）"。
- verify: `node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: README 提及 diagrams；validate-plugin 0 错误
- done: README 与 CHANGELOG 已更新

- [x] Task 8

### Task 9: 全量校验与最终验证

- files: 无（仅验证）
- read_first: 无
- action: 运行全部验证：
  - `node scripts/project-docs.cjs validate-plugin --root .`
  - `node scripts/project-docs.cjs validate --root examples/minimal-project`
  - `node scripts/project-docs.cjs validate --root examples/lifecycle-project`
  - `node --test tests/*.test.cjs`
- verify: 上述全部通过
- acceptance: validate-plugin 0 错误，两个示例 validate 通过，全部测试通过
- done: 全部验证通过

- [x] Task 9

## 验收标准映射

| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| 1. 模板存在且含 4 章节 | Task 1 | Task 9: 检查 diagrams.md 模板 |
| 2. new diagrams 命令生成正确 | Task 2、3 | Task 3: 临时项目实测生成 |
| 3. 顺序约束（Change 不存在报错） | Task 2（复用 createChangeArtifact） | Task 9: new diagrams 依赖 proposal accepted |
| 4. 幂等（已存在报错） | Task 2（writeNewFile wx flag） | Task 9: 二次运行报错 |
| 5. validate 不强制 | Task 7 | Task 7: 无 diagrams 的 change validate 通过 |
| 6. 模板变量替换无残留 | Task 1、3 | Task 3: 生成文档无 `{{}}` |
| 7. change 技能含 diagrams 步骤 | Task 4 | Task 9: grep new diagrams |
| 8. 相关技能提及 diagrams | Task 5、6 | Task 9: grep diagrams in skills |
| 9. 测试覆盖 | Task 7 | Task 9: node --test 全绿 |
| 10. 插件校验 + README/CHANGELOG | Task 8 | Task 9: validate-plugin 0 错误 |

## 最终验证

```bash
# 1. 插件结构校验
node scripts/project-docs.cjs validate-plugin --root .

# 2. 示例项目校验
node scripts/project-docs.cjs validate --root examples/minimal-project
node scripts/project-docs.cjs validate --root examples/lifecycle-project

# 3. 单元测试
node --test tests/*.test.cjs

# 4. new diagrams 实机验证（临时目录）
TMP=$(mktemp -d)
node scripts/project-docs.cjs init --root "$TMP"
node scripts/project-docs.cjs new change --title "测试数据模型" --root "$TMP"
node scripts/project-docs.cjs transition CR-001 --to accepted --root "$TMP"
node scripts/project-docs.cjs new diagrams --change CR-001 --root "$TMP"
cat "$TMP/docs/changes/CR-001-测试数据模型/diagrams.md"

# 5. skill 提及 diagrams
grep -rn "diagrams" skills/
```

### 执行验证结果(2026-08-21)

| 命令 | 结果 |
| --- | --- |
| `validate-plugin --root .` | 模板数 9（新增 diagrams），错误 0 ✅ |
| `validate --root examples/minimal-project` | Changes 0，错误 0 ✅ |
| `validate --root examples/lifecycle-project` | Changes 1，错误 0 ✅ |
| `node --test tests/*.test.cjs` | 22 个测试全部通过（新增 new diagrams / 非强制 / 顺序约束）✅ |
| `new diagrams` 临时目录实机 | 生成 diagrams.md，4 章节完整，无 `{{}}` 残留；二次运行报 EEXIST 幂等 ✅ |
| `grep -rn "diagrams" skills/` | change / plan / execute-plan / verify-plan 提及 ✅ |

> 连带修改（plan 补充记录）：Task 1 需将 `TEMPLATE_EXPECTED_COUNT` 8→9；Task 2 需在 `DOCUMENT_TYPES` 注册 `diagrams`（否则 createDocument 报"不支持的文档类型"）。

### 独立验收结果（verify-plan，2026-08-21）

| Spec 验收标准 | 新鲜证据（本轮重跑） | 结果 |
| --- | --- | --- |
| 1. 模板存在含 4 章节 | `assets/templates/diagrams.md` 存在，含数据模型清单/模型间关系（ER）/设计依据/前后端操作时机 | ✅ pass |
| 2. new diagrams 命令生成正确 | 临时项目实测：生成 diagrams.md，frontmatter（change/title/created_at）正确，4 章节齐全 | ✅ pass |
| 3. 顺序约束 | `new diagrams --change CR-999` 报"Change 不存在: CR-999" | ✅ pass |
| 4. 幂等 | 二次运行报 `EEXIST` 不覆盖 | ✅ pass |
| 5. validate 不强制 | lifecycle 示例（完整三件套、无 diagrams）validate 0 错误 | ✅ pass |
| 6. 模板变量无残留 | 生成的 diagrams.md 无 `{{}}` | ✅ pass |
| 7. change 技能含 diagrams 步骤 | Step 5 数据关系文档（可选）+ `new diagrams` 命令 | ✅ pass |
| 8. 相关技能提及 | plan / execute-plan / verify-plan 各提及 diagrams | ✅ pass |
| 9. 测试覆盖 | `node --test tests/*.test.cjs` 22 个全绿 | ✅ pass |
| 10. 插件校验 + README/CHANGELOG | validate-plugin 0 错误（模板数 9）；README/CHANGELOG 提及 diagrams | ✅ pass |

回归：minimal + lifecycle 示例 validate 均 0 错误；改动无越界。结论：全部 10 条验收标准 pass，spec verified，change completed。

## 非目标

- 不强制校验（validate 不改）
- diagrams 不加入状态机 / REQUIRED_SECTIONS / CONTENT_GATES
- 不修改 documentKind 识别 diagrams（保持无 kind 附件）
- 不做 ER 图渲染 / 数据模型自动生成
- 不改 blueprint
- 不引入个人验证/变更记录