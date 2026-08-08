---
name: status
description: Use when asking what the project state is — current milestone, feature progress, what's blocking, what's next. Read-only; use before starting any other work in an unfamiliar project.
---

# Status

## Overview

只读汇总项目当前状态、追踪一致性与机械可推导的下一动作。**本技能不修改任何文件。**

**开始前宣布:** "我正在使用 status 技能查看项目状态。"

## HARD-GATE

> **READ ONLY.** 本技能禁止修改、创建、删除任何项目文档或代码。

## Process

### Step 1: 汇总状态

```bash
node scripts/project-docs.cjs status --root <项目根>
```

输出各文档类型的当前状态分布(Brief/Requirement/Milestone/Feature/Plan/Execution/Verification/Change/Fix/ADR)。

### Step 2: 检查追踪一致性

```bash
node scripts/project-docs.cjs coverage --root <项目根>
```

- accepted REQ 是否都有 Milestone/Feature 双向映射
- 未覆盖的 REQ 列出,判断是待细化还是应标 deferred/rejected

### Step 3: 推导下一动作

```bash
node scripts/project-docs.cjs next --root <项目根> [--json]
```

脚本按状态机推导唯一下一步(如:有 implemented 未验收 → verify-plan;有 accepted 未映射 → brief)。

### Step 4: 结合 STATE 汇报

- 读 `docs/STATE.md` 确认人为记录的焦点与阻塞
- 汇报:当前 Active Milestone / Feature / Plan、阻塞项、下一动作
- 发现文档与代码状态不一致(如 implemented 但无 execution)→ 列出,不擅自修改

## Stop Conditions

- docs 结构缺失导致无法得出可信状态 → 报告,建议 `init`
- 命令失败 → 报告,不猜

## Handoff Rule

状态报告完成后,按结果进入对应技能;本技能自身是只读终点,无后继。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "顺手把状态修一下" | 本技能只读,报告 ≠ 修改 |
| "coverage 不跑也行" | 没有追踪报告,状态结论失真 |
| "implemented 基本等于完成" | 没有 verify 证据不能说完成 |
