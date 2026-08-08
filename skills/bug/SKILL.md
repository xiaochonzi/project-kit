---
name: bug
description: Use when diagnosing and fixing a defect — an implementation that violates an approved Feature Spec. If the behavior was never specified, it's a new requirement: use change.
---

# Bug

## Overview

诊断违反已批准 Spec 的缺陷:记录现象与预期 → 根因分析 → 最小修复 → 回归验证 → 写入 `docs/fixes/BUG-###.md`。**修复不借机加入新能力,不扩大范围。**

**开始前宣布:** "我正在使用 bug 技能修复缺陷。"

## HARD-GATE

> **NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.** 先找到根因再修改。未定位根因的"试试看"式修复会重复引入同类问题。

## Process

### Step 1: 确认是 Bug 还是新需求

- 实现违反已批准 Spec 的期望行为 → Bug,继续
- Spec 从未要求该行为 → 新需求,转 `change`
- 拿不准 → 问用户,不猜

### Step 2: 记录现象与复现

- 现象、复现步骤、影响范围
- 预期行为及对应 Spec 章节/验收标准

### Step 3: 根因分析

- 沿数据流/调用链定位根因(读相关代码、历史变更、相关 ADR)
- 记录根因证据(代码位置、时序、数据样本)
- 未定位根因 → 停止,不要动手改

### Step 4: 最小修复

- 只修改根因相关的最小范围
- 不改 Spec、不改验收标准、不加新能力
- 先写/运行能复现该 Bug 的失败测试,再实现修复,再看到测试通过

### Step 5: 回归验证

- 运行复现测试 + 受影响模块的相关测试 + 整体 `validate`

### Step 6: 创建 Bug Resolution

```bash
node scripts/project-docs.cjs new fix --title <问题标题> --root <项目根>
```

生成 `docs/fixes/BUG-###.md`,必须包含(脚本校验章节):

```markdown
## 现象与期望
## 复现方式
## 根因证据
## 修复内容
## 新鲜验证结果
```

记录:现象与复现条件、预期行为及对应 Spec、根因、最小修复、回归风险、验证证据。

> 说明: `fix` 文档在脚本中无合法状态迁移路径,直接在 frontmatter 把 `status` 改为 `resolved` 即可(文档是事实源)。

## Stop Conditions

- 找不到对应 Spec 依据(可能是新需求)
- 无法稳定复现
- 修复需要扩大范围或改变产品边界

## Handoff Rule

修复完成且验证通过后 → `verify-plan`(若属于某 Feature 的回归验收)或 `status`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先改了再找根因" | 没有根因,同类问题会重复出现 |
| "顺手把相关需求也做了" | Bug 修复不是增强入口 |
| "回归测试省掉,改动很小" | 小改动一样会破坏已有行为 |
