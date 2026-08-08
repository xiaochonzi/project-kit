---
name: brief
description: Use when receiving a large raw requirement or fuzzy idea that needs to become structured requirements — a big document, a discussion transcript, an unclear feature request. If the requirement is already an approved Feature Spec, use plan.
---

# Brief

## Overview

把原始讨论/大文档逐层转化为:`docs/briefs/BRIEF-###.md`(原始输入,不可变)→ `docs/requirements.md`(原子需求)→ `docs/blueprint.md`(系统边界)→ `docs/roadmap.md`(交付顺序)。**本技能只做拆解与确认,不生成代码计划。AI 不替用户做产品决定。**

**开始前宣布:** "我正在使用 brief 技能拆解需求。"

## Required Inputs(不满足即停止)

- [ ] 已读取原始需求(文档路径或讨论内容)
- [ ] 已读取 `docs/constitution.md` 与现有 `docs/blueprint.md`(若存在)
- [ ] 用户可参与决策(未决问题需要用户裁决)

## 产物契约

### BRIEF(docs/briefs/BRIEF-###-<slug>.md)

```bash
node scripts/project-docs.cjs new brief --title <标题> --source <原始需求文件> --root <项目根>
```

必须包含:背景 / 想解决的问题 / 目标用户与场景 / 初步能力设想 / 已知约束 / 假设 / 未决问题 / 明确不做的内容。**确认后正文不可改写**(只允许修正错别字与失效链接);后续变化走 change 技能。

### requirements.md(原子需求,核心契约)

每条需求一个条目,格式严格如下(脚本 `coverage` 按此解析):

```markdown
### REQ-001: 用户可以导入微信公众号链接

- statement: 单一、可验证的需求陈述
- type: functional
- priority: must
- status: accepted          # 未确认的不得 accepted
- source: BRIEF-001
- milestones: M1            # 逗号分隔;与 M# 文档双向映射
- features: F-M1-01         # 与 F-M#-## 文档双向映射
- acceptance_hint: 可观察的满足方式
```

规则:

- 一条需求只表达一项可判断的能力或约束
- 用"必须/可以/不得"等可验证表达,禁止"体验良好""功能完善"
- 每条需求让用户判定:Must/Should/Later、第一版是否包含、如何判断已满足
- 未确认 → `proposed` 或 `deferred`,不得以 accepted 进入后续设计
- 技术方案不是产品需求,除非是不可变约束

### blueprint.md

根据已接受 REQ 建立:产品目标与成功标准 / 用户与核心场景 / 系统能力地图 / 模块职责与边界 / 核心数据流 / 跨模块约束与非功能要求 / 明确不做的内容 / 仍未决定的问题。frontmatter `source` 引用 BRIEF 或 CR。

### roadmap.md

拆成可交付 Milestones,每个 Milestone 是**可验收的系统状态**:

```text
M1: 用户可以创建工作区并安全保存文件
M2: 用户可以导入并归档一篇来源
```

标记:`Active / Next / Later / Completed / Deferred`,注明依赖与文档链接。

## Process

### Step 1: 创建 BRIEF(保存原始输入)

运行上面的 `new brief` 命令。确认 Brief 结构完整。

### Step 2: 结构化审计(不立即补全缺失信息)

把内容分类为:1 产品目标 / 2 用户和场景 / 3 功能能力 / 4 业务规则 / 5 数据和接口约束 / 6 非功能要求 / 7 假设(未经确认) / 8 未决问题 / 9 明确不做的内容。

同时识别:重复表述、相互矛盾的要求、一个句子里混多个需求、无法验收的模糊要求、被技术方案掩盖的真实用户需求。

### Step 3: 形成原子 Requirements(逐条让用户确认)

按产物契约写 `docs/requirements.md`。**每条 REQ 让用户确认**,不替用户决定优先级与范围。

### Step 4: 形成 Blueprint 与 Roadmap

按产物契约写 `docs/blueprint.md`、`docs/roadmap.md`。

### Step 5: 只细化当前 Milestone

仅为当前或下一个 Milestone 生成 Feature Map 与 Feature Specs;远期保持粗粒度(交给 refine 技能)。

### Step 6: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
node scripts/project-docs.cjs coverage --root <项目根>
```

- [ ] `validate` 无 error
- [ ] accepted REQ 均有 Milestone/Feature 双向映射(未细化阶段可标 deferred 并记录原因)

## 好/坏示例

**坏**(合并需求 + 模糊描述 + AI 擅自确认):

```markdown
### REQ-001: 支持导入和导出,体验要好
- status: accepted          # 用户没确认!
```

后果:coverage 无法映射;"体验要好"无法验收;accepted 状态是 AI 越权。

**好**:

```markdown
### REQ-001: 用户可以通过 CLI 添加待办,包含标题、优先级和标签
- status: accepted
- source: BRIEF-001
- milestones: M1
- features: F-M1-01
- acceptance_hint: 运行 add 命令后,待办出现在列表输出中
```

## Stop Conditions

- 阻断性未决问题未解决(会改变目标/范围/边界)→ 暂停,列出问题让用户决定
- 需求相互矛盾且用户未裁决
- 无法把模糊输入拆成原子需求

## Exception Handling

- **原始需求是口头讨论而非文档**:先把讨论整理为临时文档再作 `--source`;整理时区分"用户确认的事实"与"AI 的候选方案"。
- **source 文件不存在**:`new brief` 报错,先确认原始需求文件路径。
- **用户中途改变范围**:已完成部分保留,新范围创建补充 BRIEF 或 Change Request,不回头改写已确认 Brief。

## Handoff Rule

拆解确认后,细化当前 Milestone/Feature → `refine`。本技能不写 Plan。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先写个 plan 再说" | 没有需求边界,plan 只是把猜测结构化 |
| "这个功能很明显,不用拆 REQ" | 没有稳定 ID 无法追踪交付,coverage 无从检查 |
| "远期功能一起细化" | 过早细化制造大量失效文档 |
| "用户没确认的,我先当确认处理" | AI 不替用户做产品决定,未决问题必须暂停 |
| "需求合并着写省事" | 一条需求一个判断,合并会导致无法独立验收 |
