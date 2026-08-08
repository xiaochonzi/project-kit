---
name: refine
description: Use when refining the current milestone into a Feature Map or Feature Spec, or clarifying a feature's boundaries before planning. If the Feature Spec is already approved and needs an implementation plan, use plan.
---

# Refine

## Overview

把已接受的需求细化成可独立验收的工作单元:Milestone(`docs/milestones/M#.md`)→ Feature Map → Feature Spec(`docs/specs/<M#>/F-<M#>-##.md`)。**本技能只定义功能契约,不写实现步骤。**

**开始前宣布:** "我正在使用 refine 技能细化阶段与功能。"

## Required Inputs

- [ ] 已读取 `docs/requirements.md`(accepted REQ 清单)
- [ ] 已读取 `docs/blueprint.md` 与 `docs/roadmap.md`(边界与顺序)
- [ ] 当前目标 Milestone 明确(仅细化当前或下一个)

## Process

### Step 1: 明确当前 Milestone

```bash
node scripts/project-docs.cjs new milestone --title <阶段目标> --root <项目根>
```

生成 `docs/milestones/M#.md`,必须包含:

```markdown
## 阶段目标
## 可验证系统状态
## Feature Map
## 退出标准
## 包含 / 不包含
## 前置依赖
## 风险与未决问题
```

**Milestone 必须是一个可验收的系统状态**,不是"把技术层做完"(禁止:阶段一建表、阶段二写 Service 这种横向拆分)。

### Step 3: 拆 Feature Map

每个 Feature 满足:

- 单一主要目标
- 可以独立验收
- 依赖无环
- 是一次受控实现可完成的

```text
M1: 编译基础闭环
├── F-M1-01 标准化来源内容
├── F-M1-02 提取知识单元(依赖 F-M1-01)
├── F-M1-03 生成 Wiki 页面(依赖 F-M1-02)
└── F-M1-04 从 UI 启动编译并展示结果(依赖 F-M1-03)
```

按钮、数据库表、IPC channel、某个 interface 属于 Plan 任务,不是 Feature。

### Step 4: 生成 Feature Spec

```bash
node scripts/project-docs.cjs new feature --milestone <M#> --title <功能名> --root <项目根>
```

生成 `docs/specs/<M#>/F-<M#>-##.md`,必须包含以下章节(脚本会校验):

```markdown
## 1. 问题与依据
## 2. 目标
## 3. 范围(包含/不包含)
## 4. 失败与边界情况
## 5. 验收标准      ← 可验证、可测试,逐条列出
## 6. 需求追踪      ← requirements: [REQ-###]
```

Frontmatter 必须包含:`id: F-M#-##`、`milestone: M#`、`status: draft`、`requirements`。

> **frontmatter 数组必须用逐行格式**(脚本解析器契约):
> ```markdown
> requirements:
>   - REQ-001
>   - REQ-002
> ```
> 禁止内联 `requirements: [REQ-001, REQ-002]` —— 脚本会把它解析成单个字符串,导致 coverage 误报"缺少双向映射"。

**验收标准必须可验证**(命令输出、可观察行为、数据断言),禁止"工作正常""体验好"。

### Step 5: 评审与批准

- 逐条确认验收标准可验证
- 确认包含/不包含边界
- 无阻断性未决问题
- 用户批准后:`transition F-M#-## --to approved --root <项目根>`

(状态路径:idea → draft → reviewed → approved;中途可 blocked/deferred。)

## Stop Conditions

- 当前阶段目标仍模糊
- Feature 无法形成独立验收闭环
- 存在会改变方案的阻断性未决问题
- 被要求细化远期 Milestone → 拒绝,只细化当前

## Validation Checklist

- [ ] `validate --root <项目根>` 无 error
- [ ] 每个 Feature 有 `requirements` 映射,accepted REQ 双向覆盖
- [ ] Feature 依赖无环

## Handoff Rule

Feature Spec approved 后 → `plan`。不要在本技能中写实现步骤。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "顺手把后面两期也细化掉" | 远期计划过早固化会失效 |
| "按钮也算 Feature" | 那是 Plan 任务 |
| "验收标准先模糊写" | 模糊标准 = 没有边界 |
