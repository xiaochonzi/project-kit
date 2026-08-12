---
name: roadmap
description: Use when you have a confirmed Blueprint and need to plan the delivery — splitting system capabilities into phases with task lists recorded in roadmap.md. Use after blueprint has produced the system architecture. If no Blueprint exists, use blueprint first.
---

# Roadmap

## Overview

把 Blueprint 系统能力拆成可交付阶段,写入 `docs/roadmap.md`(init 已生成骨架)。

**Roadmap 回答**:分几个阶段?每个阶段做哪几个任务?各任务完成情况?

**Roadmap 是静态规划文档**——保存阶段与任务清单。**动态状态(当前在做哪个阶段/任务、下一步做什么)不属于 roadmap,归 `docs/STATE.md` 的 `active_change` / `next_action`。**

**开始前宣布:** "我正在使用 roadmap 技能和您一起规划交付路线。"

## The Iron Law

```
ROADMAP PLANS — STATE TRACKS — NO ACTIVE/NEXT IN ROADMAP
```

**Violating the letter of this rule is violating the spirit of delivery planning.** Roadmap 只保存阶段与任务的规划事实,不写"当前进行中"的动态状态——那是 STATE.md 的职责。不按技术层横向拆分。不做远期详细设计。

## Required Inputs(不满足即停止)

- [ ] `docs/blueprint.md` 存在且章节已填写(非 init 骨架)。无或为空骨架 → 路由到 blueprint
- [ ] `docs/` 已初始化

## 产物契约(docs/roadmap.md)

必须按以下分区填写:

```markdown
## 排序原则       ← 为什么是这个顺序(用户价值/技术依赖/风险)
## 阶段一:<名称>   ← 每个阶段一个分区,含任务清单
### 任务         ← 该阶段要做的任务,一行一个,checkbox 标记完成情况
## 阶段二:<名称>
### 任务
## 依赖与风险     ← 跨阶段的依赖和风险
## 修订记录       ← 每次变更的日期与来源
```

任务行格式:

```text
- [ ] CR-001 支持按标签筛选待办
- [ ] (规划中) 导入来源内容     ← change 创建后补上 CR-###
```

- 任务 = 一个 change(Full 三件套或 Quick)。阶段规划时 change 可能尚未创建,先写任务描述,创建后补充 CR-###。
- **完成情况 = checkbox**:`- [x]` 已完成(change completed),`- [ ]` 未完成。
- **没有 Active/Next/Later 分区**——当前进行中的阶段/任务由 `STATE.md` 的 `active_change` / `next_action` 承担。

## 阶段设计原则

### 纵向切片,不横向

**好**(每个阶段是可验收的系统状态):

```text
阶段一: 用户可以创建并保存工作区文件
阶段二: 用户可以采集并归档一个来源
阶段三: 系统可以把来源编译为 Wiki 页面
```

**坏**(按技术层拆,很长时间没有可验收成果):

```text
阶段一: 建数据库
阶段二: 写 Service 层
阶段三: 写 UI
阶段四: 补测试
```

### 排序依据

1. **用户价值**:最早交付最有用的能力
2. **技术依赖**:被依赖的先做
3. **最大风险与未知**:风险高的先验证
4. **最小闭环**:第一个阶段就能形成可演示的完整流程
5. **后续返工成本**:先做返工成本低的

### 只细化当前

- 当前阶段:具体任务清单(每项一行)
- 后续阶段:一句话方向 + 任务占位(如"- [ ] (规划中) 待细化"),不细化——避免过早细化制造大量失效文档

## Process

### Step 1: 读 Blueprint

读 `docs/blueprint.md`,重点关注:**系统能力地图**、**模块边界**、**非目标**、**未决问题**。这些直接决定阶段的边界。

### Step 2: 和用户对话确认排序

一次讨论一个阶段。先问:第一个可交付的系统状态应该是什么?

从 Blueprint 的能力地图出发,和用户逐一确认:

- 这个阶段产出什么?(一句话,可验证的系统状态)
- 为什么是第一个?(用户价值/技术依赖/风险?)
- 这个阶段做哪几个任务?(每项可独立验收)
- 依赖哪些前置条件?

### Step 3: 远期阶段

列出后续阶段(每个一句话 + 任务占位),不细化任务细节。

### Step 4: 写入 roadmap.md

按产物契约填写:排序原则 / 阶段分区(含任务 checkbox 清单)/ 依赖与风险 / 修订记录。任务行标注 change ID(已创建)或"(规划中)"(未创建)。

### Step 5: 创建当前阶段首个 change

当前阶段准备开发时,通过 `change` 技能创建任务对应的 change。任务完成时(change completed)把 checkbox 标记为 `- [x]`,并在 `STATE.md` 更新 `active_change` / `next_action`。

### Step 6: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error
- [ ] 所有阶段有明确任务清单(可含规划占位)
- [ ] 未按技术层横向拆分
- [ ] 无 Active/Next/Later 分区(动态状态在 STATE)
- [ ] 后续阶段保持粗粒度

## 场景路由

| 场景 | 处理 |
|---|---|
| **无 Blueprint 或为空骨架** | 路由到 blueprint |
| **首次排 Roadmap** | 正常流程 |
| **调整优先级/新增阶段** | 读当前 Roadmap→确认变更→更新→修订记录 |
| **任务完成** | 由 verify 技能勾选 checkbox,更新 STATE |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| init 生成 roadmap.md 骨架 | 读 Blueprint,排阶段与任务 |
| validate 校验 | 和用户对话确认优先级与边界 |
| — | **禁止**:写实现细节、横向拆分、细化远期、写动态状态(Active/Next) |

## Handoff Rule

Roadmap 确认后 → `change`(创建当前阶段首个任务)。本技能不写实现细节。

## Common Rationalizations

| 借口 | 现实 |
|---|---|
| "先 M1 建表,M2 写后端,M3 写 UI" | 横向拆分=很长时间无可验收成果,按用户价值纵向切 |
| "把每个任务的实现细节也写了吧" | Roadmap 只保存阶段与任务一行,细节由 change 三件套承接 |
| "加个 Active 分区标当前进度" | 动态状态属于 STATE.md,roadmap 只存规划事实 |
| "远期也细化掉效率高" | 过早细化=大量失效文档=返工成本 |
