---
name: bug
description: Use when diagnosing and fixing a defect — an implementation that violates an approved Feature Spec. If the behavior was never specified, it's a new requirement: use change.
---

# Bug

## Overview

诊断违反已批准 Spec 的缺陷:复现→根因→最小修复→回归验证→写入 `docs/fixes/BUG-###.md`。**修复不借机加新能力,不扩大范围。**

**开始前宣布:** "我正在使用 bug 技能修复缺陷。"

<HARD-GATE>
先找到根因再修改。未定位根因的"试试看"修复会重复引入同类问题。不是违反 Spec 的→转 change。
</HARD-GATE>

## 确认是 Bug 还是新需求

- 实现违反已批准 Spec 的期望行为 → Bug,继续
- Spec 从未要求该行为 → 新需求,转 change
- 拿不准 → 问用户,不猜

## Process

### Step 1: 记录现象与复现

- 现象、复现步骤、影响范围
- 预期行为及对应 Spec 章节/验收标准

### Step 2: 根因分析

沿数据流/调用链定位根因——读相关代码、历史变更、相关 ADR。记录根因证据(代码位置、时序、数据样本)。**未定位根因→停止,不动手。**

### Step 3: 最小修复

- 只修改根因相关的最小范围
- 不改 Spec、不加新能力
- TDD:先写能复现该 Bug 的失败测试(RED),再最小实现(GREEN),确认测试通过

### Step 4: 回归验证

- 复现测试通过 + 受影响模块相关测试 + validate

### Step 5: 创建 Bug Resolution

```bash
node scripts/project-docs.cjs new fix --title <问题标题> --root <项目根>
```

生成 `docs/fixes/BUG-###.md`,必须包含:

```markdown
## 现象与期望      ← 问题和对应Spec
## 复现方式        ← 可复现步骤
## 根因证据        ← 代码位置+原因
## 修复内容        ← 最小修改
## 新鲜验证结果    ← 重新运行测试的输出
```

直接编辑 frontmatter `status` 为 `resolved`(fix 文档在脚本中无合法迁移路径,文档是事实源)。

## Handoff Rule

修复完成且验证通过→`verify-plan`(回归验收)或 `status`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先改了再找根因" | 没根因=同类问题重复出现 |
| "顺手做小需求" | Bug 修复不是增强入口 |
| "回归测试省掉" | 小改动一样破坏已有行为 |
