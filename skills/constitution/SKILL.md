---
name: constitution
description: Use when a project needs stable development rules established or updated — coding gates, testing requirements, documentation discipline, collaboration conventions. Use even for simple-sounding requests like "set up project rules" or "define our coding standards". If the project has no docs yet, use init first.
---

# Constitution

## Overview

通过与用户交互对话，为项目制定长期稳定的工程开发准则，写入 `docs/constitution.md`。

Constitution 定义“怎么做”（工程约束、质量门禁、测试标准），不定义“做什么”（业务功能）。它是 `plan`（影响分析）、`execute-plan`（编码门禁）、`verify-plan`（规范验收）、`bug`（回归标准）的统一约束来源。

## The Iron Law

```
NO RULES WITHOUT USER CONFIRMATION — NO FABRICATED FACTS
```

**每条规则必须有来源（代码事实或用户明确确认）。严禁 AI 凭空臆造仓库事实与规范。**

**开始前宣布：**“我正在使用 constitution 技能和您一起制定开发准则。”

## Required Inputs

- [ ] `docs/` 目录已存在并初始化（若未初始化，路由至 `init` 技能，不自行手建）
- [ ] 用户可参与交互对话（准则必须经用户确认，AI 不单方面代订纪律）

## 产物契约（docs/constitution.md）

`docs/constitution.md` 包含 12 个标准章节，本技能负责用**可验证的规则**填满它们：

| 章节 | 核心内容 | 边界限制 |
|---|---|---|
| 产品原则 | 顶层不可违背的体验与业务边界 | 不写具体功能方案 |
| 架构原则 | 技术选型约束、分层依赖规则 | 不写模块内部实现细节 |
| 模块与进程边界 | 模块职责划分、允许的调用方向 | 不写局部配置参数 |
| 数据权威与一致性 | 数据唯一事实来源、读写策略 | 不写具体表结构与字段定义（归 Spec） |
| 类型与接口原则 | 接口契约规范、通用命名约定 | 不列出具体业务接口列表 |
| 安全与隐私原则 | 数据收集边界、鉴权与敏感数据策略 | 不写业务代码具体实现 |
| 测试与验证原则 | 测试框架、必测场景、验证命令 | 不写具体业务测试用例 |
| 文档与追踪原则 | 文档落盘纪律、状态流转规则 | 不复制完整文档模板 |
| 依赖管理原则 | 允许/禁止的依赖、版本约束 | 不列出 package.json 全部内容 |
| 禁止事项 | 明确禁止的架构与编码反模式 | 保持简洁明确，可简述理由 |
| 准则变更流程 | 修改本准则所需的审批或讨论流程 | 保持流程精炼 |
| 修订记录 | 每次变更的日期与摘要 | 避免冗长过程描述 |

## 规则写作铁律

1. **每条规则必须可验证**：提供具体验证命令或客观判据，使无上下文 AI 能独立判断是否违规。
   - **反例（不可验证）**：“代码要写好，测试要覆盖到位。”
   - **正例（可验证）**：“使用 `node:test` 编写单元测试，覆盖核心计算逻辑；提交前必须运行 `node --test` 通过。”
2. **每条规则必须有来源**：
   - **代码事实**：扫描配置和代码后向用户确认：“检测到配置了 ESLint，校验命令为 `npm run lint`，是否纳入准则？”
   - **用户确认**：用户明确口头提出，但仓库尚未体现，标注 `(用户确认)`。
   - **严禁臆造**：仓库为 JavaScript，严禁擅自写入“必须使用 TypeScript strict mode”。

## Process

### Step 1：确认场景

检查项目现状：
- `docs/constitution.md` 已存在且非空骨架：**场景 D（更新现有准则）**
- `docs/constitution.md` 为初始骨架（含空章节或模板标记）：**场景 A/B/C（新建准则）**
- `docs/` 不存在：停止并路由至 `init`

### Step 2：扫描已有代码事实（场景 B/C）

扫描关键配置文件，提取成形的模式（命令、工具、脚本）：

```bash
ls package.json .eslintrc* .prettierrc* tsconfig.json jest.config.* vitest.config.* pom.xml build.gradle 2>/dev/null
head -n 30 AGENTS.md CLAUDE.md README.md 2>/dev/null
```

> **注意**：从配置文件提取事实；已有 `AGENTS.md` 仅作为对话参考，不直接当作不可动摇的事实源。

### Step 3：单话题逐步确认

一次只聚焦一个话题，不一次抛出一长串问题：
1. **技术栈与构建**：“项目构建与类型检查命令是什么？是否纳入架构原则？”
2. **代码质量与 Lint**：“静态检查命令是什么？提交前是否强制通过？”
3. **测试规范**：“测试框架与必测场景是什么？运行命令是什么？”
4. **提交规范**：“Git 提交信息是否有格式约定（如 Conventional Commits）？”
5. **禁止事项**：“是否有绝对禁止的技术方案（如禁止引入特定第三方库或禁止全局状态）？”

### Step 4：写入 constitution.md

按确认结果逐章节编辑 `docs/constitution.md`。暂未确认的章节标注 `(待确认)`，严禁脑补填空。

### Step 5：同步 AGENTS.md / CLAUDE.md（按需）

- 若不存在：创建最小 `AGENTS.md`，声明本项目开发准则见 `docs/constitution.md`。
- 若已存在：将长期工程规则收敛至 `docs/constitution.md`，保留操作指引命令。

### Step 6：机械校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

确保 `validate` 0 错误。

## Quality Checklist

- [ ] 全部 12 个章节均已处理，无未确认的编造内容
- [ ] 每条规则均有来源（代码扫描证据或用户明确确认）
- [ ] 每条规则均具备客观可验证性（含可执行命令或无歧义检查判据）
- [ ] 未混入业务功能契约（属于 Spec）或任务实现排期（属于 Plan）
- [ ] 通过 `node scripts/project-docs.cjs validate --root <项目根>` 校验

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| `init` 时生成 12 章节标准骨架 | 扫描仓库客观配置与代码事实 |
| `validate` 校验文件存在与基本结构 | 逐话题与用户对话，确认每条准则 |
| — | 将规则整理为可验证条目并落盘 |

## Stop Conditions

- `docs/` 目录尚未初始化 → 停止并路由至 `init`
- 用户当前不可交互（无法确认规则）→ 停止单方面写入规则
- 用户诉求是具体业务功能开发 → 路由至 `brief` 或 `change`

## Handoff Rule

准则确立并通过校验后：
- 需求尚需发散或梳理 → `brief`
- 需求已明确清晰 → `change`

## Anti-Patterns 负面清单

1. **严禁臆造规则**：严禁在未经用户确认或无代码事实支撑的情况下凭空编写准则。
2. **严禁不可验证空话**：“代码要规范”“质量要高”属于无意义空话，必须有命令或可审查标准。
3. **严禁混入业务逻辑**：业务状态机、API 接口、字段规则严禁写入 Constitution。
4. **严禁一次性抛出大量提问**：必须按主题逐步对话，避免用户认知过载。
