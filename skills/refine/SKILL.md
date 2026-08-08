---
name: refine
description: Use when refining the current milestone into a Feature Map or Feature Spec, or clarifying a feature's boundaries before planning. If the Feature Spec is already approved and needs an implementation plan, use plan.
---

# Refine

## Overview

把已接受的需求细化成可独立验收的工作单元:Milestone(`docs/milestones/M#-<slug>.md`)→ Feature Map → Feature Spec(`docs/specs/<M#>/F-M#-##-<slug>.md`)。**本技能只定义功能契约,不写实现步骤。**

**开始前宣布:** "我正在使用 refine 技能细化阶段与功能。"

## Required Inputs(不满足即停止)

- [ ] 已读取 `docs/requirements.md`(accepted REQ 清单)
- [ ] 已读取 `docs/blueprint.md` 与 `docs/roadmap.md`(边界与顺序)
- [ ] 当前目标 Milestone 明确(仅细化当前或下一个)

## 产物契约

### Milestone(docs/milestones/M#-<slug>.md)

```bash
node scripts/project-docs.cjs new milestone --title <阶段目标> --root <项目根>
```

必须包含以下章节(脚本校验):

```markdown
## 阶段目标
## 可验证系统状态     ← 用户可观察、可演示的结果,不是"技术层做完"
## 包含 / 不包含
## 前置依赖
## Feature Map
## 退出标准           ← 阶段级结果,不是"所有代码完成"
## 风险与未决问题
```

frontmatter 必须包含 `requirements`(**逐行数组格式**):

```markdown
requirements:
  - REQ-001
  - REQ-002
```

> **frontmatter 数组必须用逐行格式**(脚本解析器契约):禁止内联 `requirements: [REQ-001, REQ-002]` —— 脚本会把它解析成单个字符串,导致 coverage 误报"缺少双向映射"。

**Milestone 必须是可验收的系统状态**,禁止横向拆分(阶段一建表、阶段二写 Service)。

### Feature Spec(docs/specs/<M#>/F-M#-##-<slug>.md)

```bash
node scripts/project-docs.cjs new feature --milestone <M#> --title <功能名> --root <项目根>
```

必须包含以下章节(脚本校验 `REQUIRED_SECTIONS.feature`):

```markdown
## 1. 问题与依据
## 2. 目标
## 3. 范围(包含/不包含)
## 4. 失败与边界情况
## 5. 验收标准        ← 可验证、可测试,逐条列出
## 6. 需求追踪        ← requirements 字段映射 REQ
```

frontmatter 必须包含:`id: F-M#-##`、`milestone: M#`、`status: draft`、`requirements`(逐行)。

**验收标准必须可验证**(命令输出、可观察行为、数据断言),禁止"工作正常""体验好"。

## Process

### Step 1: 创建 Milestone

按产物契约创建并填写 `docs/milestones/M#-<slug>.md`。

### Step 2: 拆 Feature Map

每个 Feature 满足:单一主要目标 / 独立验收 / 依赖无环 / 一次受控实现可完成:

```text
M1: 编译基础闭环
├── F-M1-01 标准化来源内容
├── F-M1-02 提取知识单元(依赖 F-M1-01)
└── F-M1-03 从 UI 启动编译(依赖 F-M1-02)
```

按钮、数据库表、IPC channel、某个 interface 属于 Plan 任务,不是 Feature。

### Step 3: 创建并填写 Feature Spec

按产物契约创建。每份 Spec 逐节填写,验收标准逐条可验证。

### Step 4: 评审与批准

- 逐条确认验收标准可验证
- 确认包含/不包含边界
- 无阻断性未决问题
- 用户批准后推进状态(脚本校验章节非空):

```bash
node scripts/project-docs.cjs transition F-M1-01 --to reviewed --root <项目根>
node scripts/project-docs.cjs transition F-M1-01 --to approved --root <项目根>
```

状态路径:`draft → reviewed → approved`(中途可 blocked/deferred)。

### Step 5: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
node scripts/project-docs.cjs coverage --root <项目根>
```

- [ ] `validate` 无 error
- [ ] 每个 Feature 的 `requirements` 与 accepted REQ 双向映射(REQ 的 features 字段 + Spec 的 requirements 字段)
- [ ] Feature 依赖无环

## 好/坏示例

**坏**(验收标准不可验证 + frontmatter 数组内联):

```markdown
## 验收标准
- 功能基本可用,体验良好
```

或 `requirements: [REQ-001]`(内联数组 → coverage 误报)。

**好**:

```markdown
## 验收标准
- AC1: add 后 list 能看到该待办
- AC2: 不同优先级待办按 high > medium > low 排序输出
```

## Stop Conditions

- 当前阶段目标仍模糊
- Feature 无法形成独立验收闭环
- 存在会改变方案的阻断性未决问题
- 被要求细化远期 Milestone → 拒绝,只细化当前

## Exception Handling

- **new feature 报"Milestone 不存在"**:先创建 Milestone 再创建 Feature。
- **validate 报"Feature 目录与 milestone 不一致"**:Spec 必须放 `docs/specs/<M#>/` 下且 frontmatter `milestone` 一致,移动文件或修正字段。
- **coverage 报"缺少双向映射"**:检查 REQ 的 `milestones/features` 字段与 Milestone/Spec 的 `requirements` 字段是否互为包含,且数组为逐行格式。

## Handoff Rule

Feature Spec approved 后 → `plan`。本技能不写实现步骤。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "顺手把后面两期也细化掉" | 远期计划过早固化会失效 |
| "按钮也算 Feature" | 那是 Plan 任务,不是功能契约 |
| "验收标准先模糊写" | 模糊标准 = 没有边界,verify 无法执行 |
| "内联数组省一行" | 脚本解析契约要求逐行,否则 coverage 误报 |
| "依赖之后再加" | 缺依赖图直接破坏执行顺序 |
