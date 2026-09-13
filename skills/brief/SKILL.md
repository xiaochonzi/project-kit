---
name: brief
description: Use when receiving a fuzzy idea, raw requirement, or design discussion that needs to become a structured Brief — an immutable archive of the original intent. Use even for "help me figure out what to build" or "let's clarify this idea". If the requirement is already a concrete change, use change.
---

# Brief

## Overview

通过协作对话，把模糊想法或发散讨论固化为不可改写的原始归档文档：
- `docs/briefs/BRIEF-###.md` —— 原始输入归档，固化后正文不再反复改写。

> **边界说明**：本技能**不产出** Blueprint、Roadmap、或 Change 三件套。具体需求设计由 `change` 承接，系统架构由 `blueprint` 承接。

## The Iron Law

```
NO IMPLEMENTATION PLANS FROM UNVERIFIED REQUIREMENTS
```

**严禁根据未验证的需求直接制定实现计划。遇到改变产品目标、业务边界或用户行为的未决问题，必须暂停并由用户裁决。**

**开始前宣布：**“我正在使用 brief 技能和您一起梳理原始需求。”

## Required Inputs

- [ ] `docs/` 目录已初始化；否则先使用 `init`
- [ ] 已读取 `.project-kit/state.md` 以及已有的 `docs/blueprint.md`、`docs/roadmap.md`（如有）
- [ ] 当前输入为发散想法、模糊诉求或多系统构想（若已是单一明确的工程变更，直接路由至 `change`）

## Process

### Step 1：探查上下文与范围检查

1. 了解项目现状，读取既有架构与规划。
2. **多系统范围检查**：若原始输入包含多个独立子系统（如“一次性重构用户中心+计费平台+内容后台”），**立即提出拆分，不追问细节**：
   > “该诉求包含多个独立子系统，建议拆分为独立 Brief 分别推进。请问优先梳理哪一个？”

### Step 2：单问题递进对话与方案对比

一次只聚焦一个问题，倾向提供选项：
1. **目的**（为什么做，解决什么痛点）
2. **约束**（技术、合规或已有系统约束）
3. **成功标准**（达到何种效果算完成）

存在多个合理方向时，提出 2-3 个方案对比（说明利弊与推荐理由），让用户做单点决策。
对话中明确标注信息属性：
- `[用户确认]`：用户明确确认的目标或事实
- `[AI 候选]`：AI 提出的备选方案，待确认
- `[假设]`：尚未验证的前提条件
- `[未决]`：需要用户最终裁决的决策点

### Step 3：固化前复述确认

在正式落盘前，向用户复述收敛后的共识：
> “让我确认一下理解：
> - 核心痛点与目标：[复述]
> - 目标用户与核心场景：[复述]
> - 明确交付的能力范围：[复述]
> - 明确不做（Out of Scope）：[复述]
> - 待定未决事项：[列出]
> 是否准确？有无需要调整之处？”

待用户确认一致后进入下一步。

### Step 4：固化 Brief 归档

将整理后的需求共识先写入临时源文件（例如 `docs/research/brief-source.md`），随后运行 CLI 命令：

```bash
node scripts/project-docs.cjs new brief --title <简短标题> --source <源文件路径> --root <项目根>
```

CLI 会原子生成 `docs/briefs/BRIEF-###-<slug>.md`（状态为 `captured`）。
**Brief 固化后正文保持不可变**（仅修正错别字或死链），后续演进与实现走 `change`。

### Step 5：结构化审计

将 Brief 内容对照以下 9 类进行系统审查，识别并向用户报告：
1. 产品目标；2. 用户和场景；3. 功能能力；4. 业务规则；5. 数据和接口约束；6. 非功能要求；7. 假设；8. 未决问题；9. 明确不做的内容。

重点排查：
- **矛盾冲突**：两个诉求互斥 → 提示用户裁决
- **技术冒充需求**：“必须用 Redis 缓存”属于方案，追问真实性能指标（如“响应时间 < 200ms”）
- **边界缺失**：只有功能点缺乏场景或成功标准 → 补齐说明

### Step 6：机械校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

确保 `validate` 0 错误。

## Quality Checklist

- [ ] 跨系统大需求已在前期完成拆分，未混合在一个 Brief 中
- [ ] 关键事实已由用户确认，并清晰区分事实、假设与候选方案
- [ ] 包含明确的非目标（明确不做的内容）
- [ ] 通过 `new brief --source <文件路径>` 成功生成归档文件
- [ ] Brief 正文保持不可变，未包含逐文件代码设计或实现排期
- [ ] `validate` 校验通过无错误

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| `new brief` 分配编号、渲染模板并注入内容 | 对话梳理、发散收敛、方案对比 |
| `validate` 校验 frontmatter 与引用 | 识别矛盾、区分假设与事实、明确边界 |
| — | **禁止**：编写实现代码、生成 Plan、代用户决定优先级 |

## Stop Conditions

- 原始需求涉及多个独立系统且用户拒绝拆分 → 停止深入，先行厘清边界
- 存在影响方向的阻断性未决问题，用户尚未决策 → 停止固化，等待答复
- 需求已十分具体且为局部功能变动 → 停止 Brief，直接路由至 `change`

## Handoff Rule

Brief 确认固化后：
- 需要确立整体系统架构与模块边界 → `blueprint`
- 需求边界清晰，准备直接推进具体功能设计 → `change`

## Anti-Patterns 负面清单

1. **严禁越界编写实现**：Brief 仅负责需求意图归档，严禁在 Brief 中编写文件修改方案或实现步骤。
2. **严禁把技术方案当需求**：“使用特定数据库/框架”是技术选型，必须追问背后的业务约束与性能指标。
3. **严禁替用户假定未决事项**：遇到用户未确认的分歧点，严禁自作主张直接写入正文。
4. **严禁给 `--source` 传递文本内容**：`--source` 参数必须是真实存在的文件路径，非文件路径会导致 CLI 报错。
