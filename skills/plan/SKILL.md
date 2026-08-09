---
name: plan
description: Use when you have an approved Feature Spec that needs an implementation plan — breaking "what to build" into "how to build it" with exact files, steps, and verifications. If no approved Feature Spec exists, use refine. If asked to execute, use execute-plan.
---

# Plan

## Overview

为已批准的 Feature Spec 编写可逐步执行、逐步验证的实现计划。

**核心假设:执行者对这个代码库零上下文,对测试设计不太在行。** 计划必须写全:改哪些文件、按什么顺序、每步怎么验证、满足什么才算完成。每步是单一动作(2-5 分钟可完成)。

**开始前宣布:** "我正在使用 plan 技能制定实现计划。"

## The Iron Law

```
NO PLAN WITHOUT AN APPROVED FEATURE SPEC
```

**Violating the letter of this rule is violating the spirit of planning discipline.** 没有 approved Spec→不制定计划。Spec 有歧义或矛盾→停止,回 refine 修订。Plan 不得引入 Spec 没有的新能力,不得包含未授权的重构。

## Required Inputs(不满足即停止)

- [ ] Feature Spec 存在且 `status: approved`:`docs/specs/<M#>/F-M#-##.md`
- [ ] 已读取 `docs/constitution.md`(开发约束)、`docs/blueprint.md`(模块边界)、`docs/STATE.md`(当前焦点)
- [ ] 无阻断性未决问题;Spec 矛盾先回 refine

## Process

### Step 1: 确认上下文

```bash
node scripts/project-docs.cjs context plan --target <F-M#-##> --root <项目根>
```

读取 Feature Spec、相关 REQ、Milestone、依赖 Specs、ADR。

### Step 2: 探索代码现实

找到 Spec 涉及的真实文件、接口、测试位置。确认可复用的现有模式。按 constitution 的约束执行影响分析;高风险影响先报告,不隐瞒。

### Step 3: 选择实现方案

选**最小满足 Spec** 的实现方式。列出不采用的方案及原因(一行)。明确数据流、接口变化、数据库/迁移变化。

### Step 4: 写 Plan 文档

```bash
node scripts/project-docs.cjs new plan --feature <F-M#-##> --root <项目根>
```

生成 `docs/plans/F-M#-##-plan.md`。必须包含以下章节(全部填写,禁止留空):

```markdown
---
feature: F-M#-##
spec_version: 1
status: draft
wave: <执行波次>
requirements:
  - REQ-###
files_modified:
  - <相对路径>
---

# F-M#-## 实现计划

## 实现策略
<一句话策略 + 不采用的方案及原因>

## Must-haves
<本计划必须交付的可验证结果,3-8 条>

## 影响与风险

## Tasks

### Task N: <任务名>

- files: <精确文件路径,逗号分隔>
- read_first: <执行前必须读取的文件/符号>
- action: <具体修改与关键逻辑,含代码片段>
- verify: <该任务后立即运行的命令>
- acceptance: <可观察的通过条件>
- done: <何时可勾选完成>

## 验收标准映射
| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |

## 最终验证
- <整体验证命令,逐条列出>

## 非目标
<计划明确不做的事>
```

### 任务粒度标准

**每个任务是一个 2-5 分钟可完成的单一动作:**

- "写失败测试" → 一个任务
- "运行测试确认 RED" → 一个任务
- "写最小实现" → 一个任务
- "运行测试确认 GREEN" → 一个任务
- "提交" → 一个任务

### No Placeholders(计划失败检查清单)

以下是**计划失败**——写出这些即视为计划未完成:

- "TBD"、"TODO"、"稍后实现"、"补充细节"
- "添加适当的错误处理"/"添加验证"/"处理边界情况"——没有给出具体怎么做
- "类似于 Task N"——重复代码,不是引用。执行者可能打乱顺序读任务
- 描述做什么但不给怎么做——代码步骤必须有代码块
- 引用未在任何任务中定义的类型、函数、方法——每个符号必须在某个任务中首次出现

### Step 5: 自审(写完后逐项核对)

1. **Spec 覆盖**:扫 Spec 每条验收标准。能找到覆盖它的任务吗?列出缺口,补上。
2. **No Placeholders**:找 "TBD"、"TODO"、"适当处理"、"类似于 Task N"、"验证同上"——有就修复。
3. **类型一致性**:Task 3 调用的函数名和 Task 2 定义的一致吗?`clearLayers()` 在 Task 3 里变成了 `clearFullLayers()`?修。
4. **可执行性**:每个 verify 命令在目标仓库可运行吗?read_first 引用的文件/符号存在吗?文件路径正确吗?

发现任何问题→内联修复,不需要重审。

### Step 6: 提交用户批准

把 Plan 完整展示给用户。批准后:

```bash
node scripts/project-docs.cjs transition F-M#-## --to approved --kind plan --root <项目根>
node scripts/project-docs.cjs transition F-M#-## --to ready --root <项目根>
```

脚本要求在 Plan approved 前 Feature 为 approved;Feature ready 前 Plan 必须 approved。

### Step 7: 执行 Handoff

Plan 批准后,向用户提供两种执行选择:

**"Plan 已保存到 `docs/plans/F-M#-##-plan.md`。两种执行方式:**

**1. 子代理驱动(推荐)** — 每任务派全新子代理,任务间审查,快速迭代

**2. 内联执行** — 在当前会话使用 execute-plan 技能,批量执行带检查点

**哪种?"**

不要在本技能中开始实施。

## 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error(脚本检查 Plan 任务 6 字段与章节完整性)
- [ ] Plan 的 `requirements` 覆盖 Feature 的全部 REQ
- [ ] 每条 Spec 验收标准映射到至少一个任务和最终验证

## 场景路由

| 场景 | 处理 |
|---|---|
| **Spec 未 approved** | 路由到 refine |
| **Spec 与代码现实冲突** | 停止,报告具体冲突,不改 Spec |
| **影响分析发现需要新 ADR 或 Change** | 停止,先走 change 或 ADR |
| **无法给出真实文件路径或可执行验证命令** | 停止,不猜测 |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `new plan` 创建骨架 | 探索代码,选实现方案 |
| `context plan` 输出上下文 | 写任务(每步 2-5 分钟) |
| `transition` 状态迁移 | 自审(覆盖/占位符/一致性/可执行性) |
| `validate` 校验 | **禁止**:手建目录、引入 Spec 外能力、"顺手重构" |

## Handoff Rule

Plan approved → `execute-plan`。本技能不写代码,只写计划。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "Spec 够清楚了,直接写代码" | 没有计划,执行无法按步验证,验收无从映射 |
| "先写大步骤,细节执行时再补" | 缺文件/命令/条件的步骤无法执行=计划未完成 |
| "测试最后统一补" | 没有任务级 verify,问题堆到最后无法定位 |
| "顺手把这个重构也写进计划" | Plan 只服务当前 Spec,不在计划内的修改=范围越界 |
| "TBD 是合理的,这取决于..." | TBD = 执行者需要猜,猜错=返工。依赖的不确定在 Step 1 就该发现 |
