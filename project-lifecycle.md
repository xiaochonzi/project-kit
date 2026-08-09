---
date: 2026-08-08
description: 定义大型项目从初始讨论、需求澄清、蓝图拆解、分阶段开发、验收，到后续变更和 AI 接力的统一文档工作流。
---

# 大型项目文档与 AI 协作生命周期

## 1. 文档目的

大型项目通常不是从一份边界清楚的功能需求开始，而是从一轮较自由的讨论开始。讨论中可能同时出现产品目标、用户场景、多个功能模块、技术设想、长期阶段和暂未确认的假设。如果直接把这种大文档交给 AI 编码，容易出现以下问题：

- 多个功能和阶段混在同一份文档中，无法判断当前应该实现什么。
- 产品目标、功能需求和技术实现没有分层，任何变化都会牵动整份文档。
- AI 在新会话中缺少上下文，会重复决策、扩大范围或偏离原始目标。
- 已完成需求被反复改写，无法知道某个版本当时交付了什么。
- 后续新增需求被直接插入当前任务，导致阶段不断膨胀。
- 只写完代码不代表功能完成，还必须运行测试并检查 Spec 验收标准。

本文定义统一的项目生命周期，把一个模糊想法逐层转换为边界明确、可追踪、可实现、可验收的工作单元，并规定项目迭代过程中如何维护文档、接收变化和完成 AI 接力。

本文关注的是项目管理事实和文档关系，不取代具体功能的产品设计，也不规定某种特定 AI 工具。

## 2. 核心原则

### 2.1 逐层细化

不要在项目开始时为所有远期功能编写代码级实现计划。

```text
远期：明确目标、边界和依赖
近期：明确阶段、功能和验收标准
当前：明确实现步骤、代码影响和测试方式
```

只有即将进入开发的功能才需要详细 Implementation Plan。

### 2.2 单一事实来源

同一个事实只能有一个权威位置：

| 事实 | 权威文档 |
| --- | --- |
| 产品目标、系统能力和长期边界 | Blueprint / `system-design.md` |
| 当前交付顺序和阶段状态 | `roadmap.md` |
| 某个阶段要形成的可验收系统状态 | Milestone 文档 |
| 某项功能必须实现什么 | Feature Spec |
| 某项功能具体怎么实现 | Implementation Plan |
| 为什么引入后续变化 | Change Request |
| 跨模块长期约束和技术决定 | Blueprint / `system-design.md` |
| 当前项目焦点和下一动作 | `STATE.md` |

上层文档只引用下层文档，不复制下层的详细内容。

### 2.3 已完成事实不可被重写

已验收的 Feature Spec 记录的是当时被批准和交付的功能契约。后续新增能力通过新的 Change Request 和新的 Feature Spec 表达，不回头把旧 Spec 扩写成新版本需求。

允许修正错别字、失效链接和不改变语义的表述，但不得静默改变已验收功能的边界或验收标准。

### 2.4 按用户价值纵向切片

阶段和功能应形成可以演示、运行或验收的闭环，不按数据库、后端、前端、测试等技术层横向拆分。

```text
推荐：用户提交来源 → 系统保存 → UI 展示结果 → 可以验收

不推荐：
阶段一：建表
阶段二：写 Service
阶段三：写 UI
阶段四：补测试
```

### 2.5 需求和实现分离

- Feature Spec 定义“必须实现什么”。
- Implementation Plan 定义“准备怎么实现”。
- 代码、测试和 Git 记录保存“实际上实现了什么”。
- 验证方式和完成条件写入 Plan，执行结果写入 `STATE.md`。

Spec 不写文件级任务，Plan 不扩大 Spec 范围。

### 2.6 AI 不替用户补产品决定

AI 可以整理、比较、拆解和发现矛盾，但遇到会改变目标、范围、用户行为或数据边界的未决问题时，必须暂停并让用户决定。未经确认的假设应进入“未决问题”，而不是被 AI 当成既定事实。

## 3. 项目文档层级

完整文档链路如下：

```text
Idea / Discussion
  ↓
Design Brief
  ↓
Requirements
  ↓
Blueprint
  ↓
Roadmap
  ↓
Milestone + Feature Map
  ↓
Feature Spec
  ↓
Implementation Plan
  ↓
Code + Tests + STATE 更新

后续新增需求：Change Request → 上述对应层级
缺陷：Bug Record → 修复 → 回归测试
当前状态：STATE.md
```

### 3.1 Design Brief

Design Brief 保存最初讨论产生的项目雏形，包括背景、想法、用户问题、候选能力、限制和未知项。

