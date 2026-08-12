# 两档路径重构（Quick / Full）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 project-kit 从"6 类文档全链路"重构为"Quick 零文档 / Full 三件套（proposal+spec+plan）"两档路径，削减 token 消耗并消除文档职责重叠。

**Architecture:** 脚本 `scripts/project-docs.cjs` 是唯一机械事实源（文档模型常量表、new/transition/validate 命令）；技能只写流程纪律。重构顺序：先改脚本模型与命令（测试驱动），再改模板与技能，最后改文档与示例，全量校验收尾。

**Tech Stack:** Node.js ≥18（`node:test`、纯 CJS、零依赖）。

## Global Constraints

- **两档路径**：Quick 零文档（记录 = git commit + STATE 一行）；Full 三件套 `changes/CR-###-<slug>/{proposal.md, spec.md, plan.md}`。
- **判据**：Quick = 不触碰既有契约文档（blueprint/spec）、API、数据模型、权限；改动小、边界清晰。Full = 多模块/架构/数据模型变化/多迭代/跨边界/高风险。拿不准 → 问用户。
- **删除**：`requirements.md`、`milestones/`、`specs/`、`plans/`、`executions/`、`verifications/`、`fixes/` 及其模板、`refine` 技能。
- **全局文档**（完整初始化）：`constitution.md` + `blueprint.md` + `roadmap.md` + `STATE.md` 四根文档 + `briefs/`、`changes/`、`research/` 三目录；`briefs/BRIEF-###.md` 由 brief 技能产出。
- **保留**：`constitution` / `brief` / `blueprint` 技能不变；`decisions/`（ADR）、`capabilities/` 目录保留但 init 不再创建（保守，不在本次删除清单内）。
- **校验**：`validate` 只校验 Full 变更三件套完整性（章节、状态、引用、spec hash）；Quick 零文档不校验。删除 `coverage` 命令。
- **状态机收敛**：change 目录整体 `proposed → accepted → completed | deferred | rejected`；proposal `draft → approved`；spec `draft → approved → verified`；plan `draft → approved → completed`。
- **ID**：`CR-###`（目录级）；spec/plan 无独立 ID，文件名固定 `proposal.md` / `spec.md` / `plan.md`。
- **验收纪律保留**：spec approved 后记录内容 hash，verify 时核对，防静默修改契约；plan 任务 checkbox 勾选，completed 前无 `- [ ]` 残留。

---

## Task 1: 脚本文档模型常量重构

**Files:**
- Modify: `scripts/project-docs.cjs:10-168`（常量区）

**Interfaces:**
- Produces: 新的 `PLUGIN_SKILLS`（11 项，去掉 refine）、`MANAGED_DIRECTORIES`（`['briefs','changes','research','decisions','capabilities']`）、`INITIAL_FILES`（constitution/blueprint/roadmap/STATE 四根，模板名对应）、`DOCUMENT_TYPES`（仅 brief + change 目录型 + 目录内子类型）、`ALLOWED_STATUSES` / `TRANSITIONS`（收敛后的状态机）、`REQUIRED_SECTIONS` / `CONTENT_GATES`（proposal/spec/plan 三件套）、`ID_PATTERN`（`CR-\d{3}`）、删除 `REQ_PATTERN` 与 `REFERENCE_FIELDS` 中的 `requirements`/`milestone`/`capability`/`feature`。

**Key changes:**

