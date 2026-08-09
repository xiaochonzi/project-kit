---
name: status
description: Use when asking what the project state is — current milestone, feature progress, what's blocking, what's next. Read-only; use before starting any work in an unfamiliar project.
---

# Status

## Overview

只读汇总项目当前状态、追踪一致性与机械可推导的下一动作。**本技能不修改任何文件。**

**开始前宣布:** "我正在使用 status 技能查看项目状态。"

## The Iron Law

```
READ ONLY — NO MODIFICATIONS TO PROJECT FILES
```

**Violating the letter of this rule is violating the spirit of status reporting.** 报告现状,不是改变现状。发现不一致→列出,不擅自修改。

## Process

### Step 1: 汇总状态

```bash
node scripts/project-docs.cjs status --root <项目根>
```

输出各文档类型的当前状态分布。

### Step 2: 检查追踪一致性

```bash
node scripts/project-docs.cjs coverage --root <项目根>
```

accepted REQ 是否都有 Milestone/Feature 映射?未覆盖的列出。

### Step 3: 推导下一动作

```bash
node scripts/project-docs.cjs next --root <项目根>
```

脚本按状态机推导唯一下一步。

### Step 4: 结合 STATE 汇报

读 `docs/STATE.md`,将脚本输出和人为记录的焦点/阻塞结合。报告:

- 当前 Active Milestone / Feature / Plan
- 阻塞项
- 唯一下一动作

发现文档与代码状态不一致→列出,不擅自修改。

## Handoff Rule

状态报告完成后,按结果进入对应技能。本技能是只读终点。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "顺手把状态修一下" | 只读,报告≠修改 |
| "coverage 不跑也行" | 没有追踪报告,状态结论失真 |
| "implemented 基本等于 verified" | 没有 verify 证据不能说完成 |