它是原始输入，不是可以直接开发的 Spec。确认后原则上不再改写正文，以便后续追溯原始意图。发现新信息时创建补充 Brief 或 Change Request。

建议路径：

```text
docs/briefs/YYYY-MM-DD-<topic>.md
```

最低内容：

```markdown
# Brief 标题

## 背景
## 想解决的问题
## 目标用户与场景
## 初步能力设想
## 已知约束
## 假设
## 未决问题
## 讨论中明确不做的内容
```

### 3.2 Requirements

Requirements 把 Brief 中的自然语言拆成原子需求，每条需求必须有稳定 ID，并能够映射到后续 Milestone 和 Feature。

```markdown
| ID | 需求 | 类型 | 优先级 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- |
| REQ-001 | 用户可以导入微信公众号链接 | functional | must | BRIEF-001 | accepted |
| REQ-002 | 每个知识单元必须保留证据引用 | constraint | must | BRIEF-001 | accepted |
| REQ-003 | 第一版支持 PDF | functional | later | BRIEF-001 | deferred |
```

要求：

- 一条需求只表达一项可判断的能力或约束。
- 使用“必须、可以、不得”等可验证表达，避免“体验良好”“功能完善”等模糊描述。
- 每条接受的需求必须被某个 Feature 覆盖，或者明确标记为 `deferred` / `rejected`。
- 技术方案不是产品需求，除非它本身是不可变约束。

### 3.3 Blueprint

Blueprint 描述当前项目的全局形态，是持续维护的当前事实，由 `docs/system-design.md` 承担这一职责。

Blueprint 应包含：

- 产品目标和成功标准。
- 用户与核心使用场景。
- 系统能力地图。
- 模块职责和边界。
- 核心数据流。
- 跨模块约束和非功能要求。
- 明确不做的内容。
- 仍未决定的问题。

Blueprint 不包含：

- 每个文件如何修改。
- 单个功能的完整验收标准。
- 当前开发任务列表。
- 所有远期功能的详细设计。

Blueprint 可以更新，但每次更新必须能够追溯到初始 Brief 或 Change Request。普通功能增加不创建整份 `blueprint-v2-final.md`；只有产品目标、用户模型或核心架构发生根本变化时，才归档旧蓝图并建立新的主要版本。

### 3.4 Roadmap

Roadmap 定义交付顺序、依赖和当前状态，不承担详细需求说明。

每个 Milestone 必须描述一个可验收的系统状态。例如：

```text
M1：用户可以创建工作区并安全保存文件
M2：用户可以导入并归档一篇来源
M3：系统可以把来源编译为带引用的 Wiki 页面
```

Roadmap 建议区分：

- `Active`：当前正在实施。
- `Next`：已经批准且依赖基本具备。
- `Later`：方向已接受，但尚未细化。
- `Completed`：所有 Feature 已验证且满足阶段退出标准。
- `Deferred`：明确暂缓。

Roadmap 中只保存阶段摘要、状态、依赖和文档链接。阶段详细范围放在 Milestone 文档中。

### 3.5 Milestone 与 Feature Map

Milestone 定义一个迭代需要达到的可验收结果，Feature Map 把该结果拆成多个功能单元。

Milestone 最低内容：

```markdown
---
id: M10
status: planned
depends_on: [M9]
---

# Milestone 标题

## 阶段目标
## 用户可见结果
## 包含
## 不包含
## 前置依赖
## Feature Map
## 阶段退出标准
## 风险与未决问题
```

Feature Map 示例：

```text
M10 Wiki 编译基础闭环
├── F-M10-01 标准化来源内容
├── F-M10-02 提取知识单元（依赖 F-M10-01）
├── F-M10-03 生成 Wiki 页面（依赖 F-M10-02）
└── F-M10-04 从 UI 启动编译并展示结果（依赖 F-M10-03）
```

Milestone 的退出标准必须描述阶段级结果，不能只是“所有代码已经完成”。

### 3.6 Feature Spec

Feature Spec 是开发和验收共同使用的功能契约。一个合格 Feature 应具有单一主要目标、清楚的输入输出、明确边界，并可以独立测试和验收。

```markdown
---
id: F-M10-03
title: Wiki 页面生成
status: draft
milestone: M10
source_requirements: [REQ-010, REQ-011]
depends_on: [F-M10-02]
---

# Wiki 页面生成

## 1. 问题
## 2. 目标
## 3. 用户流程
## 4. 包含范围
## 5. 不包含范围
## 6. 输入与输出
## 7. 业务规则
## 8. 系统边界与接口契约
## 9. 异常和边界情况
## 10. 验收标准
## 11. 依赖
## 12. 未决问题
```