```js
const PLUGIN_SKILLS = ['init','constitution','brief','blueprint','roadmap','plan','execute-plan','verify-plan','change','bug','status'];
const MANAGED_DIRECTORIES = ['briefs','changes','research','decisions','capabilities'];
const INITIAL_FILES = {
  'constitution.md': 'constitution.md',
  'blueprint.md': 'blueprint.md',
  'roadmap.md': 'roadmap.md',
  'STATE.md': 'state.md'
};
const DOCUMENT_TYPES = {
  brief: { directory: 'briefs', prefix: 'BRIEF', template: 'brief.md' },
  change: { directory: 'changes', prefix: 'CR', template: 'proposal.md' },
  proposal: { directory: null, template: 'proposal.md' },
  spec: { directory: null, template: 'spec.md' },
  plan: { directory: null, template: 'plan.md' },
  adr: { directory: 'decisions', prefix: 'ADR', template: 'adr.md' }
};
const ALLOWED_STATUSES = {
  brief: new Set(['captured']),
  change: new Set(['proposed', 'accepted', 'completed', 'deferred', 'rejected']),
  proposal: new Set(['draft', 'approved']),
  spec: new Set(['draft', 'approved', 'verified']),
  plan: new Set(['draft', 'approved', 'completed', 'blocked']),
  adr: new Set(['proposed', 'accepted', 'superseded', 'rejected'])
};
// TRANSITIONS: change proposed→[accepted,deferred,rejected], accepted→[completed,deferred],
//   deferred→[accepted,rejected]; proposal draft→[approved]; spec draft→[approved], approved→[verified];
//   plan draft→[approved,blocked], approved→[completed,blocked], blocked→[draft,approved]
const REQUIRED_SECTIONS = {
  proposal: ['背景与问题', '期望结果', '包含', '不包含', '影响范围'],
  spec: ['问题与依据', '目标', '用户流程', '范围', '输入与输出', '业务规则', '失败与边界情况', '验收标准'],
  plan: ['实现策略', 'Tasks', '验收标准映射', '最终验证'],
  change: ['背景与问题', '期望结果', '决定'],
  brief: ['背景', '想解决的问题', '目标用户与场景'],
  adr: ['背景与约束', '决策', '理由', '影响', '验证方式']
};
const CONTENT_GATES = {
  spec: { statuses: ['approved', 'verified'], sections: ['问题与依据', '目标', '范围', '验收标准'] },
  plan: { statuses: ['approved', 'completed'], sections: ['实现策略', 'Tasks', '验收标准映射', '最终验证'] },
  change: { statuses: ['accepted', 'completed'], sections: ['背景与问题', '期望结果', '决定'] },
  adr: { statuses: ['accepted'], sections: ['背景与约束', '决策', '理由', '影响', '验证方式'] }
};
const ID_PATTERN = /^(?:BRIEF-\d{3}|CR-\d{3}|ADR-\d{3})$/;
// 删除: REQ_PATTERN、REQUIRED_SECTIONS 中 capability/milestone/feature/execution/verification/fix、capability.md 相关
```

- 删除 `REFERENCE_FIELDS` 中的 `requirements`、`milestone`、`capability`、`feature`，保留 `source`、`depends_on`、`extends`、`supersedes`、`superseded_by`、`affects`。
- `TEMPLATE_EXPECTED_COUNT` 改为 **9**（Task 6 删除旧模板后保留：constitution/brief/blueprint/roadmap/state/adr/proposal/spec/plan）。

- [ ] **Step 1: 修改常量区**
  按上述 Key changes 修改 `scripts/project-docs.cjs` 第 10-168 行。
- [ ] **Step 2: 语法检查**

Run: `node --check scripts/project-docs.cjs`
Expected: 无输出（语法通过）
- [ ] **Step 3: 提交**

```bash
git add scripts/project-docs.cjs
git commit -m "refactor: 脚本文档模型收敛为两档路径（Quick/Full）"
```

---

## Task 2: `new change` 创建三件套骨架

**Files:**
- Modify: `scripts/project-docs.cjs`（`createDocument` 约 401-465 行、`nextSequentialId`、`main` 的 new 分支）

**Interfaces:**
- Consumes: Task 1 的 `DOCUMENT_TYPES`、模板文件
- Produces: 命令 `new change --title <X> --root <项目>` 创建 `changes/CR-###-<slug>/` 目录 + `proposal.md` 骨架；`new proposal|spec|plan --change CR-### --root <项目>` 创建/补全目录内文件（frontmatter 带 `change: CR-###`）

**Key changes:**

