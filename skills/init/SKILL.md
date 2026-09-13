---
name: init
description: Use when initializing a new project's documentation structure, or when a project has no docs/ directory yet and needs Project Kit conventions. Use even for simple-sounding requests like "set up docs" or "create project docs". If docs already exist, use status first.
---

# Init

## Overview

为目标项目创建 Project Kit 标准 `docs/` 目录结构与本地私有状态环境。初始化完成后，所有后续技能（`constitution` / `brief` / `blueprint` / `roadmap` / `change` / `spec` / `plan` / `execute-plan` / `verify-plan` / `bug` / `status`）均围绕约定的目录与文档开展工作。

## The Iron Law

```
SCRIPT CREATES — AI DETECTS, ROUTES, AND VERIFIES
```

**严禁 AI 手工创建目录或文档骨架。脚本是唯一合法的初始模板生成源。手工创建无法保证 frontmatter 字段与模板完全一致，后续校验必报错。**

**开始前宣布：**“我正在使用 init 技能初始化项目文档结构。”

## Required Inputs

- [ ] 已明确目标项目的根目录绝对路径（优先检测 `.git` 存在）
- [ ] 若未检测到 `.git`，必须向用户声明并获得项目根路径的明确确认

## 目录与文件契约

初始化后的标准目录与文件布局如下：

```text
<项目根>/docs/
├── constitution.md      # 长期稳定准则 → plan / execute-plan / verify-plan 约束来源
├── blueprint.md         # 系统顶层架构与能力地图 → brief / change 读写
├── roadmap.md           # 阶段规划与静态任务清单 → status 读写
├── briefs/              # BRIEF-###-<slug>.md（原始需求归档）
├── changes/             # CR-###-<slug>/{proposal,spec,plan}.md（Full 变更三件套）
├── research/            # 预研与研究材料
└── (capabilities/ 保留兼容，不预建)

<项目根>/.project-kit/   # 本地私有目录（gitignored，不入库）
└── state.md             # 当前焦点（active_change）、下一步行动与最近完成
```

> **注意**：Quick 变更走零文档模式（不落盘任何 change 文件，记录保存在 git commit 与本地 state.md 中）。

## Process

### Step 1：确认项目根目录

检查目标根目录：
- 存在 `.git`：确认有效。
- 不存在 `.git`：向用户确认：“未检测到 `.git`，确认将 `<路径>` 作为项目根目录吗？”，获得确认后再继续。

### Step 2：探测 docs/ 现状并路由

运行状态检测：

```bash
node scripts/project-docs.cjs status --root <项目根>
```

并检查文件系统：

```bash
test -d <项目根>/docs && ls -la <项目根>/docs || echo "docs/ 不存在"
```

根据探测结果分流到以下 4 个场景之一：

- **场景 A（全新初始化）**：`docs/` 目录不存在。
- **场景 B（已就绪）**：3 个根文档全部存在且 `validate` 0 错误，无非标准冲突文件。
- **场景 C（增量补齐）**：`docs/` 存在但部分根文档或受管子目录缺失，无非标准文件。
- **场景 D（结构冲突）**：`docs/` 存在非标准目录或多余文件。

### Step 3：按场景执行

#### 场景 A：全新初始化
直接运行：

```bash
node scripts/project-docs.cjs init --root <项目根>
```

CLI 会原子创建 3 个根文档、3 个受管子目录、本地私有 `.project-kit/state.md` 并更新根目录 `.gitignore`。

#### 场景 B：已就绪
**严禁重新运行 init**。直接向用户报告“项目文档结构已就绪，validate 0 错误”，引导至 `status` 或 `constitution`。

#### 场景 C：增量补齐
向用户列出缺失项与已有文件（确认已有文件不会被覆盖），获得确认后运行：

```bash
node scripts/project-docs.cjs init --root <项目根>
```

#### 场景 D：结构冲突
**不运行 init**。向用户列出冲突文件，提供处理选项：
1. **迁移**：将非标准文件归档至 `docs/research/` 后运行 `init`；
2. **重建**：删除临时无用文件后运行 `init`；
3. **保留现状**：用户不愿改动现有结构，停止初始化并退出。

### Step 4：核对与机械校验

运行校验命令：

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

确认输出含“错误: 0”。检查项目根 `.gitignore` 包含 `.project-kit/`。

## Quality Checklist

- [ ] 3 个根文档（`constitution.md`、`blueprint.md`、`roadmap.md`）存在且格式合法
- [ ] 3 个核心子目录（`briefs/`、`changes/`、`research/`）已创建
- [ ] `.project-kit/state.md` 存在且 `.project-kit/` 规则已追加至根目录 `.gitignore`
- [ ] 无未替换的模板标记（`grep -r "{{" docs/` 无输出）
- [ ] `node scripts/project-docs.cjs validate --root <项目根>` 0 错误

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| 创建目录、渲染并生成根文档与本地私有文件 | 探测项目现状并准确识别场景 |
| 追加 `.project-kit/` 至 `.gitignore` | 遭遇结构冲突时向用户提供选项与迁移建议 |
| 机械校验结构合法性 | 核对生成结果，确保 0 错误后交接 |

## Stop Conditions

- 用户未确认无 `.git` 的目录为项目根 → 停止操作
- 场景 D 中存在非标准文件冲突且用户未决定处理方式 → 停止运行 init
- 用户明确要求保持既有非标准目录结构 → 停止初始化并退出

## Handoff Rule

初始化成功且校验通过后：
- 项目缺少工程规范与开发准则 → `constitution`
- 项目已有明确准则，需要接收模糊想法或讨论需求 → `brief`
- 准备直接立项明确需求 → `change`

## Anti-Patterns 负面清单

1. **严禁手工创建文件**：严禁通过 `touch`、`mkdir` 或代码工具直接手建根文档与目录骨架。
2. **严禁忽略冲突直接覆写**：遇非标准文件严禁静默覆盖或强行 init，必须由用户决断。
3. **严禁带病推进**：若 `validate` 报错，严禁跳过校验直接交接给下游技能。
