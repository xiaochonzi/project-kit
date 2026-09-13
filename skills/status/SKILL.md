---
name: status
description: Use when asking what the project state is — current change focus, next action, what's blocking. Read-only; use before starting any work in an unfamiliar project or a new session.
---

# Status

## Overview

只读查看项目当前状态、正在推进的 Change 焦点以及下一步推荐动作。

**任何新会话或接手陌生项目时的第一个动作** —— 必须先使用 `status` 建立客观事实上下文，严禁凭记忆或猜测行动。

## The Iron Law

```
READ-ONLY ORIENTATION — NO SPECULATION, NO SILENT MODIFICATIONS
```

**本技能为纯只读操作，严禁在执行 status 时修改任何文件或代码。状态以 CLI 输出与持久化文件为准，不凭猜测推断。**

**开始前宣布：**“我正在使用 status 技能查看项目状态。”

## Required Inputs

- [ ] 项目根目录存在
- [ ] 若存在 `docs/` 目录，检查是否存在 `.project-kit/state.md`（若未初始化，提示用户先运行 `init`）

## Process

### Step 1：运行状态探测命令

```bash
node scripts/project-docs.cjs status --root <项目根>
```

CLI 将输出：
- `当前焦点`（来自本地 `.project-kit/state.md` 的 `active_change`）
- `下一动作`（`next_action`）
- `最近完成`（`last_completed`）
- 全局 Changes 列表及其生命周期状态

> **视角区分**：
> - **个人接力视角**：当前焦点、下一动作保存在本地私有文件 `.project-kit/state.md` 中（gitignored，不随代码库共享）。
> - **团队共享视角**：各个 Change 的生命周期事实保存在 `docs/changes/CR-###/` 的持久化文档中。

### Step 2：推导下一步建议动作

```bash
node scripts/project-docs.cjs next --root <项目根>
```

脚本会机械推导当前流水线下一环节的建议操作（如 `proposal accepted -> spec`、`spec approved -> plan`、`plan approved -> execute-plan`）。

### Step 3：按需深入目标文档

仅针对当前焦点读取必要文档，避免全量通读所有历史文件制造上下文污染：
- 当前存在进行中的 Change → 读取 `docs/changes/CR-###-<slug>/` 三件套；
- 需要了解阶段排期与任务分配 → 读取 `docs/roadmap.md`；
- 需要了解系统能力地图与模块边界 → 读取 `docs/blueprint.md`；
- 需要了解工程纪律与编码门禁 → 读取 `docs/constitution.md`。

### Step 4：向用户结构化报告

向用户汇报 4 项核心事实：
1. **当前焦点**：当前活跃的 Change 编号、标题及所处阶段；
2. **推荐动作**：下一阶段建议执行的具体技能与命令；
3. **阻塞与风险**：是否有未决问题、测试阻塞或未满足的前置门禁；
4. **建议路由**：明确推荐用户下一步使用的技能（`change` / `spec` / `plan` / `execute-plan` / `verify-plan` / `bug`）。

## Quality Checklist

- [ ] 已通过 `node scripts/project-docs.cjs status` 获取最新客观状态，无凭空猜测
- [ ] 准确区分了本地私有状态与全局共享 Change 状态
- [ ] 未对工作区或 `docs/` 文件做任何写操作（保持纯只读）
- [ ] 仅按需深入当前活跃 Change 的关联文件，未盲目全局扫描历史文档

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| 解析 `.project-kit/state.md` 与 `docs/changes/` | 呈现结构化状态摘要，排除无关干扰信息 |
| `next` 命令推导标准流程下一步 | 明确指出阻塞点并推荐合适的下一个技能 |
| — | **禁止**：修改任何文件、修改任何状态、盲目全局通读 |

## Stop Conditions

- 项目尚未初始化 `docs/` → 报告现状，建议先执行 `init`
- CLI 脚本不存在或执行报错 → 降级为直接检查 `.project-kit/state.md` 与 `docs/changes/` 目录，同时如实汇报脚本缺失

## Handoff Rule

报告状态后，根据当前焦点与下一动作平滑交接：
- 尚无进行中的 Change，需梳理新需求 → `brief` 或 `change`
- 存在 accepted Proposal，Spec 待编写 → `spec`
- 存在 approved Spec，Plan 待制定 → `plan`
- 存在 approved Plan，待执行编码 → `execute-plan`
- Plan 任务全部完成，待独立验收 → `verify-plan`
- 发现系统缺陷 → `bug`

## Anti-Patterns 负面清单

1. **严禁凭记忆猜测状态**：接手新任务时严禁直接凭上轮对话记忆开始修改代码。
2. **严禁做任何写入操作**：Status 技能是纯只读查询，严禁顺手修改任何文件。
3. **严禁全量通读所有历史三件套**：历史变更已归档，只读取当前活跃 Change 相关文档，避免污染上下文。