需要继续拆分 Feature 的信号：

- 包含多个不同的用户结果。
- 存在多个可以独立验收的流程。
- 同时改变多个彼此无关的业务域。
- 有明显不同的失败条件和上线风险。
- 无法在一次可控实现中完成。

按钮、数据库表、IPC channel、某个 interface 通常属于 Plan 任务，不是 Feature。

### 3.7 Implementation Plan

Implementation Plan 只能基于已批准、没有阻断性未决问题的 Feature Spec 创建。

最低内容：

```markdown
---
feature: F-M10-03
spec_version: 1
status: draft
---

# F-M10-03 实现计划

## 1. 实现目标
## 2. 设计依据与约束
## 3. 当前代码事实
## 4. 实现方案
## 5. 受影响模块和文件
## 6. 数据流与接口变化
## 7. 数据库或迁移变化
## 8. 按依赖排序的实施步骤
## 9. 每一步对应的测试
## 10. 完整验证方式
## 11. 风险和停止条件
## 12. 明确不做的内容
```

每个实施步骤应当说明：

- 修改什么。
- 为什么必要。
- 依赖哪一步。
- 如何验证。
- 对应哪一条 Spec 验收标准。

Plan 不得引入 Feature Spec 没有要求的新能力。发现 Spec 缺失或矛盾时，应停止计划，先修正并重新批准 Spec。

### 3.8 Change Request

Change Request 接收初始蓝图之后的新需求。它先描述为什么变化和影响什么，不直接生成代码计划。

```markdown
---
id: CR-003
status: proposed
created_at: 2026-08-08
---

# 变更标题

## 需求来源
## 当前问题
## 期望结果
## 与现有能力的关系
## 可能影响的模块和文档
## 初步规模
## 优先级建议
## 未决问题
## 处理结论
```

Change Request 评审后必须得到一种明确结果：

- 接受并映射到现有 Milestone 的新 Feature。
- 接受并创建新的 Milestone。
- 接受并拆成多个有依赖关系的 Milestone。
- 需要 Blueprint 和 Roadmap 调整。
- Deferred。
- Rejected，并记录原因。

跨模块长期约束和技术决定直接更新 Blueprint；只影响一个功能的决定写入对应 Feature Spec。

### 3.9 Bug Record

如果实现违反已批准 Spec，它是 Bug；如果原 Spec 从未要求某项行为，它是新增需求。

Bug 文档应记录：

- 现象和复现条件。
- 预期行为及对应 Spec。
- 根因。
- 最小修复。
- 回归风险。
- 验证证据。

普通 Bug 不需要创建新的产品 Feature，也不借机加入额外能力。

### 3.10 STATE.md

`STATE.md` 是 AI 接力的首要入口，只保存当前事实，不保存长篇设计。

建议内容：

```markdown
# Project State

## 当前 Blueprint 和 Roadmap
## 当前 Active Milestone
## 当前 Feature
## 当前 Plan
## 已完成的最近工作
## 正在进行的工作
## 阻塞项和待用户决定事项
## 近期关键决定
## 下一步唯一动作
## 最后更新时间
```

下一位 AI 应先阅读 `STATE.md`，再按链接读取当前 Milestone、Feature Spec 和 Plan，而不是加载所有历史文档。

## 4. 从一次讨论到项目雏形

### 4.1 阶段 A：自由讨论

目标是探索问题，不急于形成实现方案。

AI 应帮助用户讨论：

- 谁遇到了什么问题。
- 当前替代方案为什么不足。
- 理想结果是什么。
- 哪些场景最重要。
- 什么约束不能违反。
- 哪些设想只是可能性。

此阶段允许发散，但必须区分：

- 用户明确确认的事实。
- AI 提出的候选方案。
- 尚未验证的假设。
- 需要用户决定的问题。

输出是 Design Brief，而不是 Implementation Plan。

### 4.2 阶段 B：结构化审计

对 Brief 进行分类，不立即补全缺失信息：

1. 产品目标。
2. 用户和场景。
3. 功能能力。
4. 业务规则。
5. 数据和接口约束。
6. 非功能要求。
7. 假设。
8. 未决问题。
9. 明确不做的内容。

同时识别：

- 重复表述。
- 相互矛盾的要求。
- 一个句子中混合的多个需求。
- 没有验收方式的模糊要求。
- 被技术方案掩盖的真实用户需求。

