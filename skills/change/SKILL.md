---
name: change
description: Use when receiving a new requirement, scope change, or enhancement after the initial blueprint — anything that modifies an existing project's boundaries. If it's a defect against an approved Spec, use bug instead.
---

# Change

## Overview

接收蓝图形成后的新需求,先记录影响与决策,不直接生成代码。**新需求不得直接插入当前 Plan 或改写已完成 Spec。**

**开始前宣布:** "我正在使用 change 技能处理变更请求。"

<HARD-GATE>
不清不楚的需求不创建 Plan。不静默修改已 verified 的 Spec 语义。
</HARD-GATE>

## 需求分类(先判断再处理)

| 类型 | 判断 | 处理 |
|---|---|---|
| Bug | 实现违反已批准 Spec | 转 bug |
| 小型增强 | 边界独立的用户能力 | 新 Feature Spec |
| 大型能力 | 需多迭代 | CR + 多个 Milestone |
| 架构变化 | 改跨模块约束 | CR + Blueprint 更新 + Roadmap 调整 |
| 补充澄清 | 不改变已批准功能语义 | 更新未完成 Spec 并重新评审 |

## Process

### Step 1: 判断类型

按上表分类。拿不准→问用户,不猜。

### Step 2: 创建 Change Request

```bash
node scripts/project-docs.cjs new change --title <变更标题> --root <项目根>
```

生成 `docs/changes/CR-###.md`,填写:

- 需求来源(谁提出的/为什么)
- 当前问题(现状和不足)
- 期望结果
- 与现有能力的关系(依赖/冲突/扩展)
- 可能影响的模块和文档
- 初步规模(小/中/大/多迭代)
- 优先级建议(must/should/later)
- 未决问题

### Step 3: 影响分析

- 影响哪些现有 Milestone/Feature/REQ?
- 是否改变 Blueprint(模块边界/跨模块约束)?
- 是否需要新 ADR?

### Step 4: 用户决策

把 CR + 影响分析呈现给用户,得到明确结论:

- **Accepted**→ 映射到现有 Milestone 的新 Feature / 新 Milestone / 多 Milestone 拆解
- **Deferred**(记录原因)
- **Rejected**(记录原因)

```bash
node scripts/project-docs.cjs transition CR-### --to accepted --root <项目根>
```

### Step 5: 落位与追踪

- 接受→按结论创建新 Feature(`refine`)或新 Milestone
- 更新 `docs/requirements.md`(新 REQ)和追踪关系
- 更新 `docs/STATE.md`
- 跨模块长期约束→更新 Blueprint,在修订记录引用 CR

## 场景路由

| 场景 | 处理 |
|---|---|
| **Bug(实现违反 Spec)** | 转 bug |
| **Spec 仍是 draft** | 直接整合;不创建 CR |
| **Spec approved 但未开发** | 澄清→更新并重新批准;新增能力→新 Feature |
| **Feature 正在开发** | 默认不插入当前 Plan;先 CR→决定当前/Next/Later |
| **Feature 已 verified** | 不修改旧 Spec 语义;新 Feature,用 depends_on/extends/supersedes |
| **架构变化** | CR + Blueprint 更新 + Roadmap 调整 |

## Handoff Rule

CR accepted 后→按结论进入 `refine`(新 Feature) 或 `blueprint`(架构调整)。判断为 Bug→`bug`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "需求小,直接塞当前 Plan" | 破坏当前迭代范围和验收边界 |
| "改一下旧 Spec 就好" | 已完成/已验证契约不能静默扩写 |
| "用户顺口一提,不用记录" | 未记录的变化是范围漂移的根源 |
