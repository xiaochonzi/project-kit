---
name: change
description: Use when receiving any new requirement, scope change, or enhancement — route it to Quick direct implementation or a Full change with proposal/spec/plan scaffolding. If it is a defect against an approved Spec, use bug instead.
---

# Change

## Overview

新需求的唯一入口。先识别用户意图，再以影响范围校正 Quick/Full 判定。Quick 零文档直接实施；Full 一次创建 `docs/changes/CR-###-<slug>/{proposal,spec,plan}.md`，本技能只完善 Proposal，不编写 Spec 或 Plan 正文。Full 三件套共同保存完整上下文，不把必要决定留在原始对话中。

**开始前宣布：**“我正在使用 change 技能处理变更请求。”

## 用户意图优先

先判断用户是在要求“直接完成局部修改”，还是要求“创建、设计、梳理一项需求”。“使用 change”只是入口指令，本身不等于 Quick。

- 用户明确要求创建或设计需求、Proposal、Spec、Plan 或完整生命周期 → Full。
- 用户明确要求直接修改文件 → 仍须满足 Quick 的全部条件；文件类型（包括 `.sql`）不能单独决定路径。
- 意图不明确或 Quick/Full 信号冲突 → 先说明影响范围和冲突点，只问一个决定路径的问题。

## The Iron Law

```
FULL PATH ONLY: PROPOSAL → SPEC → PLAN → EXECUTE → VERIFY
```

铁律只适用于已分流为 Full 的需求。Quick 不创建 proposal/spec/plan，用户也可以明确要求直接处理一个满足 Quick 条件的局部修改。

## 路径判定

| 路径 | 判据 | 文档 |
|---|---|---|
| **Quick** | 以下条件全部满足：只有一个明确用户结果；单一局部模块；不改变契约/API/数据模型/权限；一次小范围实现可完成；只有一组验收流程；用户未要求创建或设计需求文档 | 零文档 |
| **Full** | 以下信号任一命中：用户要求创建/设计需求；多个模块或独立结果；架构/API/数据模型/权限变化；需要多轮实现；多组独立验收；范围或风险不清 | proposal + spec + plan |

拿不准时询问用户，不自动降级为 Quick，也不擅自创建 Full change。

## Quick 流程

1. 澄清改什么、为什么、影响哪些文件、如何验证。
2. 用户同轮确认后直接实现并运行相关测试。
3. 记录 git commit，并在 `.project-kit/state.md` 写一行最近完成。

禁止为 Quick 创建任何 `docs/changes/` 文档。

## Full 流程

### Step 1：原子创建三件套

```bash
node scripts/project-docs.cjs new change --title <变更标题> --root <项目根>
```

命令必须一次创建：

- `proposal.md`：`status: proposed`
- `spec.md`：`status: draft`，由 `spec` 技能填写
- `plan.md`：`status: draft`，由 `plan` 技能填写

不得手动再次创建 Spec 或 Plan。

### Step 2：只完善 Proposal

按 `proposal.md` 模板填写以下章节（各章节的细节度与红线见模板注释）：

- 背景与问题：需求来源、当前状态、真实证据和用户影响
- 期望结果：为什么值得进入 Full，以可观察结果表述
- 包含 / 不包含：立项范围，以及排除相邻能力的原因
- 影响范围：业务、模块、契约文档、API、数据、权限、配置、测试和风险
- 决定 / 已确认选择：所有影响后续设计的结论、约束和技术原则
- 决定 / 未采用方向与原因：已讨论但不采用的方向及理由；没有时明确写“无”
- 未决问题：会影响是否立项或范围的问题；accepted 前必须精确写为“无”

引用代码、规则或现有文档时，同时摘要其职责、相关事实和本 Change 使用它的原因，不能只留下路径或“按之前讨论”等外部引用。

Proposal 不写业务规则、验收标准、文件路径、实现方案或任务——这些分别属于 `spec` 与 `plan`。

### Step 3：影响分析与用户决定

- 若改变系统能力边界或跨模块约束，报告需要同步 `docs/blueprint.md`。
- 若一个 change 包含多个可独立交付的系统，先建议拆分。
- 把 Proposal 和影响分析展示给用户，等待明确的 Accepted、Deferred 或 Rejected。

```bash
node scripts/project-docs.cjs transition CR-### --to accepted --root <项目根>
```

Deferred/Rejected 时记录原因并执行对应迁移，不继续设计 Spec。

### Step 4：交接 Spec

Proposal accepted 后停止本技能：

> `CR-###` Proposal 已接受，三件套已就位。下一步使用 `spec` 技能完成 `docs/changes/CR-###-<slug>/spec.md` 的业务设计。

不得在本技能中填写 Spec 或 Plan。

## 校验清单

- [ ] Quick 必须满足全部条件；Full 只需命中一个信号
- [ ] 路由判定有依据（意图 + 影响范围），无擅自降级或擅自 Full
- [ ] Full 目录同时存在 proposal/spec/plan
- [ ] Proposal 只有立项问题、目标、范围和影响，无业务规则/类名/文件路径/实现
- [ ] 已确认选择、未采用方向与原因均已写入，未决问题为“无”
- [ ] 理解立项所需的事实和决定不依赖原始对话
- [ ] 用户已明确决定 Proposal 状态
- [ ] Accepted 后交接 `spec`，没有越权继续写 Spec

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `new change` 分配 ID 并创建三件套 | 判断 Quick/Full、填写 Proposal、影响分析 |
| `transition` 执行状态迁移 | 请求并记录用户决定 |
| `validate` 校验 Full 结构 | 不替用户决定范围，不编写 Spec/Plan |

## 停止条件

- 用户意图或影响范围不足以判定路径 → 询问用户。
- Proposal 有影响立项的未决问题 → 暂停，不 accepted。
- 用户选择 Deferred/Rejected → 记录后停止。
- 需求实际是已批准 Spec 的缺陷 → 转 `bug`。

## Handoff Rule

Full Proposal accepted → `spec`。Quick → 直接实现、验证并记录本地 state。

## Common Rationalizations

| 借口 | 现实 |
|---|---|
| “三件套建好了，顺便把 Spec 写了” | 文件存在不等于职责转移；业务设计属于 `spec` |
| “用户说直接改，所以一定 Quick” | 用户意图优先，但不能覆盖真实影响范围 |
| “小改也留个 Proposal 更稳” | Quick 零文档是明确设计 |
| “先写一半 Spec，后续再补” | 半设计会被误当契约，必须完整交给 `spec` |