阻断性问题没有解决前，不进入详细拆解。

### 4.3 阶段 C：形成原子 Requirements

把确认内容转化为带 ID 的原子需求，并让用户确认：

- 是否真的需要。
- 优先级是 Must、Should 还是 Later。
- 第一版是否包含。
- 如何判断已经满足。

未确认内容不能以 accepted 需求进入后续设计。

### 4.4 阶段 D：形成 Blueprint

根据已接受 Requirements 建立系统能力地图和模块边界。此时关注“系统由哪些能力组成、它们如何协作”，不进入文件级实现。

Blueprint 评审重点：

- 是否覆盖核心用户流程。
- 模块职责是否互斥且完整。
- 数据权威和生命周期是否清楚。
- 跨模块约束是否一致。
- 是否明确第一版不做什么。
- 是否存在还未解决的重大架构问题。

### 4.5 阶段 E：形成 Roadmap

把 Blueprint 拆成能够逐步交付的 Milestones。优先顺序综合考虑：

- 用户价值。
- 技术依赖。
- 最大风险和未知项。
- 能否形成最小闭环。
- 后续返工成本。

基础设施可以成为阶段内容，但每个阶段仍应尽量服务于一个可验证结果，而不是只罗列技术组件。

### 4.6 阶段 F：细化当前 Milestone

只为当前或下一个 Milestone 创建完整 Feature Map 和 Feature Specs。远期 Milestone 保持粗粒度，避免过早细化造成大量失效文档。

当前 Milestone 只有在以下条件满足后才进入开发：

- 目标和退出标准明确。
- 包含与不包含清楚。
- Feature 依赖无环。
- 每项 Feature 能够独立验收。
- 必要的前置研究和技术决定已经完成。

## 5. 单个功能的开发闭环

每个 Feature 使用相同闭环：

```text
Feature draft
  → 需求澄清
  → Feature approved
  → Implementation Plan
  → Plan review
  → Feature ready
  → 执行 Plan
  → 运行测试并检查验收标准
  → 更新 Feature、Roadmap 和 STATE
  → Feature verified
```

### 5.1 Feature 需求门禁

进入 Plan 前必须能够回答：

- 为什么需要这个功能？
- 谁使用它？
- 主要流程是什么？
- 输入、输出和边界是什么？
- 包含什么、不包含什么？
- 哪些规则必须满足？
- 依赖哪些已存在能力？
- 如何验收？
- 是否还有会改变方案的未决问题？

### 5.2 Plan 评审门禁

执行前必须确认：

- 每个步骤都服务于 Spec。
- 受影响模块和文件经过代码事实核对。
- 顺序符合依赖关系。
- 数据库、IPC 和跨进程变化被明确说明。
- 每个关键步骤有对应测试。
- 最终验证覆盖全部验收标准。
- 没有未授权的重构或顺手优化。

### 5.3 执行规则

AI 执行 Plan 时：

1. 读取当前 `STATE.md`、Feature Spec 和 Plan。
2. 核对代码现状是否仍与 Plan 一致。
3. 执行影响分析。
4. 按 Plan 顺序实施。
5. 每完成一组相关步骤就运行对应验证。
6. 在 `STATE.md` 记录完成内容、验证结果、计划偏差和下一动作。

遇到以下情况必须停止：

- 需要扩大 Feature 范围。
- 发现 Spec 自相矛盾。
- 需要用户作产品或架构决定。
- Plan 依赖的代码事实已经变化。
- 必须修改未授权模块才能继续。
- 验证失败且根因不属于当前范围。

### 5.4 完成检查

完成前必须从 Spec 出发逐条检查验收标准，并运行当前改动直接相关的构建、测试和必要的真实运行验证。验证命令、结果和未覆盖项记录在 `STATE.md`。

验收失败时：

- 如果实现不符合 Spec，返回当前 Feature 修复。
- 如果 Spec 本身错误，停止并重新评审需求，不能通过修改验收标准掩盖问题。
- 如果出现新的期望行为，创建 Change Request，不混入当前验收。

## 6. 多功能、多模块项目如何拆解

### 6.1 先拆能力地图，再拆阶段，最后拆 Feature

大型原始文档的拆解顺序应为：

```text
产品目标
  → 能力地图
    → Milestones
      → Feature Map
        → Feature Specs
```

不要直接从一份数十页的大文档生成数百个代码任务，因为这会跳过边界和依赖判断。

### 6.2 模块边界判断

模块边界可以根据以下因素判断：

