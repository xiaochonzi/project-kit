---
name: refine
description: Use when refining the current milestone into a Feature Map and Feature Specs — breaking a deliverable phase into independently testable capabilities. Use after roadmap has defined the delivery sequence. If a Feature Spec is already approved and needs an implementation plan, use plan.
---

# Refine

## Overview

把 Roadmap 中 Active 的 Milestone 细化为: Feature Map(依赖关系)+ Feature Specs(功能契约,每份可独立验收)。

**refine 回答**:这个阶段具体包含哪些功能?每项功能的边界和验收标准是什么?

**不回答**:怎么实现(plan)。按钮、数据库表、IPC channel 属于 Plan 任务,不是 Feature。

**开始前宣布:** "我正在使用 refine 技能细化当前阶段的功能规格。"

## The Iron Law

```
ONLY REFINE THE ACTIVE MILESTONE — SPECS DEFINE WHAT, NOT HOW
```

**Violating the letter of this rule is violating the spirit of feature specification.** 只为 Active/Next Milestone 生成 Specs。Feature Spec 写"必须实现什么",不写"怎么实现"。按钮、DB 表、IPC channel 是 Plan 任务,不是 Feature。

## Required Inputs(不满足即停止)

- [ ] `docs/roadmap.md` 存在且含 Active Milestone。无 Active → 路由到 roadmap
- [ ] `docs/blueprint.md` 已填写(系统边界+模块约束)
- [ ] `docs/requirements.md` 含 accepted REQ

## 产物分层

| 产物 | 产生时机 | 内容量 |
|---|---|---|
| Milestone 文档(`docs/milestones/M#.md`) | 当前阶段首次 refine | 阶段目标/可验证系统状态/包含与不包含/Feature Map/退出标准 |
| Feature Spec(`docs/specs/<M#>/F-M#-##.md`) | 每项 Feature | 问题与依据/目标/范围/验收标准/需求追踪 |
| Feature Map | Milestone 文档内 | 依赖树,纯摘要 |

**不产出**: Implementation Plan(plan)、执行记录(execute-plan)、验收记录(verify-plan)。

## 产物契约

### Milestone 文档(docs/milestones/M#-<slug>.md)

```bash
node scripts/project-docs.cjs new milestone --title <阶段目标> --root <项目根>
```

必须包含以下章节(脚本校验 `REQUIRED_SECTIONS.milestone`):

```markdown
## 阶段目标
## 可验证系统状态     ← 用户可观察、可演示的结果,不是"所有代码完成"
## 包含 / 不包含     ← 明确边界,阻止阶段膨胀
## 前置依赖
## Feature Map        ← 依赖树(功能名+依赖关系)
## 退出标准           ← 所有 Feature verified + 可观察的系统级标准
## 风险与未决问题
```

Frontmatter 必须包含 `requirements`(逐行数组,脚本解析器契约):

```markdown
requirements:
  - REQ-001
  - REQ-002
```

禁止 `requirements: [REQ-001, REQ-002]`(内联数组被脚本解析为单个字符串,coverage 误报)。

### Feature Spec(docs/specs/<M#>/F-M#-##-<slug>.md)

```bash
node scripts/project-docs.cjs new feature --milestone <M#> --title <功能名> --root <项目根>
```

必须包含以下章节(脚本校验 `REQUIRED_SECTIONS.feature`):

```markdown
## 问题与依据       ← 为什么需要这个功能
## 目标             ← 一句话
## 用户流程         ← 1-3 步,用户怎么用
## 范围(包含/不包含) ← 明确边界
## 输入与输出       ← 可观察的
## 数据与接口       ← 涉及的字段/接口(概念级,不写签名)
## 业务规则         ← 如"标题为空拒绝"
## 失败与边界情况   ← 异常路径
## 非功能约束       ← 如"无第三方依赖"
## 验收标准         ← 可验证,逐条列出(禁止"工作正常""体验好")
## 需求追踪         ← requirements 字段映射 REQ
## 未决问题         ← 仍未决定的
```

