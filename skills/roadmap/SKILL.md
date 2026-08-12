---
name: roadmap
description: Use when you have a confirmed Blueprint and need to define the delivery sequence — splitting system capabilities into phased, verifiable stages recorded in roadmap.md. Use after blueprint has produced the system architecture. If no Blueprint exists, use blueprint first.
---

# Roadmap

## Overview

把 Blueprint 系统能力拆成可交付阶段,写入 `docs/roadmap.md`(init 已生成骨架)。

**Roadmap 回答**:先做什么、后做什么、每个阶段产出什么可验证的系统状态?

**不回答**:每个功能怎么实现(plan)、每个需求的细节(change)。阶段详细范围由承接该阶段的 change 承载——Roadmap 只保存一行摘要+状态+链接。

**开始前宣布:** "我正在使用 roadmap 技能和您一起规划交付顺序。"

## The Iron Law

```
VERTICAL SLICING ONLY — NO TECHNICAL-LAYER PHASES
```

**Violating the letter of this rule is violating the spirit of delivery planning.** 不按技术层横向拆分。不做远期详细设计。不创建独立 milestone 文档——阶段细节在 change 中。

## Required Inputs(不满足即停止)

- [ ] `docs/blueprint.md` 存在且章节已填写(非 init 骨架)。无或为空骨架 → 路由到 blueprint
- [ ] `docs/` 已初始化

## 产物契约(docs/roadmap.md)

必须按以下分区填写:

```markdown
## 排序原则       ← 为什么是这个顺序(用户价值/技术依赖/风险)
## Active         ← 当前正在实施的阶段(≤2 个)
## Next           ← 已批准且依赖基本具备(≤2 个)
## Later          ← 方向已接受但未细化(不限数量)
## Completed      ← 已完成验收的阶段
## Deferred       ← 明确暂缓的
## 依赖与风险     ← 跨阶段的依赖和风险
## 修订记录       ← 每次变更的日期与来源
```

每个阶段**只写一行摘要**,状态与链接指向承接的 change:

```text
M1: 用户可以创建工作区并安全保存文件 — status: active, changes: CR-001
M2: 用户可以导入并归档一篇来源 — status: next, depends: M1, changes: (规划中)
M3: 系统可以把来源编译为带引用的 Wiki 页面 — status: later, depends: M2
```

**没有独立 milestone 文档**——阶段细节(目标/边界/Feature 拆解)由承接该阶段的 change 三件套承担。多迭代大能力:在 roadmap 列出阶段,每阶段一个或多个 change 承接。

## 阶段设计原则

### 纵向切片,不横向

**好**(每个阶段是可验收的系统状态):

```text
M1: 用户可以创建并保存工作区文件
M2: 用户可以采集并归档一个来源
M3: 系统可以把来源编译为 Wiki 页面
```

**坏**(按技术层拆,很长时间没有可验收成果):

```text
M1: 建数据库
M2: 写 Service 层
M3: 写 UI
M4: 补测试
```

### 排序依据

1. **用户价值**:最早交付最有用的能力
2. **技术依赖**:被依赖的先做
3. **最大风险与未知**:风险高的先验证
4. **最小闭环**:第一个阶段就能形成可演示的完整流程
5. **后续返工成本**:先做返工成本低的

### 只细化当前

- 当前阶段:具体摘要+明确依赖+承接 change
- Next:方向已定,边界基本清楚
- Later:一句话方向即可,不细化——避免过早细化制造大量失效文档

## Process

### Step 1: 读 Blueprint

读 `docs/blueprint.md`,重点关注:**系统能力地图**、**模块边界**、**非目标**、**未决问题**。这些直接决定阶段的边界。

### Step 2: 和用户对话确认排序

一次讨论一个阶段。先问:第一个可交付的系统状态应该是什么?

从 Blueprint 的能力地图出发,和用户逐一确认:

- 这个阶段产出什么?(一句话,可验证的系统状态)
- 为什么是第一个?(用户价值/技术依赖/风险?)
- 包含什么?明确不包含什么?(阻止阶段膨胀)
- 依赖哪些前置条件?

### Step 3: 远期阶段

列出后续阶段(每个一句话),标记 Next/Later。远期保持粗粒度——不写包含/不包含。

### Step 4: 写入 roadmap.md

按产物契约的分区填写。每个阶段一行,状态明确,链接指向承接的 change(如有)。修订记录注明来源(Blueprint)。

### Step 5: 创建当前阶段首个 change

当前 Active 阶段准备开发时,通过 `change` 技能创建承接该阶段的需求(Full 三件套或 Quick)。Roadmap 的 Active 状态由 change 完成情况驱动更新。

### Step 6: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error
- [ ] 所有 Active/Next 阶段有明确依赖
- [ ] 未按技术层横向拆分
- [ ] 远期(Later)保持粗粒度(每项一句话)

## 场景路由

| 场景 | 处理 |
|---|---|
| **无 Blueprint 或为空骨架** | 路由到 blueprint |
| **首次排 Roadmap** | 正常流程 |
| **调整优先级/新增阶段** | 读当前 Roadmap→确认变更→更新→修订记录 |
| **阶段完成** | 由 verify 技能更新 Roadmap 状态→Completed |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| init 生成 roadmap.md 骨架 | 读 Blueprint,排顺序 |
| validate 校验 | 和用户对话确认优先级与边界 |
| — | **禁止**:写实现细节、横向拆分、细化远期、创建独立 milestone 文档 |

## Handoff Rule

Roadmap 确认后 → `change`(为当前阶段创建需求)。本技能不写实现细节。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先 M1 建表,M2 写后端,M3 写 UI" | 横向拆分=很长时间无可验收成果,按用户价值纵向切 |
| "把每个阶段的 Feature 拆解也写了吧" | Roadmap 只保存一行摘要,细节由 change 三件套承接 |
| "远期也细化掉效率高" | 过早细化=大量失效文档=返工成本 |
| "建个 milestone 文档记录细节" | 没有独立 milestone 文档——细节在 change 里 |