- 数据所有权。
- 用户流程职责。
- 生命周期。
- 对外接口。
- 失败边界。
- 安全边界。

一个模块应该有明确职责，不因为当前代码文件位置而被定义。

### 6.3 阶段边界判断

一个 Milestone 应满足：

- 产生新的可验证系统状态。
- 可以独立决定是否继续后续阶段。
- 有明确前置依赖。
- 有明确退出标准。
- 不依赖所有远期能力才能证明价值。

### 6.4 Feature 边界判断

一个 Feature 应能够在一次受控实现中完成，并有独立验收标准。若 Feature 只有技术输出而没有用户或系统可观察结果，应检查它是否只是 Plan 中的一项任务。

## 7. 后续新增需求

### 7.1 统一入口

蓝图形成后的所有新增需求先进入 Change Request。不要直接修改 Roadmap、当前 Spec 或 Plan。

```text
新需求
  → CR proposed
  → 影响分析
  → 用户决策
  → accepted / deferred / rejected
  → 映射到一个或多个 Milestone 和 Feature
```

### 7.2 需求分类

| 类型 | 判断 | 处理方式 |
| --- | --- | --- |
| Bug | 当前实现违反已批准 Spec | Bug Record + 最小修复 + 回归验证 |
| 小型增强 | 新增一个边界独立的用户能力 | 新 Feature Spec |
| 大型能力 | 需要多个迭代才能形成最终能力 | 一个 Change Request + 多个 Milestones |
| 架构变化 | 改变跨模块约束或系统基本形态 | CR + Blueprint 更新 + Roadmap 调整 |
| 补充澄清 | 不改变已批准功能语义 | 更新尚未完成的 Spec 并重新评审 |

### 7.3 不同开发状态下的处理

#### Spec 仍是 draft

可以直接整合新增信息，因为功能边界尚未批准。

#### Spec 已 approved，但尚未开发

不改变边界的澄清可以更新并重新批准。新增用户能力应创建新的 Feature。

#### Feature 正在开发

默认不插入当前 Plan。先创建 CR，并决定进入当前迭代、Next 或 Later。只有以下情况可以中断当前范围：

- 不处理就无法满足当前验收标准。
- 涉及安全或数据损坏。
- 当前方案存在根本错误，继续开发会造成明确返工。

#### Feature 已 verified

不修改旧 Feature 的语义。创建新 Feature，并使用 `depends_on`、`extends` 或 `supersedes` 表达关系。

### 7.4 Blueprint 更新规则

普通新增功能只需要更新当前 Blueprint 的能力地图或边界，并在变更记录中引用 CR。只有产品目标、用户模型、数据权威或核心架构发生根本改变时，才建立 Blueprint 的新主要版本。

## 8. 一个新增能力需要多个迭代时

### 8.1 用 Change Request 保存跨阶段目标

当一项需求同时满足以下多个条件时，应在 Change Request 中保存整体目标，并拆成多个 Milestone：

- 需要多个可独立发布阶段。
- 横跨多个功能模块。
- 存在长期共同目标。
- 后续阶段取决于前一阶段的真实反馈。
- 无法在当前 Milestone 中安全完成。

### 8.2 按可用能力拆分

以多 Agent 协作为例：

```text
M10：用户可以手动创建一个子 Agent 并获得结果
M11：主 Agent 可以自动拆解任务并并行委派
M12：用户可以观察、中断和恢复执行
```

每个 Milestone 都形成可运行闭环。不要拆成“先数据库、再后端、再 UI”。

### 8.3 只细化最近阶段

- Change Request 保存最终目标，Roadmap 保存所有阶段的粗粒度关系。
- 当前 Milestone 生成完整 Feature Map。
- 当前即将开发的 Feature 生成详细 Spec 和 Plan。
- 后续 Milestone 等前一阶段完成并获得反馈后再细化。

这样可以在不丢失长期方向的同时，避免远期计划过早固化。

## 9. 文档状态模型

各文档类型有独立的主路径，辅助状态通用。完整流转规则见 `references/state-model.md`。

```text
Feature:
idea → draft → reviewed → approved → ready → in-progress → implemented → verified

Plan:        draft → approved → in-progress → completed
Execution:   in-progress → completed
Verification: pending → passed | failed | blocked
Milestone:   planned → active → completed
Change:      proposed → accepted → completed
                   ↘ deferred | rejected
```

辅助状态：

```text
blocked
deferred
rejected
cancelled
superseded
```

状态含义：

