---
name: execute-plan
description: Use when a Full change's Plan is approved and needs execution — implementing task-by-task with TDD discipline, checking off plan.md tasks and recording verification results back into the plan. If no approved Plan exists, use plan first. If the change is already implemented, use verify-plan.
---

# Execute Plan

## Overview

严格按已批准计划实施,勾选 `plan.md` 任务并把验证结果写回。**"代码写完了"不等于"任务完成"**——每个任务必须有可验证的证据(命令+输出)。

**不产出独立执行文档**——执行事实记录在 plan.md 的勾选与「最终验证」区,结论同步到 `.project-kit/state.md`。

**开始前宣布:** "我正在使用 execute-plan 技能执行此计划。"

## The Iron Law

```
NO IMPLEMENTATION WITHOUT AN APPROVED AND VALID PLAN
```

**Violating the letter of this rule is violating the spirit of execution discipline.** 没有 approved Plan 或 Plan 与代码现实冲突→禁止修改任何文件。Plan 过期→回 plan 修订,不边执行边改。

## When to Use ESPECIALLY

- Plan 有 5+ 任务、涉及多个文件时
- 执行过程中发现了 Plan 没提到的问题时
- 想"顺手把这个也改了"时
- 测试失败了,想注释掉继续时

## Don't Skip When

- "这个任务很简单,不用 TDD"——每个任务遵守 RED→GREEN→CHECK
- "只改一行,不用记录"——每步都记录执行事实(勾选 + 验证命令)
- "功能差不多了"——本技能不产生独立验收;独立验收是 verify-plan 的职责

## Required Inputs(不满足即停止,逐项核对)

- [ ] `docs/changes/CR-###-<slug>/spec.md` 存在且 `status: approved`
- [ ] `docs/changes/CR-###-<slug>/plan.md` 存在且 `status: approved`
- [ ] `docs/changes/CR-###-<slug>/proposal.md` 存在且 `status: accepted`
- [ ] 已读 `.project-kit/state.md`(本地人员当前焦点)、`docs/constitution.md`(编码门禁)；若存在 `docs/changes/CR-###-<slug>/diagrams.md`，一并读取作为数据依据
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
node scripts/project-docs.cjs context execute-plan --target <CR-###> --root <项目根>
```

确认上下文文件齐全,Plan 状态为 approved。

### Step 2: 批判性检查 Plan(改代码前,最后一次机会)

- [ ] Plan 里每个 `files` 指向的文件/目录真实存在(新建文件除外)
- [ ] `read_first` 引用的符号存在,接口签名与 Plan 描述一致
- [ ] 每个 `verify` 命令可运行
- [ ] 任务依赖顺序无环
- [ ] Plan 只覆盖本 Spec 范围,没有相邻问题/未来设计混入

**任何一项不满足 → 停止,记录偏差,回 plan 修订。禁止边执行边改 Plan。**

### Step 3: 逐任务执行(每个任务一个 TDD 循环)

对 Plan 中每个 Task N:

1. **读 `read_first`** 指定的文件,确认理解当前代码
2. **只修改 `files` 范围内的文件**——不在范围内,哪怕"顺手就能改",不碰
3. **RED**:写/运行该任务的失败测试,确认 FAIL
4. **GREEN**:写最小实现,运行确认 PASS
5. **CHECK**:对照 `acceptance`,可观察结果满足?
6. **记录**:在 plan.md 勾选 `- [x] Task N`,把命令+输出摘要追加到「最终验证」区
7. **提交**:小步提交,描述该任务做了什么

### Step 4: 验证失败处理

- 定位是当前任务还是之前任务引入
- **禁止**:删测试、扩大范围绕开、把失败标为"已知问题"
- **禁止**:改 Spec/Plan 语义来掩盖失败
- 连续 3 次修复无改善 → 停止:计划假设可能错了,回 plan 修订

### Step 5: 整体验证与范围检查

```bash
node scripts/project-docs.cjs validate --root <项目根>
git diff --stat    # 实际改动 vs Plan 声明的 files
```

- [ ] 实际 diff 只覆盖 Plan 的 `files`
- [ ] `validate` 无新增 error
- [ ] Plan 的「最终验证」全部通过并记录在案
- [ ] plan.md 无 `- [ ]` 残留

### Step 6: 状态收口

```bash
node scripts/project-docs.cjs transition CR-### --to completed --kind plan --root <项目根>
```

脚本要求:全部任务已勾选(无 `- [ ]` 残留)。

**本技能不标记 spec verified**——独立验收是 verify-plan 的职责。

### Step 7: 更新本地 state

在 `.project-kit/state.md` 中记录:完成内容、验证结果、计划偏差、下一动作:`verify-plan CR-###`。更新 frontmatter 的 `active_change` / `next_action` / `last_completed`。

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
| `context execute-plan`、`validate` | 批判性检查 Plan |
| `transition` 状态迁移 | TDD 逐任务执行 |
| — | 记录执行事实(勾选 + 验证命令,不伪造) |
| — | **禁止**:改 Spec/Plan 语义、扩大范围、"顺手重构"、标记 verified |

## Handoff Rule

Plan `completed` 后 → `verify-plan`。本技能不接受"差不多完成了"——必须有勾选记录和验证证据。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "Plan 有点旧,我按最新代码写" | Plan 过期=失效,回 plan 修订,不边执行边改 |
| "这个文件顺手改,反正相关" | 只改 `files` 范围,越界破坏可审查性 |
| "测试失败先注释掉,后面补" | 掩盖失败=伪造通过,根因留到验收爆炸 |
| "功能差不多了,标 verified" | verified 只能来自 verify-plan 独立验收 |
| "执行记录不重要,代码能跑就行" | 没执行事实,verify-plan 无法核对,闭环断裂 |