Frontmatter 必须包含:`id: F-M#-##`、`milestone: M#`、`status: draft`、`requirements`(逐行)、`depends_on`(逐行)。

## Feature 边界判断

一个合格 Feature 满足:

- 单一主要目标
- 可以独立测试和验收
- 清楚输入输出和边界
- 一次受控实现可完成

**需要拆分的信号**:包含多个不同用户结果、多个独立验收流程、同时改多个无关业务域、明显不同的失败条件。

**拆太细的信号**:建个按钮、加个 IPC channel、加个 TypeScript interface——这些是 Plan 任务。

## Process

### Step 1: 确认当前 Milestone

读 `docs/roadmap.md`,找到 Active Milestone。确认用户要对这个阶段做 refine。如果用户想细化 Later 阶段的,拒绝(只细化当前)。

### Step 2: 填写 Milestone 文档

创建或编辑 `docs/milestones/M#-<slug>.md`,按产物契约填写:

- **阶段目标**:一句话
- **可验证系统状态**:用户可观察的,不是"所有代码完成"
- **包含/不包含**:明确边界,阻止膨胀
- **Feature Map**:依赖树

```text
M1 内容编译基础闭环
├── F-M1-01 标准化来源内容
├── F-M1-02 提取知识单元(依赖 F-M1-01)
├── F-M1-03 生成 Wiki 页面(依赖 F-M1-02)
└── F-M1-04 从 UI 启动编译并展示结果(依赖 F-M1-03)
```

- **退出标准**:所有 Feature verified + 可演示的系统级闭环

### Step 3: 逐 Feature 创建 Spec

一次只做一个 Feature。对每项 Feature:

1. 运行 `new feature` 创建骨架
2. 按产物契约填写全部章节
3. **验收标准必须可验证**:命令输出、可观察行为、数据断言。禁止"工作正常"
4. 和用户确认:包含/不包含/验收标准是否可验证
5. 确认后推进状态:

```bash
node scripts/project-docs.cjs transition F-M#-## --to reviewed --root <项目根>
node scripts/project-docs.cjs transition F-M#-## --to approved --root <项目根>
```

脚本要求 approved 前关键章节非空(问题与依据/目标/范围/验收标准/需求追踪)。

### Step 4: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
node scripts/project-docs.cjs coverage --root <项目根>
```

- [ ] `validate` 无 error
- [ ] `coverage` 100%:accepted REQ 均有 Milestone/Feature 双向映射
- [ ] Feature 依赖无环
- [ ] 所有 Feature Spec 的验收标准可验证

## 场景路由

| 场景 | 处理 |
|---|---|
| **无 Active Milestone** | 路由到 roadmap |
| **首次 refine 当前阶段** | 正常流程 |
| **补充/修改已 approved 的 Spec** | 如果只是澄清(不改变边界)→更新后重新 approved;如果新增用户能力→新 Feature |
| **用户想细化远期** | 拒绝,只细化 Active/Next |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `new milestone`/`new feature` 创建骨架 | 读 Roadmap/Blueprint,拆 Feature |
| `transition` 状态迁移 | 填写 Spec 内容,确认验收标准 |
| `validate`/`coverage` 校验 | 和用户对话确认边界 |
| — | **禁止**:写 Plan、细化远期、把按钮当 Feature |

## Handoff Rule

Feature Specs approved 后 → `plan`(为已批准 Feature 制定实现计划)。本技能不写 Plan。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "把手顺把后面两期也细化掉" | 远期过早细化=大量失效文档 |
| "按钮也算 Feature" | 那是 Plan 任务,不是功能契约 |
| "验收标准先模糊写,后面再补" | 模糊标准=没有边界,verify 无法执行 |
| "在 Spec 里直接写实现步骤更快" | Spec 是"做什么",Plan 是"怎么做"——混在一起=范围失控 |