- `createDocument` 对 `type === 'change'`：目录路径 = `docs/changes/CR-###-<slug>/`，文件名 `proposal.md`；frontmatter：`id: CR-###`、`title`、`status: proposed`、`created_at`。
- `new proposal|spec|plan`：`--change CR-###` 解析目录 → 写入 `spec.md` / `plan.md`，frontmatter `change: CR-###`、`status: draft`、`created_at`；重复创建报错"文件已存在"。
- `new brief` 保持原样；`new capability|milestone|context|feature|execution|verification|fix` 分支删除。
- `documentKind`（约 285 行）识别：`changes/CR-###/proposal.md` → kind `proposal`；同目录 `spec.md`/`plan.md` 同理；`changes/CR-###.md`（旧平铺）→ 报错提示新结构。

- [ ] **Step 1: 改造 createDocument 与 new 分支**
- [ ] **Step 2: 语法检查**

Run: `node --check scripts/project-docs.cjs`
Expected: 无输出
- [ ] **Step 3: 手工验证三件套创建**

```bash
rm -rf /tmp/pk-test && node scripts/project-docs.cjs init --root /tmp/pk-test
node scripts/project-docs.cjs new change --title "支持标签筛选" --root /tmp/pk-test
find /tmp/pk-test/docs/changes -type f
node scripts/project-docs.cjs new spec --change CR-001 --root /tmp/pk-test
node scripts/project-docs.cjs new plan --change CR-001 --root /tmp/pk-test
find /tmp/pk-test/docs/changes/CR-001-* -type f
```
Expected: init 建 4 根文档 + 目录；change 建目录 + proposal.md；spec/plan 各建 1 文件，共 3 个文件
- [ ] **Step 4: 提交**

```bash
git add scripts/project-docs.cjs
git commit -m "feat: new change 创建三件套目录骨架"
```

---

## Task 3: validate 重构（Full 三件套校验）

**Files:**
- Modify: `scripts/project-docs.cjs`（`validateProject` 541-663 行、`collectDocuments` 298 行、`detectDependencyCycles`、`validatePlanTasks` 511 行、`parseRequirements` 删除调用）

**Interfaces:**
- Consumes: Task 1 常量表、Task 2 目录结构
- Produces: `validate` 输出 `documentCount`（含子文档）、`changeCount`，无 `requirementCount` / `acceptedRequirementCoverage`

**Key changes:**

- `validateProject` 删除 `parseRequirements` 调用与 REQ 覆盖循环（643 行）。
- 校验逻辑改为：
  1. 根文档存在性：按 `INITIAL_FILES`（4 份）。
  2. 每个 `changes/CR-###/` 目录：若存在（Full 变更）→ proposal.md/spec.md/plan.md 三件套必须齐全；缺少任一 → error `Full 变更缺少 <文件>: <目录>`。若目录内只有部分文件（proposal 存在但 spec/plan 不存在）→ error（Full 未完成，禁止部分落盘）。
  3. 子文档校验（复用现有循环）：`proposal/spec/plan` 的 frontmatter 必须有 `status`；spec/plan 必须有 `change: CR-###` 且目录 ID 与 frontmatter 一致。
  4. 章节校验：`REQUIRED_SECTIONS[document.kind]`；`CONTENT_GATES` 空章节检查。
  5. spec hash：spec `status: verified` 时核对 `spec_hash` frontmatter 与 `contentHash(document.content)`（复用 623 行逻辑）；spec approved 时脚本 `transition` 记录 hash（见 Task 4）。
  6. plan 任务勾选：`validatePlanTasks` 改为校验 plan 内 `- [ ]` 残留 —— `status: completed` 的 plan 若含 `- [ ]` → error；`- [x]` 数 ≥1 → 要求含 `## 验证记录` 章节（若 plan 模板有该章节，见 Task 7）。
  7. 依赖环：`detectDependencyCycles` 只对 `depends_on` 字段生效（`REFERENCE_FIELDS` 收敛后自动）。
  8. 模板变量残留、文件名与 ID 一致性：保持，但 ID 校验只对 brief/change/adr 主文档执行；proposal/spec/plan 跳过文件名-ID 检查（文件名固定）。
