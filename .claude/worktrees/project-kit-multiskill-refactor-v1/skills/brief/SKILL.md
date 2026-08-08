---
name: brief
description: Use when receiving a large raw requirement or fuzzy idea that needs to become structured requirements — a big document, a discussion transcript, an unclear feature request. If the requirement is already an approved Feature Spec, use plan.
---

# Brief

## Overview

把原始讨论/大文档逐层转化为:`docs/briefs/BRIEF-###.md`(原始输入,不可变)→ `docs/requirements.md`(原子需求)→ `docs/blueprint.md`(系统边界)→ `docs/roadmap.md`(交付顺序)。**本技能只做拆解与确认,不生成代码计划。**

**开始前宣布:** "我正在使用 brief 技能拆解需求。"

## Required Inputs

- [ ] 已读取原始需求(文档路径或讨论内容)
- [ ] 已读取 `docs/constitution.md` 与 `docs/blueprint.md`(若存在)

## Process

### Step 1: 创建 Brief(保存原始输入)

```bash
node scripts/project-docs.cjs new brief --title <标题> --source <原始需求文件> --root <项目根>
```

生成 `docs/briefs/BRIEF-###.md`,包含:背景 / 想解决的问题 / 目标用户与场景 / 初步能力设想 / 已知约束 / 假设 / 未决问题 / 明确不做的内容。

**Brief 确认后正文不再改写**(只允许修正错别字与失效链接),后续变化走 change 技能。

### Step 2: 结构化审计(不立即补全缺失信息)

把 Brief 内容分类为:

1. 产品目标
2. 用户和场景
3. 功能能力
4. 业务规则
5. 数据和接口约束
6. 非功能要求
7. 假设(未经确认)
8. 未决问题(需要用户决定)
9. 明确不做的内容

同时识别:重复表述、相互矛盾的要求、一个句子里混多个需求、无法验收的模糊要求、被技术方案掩盖的真实用户需求。

### Step 3: 形成原子 Requirements(逐条让用户确认)

在 `docs/requirements.md` 中,每条需求一个条目:

```markdown
### REQ-001: 用户可以导入微信公众号链接
- status: accepted
- source: BRIEF-001
- milestones: [M1]
- features: [F-M1-01]
```

规则:

- 一条需求只表达一项可判断的能力或约束
- 用"必须/可以/不得"等可验证表达,禁止"体验良好""功能完善"
- 每条确认的需求让用户判定:必须(Must)/应该(Should)/以后(Later)、第一版是否包含、如何判断已满足
- 未确认的 → `proposed` 或 `deferred`,不得以 accepted 进入后续设计
- 技术方案不是产品需求,除非它是不可变约束
- **AI 不替用户补产品决定** —— 改变目标、范围、用户行为或数据边界的未决问题必须暂停让用户决定

### Step 4: 形成 Blueprint(docs/blueprint.md)

根据已接受 Requirements 建立系统能力地图和模块边界:

- 产品目标和成功标准
- 用户与核心使用场景
- 系统能力地图
- 模块职责和边界
- 核心数据流
- 跨模块约束和非功能要求
- 明确不做的内容
- 仍未决定的问题

### Step 5: 形成 Roadmap(docs/roadmap.md)

把 Blueprint 拆成可交付 Milestones,每个 Milestone 是一个**可验收的系统状态**:

```text
M1: 用户可以创建工作区并安全保存文件
M2: 用户可以导入并归档一篇来源
M3: 系统可以把来源编译为带引用的 Wiki 页面
```

每个 Milestone 标记:`planned / active / completed / deferred`,注明依赖与文档链接。

### Step 6: 只细化当前 Milestone

仅为当前或下一个 Milestone 生成 Feature Map 与 Feature Specs;远期保持粗粒度(→ 交给 refine)。

## Stop Conditions

- 阻断性未决问题未解决(会改变目标/范围/边界)
- 需求相互矛盾且用户未裁决
- 无法把模糊输入拆成原子需求

## Validation Checklist

- [ ] `validate --root <项目根>` 无 error
- [ ] `coverage --root <项目根>` 显示 accepted REQ 均有 Milestone/Feature 双向映射(未细化阶段可标 deferred)
- [ ] 事实、假设、候选方案、未决问题已分开,无未确认需求以 accepted 进入

## Handoff Rule

拆解确认后,细化当前 Milestone/Feature → `refine`。不要在本技能中写 Plan。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先写个 plan 再说" | 没有需求边界,plan 只是把猜测结构化 |
| "这个功能很明显,不用拆 REQ" | 没有稳定 ID 无法追踪交付 |
| "远期功能一起细化" | 过早细化制造大量失效文档 |
| "用户没确认的,我先当确认处理" | AI 不替用户做产品决定,未决问题必须暂停 |