| 状态 | 含义 |
| --- | --- |
| `idea` | 尚未结构化的想法 |
| `draft` | 文档正在形成，边界可能变化 |
| `reviewed` | 已完成一轮审查，仍可能有待确认项 |
| `approved` | 目标和边界已由用户确认 |
| `ready` | 依赖、Plan 和验证方式已具备，可以实施 |
| `in-progress` | 正在实施 |
| `implemented` | 计划实施和直接验证完成，但尚未独立验收 |
| `verified` | 同一轮新鲜证据证明所有验收标准通过，是 Feature 的完成状态 |
| `completed` | Plan、Execution、Change、Milestone 的完成状态 |
| `blocked` | 存在明确阻塞条件 |
| `deferred` | 已决定暂缓 |
| `rejected` | 已决定不接受，并保留原因 |
| `cancelled` | 已批准工作被终止 |
| `superseded` | 被新的文档或能力取代 |

状态变化必须有事实依据，不能因为“看起来差不多完成”而跳到 `verified` 或 `completed`。

## 10. 需求追踪

每项开发成果应能反向追踪：

```text
Brief / Change Request
  → REQ
  → Milestone
  → Feature Spec
  → Implementation Plan
  → 代码、测试和完成状态
```

Feature Spec 头部至少记录：

```yaml
id: F-M10-03
source_requirements: [REQ-010, REQ-011]
source_changes: [CR-003]
milestone: M10
depends_on: [F-M10-02]
status: approved
```

Requirements 表应能够回答：

- 哪些需求已经接受？
- 每条需求由哪些 Feature 覆盖？
- 哪些 Feature 已经完成？
- 哪些需求被延期或拒绝？
- 是否存在接受但没有交付映射的需求？

## 11. AI 接力协议

### 11.1 AI 开始工作前

新 AI 会话不应直接读取所有历史文档，而应按顺序建立上下文：

1. 仓库 `AGENTS.md`：稳定开发约束。
2. `docs/STATE.md`：当前焦点、阻塞和下一动作。
3. `docs/system-design.md`：仅在需要理解系统边界时读取相关章节。
4. `docs/roadmap.md`：确认当前 Milestone 和优先级。
5. 当前 Milestone 文档。
6. 当前 Feature Spec。
7. 当前 Implementation Plan 或 Change Request。
8. 与当前任务直接相关的 Blueprint 章节和代码。

AI 开始行动前必须复述：

- 当前目标。
- 本次包含范围。
- 本次不包含范围。
- 当前权威文档。
- 依赖和阻塞项。
- 计划执行的下一动作。

如果复述与文档矛盾，先澄清，不开始实施。

### 11.2 AI 工作中的防偏移规则

AI 必须遵守：

- 每项修改都能映射到当前 Spec 或 Plan。
- 不因为发现相邻问题就扩大范围。
- 不把远期 Roadmap 项目提前塞进当前 Feature。
- 不把候选方案写成已决定事实。
- 不静默改变验收标准。
- 不修改已 verified Spec 的语义。
- 发现代码事实与 Plan 不同时立即报告。

可以用以下问题持续自检：

```text
我当前修改对应哪条 Feature 验收标准？
这项工作是否出现在已批准 Plan 中？
如果不做它，当前 Feature 是否仍能完成？
它是否需要新的产品或架构决定？
它是否应当成为 Change Request？
```

### 11.3 AI 结束工作时

每次工作结束必须留下接力信息：

- 完成了什么。
- 没有完成什么。
- 修改了哪些关键文件。
- 运行了哪些验证，结果是什么。
- 是否偏离 Plan，为什么。
- 新发现了哪些问题。
- 当前状态应该是什么。
- 下一步唯一动作是什么。

如果 Feature 尚未完成，不得用模糊表述声称完成。更新 `STATE.md`，让下一位 AI 能够从明确位置继续。

### 11.4 AI 上下文包

针对单次任务，推荐使用最小上下文包：

```text
必读：
- AGENTS.md
- STATE.md
- 当前 Feature Spec
- 当前 Plan

按需：
- 当前 Milestone
- Blueprint 相关章节
- 直接相关代码和测试

不默认读取：
- 已完成阶段的全部 Spec
- 所有研究报告
- 所有历史 Plan
- 与当前任务无关的模块文档
```

最小上下文减少噪声，但每个引用必须能沿追踪链找到上层依据。

## 12. 防止文档和实现偏移

### 12.1 文档更新责任