- `documentKind` 增加：`changes/CR-###/proposal.md` → `proposal`，`spec.md` → `spec`，`plan.md` → `plan`；`changes/CR-###/` 目录本身不作为文档计数。
- `collectDocuments` 需遍历 `changes/` 下子目录中的 md 文件（现有递归应已覆盖，验证即可）。
- 删除 `calculateCoverage` 调用与 `coverage` 命令（main 分支 1003-1043 行）。

- [ ] **Step 1: 改造 validateProject**
- [ ] **Step 2: 删除 coverage 命令**
- [ ] **Step 3: 语法检查**

Run: `node --check scripts/project-docs.cjs`
Expected: 无输出
- [ ] **Step 4: 行为验证**

```bash
node scripts/project-docs.cjs validate --root /tmp/pk-test --json
```
Expected: `valid: false`（三件套缺失 spec/plan 报错）。随后补全后：

```bash
node scripts/project-docs.cjs validate --root /tmp/pk-test --json
```
Expected: `valid: true`，无 `requirementCount` 字段
- [ ] **Step 5: 提交**

```bash
git add scripts/project-docs.cjs
git commit -m "feat: validate 校验 Full 三件套，删除 REQ 覆盖与 coverage"
```

---

## Task 4: transition 收敛

**Files:**
- Modify: `scripts/project-docs.cjs`（`transitionDocument` 710-784 行、`findTarget` 698 行）

**Interfaces:**
- Consumes: Task 1 的 `ALLOWED_STATUSES` / `TRANSITIONS` / `DOCUMENT_TYPES`
- Produces: `transition CR-### --to accepted --root <项目>`（目录级）；`transition CR-### --to approved --kind spec|proposal|plan --root <项目>`

**Key changes:**

- `findTarget`：target 为 `CR-\d{3}` 时定位 `changes/CR-###-<slug>/` 目录；`--kind spec|proposal|plan` 时定位目录内文件。
- 目录级 transition 校验：`accepted` 前 proposal 必须 `approved`（proposal 未批准 → error）；`completed` 前 plan 必须 `completed` 且 spec 必须 `verified`。
- spec 状态推进 `approved` 时：写入 `spec_hash: <contentHash(内容)>`（复用 480 行函数）到 frontmatter；spec 从 approved 改为 draft 时清除 spec_hash。
- plan `completed` 前：`validatePlanTasks` 残留检查通过（复用 Task 3 的检查函数）。
- 删除 milestone/feature/execution/verification 相关的 transition 分支逻辑（TRANSITIONS 表收敛后自然失效）。

- [ ] **Step 1: 改造 findTarget 与 transitionDocument**
- [ ] **Step 2: 行为验证**

```bash
node scripts/project-docs.cjs transition CR-001 --to accepted --root /tmp/pk-test; echo "exit=$?"
node scripts/project-docs.cjs transition CR-001 --to approved --kind proposal --root /tmp/pk-test
node scripts/project-docs.cjs transition CR-001 --to accepted --root /tmp/pk-test
grep spec_hash /tmp/pk-test/docs/changes/CR-001-*/spec.md
```
Expected: 第一次 accepted 报错（proposal 未 approved）；proposal approved 后 accepted 成功；spec 尚无 spec_hash（approve spec 时才有）
- [ ] **Step 3: 提交**

```bash
git add scripts/project-docs.cjs
git commit -m "feat: transition 收敛为 CR 目录状态机 + spec_hash 冻结"
```

---

## Task 5: status / next / context 调整

**Files:**
- Modify: `scripts/project-docs.cjs`（`projectStatus` 818 行、`nextAction` 965 行、`contextForMode` 784 行）

**Interfaces:**
- Consumes: Task 3/4 的结构与状态机
- Produces: `status` 输出当前 change 焦点（读 STATE frontmatter 的 `active_change`）；`next` 提示下一步动作；`context plan|execute-plan|verify-plan --target CR-###` 输出三件套内容

