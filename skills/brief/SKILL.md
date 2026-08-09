---
name: brief
description: Use when receiving a fuzzy idea, raw requirement, or design discussion that needs to become a structured Brief with atomic Requirements. Use even for "help me figure out what to build" or "let's clarify this idea". If the requirement is already an approved Feature Spec, use plan.
---

# Brief

## Overview

通过自然协作对话,把一个模糊想法变成两份可追溯的文档:

- `docs/briefs/BRIEF-###.md` — 原始输入,固化后不可改写
- `docs/requirements.md` — 原子 REQ,每条都经过用户确认

**不产出**:Blueprint、Roadmap、Feature Spec、Implementation Plan——这些是后续技能的职责。

<HARD-GATE>
本技能不写任何代码,不生成任何实现计划,不替用户做产品决定。遇到会改变目标、范围、用户行为或数据边界的未决问题——暂停,让用户决定。
</HARD-GATE>

## Anti-Pattern: "这个需求很清楚,直接写代码吧"

即使看起来简单到不需要设计,仍然走完 Brief → REQ 流程。"简单"项目是未检视的假设造成最多返工的地方。Brief 可以短(几段话),但必须存在。

## Checklist

按顺序完成,不跳:

1. **探查项目上下文** — 检查已有 `docs/`、现有 Blueprint、Roadmap
2. **范围检查** — 多独立系统?立刻提出拆分,不追问细节
3. **对话展开** — 一次一个问题,理解目的/约束/成功标准
4. **固化 Brief** — 写入 `docs/briefs/BRIEF-###.md`,区分事实/假设/候选/未决
5. **结构化审计** — 分 9 类,识别重复、矛盾、模糊、缺失
6. **逐条 REQ 确认** — 每条 REQ 和用户确认优先级与范围
7. **Brief 自审** — 占位符、一致性、范围、歧义(修复后重审)
8. **用户审阅 Brief** — 用户确认后再进入下一步

## Process

### 1. 探查项目上下文

先了解现状,再提问:

- 读取 `docs/STATE.md`,了解当前焦点
- 检查是否已有 `docs/blueprint.md`、`docs/roadmap.md`、`docs/requirements.md`
- 如已有 REQ → 识别为增量追加,新 REQ 不静默改旧的

### 2. 范围检查(先于细节提问)

如果原始输入描述多个独立子系统(如"重建平台:用户系统+内容系统+支付系统+数据平台+运营后台"),**立刻提出拆分,不问细节**:

> 这里包含了 5 个相互独立的系统。建议每个独立做 brief,各自走后续流程。你希望先做哪个?

不要在需要拆分的问题上花时间追问细节。每个子系统独立 brief → blueprint → roadmap → refine。

### 3. 对话展开(一次一个问题)

一次只问一个问题,倾向给选项:

> 好的——不是"你有什么需求?"。

> 坏的:"你要什么功能?什么技术栈?什么用户?什么约束?"

理解三件事:目的(为什么做)、约束(什么不能违反)、成功标准(怎样算做好了)。

讨论中**必须标注每条陈述的标签**:

| 标签 | 含义 |
|---|---|
| **用户确认** | 用户明确确认的目标/事实 |
| **AI 候选** | AI 提出的方案,用户尚未确认 |
| **假设** | 尚未验证的前提 |
| **未决** | 需要用户决定的问题 |

### 4. 固化 Brief

讨论收敛后(用户意图清楚,不再是纯发散),创建 Brief:

```bash
node scripts/project-docs.cjs new brief --title <标题> --source <整理后的原文或讨论记录> --root <项目根>
```

生成 `docs/briefs/BRIEF-###.md`。确保包含:

- 背景和想解决的问题
- 目标用户与场景
- 初步能力设想(标注标签)
- 已知约束
- 假设
- 未决问题
- 讨论中明确不做的内容

**Brief 确认后正文不再改写**——只允许修正错别字和失效链接。后续变化走 change 技能。

### 5. 结构化审计

把 Brief 归为 9 类,**不立即补全缺失**:

1. 产品目标 — 2. 用户和场景 — 3. 功能能力 — 4. 业务规则 — 5. 数据和接口约束 — 6. 非功能要求 — 7. 假设 — 8. 未决问题 — 9. 明确不做的内容

识别并报告:

- **重复**:同一件事说了两遍 → 合并
- **矛盾**:两个要求互斥 → 列出,让用户决定
- **一个句子多个需求**:拆开
- **模糊**:没有验收方式的描述 → 标注"需要明确验收方式"
- **技术方案冒充需求**:"用 Redis 做缓存"vs"响应时间<100ms" → 追问用户到底要什么
- **缺失**:只有功能列表,没有用户场景 → 标注

**阻断性问题未解决→暂停,不进入 REQ。**

### 6. 逐条 REQ 确认

在 `docs/requirements.md` 中,每条 REQ 一个条目:

```markdown
### REQ-001: 用户可以导入微信公众号链接

- statement: 单一、可验证的需求陈述
- type: functional
- priority: must
- status: accepted
- source: BRIEF-001
- milestones: M1
- features: F-M1-01
- acceptance_hint: 可观察的满足方式
```

**逐条和用户确认**(一次一条,不给用户一次抛 10 条):

1. 是否真的需要?
2. 优先级:must(必须有) / should(应该有) / later(以后)?
3. 第一版包含吗?
4. 如何判断已满足?

**规则**:

- 一条 REQ 只表达一项可判断的能力或约束
- 用"必须/可以/不得"等可验证表达,禁止"体验良好""功能完善"
- 技术方案不是产品需求,除非它是不可变约束
- **未确认的→ `status: proposed` 或 `deferred`,禁止以 `accepted` 进入后续**
- accepted 的 REQ 必须能被 `coverage` 命令追踪到 Milestone/Feature(如果还没拆到那一步,先标 deferred)

### 7. Brief 自审

写完 Brief + REQ 后,回头看:

1. **占位符扫描**:有 "TBD"、"TODO"、空章节、模糊描述吗?修复
2. **内部一致性**:有没有两个 REQ 互相矛盾?Brief 的能力设想和 REQ 的范围对得上吗?不一致→修复
3. **范围检查**:这是一个人能在一次计划中完成的吗?还是应该继续拆?太大→回到步骤 2
4. **歧义检查**:有没有某条 REQ 可以被理解为两种不同含义?有→明确

修复问题内联,不用重审。

### 8. 用户审阅 Brief

> Brief 和 REQ 已写入 `docs/briefs/BRIEF-###.md` 和 `docs/requirements.md`。请审核一下,有任何调整告诉我,确认后我们进入下一阶段(blueprint)。

等待用户回复。如果需要修改,做完后重新自审。

## 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
node scripts/project-docs.cjs coverage --root <项目根>
```

- [ ] `validate` 无 error
- [ ] 每条 accepted REQ 有 `source`(可追溯到 Brief 或标注用户确认)
- [ ] 无 AI 擅自 accepted 的 REQ

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `new brief` 创建 BRIEF 文档 | 对话展开,标注标签 |
| `validate`/`coverage` | 9 类审计,识别矛盾/缺失 |
| ID 分配、模板渲染 | 逐条 REQ 确认(用户说了算) |
| — | **禁止**:替用户定优先级、写 Blueprint/Roadmap/Plan |

## 场景路由

| 场景 | 处理 |
|---|---|
| **超大/多系统** | 范围检查时立刻提出拆分,不问细节 |
| **阻断性未决问题** | 暂停,列出问题让用户决定,不拆 REQ |
| **已有部分 REQ/Blueprint** | 增量追加,不静默改已有 accepted |
| **用户口头需求,无文档** | 先整理为临时文档,标注来源,再走流程 |
| **口头和文档矛盾** | 口头视为补充,列出矛盾让用户裁决 |

## Handoff Rule

Brief + REQ 确认后 → `blueprint`。本技能不写 Blueprint,不写 Roadmap,不写 Plan。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "需求很清楚了,直接写 plan 吧" | 没有 Brief 不可变记录+原子 REQ,plan 只是把猜测结构化 |
| "这个功能明显需要,不用逐条确认" | 跳过确认 = AI 替用户决定优先级和范围 |
| "10 条 REQ 一起列出来效率高" | 用户一次只能认真判断一条,批量 = 全 accept |
| "技术方案就是需求" | "用 Redis"是实现手段,用户的真实需求是"响应<100ms" |
| "阻断性问题我先猜,后面再改" | AI 不替用户做产品决定——Brief 确认前,未决问题必须暂停 |