| 事件 | 必须更新 |
| --- | --- |
| 初始想法确认 | Brief、Requirements |
| 系统边界确认 | Blueprint |
| 阶段顺序确认 | Roadmap、Milestone |
| 功能边界确认 | Feature Spec |
| 实现方案确认 | Implementation Plan |
| 实现、测试和验收标准检查完成 | Feature 状态、Roadmap、STATE |
| 新需求进入 | Change Request |
| 跨模块技术决定 | Blueprint |
| Bug 修复 | Bug Record、验证证据 |
| 工作暂停或交接 | STATE |

### 12.2 不重复维护细节

Roadmap 不复制 Feature 验收标准，Feature Spec 不复制 Plan 文件列表。文档之间通过稳定 ID 和相对链接建立关系。

### 12.3 文档与代码冲突

发现冲突时先判断文档状态：

- 已批准 Spec 与代码冲突：代码尚未满足需求，除非用户重新批准需求变化。
- Plan 与代码现状冲突：Plan 失效，更新并重新评审后再执行。
- Blueprint 与已完成系统冲突：调查是文档漏更新还是实现未经授权偏移。
- 旧研究材料与当前文档冲突：当前已批准文档优先，研究材料只是参考。

### 12.4 定期一致性检查

每个 Milestone 结束或开始新 Milestone 前检查：

- Roadmap 状态是否与 Feature 状态一致。
- 是否存在 accepted REQ 没有 Feature 覆盖。
- 是否存在 Feature 没有需求来源。
- 是否存在实现后没有测试结果却标记为 verified 的功能。
- 是否存在已完成 Feature 仍有阻断性未决问题。
- 是否存在失效 Plan 仍标记为 ready。
- `STATE.md` 是否指向真实的当前工作。
- 相对链接是否有效。

## 13. 推荐目录结构

以下是完整结构。目录只在出现对应产物时创建，不为了形式预建空目录。

```text
docs/
├── README.md
├── STATE.md
├── system-design.md
├── roadmap.md
├── requirements.md
├── briefs/
├── changes/
├── milestones/
├── specs/
├── plans/
├── fix/
├── research/
└── reference/
```

已有旧结构项目（如已存在 `system-design.md`、`roadmap.md`、`specs/`、`fix/`、`research/`、`reference/` 等）不需要一次性迁移历史文档，可以从下一项大型需求开始采用新增层级：

1. 保留既有历史结构。
2. 新需求先建立 Change Request。
3. 跨多个阶段的需求由 Change Request 直接拆成多个 Milestone。
4. 新阶段建立 Milestone 和 Feature Map。
5. 当前开发 Feature 使用独立 Spec 和 Plan。
6. 实现、测试结果和下一动作更新到 `STATE.md`。

## 14. 常用 AI 提示词

### 14.1 从讨论生成 Brief

```text
请把本次讨论整理为 Design Brief，不要生成实现计划。

区分：
1. 用户明确确认的目标和事实。
2. AI 提出的候选方案。
3. 尚未验证的假设。
4. 需要用户决定的问题。
5. 明确不做的内容。

不要自行补全没有依据的需求。
```

### 14.2 审计大型原始文档

```text
请审计这份设计文档，不要写代码，也不要生成实现步骤。

把内容分类为：
1. 产品目标
2. 用户场景
3. 功能能力
4. 业务规则
5. 技术约束
6. 非功能要求
7. 未验证假设
8. 未决问题
9. 明确不做的内容

指出重复、矛盾、含糊和缺失的信息，不要自行决定未确认事项。
```

### 14.3 拆解 Roadmap

```text
基于已批准 Blueprint，把项目拆成可交付 Milestones。

要求：
- 每个 Milestone 形成可运行、可演示、可验收的系统状态。
- 优先采用纵向功能切片。
- 明确每个 Milestone 包含和不包含什么。
- 给出依赖和退出标准。
- 远期阶段保持粗粒度。
- 不生成文件级实现任务。
```

### 14.4 拆解当前 Milestone

```text
现在只细化当前 Milestone。

请生成 Feature Map，并确保：
- 每个 Feature 具有单一主要目标。
- 每个 Feature 可以独立验收。
- 给出 Feature 依赖。
- 区分 Feature 与代码任务。
- 不设计后续 Milestone。
```

### 14.5 生成 Feature Spec

```text
现在只处理指定 Feature。

根据 Blueprint、Milestone 和需求来源生成 Feature Spec，包含：
- 问题与目标
- 用户流程
- 包含与不包含
- 输入输出
- 业务规则
- 系统边界
- 异常和边界情况
- 验收标准
- 依赖
- 未决问题

不要生成代码步骤，不要扩大 Feature 范围。
```

