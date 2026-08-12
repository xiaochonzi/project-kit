---
name: status
description: Use when asking what the project state is — current change focus, next action, what's blocking. Read-only; use before starting any work in an unfamiliar project or a new session.
---

# Status

## Overview

只读查看项目当前状态与下一动作。**任何新会话或接手的第一个动作**——用 `status` 技能建立上下文,不猜。

**开始前宣布:** "我正在使用 status 技能查看项目状态。"

## Process

### Step 1: 运行状态命令

```bash
node scripts/project-docs.cjs status --root <项目根>
```

输出:`当前焦点`(STATE frontmatter 的 `active_change`)、`下一动作`(STATE frontmatter 的 `next_action`)、全部 changes 及其状态。

### Step 2: 读取接力文档

```bash
cat docs/STATE.md
```

`STATE.md` 是 AI 接力的首要入口:当前焦点、最近完成、决策、阻塞项、下一动作、恢复上下文。

### Step 3: 按需深入

- 当前 change 进行中 → 读 `docs/changes/CR-###-<slug>/` 三件套
- 需要交付顺序 → 读 `docs/roadmap.md`(阶段分组)
- 需要系统边界 → 读 `docs/blueprint.md` 相关章节
- 需要开发准则 → 读 `docs/constitution.md`

### Step 4: 报告

向用户报告:

- 当前焦点(active_change)与状态
- 下一动作(next_action)或建议(用 `next` 命令推导:`node scripts/project-docs.cjs next --root <项目根>`)
- 阻塞项(如有)
- 建议使用的下一个技能(change / plan / execute-plan / verify-plan / bug)

## 禁止

| 禁止的行为 | 为什么 |
|---|---|
| 读全部历史文档再开始 | 只读 STATE + 当前 change 目录,噪声最小化 |
| 不跑 status 直接猜焦点 | 状态以脚本输出为准,不靠记忆 |
| 修改任何文档 | 本技能只读;修改走对应技能 |

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "我记得上次做到哪了" | 会话之间记忆不可靠,status 是唯一事实源 |
| "直接开始吧,不用看状态" | 不看焦点=可能重复已完成工作或偏移范围 |
| "把 roadmap 全读一遍" | 只需要当前焦点与下一动作,按需深入 |
