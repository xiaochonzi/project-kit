---
name: roadmap
description: Use when you have a confirmed Blueprint and need to define the delivery sequence — breaking system capabilities into phased, verifiable milestones. Use after blueprint has produced the system architecture. If no Blueprint exists, use blueprint first.
---

# Roadmap

## Overview

把 Blueprint 系统能力拆成可交付 Milestones,写入 `docs/roadmap.md`(init 已生成骨架)。

**Roadmap 回答**:先做什么、后做什么、每个阶段产出什么可验证的系统状态?

**不回答**:每个阶段包含哪些 Feature(refine)、每个功能怎么实现(plan)。阶段详细范围放在 Milestone 文档中,Roadmap 只保存摘要+状态+依赖+文档链接。

**开始前宣布:** "我正在使用 roadmap 技能和您一起规划交付顺序。"

## The Iron Law

```
VERTICAL SLICING ONLY — NO TECHNICAL-LAYER PHASES
```

**Violating the letter of this rule is violating the spirit of delivery planning.** 不按技术层横向拆分。不写 Feature 验收标准。不做远期详细设计。

## Required Inputs(不满足即停止)

- [ ] `docs/blueprint.md` 存在且章节已填写(非 init 骨架)。无或为空骨架 → 路由到 blueprint
- [ ] `docs/` 已初始化

## 产物契约(docs/roadmap.md)

必须按以下分区填写:

```markdown
## 排序原则       ← 为什么是这个顺序(用户价值/技术依赖/风险)
## Active         ← 当前正在实施的 Milestone(≤2 个)
## Next           ← 已批准且依赖基本具备(≤2 个)
## Later          ← 方向已接受但未细化(不限数量)
## Completed      ← 已完成验收的 Milestone
## Deferred       ← 明确暂缓的
## 依赖与风险     ← 跨阶段的依赖和风险
## 修订记录       ← 每次变更的日期与来源
```

每个 Milestone 在 Roadmap 中**只写一行摘要**:

```text
M1: 用户可以创建工作区并安全保存文件 — status: active, depends: none
M2: 用户可以导入并归档一篇来源 — status: next, depends: M1
M3: 系统可以把来源编译为带引用的 Wiki 页面 — status: later, depends: M2
```

详细范围(包含/不包含/Feature Map/退出标准)写在 `docs/milestones/M#.md` 中——那是 refine 的事。

## Milestone 设计原则

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

综合考虑以下因素决定优先级:

1. **用户价值**:最早交付最有用的能力
2. **技术依赖**:被依赖的先做
3. **最大风险与未知**:风险高的先验证
4. **最小闭环**:第一个 Milestone 就能形成可演示的完整流程
5. **后续返工成本**:先做返工成本低的(不确定的先推迟)

基础设施可以成为阶段内容,但每个阶段仍服务于一个可验证结果,不要罗列技术组件。

### 只细化当前

- 当前 Milestone:具体摘要+明确依赖
- Next:方向已定,边界基本清楚
- Later:一句话方向即可,不细化——避免过早细化制造大量失效文档

## Process

### Step 1: 读 Blueprint

读 `docs/blueprint.md`,重点关注:**系统能力地图**(有哪些能力群)、**模块边界**(哪些模块)、**非目标**(哪些不做)、**未决问题**(哪些没定)。这些直接决定 Milestone 的边界。

### Step 2: 和用户对话确认排序

一次讨论一个 Milestone。先问:第一个可交付的系统状态应该是什么?

从 Blueprint 的能力地图出发,和用户逐一确认:

- 这个阶段产出什么?(一句话,可验证的系统状态)
- 为什么是第一个?(用户价值/技术依赖/风险?)
- 包含什么?明确不包含什么?(阻止阶段膨胀)
- 依赖哪些前置条件?(技术、决策、其他 Milestone)

确认后写进 Roadmap。第一个 Milestone 通常进 Active,后续进 Next 或 Later。

### Step 3: 远期 Milestones

列出后续 Milestone(每个一句话),标记 Next/Later。远期保持粗粒度——不写包含/不包含,不列 Feature。

### Step 4: 写入 roadmap.md

```bash
# roadmap.md 是 init 生成的,直接编辑填写
```

按产物契约的 8 个分区填写。Active/Next/Later 每个 Milestone 一行。修订记录注明来源(Blueprint)。

### Step 5: 创建当前 Milestone 文档骨架(可选)

如果当前 Active Milestone 明确,可以用脚本创建骨架:

```bash
node scripts/project-docs.cjs new milestone --title <阶段目标> --root <项目根>
```

但详细内容(Feature Map、退出标准)是 refine 的事——本技能只建骨架,不填内容。

### Step 6: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error
- [ ] 所有 Active/Next Milestone 有明确依赖
- [ ] 未按技术层横向拆分
- [ ] 远期(Later)保持粗粒度(每项一句话)

## 场景路由

| 场景 | 处理 |
|---|---|
| **无 Blueprint 或为空骨架** | 路由到 blueprint |
| **首次排 Roadmap** | 正常 6 步流程 |
| **调整优先级/新增阶段** | 读当前 Roadmap→确认变更→更新→修订记录 |
| **里程碑完成** | 由 verify 技能更新 Roadmap 状态→Completed |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| init 生成 roadmap.md 骨架 | 读 Blueprint,排顺序 |
| new milestone 创建骨架 | 和用户对话确认优先级 |
| validate 校验 | 确认每个 Milestone 边界 |
| — | **禁止**:写 Feature 细节、写实现计划、横向拆分、细化远期 |

## Handoff Rule

Roadmap 确认后→`refine`(细化当前 Milestone 的 Feature Map 和 Feature Specs)。本技能不写 Feature。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先 M1 建表,M2 写后端,M3 写 UI" | 横向拆分=很长时间无可验收成果,按用户价值纵向切 |
| "把 Feature Map 也写了吧" | Roadmap 只保存阶段摘要,详细范围在 Milestone 文档中 |
| "远期也细化掉效率高" | 过早细化=大量失效文档=返工成本 |
| "所有功能都放 M1" | 每个阶段是可验收闭环,不是"全都要" |
