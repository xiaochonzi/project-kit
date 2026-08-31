---
name: change
description: Use when receiving any new requirement, scope change, or enhancement — route it to Quick direct implementation or a Full change whose Proposal must be written. If it is a defect against an approved Spec, use bug instead.
---

# Change

## Overview

新需求的唯一入口。先根据用户意图和真实影响分流 Quick / Full；Quick 零文档直接实施，Full 原子创建 `docs/changes/CR-###-<slug>/{proposal,spec,plan}.md` 的最小骨架，并在本技能中从空正文完整编写 Proposal。

Proposal 回答“为什么做、做多大、哪些决定已经冻结”。它不是需求契约，也不是实现计划。

## The Document Is the Handoff

后续 AI 没有原始对话，也不应重新猜测立项范围。理解 Proposal 所需的事实、证据摘要、范围和决定必须全部落盘；“按之前讨论”“参照原型”“去看分析结果”都不能代替正文。

**开始前宣布：**“我正在使用 change 技能处理变更请求。”

## 路径判定

| 路径 | 判据 | 文档 |
| --- | --- | --- |
| **Quick** | 以下全部满足：单一明确结果；单一局部模块；不改变契约/API/数据模型/权限；一次小范围实现；一组验收；用户未要求需求设计 | 零文档 |
| **Full** | 任一命中：用户要求创建或设计需求；多模块或多个独立结果；架构/API/数据模型/权限变化；多轮实现；多组验收；范围或风险不清 | proposal + spec + plan |

意图与影响信号冲突时，只问一个决定路径的问题。拿不准不得自动降级为 Quick，也不得擅自创建 Full。

## Quick Process

1. 澄清目标、影响文件和验证方法。
2. 获得用户同轮确认。
3. 直接实现并运行相关测试。
4. 记录 git commit，并在 `.project-kit/state.md` 写一行最近完成。

禁止为 Quick 创建 `docs/changes/` 文档。

## Full Required Inputs

- [ ] 项目根和 `docs/` 已存在；否则先使用 `init`
- [ ] 已读取 `docs/constitution.md`、`docs/blueprint.md`（如有）和相关已批准契约
- [ ] 已检查 `.project-kit/state.md` 与现有 changes，确认没有重复立项
- [ ] 当前请求不是已批准 Spec 的缺陷；缺陷使用 `bug`

## Full Process

### Step 1：探查再立项

先收集足以判断范围的事实：

- 用户当前遇到的具体问题和可观察影响
- 当前系统或流程的真实行为
- 相关契约、API、数据、权限和模块边界
- 已讨论的方案、约束和排除方向
- 会影响是否立项或范围的未决问题

不得根据标题或用户一句话直接填文档。工具、原型、代码和研究材料可以作为证据，但其结论必须写入 Proposal。

### Step 2：原子创建最小三件套

```bash
node scripts/project-docs.cjs new change --title <变更标题> --root <项目根>
```

命令只负责稳定 ID、目录、frontmatter、标题和初始状态：

- 三个文件保留 `schema_version: 2`
- `proposal.md`：`proposed`
- `spec.md`：`draft`
- `plan.md`：`draft`

三个文件不得包含指导注释、示例契约、示例 Task 或待填占位符。不得再次创建 Spec 或 Plan。

### Step 3：从空正文编写 Proposal

Proposal 必须包含以下章节，顺序可按阅读需要组织，但标题必须可被 CLI 识别。

#### 背景与问题

写清需求来源、当前行为、可复核问题和用户影响。禁止“感觉不对”“可能有问题”。

#### 证据快照

每条证据使用稳定 `EVD-##`：

```markdown
- EVD-01
  - 来源：<可定位来源>
  - 已确认事实：<完整事实摘要>
  - 对本 Change 的影响：<为何相关>
  - 复核方式：<如何重新验证>
```

来源不可代替事实摘要。即使来源暂时不可访问，读者仍能理解立项依据。

#### 期望结果

只写可观察结果，不写内部实现动作。

#### 包含 / 不包含

- 包含：本 Change 明确交付的能力边界。
- 不包含：相邻但不做的能力及原因，防止执行时范围蔓延。

#### 影响范围

覆盖适用的业务、模块、契约、API、数据、权限、配置、测试、文档和风险；只到能力或模块级，不写类名、函数和逐文件修改方案。

#### 决定

每项已确认选择使用稳定 `DEC-##`：

```markdown
### 已确认选择

- DEC-01：<唯一决定>
  - 原因：<为什么>
  - 对后续约束：<Spec/Plan 不得重新选择什么>
```

同时记录“未采用方向与原因”。没有未采用方向时明确写“无”。

#### 未决问题

accepted 前必须精确写为“无”。不能把未决事项藏在“建议”“或者”“暂时”“后续再定”等表达中。

### Step 4：Proposal 文档自检

只依据落盘 Proposal 逐项回答：

1. 为什么值得做？真实证据是什么？
2. 范围内和范围外分别是什么？
3. 哪些选择已由 `DEC-##` 冻结，后续不得重新决定？
4. 是否有事实只存在于原始对话或外部材料？
5. 是否混入属于 Spec 的业务规则、验收标准，或属于 Plan 的文件和实现？
6. 是否仍存在两种合理的立项范围解释？

任一答案不唯一或需要原始对话时，直接修正 Proposal。不要用篇幅代替明确性。

### Step 5：用户决定

向用户展示 Proposal 摘要、影响分析、全部 DEC 和排除范围，等待明确选择：Accepted / Deferred / Rejected。

Accepted：

```bash
node scripts/project-docs.cjs transition CR-### --to accepted --root <项目根>
```

Deferred / Rejected：记录原因并执行对应迁移，不继续设计 Spec。

## Quality Checklist

- [ ] Quick 必须满足全部条件；Full 只需命中一个信号
- [ ] 三件套是无指导注释、无示例、无占位符的最小骨架
- [ ] Proposal 从空正文完整编写，不沿模板机械填空
- [ ] 背景有可复核事实，证据使用 EVD-## 且结论已落盘
- [ ] 所有冻结选择使用 DEC-##，排除方向有原因
- [ ] 包含、不包含和影响范围只有一种合理解释
- [ ] 不含业务契约、验收标准、文件路径或实现任务
- [ ] 不依赖原始对话或仅可外部访问的资料
- [ ] 未决问题为“无”且用户明确决定状态

## Script / Author Responsibility

| CLI | 文档作者 |
| --- | --- |
| 分配 ID、原子创建最小骨架 | 判断 Quick / Full，探查事实 |
| 校验章节、EVD/DEC、占位符和状态 | 从空正文完整编写并自检 Proposal |
| 执行状态迁移 | 请求并记录用户决定 |

CLI 不替用户做产品决定，也不判断证据和范围是否真实。

## Stop Conditions

- 用户意图或影响不足以判定路径 → 只问一个关键问题
- Proposal 仍有影响范围的未决问题 → 不 accepted
- 一个 Change 包含多个可独立交付系统 → 建议拆分
- 需要先改变 Blueprint 边界 → 暂停并处理 Blueprint
- 实际是 approved Spec 的缺陷 → 转 `bug`
- 用户选择 Deferred / Rejected → 记录并停止

## Handoff Rule

Proposal accepted → `spec`。本技能不得继续写 Spec 或 Plan。