**Key changes:**

- `projectStatus`：改为读 `STATE.md` frontmatter（`active_change`、`updated_at`）与 roadmap 的 Active 分组；不再统计 REQ/Feature。
- `nextAction`：输出 `STATE.md` 的 `next_action` 字段，无则提示 `change`（新需求入口）。
- `contextForMode`：mode `plan` / `execute-plan` / `verify-plan` + `--target CR-###` → 输出该 change 目录三件套的相对路径与 frontmatter 摘要；mode 不支持时提示仅支持 change 目录。
- `state.md` 模板 frontmatter 增加 `active_change: null`、`next_action: null`（Task 7 同步）。

- [ ] **Step 1: 改造 projectStatus / nextAction / contextForMode**
- [ ] **Step 2: 行为验证**

Run: `node scripts/project-docs.cjs status --root /tmp/pk-test`
Expected: 输出含 STATE 焦点与 Active 分组，无 REQ 统计
- [ ] **Step 3: 提交**

```bash
git add scripts/project-docs.cjs
git commit -m "feat: status/next/context 收敛到 STATE 焦点与 change 目录"
```

---

## Task 6: 模板更新

**Files:**
- Create: `assets/templates/proposal.md`、`assets/templates/spec.md`、`assets/templates/plan.md`
- Modify: `assets/templates/state.md`（加 `active_change` / `next_action`）
- Delete: `assets/templates/capability.md`、`context.md`、`milestone.md`、`feature-spec.md`、`implementation-plan.md`、`execution-summary.md`、`verification.md`、`change-request.md`、`bug-resolution.md`（共 9 份）
- Keep: `constitution.md`、`brief.md`、`blueprint.md`、`roadmap.md`、`state.md`、`adr.md`、`requirements.md`（⚠️ 见下）

**Key changes:**

> ⚠️ `requirements.md` 与 `capability.md` 模板：requirements.md 因 `INITIAL_FILES` 不再引用，一并删除；capability.md 随 capabilities 目录不再创建而删除。删除后保留 9 份模板：constitution、brief、blueprint、roadmap、state、adr、proposal、spec、plan。`TEMPLATE_EXPECTED_COUNT = 9`（Task 1 中同步）。

- `proposal.md`：

```markdown
---
id: {{ID}}
title: {{TITLE}}
status: proposed
created_at: {{DATE}}
---

# {{TITLE}}

## 背景与问题

## 期望结果

## 包含

## 不包含

## 影响范围

## 未决问题
```

- `spec.md`：

```markdown
---
change: {{CHANGE}}
status: draft
created_at: {{DATE}}
spec_hash: null
---

# {{TITLE}}

## 问题与依据

## 目标

## 用户流程

## 范围

### 包含

### 不包含

## 输入与输出

## 业务规则

## 失败与边界情况

## 验收标准

## 未决问题
```

- `plan.md`：

```markdown
---
change: {{CHANGE}}
status: draft
created_at: {{DATE}}
---

# {{TITLE}} 实现计划

## 实现策略

## Tasks

### Task 1: <任务名>

- files: <精确文件路径>
- read_first: <执行前必须读取的文件/符号>
- action: <具体修改，含代码片段>
- verify: <该任务后立即运行的命令>
- acceptance: <可观察的通过条件>
- done: <何时可勾选完成>

- [ ] Task 1

## 验收标准映射
| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |

## 最终验证

## 非目标
```

- `state.md` frontmatter 改为：

```yaml
---
updated_at: {{DATE}}
active_change: null
mode: init
next_action: null
---
```

- [ ] **Step 1: 创建 proposal/spec/plan 模板、改 state 模板**
- [ ] **Step 2: 删除 10 份旧模板**（capability/context/milestone/feature-spec/implementation-plan/execution-summary/verification/change-request/bug-resolution/requirements）
- [ ] **Step 3: 同步 `TEMPLATE_EXPECTED_COUNT`**（改后统计 `ls assets/templates/*.md | wc -l` 的实际值写入常量）
- [ ] **Step 4: 验证**

