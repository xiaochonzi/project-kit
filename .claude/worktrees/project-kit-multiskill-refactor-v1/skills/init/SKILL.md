---
name: init
description: Use when initializing a new project's documentation structure, or when a project has no docs/ directory yet and needs Project Kit conventions. If docs already exist, use status first.
---

# Init

## Overview

在目标项目下创建 Project Kit 标准 `docs/` 目录结构,使后续所有技能(brief/refine/plan/execute/verify/change/bug/status)有统一的落盘位置。本技能只搭骨架,不替用户补需求内容。

**开始前宣布:** "我正在使用 init 技能初始化文档结构。"

## Required Inputs

- [ ] 已确认目标项目根目录(有 `.git` 或明确为项目目录)
- [ ] 用户同意创建/使用 `docs/` 目录

## Process

### Step 1: 运行初始化

```bash
node scripts/project-docs.cjs init --root <项目根>
```

### Step 2: 确认生成的结构(脚本会创建,若已存在则跳过)

```text
<项目根>/docs/
├── constitution.md      # 稳定开发准则
├── requirements.md      # 原子需求清单(REQ-###)
├── blueprint.md         # 系统边界与能力地图
├── roadmap.md           # 交付顺序
├── STATE.md             # 当前焦点与下一动作
├── briefs/              # BRIEF-###
├── capabilities/        # C-###
├── milestones/          # M# + M#-CONTEXT.md
├── specs/<M#>/          # F-M#-##
├── plans/               # F-M#-##-plan.md
├── executions/          # F-M#-##-execution.md
├── verifications/       # F-M#-##-verification.md
├── changes/             # CR-###
├── fixes/               # BUG-###
├── decisions/           # ADR-###
└── research/
```

目录只在出现对应产物时使用,不预填内容。

### Step 3: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error
- [ ] 5 个根文档(`constitution/requirements/blueprint/roadmap/STATE.md`)均已生成

## Stop Conditions

- 无法确定目标项目根目录
- 目标已有 `docs/` 且结构冲突 → 报告现状,不覆盖
- `init` 或 `validate` 失败

## Handoff Rule

初始化完成后,下一步由用户选择:制定准则 → `constitution`;接收需求 → `brief`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "手工建几个目录更快" | 绕过脚本会漏掉模板和目录约定,后续 validate 必报错 |
| "README 以后再说" | 本技能只负责标准骨架,README 不属于 docs 约定 |
