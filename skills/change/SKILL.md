---
name: change
description: Use when receiving any new requirement, scope change, or enhancement — route it to Quick direct implementation or a Full change whose Proposal must be written. If it is a defect against an approved Spec, use bug instead.
---

# Change

## Overview

新需求的唯一入口。先根据意图和真实影响分流 Quick / Full：
- **Quick**：零文档直接实施。
- **Full**：原子创建 `docs/changes/CR-###-<slug>/{proposal,spec,plan}.md` 最小骨架，并从空正文完整编写 Proposal。

Proposal 回答“为什么做、做多大、哪些决定已经冻结”。它不是需求契约（归 Spec），也不是实现计划（归 Plan）。

## The Document Is the Handoff

后续 AI 没有原始对话，也不应重新猜测立项范围。理解 Proposal 所需的事实、证据摘要、范围和决定必须全部落盘；“按之前讨论”“参照原型”“去看分析结果”都不能代替正文。

**开始前宣布：**“我正在使用 change 技能处理变更请求。”

## 路径判定

| 路径 | 判据 | 文档 |
| --- | --- | --- |
| **Quick** | 以下全部满足：单一明确结果；单一局部模块；不改变契约/API/数据模型/权限；一次小范围实现；一组验收；用户未要求需求设计 | 零文档 |
| **Full** | 任一命中：用户要求创建或设计需求；多模块或多个独立结果；架构/API/数据模型/权限变化；多轮实现；多组验收；范围或风险不清 | proposal + spec + plan |

意图与影响信号冲突时，只问一个决定路径的关键问题。拿不准不得自动降级为 Quick，也不得擅自创建 Full。

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
- 用户遇到的具体问题和可观察影响
- 当前系统或流程的真实行为
- 相关契约、API、数据、权限和模块边界
- 已讨论的方案、约束和排除方向
- 会影响是否立项或范围的未决问题

不得根据标题或用户一句话直接填文档。工具、原型、代码和研究材料可以作为证据，但其结论必须写入 Proposal。

### Step 2：原子创建最小三件套

```bash
node scripts/project-docs.cjs new change --title <变更标题> --root <项目根>
```

命令只负责分配稳定 ID、创建目录、注入 frontmatter（初始状态 `proposed` / `draft` / `draft`，保留 `schema_version: 2`）。

生成的三个文件是无指导注释、无示例契约、无 Task 的最小骨架。**不得再次单独运行 new spec 或 new plan。**

### Step 3：从空正文编写 Proposal

Proposal 必须包含以下 **8 个二级标题（`##`）**。
**标题铁律**：必须精确匹配以下字符，**严禁添加数字序号**（如 `## 1. 背景与问题` 会导致门禁识别失败），**严禁合并章节**：

```markdown
## 背景与问题
写清需求来源、当前行为、可复核问题和用户影响。禁止使用“感觉不对”“可能有问题”等模糊表述。

## 证据快照
每条证据使用稳定编号 `EVD-##`（至少 1 条）：
- EVD-01
  - 来源：<可定位来源，如文件路径、接口响应或日志>
  - 已确认事实：<完整事实摘要>
  - 对本 Change 的影响：<为何相关>
  - 复核方式：<如何重新验证>

## 期望结果
只写业务层面的可观察结果，不写内部代码实现动作。

## 包含
本 Change 明确交付的能力边界。

## 不包含
相邻但不做的能力及原因，明确划定边界防止执行时范围蔓延。

## 影响范围
覆盖适用的业务、模块、契约、API、数据、权限、配置、测试和风险；只到能力或模块级，不写内部类名与逐文件修改方案。

## 决定
每项已冻结选择使用稳定编号 `DEC-##`（至少 1 条）：
### 已确认选择
- DEC-01：<唯一决定>
  - 原因：<为什么选择该方案>
  - 对后续约束：<Spec/Plan 不得推翻或重新选择什么>

### 未采用方向与原因
- <备选方向>：<未采用原因>（若无备选方向，明确写“无”）

