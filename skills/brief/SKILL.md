---
name: brief
description: Use when receiving a fuzzy idea, raw requirement, or design discussion that needs to become a structured Brief — an immutable archive of the original intent. Use even for "help me figure out what to build" or "let's clarify this idea". If the requirement is already a concrete change, use change.
---

# Brief

## Overview

通过自然协作对话,把一个模糊想法固化为不可改写的存档文档:

- `docs/briefs/BRIEF-###.md` — 原始输入,固化后正文不再改写

**不产出**:requirements 表(已删除)、Blueprint、Roadmap、change 三件套——需求由 `change` 技能承接,蓝图由 `blueprint` 技能承接。

## The Iron Law

```
NO IMPLEMENTATION PLANS FROM UNVERIFIED REQUIREMENTS
```

**Violating the letter of this rule is violating the spirit of requirements gathering.** 本技能不写代码、不生成实现计划、不替用户做产品决定。遇到会改变目标/范围/用户行为/数据边界的未决问题→暂停,让用户决定。

## Don't Skip When

- 需求"看起来很清楚了"——没被检视过的假设是返工的根源
- "用户口头说了,直接写下来"——口头的也要逐条确认,标注来源
- 想一次把所有问题都问完——逐话题,一次一个

## Checklist

按顺序完成,不跳:

1. **探查项目上下文** — 检查已有 `docs/`、现有 Blueprint、Roadmap
2. **范围检查** — 多独立系统?立刻提出拆分,不追问细节
3. **对话展开** — 一次一个问题,理解目的/约束/成功标准
4. **Validate Before Concluding** — 复述确认,纠正后再进入固化
5. **固化 Brief** — 写入 `docs/briefs/BRIEF-###.md`,区分事实/假设/候选/未决
6. **结构化审计** — 分 9 类,识别重复、矛盾、模糊、缺失
7. **Brief 自审** — 占位符、一致性、范围、歧义(修复后重审)
8. **用户审阅 Brief** — 用户确认后再进入下一步

## Process

### 1. 探查项目上下文

先了解现状,再提问:

- 读取 `docs/STATE.md`,了解当前焦点
- 检查是否已有 `docs/blueprint.md`、`docs/roadmap.md`

### 2. 范围检查(先于细节提问)

如果原始输入描述多个独立子系统(如"重建平台:用户系统+内容系统+支付系统+数据平台+运营后台"),**立刻提出拆分,不问细节**:

> 这里包含了 5 个相互独立的系统。建议每个独立做 brief,各自走后续流程。你希望先做哪个?

不要在需要拆分的问题上花时间追问细节。

### 3. 对话展开(一次一个问题 + 方案对比)

一次只问一个问题,倾向给选项。当存在多种合理方向时,**提出 2-3 个方案对比**:每个方案一句话+利弊+适合什么场景,然后**推荐一个**并解释原因。不要只给一条路——至少提一个替代方案。

理解三件事:目的(为什么做)、约束(什么不能违反)、成功标准(怎样算做好了)。

讨论中**必须标注每条陈述的标签**:

| 标签 | 含义 |
|---|---|
| **用户确认** | 用户明确确认的目标/事实 |
| **AI 候选** | AI 提出的方案,用户尚未确认 |
| **假设** | 尚未验证的前提 |
| **未决** | 需要用户决定的问题 |

### 4. Validate Before Concluding(固化前复述确认)

在和用户得出结论之前,**先复述你听到的内容**:

> 让我确认一下我的理解:
> - 问题:[复述]
> - 目标用户:[复述]
> - 核心能力:[复述]
> - 明确不做:[复述]
> - 还有这些未决问题:[列出]
>
> 这样对吗?有需要纠正的吗?

用户纠正后重新复述,直到确认一致。然后进入固化。

### 5. 固化 Brief

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

### 6. 结构化审计

把 Brief 归为 9 类,**不立即补全缺失**:

1. 产品目标 — 2. 用户和场景 — 3. 功能能力 — 4. 业务规则 — 5. 数据和接口约束 — 6. 非功能要求 — 7. 假设 — 8. 未决问题 — 9. 明确不做的内容

识别并报告:

- **重复**:同一件事说了两遍 → 合并
- **矛盾**:两个要求互斥 → 列出,让用户决定
- **一个句子多个需求**:拆开
- **模糊**:没有验收方式的描述 → 标注"需要明确验收方式"
- **技术方案冒充需求**:"用 Redis 做缓存"vs"响应时间<100ms" → 追问用户到底要什么
- **缺失**:只有功能列表,没有用户场景 → 标注

**阻断性问题未解决→暂停,不进入后续。**

### 7. Brief 自审

写完 Brief 后回头看:

1. **占位符扫描**:有 "TBD"、"TODO"、空章节、模糊描述吗?修复
2. **内部一致性**:Brief 的能力设想和约束对得上吗?不一致→修复
3. **范围检查**:拆出的需求是否能被独立 change 承接?太大→回到步骤 2
4. **歧义检查**:有没有内容可以被理解为两种不同含义?有→明确

修复问题内联,不用重审。

### 8. 用户审阅 Brief

> Brief 已写入 `docs/briefs/BRIEF-###.md`。请审核一下,有任何调整告诉我,确认后我们进入下一阶段(blueprint 或 change)。

等待用户回复。如果需要修改,做完后重新自审。

## 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error
- [ ] Brief 的事实/假设/候选/未决标签清晰
- [ ] 无 AI 擅自替用户确认的"事实"

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `new brief` 创建 BRIEF 文档 | 对话展开,标注标签 |
| `validate` | 9 类审计,识别矛盾/缺失 |
| — | **禁止**:替用户定优先级、写 Blueprint/Roadmap/Plan、创建 change |

## 场景路由

| 场景 | 处理 |
|---|---|
| **超大/多系统** | 范围检查时立刻提出拆分,不问细节 |
| **阻断性未决问题** | 暂停,列出问题让用户决定 |
| **已有部分 Brief/Blueprint** | 增量追加,不静默改写已确认内容 |
| **用户口头需求,无文档** | 先整理为临时文档,标注来源,再走流程 |
| **口头和文档矛盾** | 口头视为补充,列出矛盾让用户裁决 |
| **需求已具体到可开发** | 直接转 change(不再需要 brief) |

## Handoff Rule

Brief 确认后 → `blueprint`(系统边界)或 `change`(直接进入需求)。本技能不写 Blueprint,不写 Roadmap,不写 Plan,不创建 change。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "需求很清楚了,直接写 plan 吧" | 没有 Brief 不可变记录,后续变化无法追溯原始意图 |
| "这个功能明显需要,不用确认" | 跳过确认 = AI 替用户决定范围和边界 |
| "技术方案就是需求" | "用 Redis"是实现手段,用户的真实需求是"响应<100ms" |
| "阻断性问题我先猜,后面再改" | AI 不替用户做产品决定——Brief 确认前,未决问题必须暂停 |