Run: `node scripts/project-docs.cjs validate-plugin --root . --json | head -20`
Expected: `templateCount` 与常量一致；模板目录文件数与常量一致
- [ ] **Step 5: 提交**

```bash
git add assets/templates scripts/project-docs.cjs
git commit -m "refactor: 模板收敛为两档路径三件套"
```

---

## Task 7: 技能重写（核心）

**Files:**
- Rewrite: `skills/change/SKILL.md`、`skills/plan/SKILL.md`、`skills/execute-plan/SKILL.md`、`skills/verify-plan/SKILL.md`、`skills/roadmap/SKILL.md`、`skills/bug/SKILL.md`、`skills/init/SKILL.md`、`skills/status/SKILL.md`
- Delete: `skills/refine/`（目录）
- Keep: `skills/constitution/SKILL.md`、`skills/brief/SKILL.md`、`skills/blueprint/SKILL.md`（不变）

**Key changes（每个 skill 的关键内容，全部使用现有脚本命令）：**

### change（入口技能）

- description: 新需求入口，Quick/Full 分流。
- Iron Law: `NO DOCUMENTS FOR QUICK — FULL NEEDS THE THREE ARTIFACTS`。
- 判定表（Quick/Full 判据照抄设计文档第 3 节）。
- Quick 流程（全部对话内）：
  1. 澄清：改什么/为什么/影响哪些文件/怎么验证
  2. 用户同轮确认
  3. 直接实现 + 测试 + commit
  4. `STATE.md` 记一行（`active_change: quick-<slug>` 或最近完成行）
- Full 流程：
  1. `node scripts/project-docs.cjs new change --title <X> --root <项目>`
  2. 填 proposal.md（背景与问题/期望结果/包含/不包含/影响范围/未决问题）→ `transition CR-### --to approved --kind proposal`
  3. 用户确认范围 → `transition CR-### --to accepted`
  4. 创建 spec：`new spec --change CR-###` → 填契约（含验收标准）→ 用户确认 → `transition CR-### --to approved --kind spec`
  5. Handoff → plan。
- 场景路由表保留 Bug → bug 技能；补充澄清 → 更新未 approved 的 spec。

### plan

- description: Full 变更的 spec approved 后写实现计划。
- Iron Law: `NO PLAN WITHOUT AN APPROVED SPEC`。
- Process: `context plan --target CR-###` → 探索代码 → 写 `plan.md`（实现策略/Tasks/验收标准映射/最终验证/非目标，任务粒度 2-5 分钟，No Placeholders 清单保留）→ `transition CR-### --to approved --kind plan` → Handoff execute-plan。
- 校验：`validate` 无 error；每条 spec 验收标准映射到任务。

### execute-plan

- description: Full 变更 plan approved 后执行。
- Iron Law: `NO IMPLEMENTATION WITHOUT AN APPROVED AND VALID PLAN`。
- Process: 确认 plan approved → `transition CR-### --to in-progress`？——简化：plan 勾选即执行记录，无独立 execution 文档；每任务 TDD（RED→GREEN→CHECK，纪律保留）；完成后在 plan.md 勾选 `- [x]` 并记录验证命令输出到 `## 最终验证` 区 → plan completed 前跑 `validate` 确认无 `- [ ]` 残留 → `transition CR-### --to completed --kind plan` → 更新 STATE（`active_change` 清空、最近完成行）。

### verify-plan

- description: Full 变更 implemented 后独立验收。
- Iron Law: `NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE`。
- Process: 逐条重跑 spec.md 验收标准 → 结果写回 plan.md `## 最终验证`（命令+输出+pass/fail）→ 全 pass → `transition CR-### --to verified --kind spec`（脚本核对 spec_hash 未变）→ `transition CR-### --to completed` → 更新 STATE 与 roadmap 状态。
- 禁止清单保留（引用旧输出/改验收标准过关等）。

### roadmap

