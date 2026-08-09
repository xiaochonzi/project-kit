---
name: execute-plan
description: Use when you have an approved Implementation Plan to execute — implementing code task-by-task with TDD discipline and recording execution facts. If no approved Plan exists, use plan first. If the Feature is already implemented, use verify-plan.
---

# Execute Plan

## Overview

严格按已批准计划实施,保存执行事实。**"代码写完了"不等于"任务完成"**——每个任务必须有可验证的证据(命令+输出),每条 Spec 验收标准必须映射到执行结果。

本技能最多把 Feature 推进到 `implemented`,**独立验收是 verify-plan 的职责**。

**开始前宣布:** "我正在使用 execute-plan 技能执行此计划。"

## The Iron Law

```
NO IMPLEMENTATION WITHOUT AN APPROVED AND VALID PLAN
```

**Violating the letter of this rule is violating the spirit of execution discipline.** 没有 approved Plan 或 Plan 与代码现实冲突→禁止修改任何文件。Plan 过期→回 plan 修订,不边执行边改。Feature 最多到 `implemented`,禁止标记 `verified`。

## When to Use ESPECIALLY

- Plan 有 5+ 任务、涉及多个文件时
- 执行过程中发现了 Plan 没提到的问题时
- 想"顺手把这个也改了"时
- 测试失败了,想注释掉继续时

## Don't Skip When

- "这个任务很简单,不用 TDD"——每个任务遵守 RED→GREEN→CHECK
- "只改一行,不用记录"——每步都记录执行事实
- "功能差不多了,标 verified"——verified 只能来自 verify-plan

## Required Inputs(不满足即停止,逐项核对)

- [ ] Feature Spec `status: approved`:`docs/specs/<M#>/F-M#-##.md`
- [ ] Implementation Plan `status: approved`:`docs/plans/F-M#-##-plan.md`
- [ ] 已读 `docs/STATE.md`(当前焦点)、`docs/constitution.md`(编码门禁)
- [ ] 目标仓库可构建、测试命令可运行

## TDD Iron Law(每任务严格执行)

```
RED   → 写失败测试,运行确认 FAIL
GREEN → 写最小实现,运行确认 PASS
CHECK → 对照 acceptance,可观察结果满足才算完成
```

**禁止**:

- 在测试通过前写实现代码
- 跳过 RED(直接写实现=`我猜它是对的`)
- 测试失败时注释掉测试继续
- 把测试失败标记为"已知问题"后推进

## Process

### Step 1: 确认 Plan 可执行

```bash
node scripts/project-docs.cjs context execute-plan --target <F-M#-##> --root <项目根>
```

确认上下文文件齐全。用脚本确认状态可迁移:

```bash
node scripts/project-docs.cjs transition F-M#-## --to in-progress --root <项目根>
node scripts/project-docs.cjs transition F-M#-## --to in-progress --kind plan --root <项目根>
```

如果 `transition` 报"非法迁移"→ 前置状态不对,停止并报告,不绕过。

### Step 2: 批判性检查 Plan(改代码前,最后一次机会)

- [ ] Plan 里每个 `files` 指向的文件/目录真实存在(新建文件除外)
- [ ] `read_first` 引用的符号存在,接口签名与 Plan 描述一致
- [ ] 每个 `verify` 命令可运行
- [ ] 任务依赖顺序无环
- [ ] Plan 只覆盖本 Feature 范围,没有相邻问题/未来设计混入

**任何一项不满足 → 停止,记录偏差,回 plan 修订。禁止边执行边改 Plan。**

### Step 3: 状态推进

```bash
node scripts/project-docs.cjs transition <feature-id> --to in-progress --root <项目根>
node scripts/project-docs.cjs transition <feature-id> --to in-progress --kind plan --root <项目根>
```

### Step 4: 逐任务执行(每个任务一个 TDD 循环)

对 Plan 中每个 Task N:

1. **读 `read_first`** 指定的文件,确认理解当前代码
2. **只修改 `files` 范围内的文件**——不在范围内,哪怕"顺手就能改",不碰
3. **RED**:写/运行该任务的失败测试,确认 FAIL
4. **GREEN**:写最小实现,运行确认 PASS
5. **CHECK**:对照 `acceptance`,可观察结果满足?
6. **记录**:命令+输出摘要+实际修改的文件+与 Plan 的偏差
7. **提交**:小步提交,描述该任务做了什么

每完成一个任务,在 Plan 文档中勾选:`- [x] Task N`。

### Step 5: 验证失败处理

- 定位是当前任务还是之前任务引入
- **禁止**:删测试、扩大范围绕开、把失败标为"已知问题"
- **禁止**:改 Spec/Plan 语义来掩盖失败
- 连续 3 次修复无改善 → 停止:计划假设可能错了,回 plan 修订

### Step 6: 整体验证与范围检查

```bash
node scripts/project-docs.cjs validate --root <项目根>
git diff --stat    # 实际改动 vs Plan 声明的 files
```

- [ ] 实际 diff 只覆盖 Plan 的 `files_modified`
- [ ] `validate` 无新增 error
- [ ] Plan 的最终验证全部通过

### Step 7: 创建 Execution Summary

```bash
node scripts/project-docs.cjs new execution --feature <F-M#-##> --root <项目根>
```

在 `docs/executions/F-M#-##-execution.md` 中如实记录:

- **Task Results**:每个任务完成/失败、验证输出摘要
- **实际修改文件**:真实列表(与 Plan `files_modified` 对比)
- **验证记录**:运行过的命令+结果;失败项写明原因
- **最终结果**:整体验证结论
- **偏差与遗留**:与 Plan 的任何偏差、发现的相邻问题(只记录,不修)

**禁止伪造执行记录**——没跑过的命令不写"通过"。

### Step 8: 状态收口

```bash
node scripts/project-docs.cjs transition <feature-id> --to completed --kind plan --root <项目根>
node scripts/project-docs.cjs transition <feature-id> --to completed --kind execution --root <项目根>
node scripts/project-docs.cjs transition <feature-id> --to implemented --root <项目根>
```

**HARD-GATE**:Feature 最多到 `implemented`。`verified` 只能由 verify-plan 的独立验收产生。本技能不得标记。

### Step 9: 更新 STATE.md

在 `docs/STATE.md` 中记录:完成内容、验证结果、计划偏差、下一动作:`verify-plan F-M#-##`。

## Stop Conditions(出现任一立即停止并报告)

| 条件 | 动作 |
|---|---|
| Plan 未批准/过期/与代码现实冲突 | 回 plan 修订 |
| 需改 Plan 范围外文件 | 停止;可能需要 change 或 plan 修订 |
| 需改 Spec 语义/加功能/跨模块/新架构决定 | 转 change |
| 需要未授权的外部写操作(删数据/推远端) | 停止,等用户授权 |
| 连续修复无改善 | 停止:Plan 假设错误,回 plan |
| 安全/数据迁移/高风险影响未被 Plan 覆盖 | 停止,先分析 |
| 验证失败且根因不在当前范围 | 停止,定位根因 |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `context execute-plan`、`transition`、`validate` | 批判性检查 Plan |
| `new execution` 创建骨架 | TDD 逐任务执行 |
| — | 记录执行事实(不伪造) |
| — | **禁止**:改 Spec/Plan 语义、扩大范围、"顺手重构"、标记 verified |

## Handoff Rule

Feature `implemented` 后 → `verify-plan`。本技能不接受"差不多完成了"——必须有执行记录和验证证据。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "Plan 有点旧,我按最新代码写" | Plan 过期=失效,回 plan 修订,不边执行边改 |
| "这个文件顺手改,反正相关" | 只改 `files` 范围,越界破坏可审查性 |
| "测试失败先注释掉,后面补" | 掩盖失败=伪造通过,根因留到验收爆炸 |
| "功能差不多了,标 verified" | verified 只能来自 verify-plan 独立验收 |
| "执行记录不重要,代码能跑就行" | 没执行事实,verify-plan 无法核对,闭环断裂 |
