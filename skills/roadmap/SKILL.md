---
name: roadmap
description: Use when you have a confirmed Blueprint and need to plan the delivery — splitting system capabilities into phases with task lists recorded in roadmap.md. Use after blueprint has produced the system architecture. If no Blueprint exists, use blueprint first.
---

# Roadmap

## Overview

把 Blueprint 的系统能力拆解为可增量交付的阶段与任务清单，写入 `docs/roadmap.md`。

- **Roadmap 回答**：分几个阶段？每个阶段交付什么可验收的系统状态？每个阶段包含哪些任务（Change）？各任务完成情况如何？
- **Roadmap 是静态规划事实**：保存阶段与任务清单。**动态工作状态（当前在做哪个任务、下一步执行什么）严禁写入 Roadmap，由本地私有文件 `.project-kit/state.md` 的 `active_change` / `next_action` 承担。**

## The Iron Law

```
ROADMAP PLANS — LOCAL STATE TRACKS — NO ACTIVE/NEXT IN ROADMAP
```

**Roadmap 只记录阶段与任务的规划与完成事实。严禁在 Roadmap 中设立 Active / Next / Later 分区。纵向切片交付价值，严禁按技术层横向拆分。**

**开始前宣布：**“我正在使用 roadmap 技能和您一起规划交付路线。”

## Required Inputs

- [ ] `docs/` 目录已初始化；否则先使用 `init`
- [ ] `docs/blueprint.md` 存在且核心章节（能力地图、模块边界）已填写完备；若无，停止并路由至 `blueprint`
- [ ] 当前诉求为规划交付排期或调整阶段任务状态

## 产物契约（docs/roadmap.md）

`docs/roadmap.md` 必须按以下标准结构组织：

```markdown
## 排序原则
说明阶段先后顺序的技术依赖、业务价值或风险验证依据。

## 阶段一：<阶段名称>
每个阶段是端到端可验证的系统状态（纵向切片）。直接放置任务表格：

| 任务 | 状态 | Change |
| --- | --- | --- |
| 支持按标签筛选待办 | 已完成 | CR-001 |
| 添加与列出待办 | 进行中 | CR-002 |
| 导入外部来源内容 | 规划中 | — |

## 阶段二：<阶段名称>
后续阶段保持粗粒度，任务状态为“规划中”，Change 为“—”。

| 任务 | 状态 | Change |
| --- | --- | --- |
| <后续任务概述> | 规划中 | — |

## 依赖与风险
跨阶段的核心外部依赖与潜在风险预案。

## 修订记录
记录每次调整阶段排期的日期、摘要及依据。
```

### 任务状态列三档规则

| 状态 | 严格含义 | 何时更新 |
|---|---|---|
| `规划中` | 任务已规划，对应的 Change 尚未立项创建 | 初始规划时默认填入 |
| `进行中` | Change 已被接受（accepted），正在设计或编码 | `change` 技能迁移为 accepted 时 |
| `已完成` | Change 已通过独立验收（completed） | `verify-plan` 技能验收通过时 |

## 阶段设计原则

### 1. 纵向切片，严禁横向分层
- **正例（纵向切片，每个阶段均可端到端演示与验收）**：
  - 阶段一：用户可在界面创建并保存本地工作区
  - 阶段二：用户可采集外部网页内容并归档
  - 阶段三：系统可把归档内容编译为 Wiki 页面
- **反例（横向技术层拆分，长时间无可交付成果）**：
  - 阶段一：设计并创建数据库表
  - 阶段二：实现全部后端 Service
  - 阶段三：编写前端页面 UI
  - 阶段四：编写测试

### 2. 远期粗粒度原则
- **当前阶段**：任务清单细化（每项任务对应一个明确的 Change 预期）。
- **后续阶段**：保持粗粒度，仅列出一句话目标与占位任务，严禁过早细化导致大量失效文档。

## Process

### Step 1：读取 Blueprint 与依赖关系

读取 `docs/blueprint.md` 中的系统能力地图、模块职责、非目标与风险假设。明确各能力之间的硬性前置依赖。

### Step 2：对话确认阶段划分与优先级

与用户交互确认首个交付闭环：
1. 第一个可独立演示和端到端验收的系统状态是什么？
2. 为什么该阶段排在首位（核心价值、风险最高、还是前置依赖）？
3. 该阶段包含哪几个可独立交付的原子任务？

### Step 3：梳理后续阶段

列出后续阶段的大致目标与占位任务（状态标为 `规划中`，Change 标为 `—`）。

### Step 4：写入或更新 roadmap.md

按产物契约编辑 `docs/roadmap.md`。
- 新增任务时状态写 `规划中`，Change 写 `—`。
- 已关联 Change 的任务填入真实编号（如 `CR-001`）。

### Step 5：启动首个 Change（按需）

当前阶段准备启动开发时，通过 `change` 技能立项首个任务，并将对应表格行的状态更新为 `进行中`，Change 列填入新分配的 `CR-###`。

### Step 6：机械校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

确保 `validate` 0 错误。

## Quality Checklist

- [ ] 基于已确认的 Blueprint 能力地图进行规划
- [ ] 阶段采用端到端纵向切片，严禁按技术分层（如前端/后端/DB）横向拆分
- [ ] 任务表格状态严格限定为“规划中 / 进行中 / 已完成”，Change 列格式规范（`CR-###` 或 `—`）
- [ ] 绝无 Active / Next / Later 动态分区（动态状态在 `.project-kit/state.md`）
- [ ] 后续阶段保持粗粒度，避免过早过度设计
- [ ] `validate` 校验通过，0 错误

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| `init` 生成 roadmap.md 初始骨架 | 读取 Blueprint，纵向切片拆分阶段 |
| `validate` 校验文档结构与引用完整性 | 与用户对话确认优先级，维护任务表格 |
| — | **禁止**：横向技术分层、写入动态工作状态、过早过度细化远期任务 |

## Stop Conditions

- Blueprint 不存在或为空骨架 → 停止，路由至 `blueprint`
- 阶段划分存在争议且用户未确认优先级 → 停止落盘，等待用户决策
- 发现某个任务属于架构探索或原型预研 → 提示用户先在 `docs/research/` 开展或先做 Brief

## Handoff Rule

- Roadmap 规划或更新完成 → `change`（启动当前阶段首个任务的立项）
- 仅查看当前执行进度与下一动作 → `status`

## Anti-Patterns 负面清单

1. **严禁按技术架构层横向拆分阶段**：严禁出现“第一阶段建数据库，第二阶段写接口，第三阶段写前端”的分阶段方式。
2. **严禁在 Roadmap 中记录动态状态**：严禁创建 `## Active`、`## Next` 分区，动态状态必须统一保存在 `.project-kit/state.md`。
3. **严禁过早细化远期阶段**：远期阶段必须保持粗粒度占位，避免产生大量注定过期的无效设计。
4. **严禁非标准任务状态**：任务表格状态列严禁使用除“规划中”“进行中”“已完成”之外的随意字符。
