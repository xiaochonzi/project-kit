---
name: blueprint
description: Use when confirmed requirements need a system architecture — capability map, module boundaries, data flows, cross-module constraints. Use after brief has produced a confirmed Brief, or when accepted changes accumulate. If no confirmed requirements exist, use brief first.
---

# Blueprint

## Overview

根据已归档的 Brief 与已接受 Change 的 Proposal，建立顶层系统能力地图和模块职责边界，写入 `docs/blueprint.md`。

- **Blueprint 回答**：系统由哪些顶层能力组成？模块边界怎么划分？核心数据怎么流动？什么明确不做？跨模块有哪些长期约束？
- **Blueprint 不回答**：阶段交付排期（归 Roadmap）、具体功能字段契约（归 Change Spec）、任务实现细节与代码修改（归 Change Plan）。

## The Iron Law

```
NO ARCHITECTURE FROM UNVERIFIED REQUIREMENTS
```

**严禁基于未经确认的需求构建架构。Blueprint 只提炼已冻结的架构共识，不写内部代码细节，不写交付排期。**

**开始前宣布：**“我正在使用 blueprint 技能和您一起设计系统架构。”

## Required Inputs

- [ ] `docs/` 目录已初始化（否则路由至 `init`）
- [ ] 存在至少一个已确认的需求来源：`docs/briefs/BRIEF-###.md`（状态为 `captured`）或 `docs/changes/CR-###-<slug>/proposal.md`（状态为 `accepted`）
- [ ] 若无已确认需求，停止并路由至 `brief` 或 `change`

## 产物契约（docs/blueprint.md）

`docs/blueprint.md` 包含以下 **14 个二级标题（`##`）**，编写时标题必须精确匹配，**严禁添加数字序号**，所有章节均需填写：

```markdown
## 背景与目标
一句话阐述该系统解决的核心问题与业务定位。

## 非目标
明确不做的系统能力与范围边界（如“初期不做多设备实时协同”）。

## 用户与核心场景
系统服务的目标角色与最核心的 2-3 个高频使用场景。

## 成功标准
系统级的可验证指标与运行基线（而非单个功能的验收点）。

## 系统能力地图
顶层能力分组，每项明确归属与来源（如“- 采集系统：网页采集、微信采集”）。

## 模块与职责边界
对每个架构模块明确定义：职责、对外接口抽象、数据所有权、失败边界。

## 核心数据流
绘制 2-3 条最核心的数据流动路径（文字链路或 Mermaid/ASCII 图）。

## 外部系统边界
与外部服务、第三方平台或外部依赖的交互协议与边界。

## 数据权威
每份核心业务数据的唯一写入源（哪个模块写，谁只读，杜绝双写冲突）。

## 跨模块约束
长期有效的全局技术铁律（如“API 层严禁直接操作数据库”“渲染进程禁止直接调用底层系统 API”）。

## 非功能要求
系统级性能、可用性、安全与合规要求（可验证判据，避免模糊形容词）。

## 风险与假设
当前架构设计所依赖的前提假设与已知系统性风险。

## 未决问题
当前尚未定论的架构设计分歧。

## 修订记录
每次架构修订的日期、摘要及触发来源（对应 BRIEF-### 或 CR-### 编号）。
```

## Process

### Step 1：读取已确认需求源

检查并读取上下文：
- 运行 `node scripts/project-docs.cjs status --root <项目根>` 查看全局状态。
- 读取 `docs/briefs/` 下的 Brief 归档以及 `docs/changes/` 下状态为 `accepted` 的 Proposal。
- **严禁**处理处于 `proposed` 或 `deferred` 状态的未批准需求。

### Step 2：提炼系统能力地图

将各需求点的期望结果聚合为顶层能力分组（按业务能力聚类，而非逐需求平铺）：
- 与用户按能力群逐步确认，一个能力群讨论收敛后再讨论下一个。
- 无法归入现有分组的新需求，讨论确定是新建能力群还是需求边界有误。

### Step 3：划定模块职责边界

依据能力地图定义系统模块，每个模块必须明确回答 4 个核心问题：
1. **职责**：该模块唯一负责的核心价值是什么？
2. **对外接口**：其他模块通过什么方式与其交互（函数调用、REST、RPC、事件发布等，不写具体类名和方法签名）？
3. **数据所有权**：该模块拥有哪些数据的写入生命周期？哪些数据仅供外部只读？
4. **失败边界**：该模块发生故障或崩溃时，哪些周边能力受影响？哪些能力保持可用隔离？

### Step 4：梳理核心数据流与跨模块约束

1. 梳理端到端的核心数据流动链路（如：`UI 输入 -> 控制层参数校验 -> 服务层业务处理 -> 仓储层持久化`）。
2. 制定可客观验证的跨模块约束（禁止跨层反向调用、统一异常传播规范等）。

### Step 5：写入与更新 blueprint.md

- **首次创建**：填写全部 14 个章节，frontmatter 中 `source` 数组填入对应的 `BRIEF-###` 编号。
- **增量更新**：仅修改变动章节，在 `## 修订记录` 中追加修订日期、变动摘要和对应的 `CR-###` 编号。严禁全局盲目重写无关章节。

### Step 6：机械校验与自检

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

自检清单：
1. 占位符排查：无 `TODO`、`TBD` 或未替换标记残留。
2. 边界一致性：能力地图与已确认需求完全对应，未凭空臆造未确认功能。
3. 纯粹性：不含具体文件代码路径、不含单个功能字段定义、不含阶段交付时间表。

## Quality Checklist

- [ ] 架构设计基于已确认的 Brief 或 accepted Proposal，无凭空臆造的能力
- [ ] 14 个标准二级标题精确匹配，无数字前缀，无遗漏章节
- [ ] 模块定义覆盖：职责、对外接口、数据所有权、失败边界
- [ ] 跨模块约束具备明确客观的检查标准
- [ ] frontmatter 的 `source` 引用完整
- [ ] `validate` 校验通过，0 错误

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| `init` 生成 blueprint.md 初始骨架 | 提取已确认需求事实，归纳能力群 |
| `validate` 校验 frontmatter、source 引用及结构 | 明确模块职责、划分失败边界与数据权威 |
| — | **禁止**：编写具体代码文件实现、定义单一功能字段、排定交付排期 |

## Stop Conditions

- 缺乏已确认的 Brief 或 accepted Proposal 作为输入 → 停止，路由至 `brief` 或 `change`
- 架构存在影响系统边界的未决分歧且用户未裁决 → 停止更新，等待用户决策
- 需求变更仅为已有模块内部的单一功能演化 → 不修改 Blueprint，直接路由至 `change`

## Handoff Rule

Blueprint 确立或更新完成后：
- 需要拆解交付阶段与里程碑任务 → `roadmap`
- 准备立即开始特定功能的实施 → `change`

## Anti-Patterns 负面清单

1. **严禁按功能点 1:1 设模块**：模块是长期稳定的架构单元，严禁将单一功能或单一接口直接定义为一个独立模块。
2. **严禁越界编写实现细节**：严禁在 Blueprint 中书写具体编程语言的代码片段、类名、文件目录路径。
3. **严禁定义交付时间线**：“第一期做什么、第二期做什么”属于 Roadmap 职责，严禁写入 Blueprint。
4. **严禁数字前缀标题**：严禁书写 `## 1. 背景与目标`，必须为精确的 `## 背景与目标`。
