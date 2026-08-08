---
name: init
description: Use when initializing a new project's documentation structure, or when a project has no docs/ directory yet and needs Project Kit conventions. If docs already exist, use status first.
---

# Init

## Overview

在目标项目下创建 Project Kit 标准 `docs/` 目录结构,使后续所有技能(brief/refine/plan/execute/verify/change/bug/status)有统一的落盘位置。本技能只搭骨架,不替用户补需求内容。

**开始前宣布:** "我正在使用 init 技能初始化文档结构。"

## Required Inputs(不满足即停止)

- [ ] 已确认目标项目根目录(有 `.git` 或用户明确指定为项目目录)
- [ ] 用户同意创建/使用 `docs/` 目录
- [ ] 已检查目标目录现状:若已存在 `docs/`,先运行 `node scripts/project-docs.cjs status --root <项目根>` 报告现状,不得静默覆盖

## 目录契约(本技能的产物定义,逐项必须成立)

`init` 之后,以下结构必须存在。每个条目的用途与命名规则是**后续所有技能的读取契约**,任何一项缺失都会导致下游技能失效:

```text
<项目根>/docs/
├── constitution.md      # 稳定开发准则。用途:plan/execute/verify 的约束来源
├── requirements.md      # 原子需求清单。格式:### REQ-### 条目,status/source/milestones/features 字段
├── blueprint.md         # 系统边界与能力地图。frontmatter source 引用 BRIEF-### 或 CR-###
├── roadmap.md           # 交付顺序。按 Active/Next/Later/Completed/Deferred 分节
├── STATE.md             # 当前焦点与下一动作。AI 接力的首要入口
├── briefs/              # BRIEF-###-<slug>.md。原始需求,不可变
├── capabilities/        # C-###-<slug>.md。跨里程碑能力(可选)
├── milestones/          # M#-<slug>.md + M#-CONTEXT.md。阶段定义
├── specs/<M#>/          # F-M#-##-<slug>.md。Feature Spec,必须与 milestone 目录一致
├── plans/               # F-M#-##-plan.md。实现计划
├── executions/          # F-M#-##-execution.md。执行记录
├── verifications/       # F-M#-##-verification.md。验收记录
├── changes/             # CR-###-<slug>.md。变更请求
├── fixes/               # BUG-###-<slug>.md。缺陷记录
├── decisions/           # ADR-###-<slug>.md。架构决策(可选)
└── research/            # 研究材料(可选,不作为权威)
```

命名规则(脚本会校验,违反即 validate 报错):

- 有 ID 的文档文件名**必须以 ID 开头**:`BRIEF-001-...`、`F-M1-01-...`、`CR-001-...`
- Feature 必须放在 `specs/<其 milestone>/` 下,目录名与 frontmatter `milestone` 字段一致
- ID 格式:`BRIEF-###` / `CR-###` / `C-###` / `M#` / `F-M#-##` / `BUG-###` / `ADR-###`

## Process

### Step 1: 运行初始化

```bash
node scripts/project-docs.cjs init --root <项目根>
```

脚本创建目录与 5 个根文档(从 `assets/templates/` 渲染);已存在的文件会跳过并提示,不会覆盖。

### Step 2: 核对生成的骨架(逐项检查,不是看一眼就过)

对照上面的目录契约,逐项确认:

- [ ] 5 个根文档存在:`constitution.md`、`requirements.md`、`blueprint.md`、`roadmap.md`、`STATE.md`
- [ ] 全部受管子目录存在(briefs/capabilities/milestones/specs/plans/executions/verifications/changes/fixes/decisions/research)
- [ ] 5 个根文档的 frontmatter 无残留模板变量:`grep -r "{{" docs/` 无输出
- [ ] 根文档 frontmatter 的 `updated_at` 为当前日期(脚本已渲染)

### Step 3: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 输出"错误: 0"
- [ ] `coverage --root <项目根>` 可运行(0 个 accepted REQ 时覆盖率 100%)

### Step 4: 向用户报告

报告结构(简洁,不改文档):

```text
已初始化: <项目根>/docs/
- 根文档: constitution / requirements / blueprint / roadmap / STATE
- 子目录: 11 个受管目录
- validate: 0 错误
下一步: 制定准则(constitution)或接收需求(brief)
```

## 好/坏示例

**坏**(手工建目录,文件名随意):

```text
docs/req.md              # 不是 requirements.md,脚本找不到
docs/SPECS/feature1.md   # 目录名大小写错误,且文件不在 specs/<M#>/
docs/todo.txt            # 非 markdown,不在任何约定位置
```

后果:后续 `validate` 报"缺少根文档",brief/refine 技能按 `docs/requirements.md` 读取失败,整个追踪链断裂。

**好**(脚本生成 + 手工核对):

```text
docs/requirements.md
docs/specs/M1/F-M1-01-添加与列出待办.md
docs/plans/F-M1-01-plan.md
```

## Stop Conditions

- 无法确定目标项目根目录 → 问用户,不猜
- 目标已有 `docs/` 且结构冲突 → 报告现状与冲突项,由用户决定迁移还是重建,不覆盖
- `init` 或 `validate` 失败 → 报告错误原文,不绕过

## Exception Handling

- **脚本提示"跳过已有文件"**:说明项目已有部分文档。运行 `status` 查看现状,把已有内容纳入报告,不删除、不覆盖。
- **validate 报错**:逐条阅读错误,对照目录契约定位(通常是模板变量残留或目录缺失),修复后重跑;不得把错误标记为"已知问题"继续。
- **目录已存在但为空**:正常,脚本会补全缺失部分;仍按 Step 2 核对全部条目。
- **用户中途改变项目根目录**:已生成内容保留在原位置,在新位置重新执行完整流程,不混用。

## Handoff Rule

初始化完成后,下一步由用户选择:制定准则 → `constitution`;接收需求 → `brief`。本技能不进入任何下游流程的内容编写。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "手工建几个目录更快" | 绕过脚本会漏掉模板与目录约定,validate 必报错,下游 9 个技能全部失效 |
| "docs 差不多有了,不用 init" | 缺少任一受管目录,对应文档类型无法落盘,追踪链断裂 |
| "README 以后再说" | README 不属于 docs 契约;本技能只负责标准骨架,别顺手扩范围 |
| "文件已存在,跳过就跳过" | 已存在但内容不符约定的文件同样会破坏下游读取,必须核对 |
| "validate 报错是小问题,先继续" | 结构错误会传染到所有后续技能,必须在本技能内清零 |
