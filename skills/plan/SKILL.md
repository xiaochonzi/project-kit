---
name: plan
description: Use when you have an approved Feature Spec that needs an implementation plan, before touching code. If no approved Feature Spec exists, use refine instead. If asked to execute, use execute-plan.
---

# Plan

## Overview

为已批准的 Feature Spec 编写可逐步执行、逐步验证的实现计划。**假设执行者对该代码库零上下文** —— 计划必须写全:改哪些文件、按什么顺序、每步怎么验证、满足什么才算完成。本技能不修改业务代码。

**开始前宣布:** "我正在使用 plan 技能制定实现计划。"

**保存位置:** `docs/plans/F-<M#>-<NN>-plan.md`

## Required Inputs(不满足即停止)

- [ ] Feature Spec 存在且 `status: approved`:`docs/specs/<M#>/F-<M#>-<NN>.md`
- [ ] 已读取 `docs/STATE.md` 与 `docs/constitution.md`
- [ ] 无阻断性未决问题;Spec 的矛盾先回 refine 解决,不在这里猜

## Process

### Step 1: 确认上下文

```bash
node scripts/project-docs.cjs context plan --target <F-<M#>-<NN>> --root <项目根>
```

读取输出的 Feature Spec、相关 REQ、Milestone、依赖 Specs 与 ADR。

### Step 2: 探索代码现实

- 找到 Spec 涉及的真实模块、文件、接口与测试位置
- 确认可复用的现有实现,不重复发明
- 按目标仓库规则做影响分析;高风险影响先报告,不隐瞒

### Step 3: 选择实现方案

- 选**最小满足 Spec** 的实现方式
- 列出不采用的复杂方案及原因(一行即可)
- 明确数据流、接口变化、数据库/迁移变化

### Step 4: 写 Plan 文档

创建 `docs/plans/F-<M#>-<NN>-plan.md`(用脚本生成骨架后完整填写):

```bash
node scripts/project-docs.cjs new plan --feature <F-<M#>-<NN>> --root <项目根>
```

**Plan 文档必须包含以下章节(全部填写,禁止留空):**

```markdown
---
feature: F-<M#>-<NN>
spec_version: 1
status: draft
wave: <执行波次>
requirements: [REQ-###]
files_modified:
  - <相对路径>
requirements:
  - REQ-###
---

> frontmatter 数组字段(requirements/files_modified/depends_on)一律用逐行格式,禁止内联 `[a, b]`(脚本解析契约,见 refine 技能)。

# F-<M#>-<NN> 实现计划

## 实现策略
<一句话策略 + 不采用的方案及原因>

## Must-haves
- <本计划必须交付的可验证结果,3-8 条>

## Tasks
### Task 1: <任务名>
- files: <精确文件路径,多个用逗号分隔>
- read_first: <执行前必须读取的文件/符号>
- action: <具体修改与关键逻辑,含代码片段>
- verify: <该任务后立即运行的命令>
- acceptance: <可观察的通过条件>
- done: <何时可勾选完成>

### Task N: ...
<按依赖排序;每步 2-5 分钟可完成>

## 验收标准映射
| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| <逐条列出 Spec 的每条验收标准> | Task N | <验证命令/方式> |

## 最终验证
- <整体验证命令,逐条列出>
```

### Step 5: 自审(交付前逐项核对)

- [ ] **No Placeholders**:禁止 "TBD"、"TODO"、"适当处理错误"、"类似 Task N"、描述做什么但不给怎么做
- [ ] 每个任务含全部 6 字段:`files` / `read_first` / `action` / `verify` / `acceptance` / `done`
- [ ] 每个任务都有对应测试或验证命令
- [ ] **每条 Spec 验收标准都映射到任务与最终验证,一条不漏**
- [ ] 顺序符合依赖;迁移/数据库步骤位置正确
- [ ] 无任务间文件冲突;公开接口变化与回滚影响已说明
- [ ] 任务粒度:每个步骤是单一动作(写失败测试 → 跑 → 最小实现 → 跑 → 提交)
- [ ] Plan 只实现目标 Spec,无顺手重构、无未来设计
- [ ] 依赖的代码事实与当前仓库一致(不一致 → 停止,先澄清)

### Step 6: 提交用户批准

- 把 Plan 完整展示给用户,说明方案与影响
- 用户批准后:
  - `transition F-<M#>-<NN> --to approved --kind plan  # 用 feature id(plan 文档无独立 id)`
  - `transition F-<M#>-<NN> --to ready`(脚本要求 Plan approved 才能 ready)

## Stop Conditions

- Spec 未批准或有阻断性歧义
- 代码现实与 Spec 冲突,需要改变产品边界 → 停止,报告
- 影响分析发现需要新 ADR 或 Change
- 无法给出真实文件路径或可执行验证命令

## Validation Checklist(脚本确认)

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error(脚本会检查 Plan 任务 6 字段与章节完整性)
- [ ] Plan 的 `requirements` 覆盖 Feature 的全部 REQ

## Handoff Rule

计划批准后,**本技能完成,交 execute-plan 执行**。不要在本技能中开始写代码。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "Spec 够清楚了,直接写代码吧" | 没有计划,执行无法按步验证,验收无从映射 |
| "先写大步骤,细节执行时再补" | 缺文件、命令、验收条件的步骤无法执行 |
| "测试最后统一补" | 没有任务级验证,问题会堆到最后 |
| "顺手把相邻问题也排进计划" | Plan 只服务当前 Spec |
