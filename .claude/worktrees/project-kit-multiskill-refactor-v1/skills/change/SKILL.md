---
name: change
description: Use when receiving a new requirement, scope change, or enhancement after the initial blueprint — anything that modifies an existing project's boundaries. If it's a defect against an approved Spec, use bug instead.
---

# Change

## Overview

接收蓝图形成后的新需求,先记录影响与决策,不直接生成代码计划。**新需求不得直接插入当前 Plan 或改写已完成 Spec。**

**开始前宣布:** "我正在使用 change 技能处理变更请求。"

## Required Inputs

- [ ] 已读取 `docs/STATE.md`(当前焦点)与相关 Feature Spec
- [ ] 已判断:是 Bug、增强、大型能力还是架构变化

## Process

### Step 1: 判断需求类型

| 类型 | 判断 | 处理 |
| --- | --- | --- |
| Bug | 实现违反已批准 Spec | 转 bug |
| 小型增强 | 新增一个边界独立的用户能力 | 新 Feature Spec |
| 大型能力 | 需要多个迭代形成 | 一个 CR + 多个 Milestone |
| 架构变化 | 改变跨模块约束或系统基本形态 | CR + Blueprint 更新 + Roadmap 调整 |
| 补充澄清 | 不改变已批准功能语义 | 更新未完成 Spec 并重新评审 |

### Step 2: 创建 Change Request

```bash
node scripts/project-docs.cjs new change --title <变更标题> --root <项目根>
```

生成 `docs/changes/CR-###.md`,必须包含(脚本校验章节):

```markdown
## 需求来源
## 当前问题
## 期望结果
## 与现有能力的关系
## 可能影响的模块和文档
## 初步规模
## 优先级建议
## 未决问题
## 处理结论
```

### Step 3: 影响分析

- 与现有 Blueprint、Milestone、Feature 的关系
- 受影响的模块、文档、REQ
- 需要一个 Feature、一个新 Milestone,还是拆成多个
- 应进入 Active / Next / Later / Deferred / Rejected

**跨模块长期约束 → 更新 Blueprint;只影响一个功能 → 写入对应 Feature Spec。**

### Step 4: 用户决策

把 CR 与影响分析呈现给用户,获得明确结论:

- 接受 → 映射到现有 Milestone 的新 Feature / 创建新 Milestone / 拆多个 Milestone
- Deferred / Rejected(记录原因)

```bash
node scripts/project-docs.cjs transition CR-### --to accepted --root <项目根>
```

### Step 5: 落位

- 接受 → 按结论创建新 Feature(`refine`)或新 Milestone
- 更新 `docs/requirements.md`(新 REQ 或状态变化)与追踪关系
- 更新 `docs/STATE.md`

## Stop Conditions

- 无法判断是 Bug 还是新需求
- 变更会改写已验证功能契约但未获用户批准
- 影响范围超出已知架构边界且需用户决定

## Validation Checklist

- [ ] `validate --root <项目根>` 无 error
- [ ] `coverage` 通过:accepted REQ 均有映射
- [ ] 未静默修改已 verified 的 Spec

## Handoff Rule

CR accepted 后 → 按结论进入 `refine`(新 Feature)或 `plan`;判断为 Bug → `bug`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "需求小,直接塞进当前 Plan" | 破坏当前迭代范围和验收边界 |
| "改一下旧 Spec 就好" | 已完成/已验证契约不能静默扩写 |
| "用户顺口一提,不用记录" | 未记录的变化是范围漂移的根源 |
