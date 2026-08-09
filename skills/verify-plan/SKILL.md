---
name: verify-plan
description: Use when a Feature is implemented and needs independent acceptance — checking the actual implementation against the approved Feature Spec with fresh evidence. If the Feature is still in progress, use execute-plan.
---

# Verify Plan

## Overview

用**新鲜证据**独立核对 Spec、Plan 与实际实现——每条验收标准重新运行证据命令,不引用执行阶段的历史输出。只在全部验收标准满足时宣布完成。

**"执行者说完成了"不是证据。** 本技能独立于 execute-plan,不信任实现者的自述。

**开始前宣布:** "我正在使用 verify-plan 技能进行独立验收。"

<HARD-GATE>
每条验收标准必须在本技能执行期间重新运行证据命令。不得引用 execute 阶段的旧输出,不得凭"看起来正确"宣称通过。验收失败不得通过修改验收标准来掩盖。
</HARD-GATE>

## Required Inputs(不满足即停止)

- [ ] Feature `status: implemented`:`docs/specs/<M#>/F-M#-##.md`
- [ ] Plan `status: completed`:`docs/plans/F-M#-##-plan.md`
- [ ] Execution Summary `status: completed`:`docs/executions/F-M#-##-execution.md`
- [ ] `docs/constitution.md`(对照约束检查)

## Process

### Step 1: 创建 Verification 文档

```bash
node scripts/project-docs.cjs new verification --feature <F-M#-##> --root <项目根>
```

生成 `docs/verifications/F-M#-##-verification.md`。

### Step 2: 确认上下文

读取 Feature Spec(验收标准是核对清单)、Plan(任务完成情况)、Execution Summary(实际修改文件)、constitution(约束检查)。

### Step 3: 逐条核对验收标准

对 Spec 的**每条**验收标准:

1. 选择直接证据:自动测试、CLI 命令、静态检查、数据断言
2. **重新运行证据命令**,记录命令+输出(不引用 execute 阶段的旧日志)
3. 判定:`pass`(证据满足) / `fail`(证据不满足) / `blocked`(无法运行证据)
4. 检查 Plan 每项任务是否完成、实际文件是否越界(超出 Plan `files_modified`)

**如果 execute 阶段的测试已经通过,仍然重新运行**——验证的是"当前代码是否满足验收标准",不是"以前是否满足过"。

### Step 4: 回归与边界检查

- 运行受影响模块的回归测试
- 检查 Constitution 约束(编码门禁/测试要求)
- 检查关键失败路径(空输入/损坏数据/权限边界)
- 检查安全与数据边界

### Step 5: 填写 Verification 文档

```markdown
## 验证环境
<环境信息:commit、Node版本、OS>

## 验收证据
<每条Spec验收标准:命令、输出、pass/fail/blocked>

## Plan 完整性
<Plan任务是否全部完成、实际文件是否越界>

## 回归与边界检查
<回归测试结果、关键失败路径、安全边界>

## 未授权范围检查
<实际diff是否仅覆盖Plan范围>

## 失败与阻塞
<失败项和阻塞原因;若无则为"无">

## 结论
<pass/fail/blocked汇总,建议>
```

### Step 6: 判定与状态推进

**全部 pass**:推进状态:

```bash
node scripts/project-docs.cjs transition F-M#-## --to passed --kind verification --root <项目根>
node scripts/project-docs.cjs transition F-M#-## --to verified --root <项目根>
```

脚本要求:verification passed 前 Feature 必须 implemented;需填 `implementation_ref`、`spec_hash`。

全部通过后,检查 Milestone 的退出标准:如果该 Milestone 的全部 Feature 均 verified 且退出标准满足:

```bash
node scripts/project-docs.cjs transition M# --to completed --root <项目根>
```

更新 `docs/STATE.md` 与 `docs/roadmap.md`,选定下一 Feature/Milestone。

**任一必需标准 fail**:不标记完成。给出最小下一动作(回 execute-plan 修复 / 转 bug)。

**任一 blocked**:记录阻塞原因,不标记完成。

### Step 7: 更新 STATE.md

记录验收结论、下一动作、任何残留风险。

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
| **Feature 未 implemented** | 路由到 execute-plan |
| **全部 pass** | verified;检查 Milestone 退出标准 |
| **任一必需标准 fail** | 记录,回 execute-plan 修复或转 bug |
| **Spec 本身错误** | 停止,重新评审需求,不通过修改验收标准掩盖 |
| **验收中发现新期望行为** | 创建 Change Request,不混入当前验收 |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `new verification` 创建骨架 | 逐条运行证据命令 |
| `transition` 状态迁移 | 判定 pass/fail/blocked |
| — | 检查越界/回归/Constitution |
| — | **禁止**:引用旧输出、手修代码、"看起来正确" |

## Handoff Rule

Feature verified 后 → `status`(查看下一动作)或进入下一 Feature 的 `refine`/`plan`。验收失败 → `execute-plan`(修复)或 `bug`(根因分析)。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "执行阶段测过了,不用重跑" | 没有新鲜证据就不是独立验收 |
| "失败的验收标准写成限制就行" | 失败就是失败,不能用表述掩盖 |
| "顺手修掉这个越界问题再验收" | 验收不是修复入口,失败→标记,交给 execute-plan |
| "spec_hash 随便填" | 脚本用它检测 verified 后 Spec 是否被改——必须准确 |
