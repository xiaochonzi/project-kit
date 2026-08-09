---
name: blueprint
description: Use when you have accepted REQs that need a system architecture — capability map, module boundaries, data flows, cross-module constraints. Use after brief has produced confirmed requirements. If no accepted REQs exist, use brief first.
---

# Blueprint

## Overview

根据 brief 产出的已接受 REQ,建立系统能力地图和模块边界,写入 `docs/blueprint.md`(init 已生成 12 章节骨架)。

**Blueprint 回答**:系统由哪些能力组成?模块怎么划?数据怎么流?什么明确不做?

**不回答**:交付顺序(roadmap)、功能验收标准(refine)、怎么实现(plan)。

**开始前宣布:** "我正在使用 blueprint 技能和您一起设计系统架构。"

## The Iron Law

```
NO ARCHITECTURE FROM UNVERIFIED REQUIREMENTS
```

**Violating the letter of this rule is violating the spirit of system design.** 没有 accepted REQ→路由回 brief,不基于未确认需求建架构。Blueprint 不写实现细节,不写交付顺序。

## Required Inputs(不满足即停止)

- [ ] `docs/requirements.md` 存在且含 accepted REQ。无 → 路由到 brief
- [ ] `docs/` 已初始化。无 → 路由到 init

## 已存在的 Blueprint

`docs/blueprint.md` 可能有两种状态:

- **init 骨架**(`{{DATE}}` 残留或章节空):首次建 Blueprint → 场景 A
- **已有内容**(章节已填写):增量更新 → 场景 B

场景 B 必须:
- 读当前 Blueprint 全文
- 确认用户要改哪些章节,不全局重写
- 更新相关章节后在修订记录中追加条目(注明来源:CR 或新 Brief)

## 产物契约(docs/blueprint.md)

必须填写以下章节(全部填写,禁止留空):

```markdown
## 背景与目标       ← 一句话:这系统解决什么问题
## 非目标           ← 明确不做的事(比如"不做多设备同步")
## 用户与核心场景   ← 谁用、最重要的 2-3 个场景
## 成功标准         ← 系统级的可验证标准(不是单功能验收)
## 系统能力地图     ← 顶层能力分组,每项一行("采集系统: URL/微信/X采集")
## 模块与职责边界   ← 每个模块:职责/对外接口/数据所有权/失败边界
## 核心数据流       ← 从用户操作到数据落盘,经过哪些模块(文字或 ASCII)
## 外部系统边界     ← 与外部系统的交互(API/文件/消息队列)
## 数据权威         ← 每份数据的唯一来源(哪个模块写、谁只读)
## 跨模块约束       ← 如"命令层不得直读文件""renderer 禁止访问 Node API"
## 非功能要求       ← 性能/安全/可靠性(可验证的表达,不含糊)
## 风险与假设       ← 当前假设和潜在风险
## 未决问题         ← 仍未决定的架构问题
## 修订记录         ← 每次变更的日期、内容、来源(Brief/CR)
```

**Blueprint 不包含**:文件级实现路径、单功能验收标准、开发任务列表、远期功能详细设计。

## Process

### Step 1: 读 accepted REQ

```bash
node scripts/project-docs.cjs coverage --root <项目根>
```

确认 accepted REQ 均有来源(可追溯到 Brief)。只处理 `status: accepted` 的 REQ,**不碰 proposed/deferred**。

### Step 2: 能力地图

把 accepted REQ 归入顶层能力分组。这是一个**聚合**过程——不是每条 REQ 一个能力,而是 REQ 可以归入同一个能力组:

```text
采集系统
├── REQ-001 URL 采集
├── REQ-002 微信采集
└── REQ-003 X/Twitter 采集

知识编译
├── REQ-004 内容标准化
├── REQ-005 去重
└── REQ-006 Wiki 页面生成
```

和用户对话确认:**一次讨论一个能力群**。如果某个 REQ 无法归入任何现有能力群 → 可能是新能力群,或需要拆成更多 REQ。

### Step 3: 模块边界

基于能力地图,定义模块:

- **职责**:一句话,这个模块干什么
- **对外接口**:其他模块怎么调用它(函数/API/事件,不写具体签名)
- **数据所有权**:这个模块写哪些数据?哪些模块只读?
- **失败边界**:这个模块挂了,影响什么?什么不受影响?

**模块边界判断标准**(来自 lifecycle 6.2):
- 数据所有权:谁拥有这份数据的生命周期?
- 用户流程职责:谁负责这段用户流程?
- 生命周期:谁和谁一起启动/停止?
- 失败边界:谁的失败不影响谁?

### Step 4: 核心数据流

画出 2-3 条核心数据流(不是全部,是最重要的):

```text
用户操作 → UI → IPC → Service → Repository → 文件系统
                      ↓
                   验证失败 → 错误展示
```

### Step 5: 跨模块约束

列长期有效的跨模块约束,每条可验证:

- "命令层不得直接读写文件,必须经 Repository"
- "Renderer 禁止访问 Node API"
- "数据库迁移只能前向执行"

### Step 6: 写入 blueprint.md

把确认的内容填入对应章节。首次建 Blueprint 时 `source` 引用 BRIEF-###。更新时修订记录注明来源(CR-### 或新 Brief)。

### Step 7: 校验与自审

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error
- [ ] Blueprint 的 `source` 字段引用了 Brief 或 CR
- [ ] 所有 accepted REQ 被归入至少一个能力群

**自审**(对照原文,修后不重审):

1. **占位符扫描**:有 "TBD"、"TODO"、空章节?修复
2. **与 REQ 一致性**:能力地图覆盖所有 accepted REQ 了吗?多出来的能力有 REQ 支撑吗?
3. **模块边界完整**:每个模块能回答职责/接口/数据所有权/失败边界吗?
4. **歧义检查**:约束可以被两种方式理解吗?

## 场景路由

| 场景 | 处理 |
|---|---|
| **无 accepted REQ** | 路由到 brief |
| **首次建 Blueprint** | 正常 7 步流程 |
| **更新已有 Blueprint** | 读当前版→确认变更章节→更新→修订记录注明来源 |
| **产品/架构根本变化** | 归档旧 Blueprint(如 `blueprint-v1.md`),建新的。普通功能增加不换版本号 |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| validate 校验结构+source 引用 | 读 REQ,合成能力地图 |
| — | 划模块边界(对话确认,用户说了算) |
| — | 画数据流,定跨模块约束 |
| — | **禁止**:无 accepted REQ 就写 Blueprint、写实现细节、写交付顺序 |

## Handoff Rule

Blueprint 确认后 → `roadmap`(拆可交付 Milestones)。本技能不写 Roadmap。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "REQ 够了,直接写 plan 吧" | 没有 Blueprint,plan 没有模块边界和约束可依 |
| "把 Roadmap 也一起写了吧" | Blueprint 是系统形态,Roadmap 是交付顺序——先定边界再排顺序 |
| "每条 REQ 都当一个模块" | 模块是稳定的架构单元,REQ 是功能的原子——不 1:1 映射 |
| "这次改动小,不更新 Blueprint 了" | 不更新→下次 AI 读到的是过时的系统形态 |