## 未决问题
accepted 前必须精确填写为“无”。不能把未决事项隐藏在“建议”“或者”“暂时”中。
```

### Step 4：Proposal 文档自检

只依据落盘 Proposal 逐项核对：
1. 为什么值得做？真实证据是什么（`EVD-##`）？
2. 范围内（`包含`）和范围外（`不包含`）边界是否清晰唯一？
3. 哪些选择已由 `DEC-##` 冻结，后续不得重新决定？
4. 是否有事实只存在于原始对话或外部材料未落盘？
5. 是否混入属于 Spec 的业务规则、验收标准，或属于 Plan 的文件修改和实现步骤？
6. 是否仍存在未决问题或两种合理的立项范围解释？

若存在不确定项或依赖外部信息，直接修改补齐正文。

### Step 5：用户决定与状态迁移

向用户展示 Proposal 摘要、影响分析、全部 DEC 和排除范围，等待明确选择：Accepted / Deferred / Rejected。

**用户确认 Accepted 后，必须通过 CLI 门禁迁移状态**：

```bash
node scripts/project-docs.cjs transition CR-### --to accepted --root <项目根>
```

**严禁在 markdown frontmatter 中手动编辑 `status: accepted`！** 脚本会机械检查章节完整性、EVD/DEC 编号、占位符及未决问题。

若用户选择 Deferred 或 Rejected，按对应状态迁移并记录原因，终止后续流程。

## Quality Checklist

- [ ] Quick 路径满足全部判据；Full 路径命中明确信号
- [ ] 三件套通过 CLI 原子创建，保持无注释最小骨架
- [ ] Proposal 从空正文完整编写，8 个二级章节标题精确匹配且无数字前缀
- [ ] `包含` 与 `不包含` 作为独立二级标题分别填写
- [ ] 背景与问题包含可复核事实，至少包含 1 条带事实摘要的 `EVD-##`
- [ ] 至少包含 1 条 `DEC-##`，明确包含 `### 未采用方向与原因`（无时写“无”）
- [ ] 不含业务契约、验收标准、文件路径或实现任务
- [ ] 正文自包含，没有原始对话也能独立理解
- [ ] `未决问题` 为“无”，且通过 CLI 成功迁移为 `accepted`

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| 分配 ID、原子创建最小骨架 | 判断 Quick / Full，探查系统事实 |
| 校验 8 章节、EVD/DEC、占位符、未决问题 | 从空正文完整编写并自检 Proposal |
| 机械门禁校验与执行状态迁移 | 请求用户决策，不替用户做产品决定 |

## Stop Conditions

- 用户意图或影响不足以判定路径 → 只问一个决定路径的关键问题，不继续推演
- 仍存在影响范围的未决问题 → 严禁迁移为 accepted
- 需求包含多个可独立交付的系统 → 提出拆分为多个 Change
- 触碰未定型的 Blueprint 系统边界 → 暂停并引导至 `blueprint`
- 实际为已批准 Spec 的行为缺陷 → 终止并路由至 `bug`
- 用户选择 Deferred 或 Rejected → 执行对应状态迁移后终止

## Handoff Rule

Proposal accepted → `spec`。本技能职责结束，严禁在本技能内继续编写 Spec 或 Plan。

## Anti-Patterns 负面清单

1. **严禁手动编辑状态**：严禁在 frontmatter 中手动将 status 改为 `accepted`，必须执行 `node scripts/project-docs.cjs transition CR-### --to accepted`。
2. **严禁带数字标题**：严禁写 `## 1. 背景与问题` 或 `## 一、背景与问题`，必须为精确的 `## 背景与问题`。
3. **严禁合并章节**：严禁将 `包含` 和 `不包含` 合并为 `## 包含与不包含` 或 `## 包含 / 不包含`。
4. **严禁遗漏「未采用方向与原因」**：`## 决定` 章节内必须包含该小节，无备选方案时必须明确写“无”。
5. **严禁越界夹带**：严禁在 Proposal 中定义 API 结构、字段契约（属于 Spec）或文件修改列表、测试步骤（属于 Plan）。
