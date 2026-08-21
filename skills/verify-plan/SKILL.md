---
name: verify-plan
description: Use when a Full change is implemented and needs independent acceptance — checking the actual implementation against the approved Spec with fresh evidence, writing results back into plan.md and local state. If the change is still in progress, use execute-plan.
---

# Verify Plan

## Overview

用**新鲜证据**独立核对 Spec 与实际实现——每条验收标准重新运行证据命令,不引用执行阶段的历史输出。只在全部验收标准满足时宣布完成。

**"执行者说完成了"不是证据。** 本技能独立于 execute-plan,不信任实现者的自述。

**不产出独立验收文档**——验收证据写回 `plan.md` 的「最终验证」区,结论同步 `.project-kit/state.md`,并把 roadmap 中对应任务状态更新为 `已完成`。

**开始前宣布:** "我正在使用 verify-plan 技能进行独立验收。"

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

**Violating the letter of this rule is violating the spirit of verification.** 如果你没有在此轮消息中重新运行验证命令,就不能声称它通过。不得引用 execute 阶段的旧输出、不得凭"看起来正确"宣称通过、不得通过修改验收标准来掩盖失败。

## Red Flags — STOP immediately

在声明任何结果前,如果出现以下信号,**立刻停止,不要继续**:

- 想说"应该没问题"、"看起来正确"、"之前测过了"
- 想表达满意("Perfect!"、"Done!")但没跑过验证命令
- 相信 execute 阶段的测试输出("那次是通过的")——那次不是这次
- 验收标准失败了,但想把它写成"限制"或"已知问题"来过关
- 想顺手修个范围外的 bug 再回来验收
- **任何在没有运行证据命令的情况下暗示通过的措辞**

## Common Failures

| 声明 | 必须要 | 不算数 |
|---|---|---|
| 测试通过 | 本轮 `node --test` 输出:0 failures | 上一轮通过、"应该能过" |
| Spec 验收满足 | 逐条 AC 证据命令+本轮输出 | "代码看起来实现了" |
| 没有越界修改 | `git diff --stat` vs Plan files | "感觉没改别的" |
| Change 可标记完成 | 全部 AC pass + spec verified + plan completed | "差不多了,标完成吧" |

## Required Inputs(不满足即停止)

- [ ] `docs/changes/CR-###-<slug>/spec.md` 存在且 `status: approved`(验收标准是核对清单)
- [ ] `docs/changes/CR-###-<slug>/plan.md` 存在且 `status: completed`(任务全部勾选)
- [ ] `docs/constitution.md`(对照约束检查)

## Process

### Step 1: 确认上下文

```bash
node scripts/project-docs.cjs context verify-plan --target <CR-###> --root <项目根>
```

读取该 change 三件套。

### Step 2: 逐条核对验收标准

对 Spec 的**每条**验收标准:

1. 选择直接证据:自动测试、CLI 命令、静态检查、数据断言
2. **重新运行证据命令**,记录命令+输出(不引用 execute 阶段的旧日志)
3. 判定:`pass`(证据满足) / `fail`(证据不满足) / `blocked`(无法运行证据)
4. 检查 Plan 每项任务是否勾选、实际文件是否越界(超出 Plan `files`)

**如果 execute 阶段的测试已经通过,仍然重新运行**——验证的是"当前代码是否满足验收标准",不是"以前是否满足过"。

### Step 3: 回归与边界检查

- 运行受影响模块的回归测试
- 检查 Constitution 约束(编码门禁/测试要求)
- 检查关键失败路径(空输入/损坏数据/权限边界)
- 检查安全与数据边界

### Step 4: 记录验收证据

把每条验收标准的命令+输出+结论追加到 `plan.md` 的「最终验证」区,并更新「验收标准映射」表的最终验证列。

### Step 5: 判定与状态推进

**全部 pass**:

```bash
node scripts/project-docs.cjs transition CR-### --to verified --kind spec --root <项目根>
node scripts/project-docs.cjs transition CR-### --to completed --root <项目根>
```

脚本要求:spec verified 前 `spec_hash` 与 Spec 内容一致(防静默修改契约)、Plan 必须 completed;change completed 前 Spec verified 且 Plan completed。

把 `docs/roadmap.md` 中该 change 对应任务的状态更新为 `已完成`,更新 `.project-kit/state.md`(完成记录、下一动作、最近完成)。

**任一必需标准 fail**:不标记完成。给出最小下一动作(回 execute-plan 修复 / 转 bug)。

**任一 blocked**:记录阻塞原因,不标记完成。

### Step 6: 更新本地 state

记录验收结论、下一动作、任何残留风险。更新 frontmatter 的 `active_change` / `next_action`。

## 禁止

| 禁止的行为 | 为什么 |
|---|---|
| 引用 execute 阶段的旧输出当证据 | 那不是新鲜证据,无法证明当前代码满足验收 |
| "应该可以""看起来正确"代替证据 | 验收结论只能由命令输出支持 |
| 因实现者声称完成而跳过复验 | 本技能独立于 execute-plan |
| 在验收过程中顺手修范围外问题 | 验收不是修复——失败就标记失败 |
| 修改验收标准来掩盖失败 | Spec 错误→停止重新评审需求,不静默改标准 |
| 通过修改代码来"修复"验收失败 | 失败就是失败,记录,交给 execute-plan 或 bug |

## 场景路由

| 场景 | 处理 |
|---|---|
| **Plan 未 completed** | 路由到 execute-plan |
| **全部 pass** | spec verified → change completed;roadmap 任务状态置为已完成,更新本地 state |
| **任一必需标准 fail** | 记录,回 execute-plan 修复或转 bug |
| **Spec 本身错误** | 停止,重新评审需求,不通过修改验收标准掩盖 |
| **验收中发现新期望行为** | 创建新 Change(走 change 技能),不混入当前验收 |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `context verify-plan` 输出上下文 | 逐条运行证据命令 |
| `transition` 状态迁移与 spec_hash 核对 | 判定 pass/fail/blocked |
| — | 检查越界/回归/Constitution |
| — | **禁止**:引用旧输出、手修代码、"看起来正确" |

## Handoff Rule

Change completed 后 → `status`(查看下一动作)或进入下一个 change 的 `change`/`plan`。验收失败 → `execute-plan`(修复)或 `bug`(根因分析)。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "执行阶段测过了,不用重跑" | 没有新鲜证据就不是独立验收 |
| "失败的验收标准写成限制就行" | 失败就是失败,不能用表述掩盖 |
| "顺手修掉这个越界问题再验收" | 验收不是修复入口,失败→标记,交给 execute-plan |
| "spec_hash 随便填" | 脚本用它检测 Spec 是否被静默修改——必须准确 |