### 14.6 生成 Implementation Plan

```text
基于已批准 Feature Spec 和当前代码事实生成 Implementation Plan。

每一步必须说明：
- 修改目标
- 涉及模块和文件
- 实现顺序和依赖
- 对应的测试
- 对应的 Spec 验收标准

如果代码事实与 Spec 冲突，或需要扩大范围，停止并报告，不要自行调整需求。
```

### 14.7 接收新增需求

```text
这是针对现有系统的新增需求。请先生成 Change Request，不要生成代码或实现计划。

请判断：
- 它是 Bug、增强、新能力还是架构变化。
- 与现有 Blueprint、Milestone 和 Feature 的关系。
- 可能受影响的模块和文档。
- 是否需要一个 Feature、一个新 Milestone，或拆成多个 Milestone。
- 应进入 Active、Next、Later、Deferred 还是 Rejected。

不要直接修改已 verified 的 Spec。
```

### 14.8 AI 接力

```text
请先阅读 AGENTS.md、STATE.md、当前 Feature Spec 和当前 Plan。

在采取行动前复述：
1. 当前目标
2. 包含范围
3. 不包含范围
4. 依赖和阻塞
5. 当前事实来源
6. 下一步动作

发现文档冲突、范围变化或需要用户决策时停止，不要猜测。
```

## 15. 项目生命周期检查清单

### 15.1 初始项目

- [ ] 原始讨论已保存为 Brief。
- [ ] 事实、候选方案、假设和未决问题已分开。
- [ ] 已生成带稳定 ID 的 Requirements。
- [ ] Blueprint 已说明能力、模块和数据边界。
- [ ] Roadmap 按可交付结果拆分。
- [ ] 当前 Milestone 有包含、不包含和退出标准。
- [ ] 当前 Feature Map 的依赖清楚。

### 15.2 Feature 开发前

- [ ] Feature Spec 已批准。
- [ ] 验收标准可验证。
- [ ] 没有阻断性未决问题。
- [ ] Implementation Plan 基于当前代码事实。
- [ ] Plan 没有扩大需求范围。
- [ ] 每个关键步骤有测试和验收映射。

### 15.3 Feature 实施后

- [ ] 实际完成内容和计划偏差已记录在 `STATE.md`。
- [ ] 已运行与改动直接相关的验证。
- [ ] 已逐条检查 Spec 验收标准。
- [ ] Feature 状态与证据一致。
- [ ] `STATE.md` 已更新。

### 15.4 新需求进入时

- [ ] 已创建 Change Request。
- [ ] 已判断 Bug、增强、大型能力或架构变化。
- [ ] 已完成对现有文档和模块的影响分析。
- [ ] 已决定 Active、Next、Later、Deferred 或 Rejected。
- [ ] 没有静默修改已 verified Spec。
- [ ] 多迭代能力已拆成边界明确的多个 Milestone。
- [ ] Requirements 和追踪关系已更新。

### 15.5 AI 交接时

- [ ] 当前目标和范围明确。
- [ ] 当前权威 Spec 和 Plan 链接明确。
- [ ] 已完成与未完成内容分开。
- [ ] 验证命令和结果已记录。
- [ ] 阻塞项明确说明需要谁决定。
- [ ] 下一步只有一个清楚动作。
- [ ] 下一位 AI 不需要从聊天记录猜测项目状态。

## 16. 最终工作流

```text
第一次建立项目：
Discussion
  → Brief
  → Requirements
  → Blueprint
  → Roadmap
  → Current Milestone
  → Feature Map
  → Current Feature Spec
  → Implementation Plan
  → 编码和测试
  → 检查验收标准
  → 更新 Roadmap 和 STATE

后续继续开发：
Next Feature / Next Milestone
  → Refine
  → Plan
  → 编码和测试
  → 更新状态

后续新增需求：
New Requirement
  → Change Request
  → Impact Analysis
  → Feature / 一个或多个 Milestone / Blueprint 更新
  → 回到标准开发闭环

AI 接力：
AGENTS.md
  → STATE.md
  → 当前 Milestone
  → 当前 Feature Spec
  → 当前 Plan
  → 核对范围后继续
```

整套方法的核心是：大文档保存全局意图，Requirements 保存原子承诺，Blueprint 保存当前系统边界和跨模块决定，Roadmap 安排交付顺序，Milestone 定义阶段结果，Feature Spec 定义功能契约，Plan 指导一次实施，Change Request 承接后续变化，代码和 Git 保存实施事实，`STATE.md` 保存当前结果并负责 AI 接力。