- description: 拆分交付顺序（多迭代项目）。
- 删除 milestone 文档相关：不再 `new milestone`；Roadmap 每阶段一行摘要 + 状态 + 链接（指向 change 目录或需求描述）。分区保留（排序原则/Active/Next/Later/Completed/Deferred/依赖与风险/修订记录）。Active 分组同步 Full change 的 accepted 状态；Large 多迭代能力在 roadmap 列出阶段，每阶段一个或多个 change 承接。

### bug

- description: 违反已批准 spec 的缺陷。
- 默认 Quick：对话确认现象/预期 → 最小修复 + 回归验证 → commit + STATE 一行。根因复杂/需架构决定 → 转 change 走 Full。

### init

- 目录契约更新为：4 根文档（constitution/blueprint/roadmap/STATE）+ 3 目录（briefs/changes/research）+ decisions/capabilities 不再创建（保留目录契约文本中但不预建）。核对清单与 Handoff 报告同步（"根文档(4)"，不再提 requirements）。

### status

- 读 STATE frontmatter（active_change/next_action）+ roadmap Active 分组，输出当前焦点与下一动作。

- [ ] **Step 1: 重写 change / plan / execute-plan / verify-plan 四个 skill**
- [ ] **Step 2: 重写 roadmap / bug / init / status，删除 refine 目录**

```bash
rm -rf skills/refine
```
- [ ] **Step 3: 校验 skill 清单与描述**

Run: `node scripts/project-docs.cjs validate-plugin --root . --json | head -30`
Expected: `skillCount: 11`，无 refine
- [ ] **Step 4: 提交**

```bash
git add skills/
git commit -m "refactor: 技能收敛为两档路径（删 refine，change 为入口）"
```

---

## Task 8: commands 更新

**Files:**
- Modify: `commands/project-kit/new.md`、`commands/project-kit/plan.md`、`commands/project-kit/init.md`、`commands/project-kit/brief.md`、`commands/project-kit/status.md`、`commands/project-kit/validate.md`

**Key changes:**

- `new.md`：命令列表改为 `new change --title`（Full 入口）。
- `plan.md`：`/project-kit/plan CR-###`。
- `init.md`：产出描述改为 4 根文档 + 目录。
- `status.md` / `validate.md`：描述改为 STATE 焦点 / Full 三件套校验。
- `brief.md`：不变（或仅校对链接）。

- [ ] **Step 1: 逐个更新 commands 文件**
- [ ] **Step 2: 提交**

```bash
git add commands/
git commit -m "docs: commands 同步两档路径"
```

---

## Task 9: 示例重构

**Files:**
- Modify: `examples/minimal-project/docs/*`、`examples/lifecycle-project/docs/*`、`examples/lifecycle-sim/docs/*`

**Key changes:**

- `examples/minimal-project`：重建为最小初始化（4 根文档骨架），保留为 validate 基线。
- `examples/lifecycle-project` 与 `examples/lifecycle-sim`：删除旧结构（milestones/specs/plans/executions/verifications/changes 平铺文件），重建一个 **Full 示例**（一个 change 目录三件套，展示完整流程）与 **Quick 示例**（无文档，仅 STATE 一行演示——STATE 内说明文字即可）。
- 所有示例必须通过 `validate`（Quick 示例无变更文档也通过）。

- [ ] **Step 1: 重建 minimal-project（4 根文档）**
- [ ] **Step 2: 重建 lifecycle-project 为 Full 三件套示例**
- [ ] **Step 3: 重建 lifecycle-sim 或删除（保留 minimal + lifecycle-project 两个基线即可）**
- [ ] **Step 4: 验证**

```bash
node scripts/project-docs.cjs validate --root examples/minimal-project --json | grep -E 'valid|errors'
node scripts/project-docs.cjs validate --root examples/lifecycle-project --json | grep -E 'valid|errors'
```
Expected: 两个示例均 `valid: true`
- [ ] **Step 5: 提交**

```bash
git add examples/
git commit -m "refactor: 示例收敛为 minimal + Full 三件套基线"
```

