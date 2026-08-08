---
name: verify-plan
description: Use when a Feature is implemented and needs independent acceptance — checking the actual implementation against the approved Feature Spec with fresh evidence. If the Feature is still in progress, use execute-plan.
---

# Verify Plan

## Overview

用**新鲜证据**独立核对 Spec、Plan 与实际实现,只在全部验收标准满足时宣布完成。不信任实现者的自述,不引用执行阶段的旧输出。

**开始前宣布:** "我正在使用 verify-plan 技能进行独立验收。"

## HARD-GATE

> **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.** 每条验收标准必须在本技能执行期间重新运行证据命令,不得引用历史输出,不得凭"看起来正确"。

## Required Inputs(不满足即停止)

- [ ] Feature `status: implemented`:`docs/specs/<M#>/F-<M#>-##.md`
- [ ] Plan `status: completed`:`docs/plans/F-<M#>-##-plan.md`
- [ ] Execution Summary `status: completed`:`docs/executions/F-<M#>-##-execution.md`

## Process

### Step 1: 创建 Verification 文档

```bash
node scripts/project-docs.cjs new verification --feature <F-<M#>-##> --root <项目根>
```

生成 `docs/verifications/F-<M#>-##-verification.md`,Frontmatter 含 `feature:`、`status: pending`。

### Step 2: 逐条核对验收标准

对 Spec 的**每条**验收标准:

1. 选择直接证据:自动测试、构建、静态检查、数据检查或人工流程
2. **重新运行证据命令**,记录命令与输出
3. 判定:`pass` / `fail` / `blocked`,附观察事实
4. 检查 Plan 每项任务是否完成、实际文件是否越界、相关 REQ 是否仍满足

### Step 3: 填写 Verification 文档

必须包含:

```markdown
## 验证环境
## 验收证据        ← 每条标准:命令、输出、pass/fail/blocked
## 回归与边界检查  ← 关键失败路径、安全与数据边界
## 结论
```

同时记录:

- `implementation_ref`:commit、构建 ID 或明确的工作树版本
- 未批准范围、残留风险、人工验证限制

### Step 4: 判定

```bash
node scripts/project-docs.cjs transition F-<M#>-##-verification --to passed --kind verification --root <项目根>
node scripts/project-docs.cjs transition F-<M#>-## --to verified --root <项目根>
```

(脚本要求:Verification passed 前 Feature 必须 implemented;passed 需填 verified_at/spec_hash/implementation_ref;verified 前需 passed Verification。)

全部通过后:

- 若 Milestone 所有 Feature 均 verified 且退出标准满足 → `transition M# --to completed`
- 更新 `docs/STATE.md` 与 `docs/roadmap.md`,选定下一 Feature/Milestone

## Stop Conditions

- Feature 尚未 implemented
- 任一必需标准失败或证据不新鲜 → 不标记完成,给出最小下一动作
- 验收中发现范围外问题 → 记录,转 bug 或 change,不在验收中顺手修

## 禁止

- 不使用"应该可以""看起来正确"代替证据
- 不因实现者声称完成而跳过复验
- 不在验收过程中隐式修复范围外问题

## Handoff Rule

验收完成后 → `status` 或按结果进入下一 Feature(重新走 refine/plan)。验收失败 → `execute-plan` 修复或 `bug`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "执行阶段测过了,不用重跑" | 没有新鲜证据就不是独立验收 |
| "失败项写成限制就行" | 失败是失败,不能用表述掩盖 |
| "顺手修掉这个越界问题再验收" | 验收不是修复入口 |