---

## Task 10: 文档重写（README / project-lifecycle / AGENTS / CHANGELOG / hooks）

**Files:**
- Modify: `README.md`、`project-lifecycle.md`、`AGENTS.md`、`CHANGELOG.md`、`hooks/session-start`

**Key changes:**

- `README.md`：技能表改 11 项（删 refine）；`docs/` 目录约定改两档路径结构；生命周期示例表改为 Quick/Full 两路径；"常用命令"删 `coverage`；"不支持的能力"保留。
- `project-lifecycle.md`：整篇重构为两档路径——第 3 节文档层级改为 proposal/spec/plan；删除 Requirements/Milestone/Feature Spec/Execution/Verification 章节，替换为两档判据、Quick 流程、Full 三件套契约；状态模型节收敛；目录结构节更新；检查清单节更新。
- `AGENTS.md`：同步目录约定与技能清单。
- `CHANGELOG.md`：追加 `0.4.0` 条目（两档路径重构）。
- `hooks/session-start`：技能清单与 docs 约定文本同步。

- [ ] **Step 1: 重写 README.md**
- [ ] **Step 2: 重写 project-lifecycle.md**
- [ ] **Step 3: 更新 AGENTS.md / CHANGELOG.md / hooks/session-start**
- [ ] **Step 4: 提交**

```bash
git add README.md project-lifecycle.md AGENTS.md CHANGELOG.md hooks/
git commit -m "docs: 生命周期文档与 README 收敛为两档路径"
```

---

## Task 11: 全量校验收尾

**Files:**
- Modify: `tests/project-docs.test.cjs`

**Key changes（测试更新与新增）：**

- 更新 `validate-plugin passes for current plugin`：`skillCount` 11、`templateCount` 9（以 Task 6 实际值为准）。
- 新增测试：`new change` 三件套流程 + `validate` 通过；缺少 spec/plan 时 `validate` 失败；Quick 项目（仅 4 根文档 + STATE，无 changes）`validate` 通过。

```js
test('new change creates three artifacts and validates', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-'));
  run(['init', '--root', tmp]);
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
  fs.rmSync(tmp, { recursive: true, force: true });
});
```

- [ ] **Step 1: 更新现有测试断言并新增测试**
- [ ] **Step 2: 全量跑测试与校验**

```bash
node --test tests/project-docs.test.cjs
node scripts/project-docs.cjs validate-plugin --root . --json | grep -E 'valid|skillCount|templateCount'
node scripts/project-docs.cjs validate --root examples/minimal-project --json | grep '"valid"'
node scripts/project-docs.cjs validate --root examples/lifecycle-project --json | grep '"valid"'
```
Expected: 全部通过（`tests: 4+ pass`，plugin `valid: true`）
- [ ] **Step 3: 最终提交**

```bash
git add tests/
git commit -m "test: 两档路径测试与全量校验"
```

---

## Task 12: 验收自检（对照设计文档）

**Files:** 无（验证）

- [ ] **Step 1: 对照设计文档逐条核对**

对照 `docs/superpowers/specs/2026-08-12-two-tier-path-design.md`：
- [ ] Quick 零文档：validate 通过（examples/minimal-project）
- [ ] Full 三件套：changes/CR-###/<slug>/{proposal,spec,plan}.md
- [ ] 删除清单：`grep -r "requirements.md\|milestones/\|executions/\|verifications/\|fixes/" README.md project-lifecycle.md AGENTS.md hooks/ scripts/ skills/ commands/ assets/` 无残留（示例旧文件已由 Task 9 清理）
- [ ] refine 删除：`ls skills/` 无 refine
- [ ] 状态机：`grep -n "TRANSITIONS" scripts/project-docs.cjs` 收敛为 5 类
- [ ] STATE 瘦身：frontmatter 含 `active_change` / `next_action`

- [ ] **Step 2: 完成报告**

向用户报告：改动文件清单、validate/tests 全绿、token 预估（Quick 0 文档 / Full 3 文档）、示例演示。
