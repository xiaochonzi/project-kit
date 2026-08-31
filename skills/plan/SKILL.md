---
name: plan
description: Use when a Full change has an approved Spec and its draft plan.md must become an executable technical handoff. If Spec is not approved, use spec; if Plan is approved, use execute-plan.
---

# Plan

## Overview

把 approved Spec 绑定到当前代码库，完整写入既有 `docs/changes/CR-###-<slug>/plan.md`，生成可以直接交给没有原始对话上下文的执行 AI 的技术实施契约。Plan 回答：当前代码如何工作、目标技术结构是什么、精确修改哪里、按什么顺序实施、何时停止、怎样验证。

Plan 必须让执行者从 Task 1 开始工作，而不是在执行阶段重新完成需求设计和代码研究。

**开始前宣布：**“我正在使用 plan 技能制定实现计划。”

## Iron Laws

```text
NO PLAN WITHOUT AN APPROVED SPEC
THE PLAN MUST BE EXECUTABLE WITHOUT THE AUTHOR'S CONVERSATION
```

Plan 可以选择技术方案，但不得新增、删除或改变 Spec 的业务行为。Spec 有歧义、与代码现实冲突或缺少契约时，停止并返回 `spec` / `change`。

## Single Source of Truth

一条信息只写一次：

- Proposal 冻结原因、范围和 `DEC-##`
- Spec 冻结 REQ / BR / AC、字段、状态和外部协议
- Plan 只写代码现实、技术绑定和执行任务

Plan 通过编号引用 Proposal / Spec，不复制业务契约正文。复制会制造漂移并让执行者无法判断应信哪一份。

## Required Inputs

- [ ] `proposal.md` 存在且 `status: accepted`
- [ ] `spec.md` 存在且 `status: approved`
- [ ] 同目录 `plan.md` 存在且 `status: draft`，正文可以只有最小骨架
- [ ] 已完整读取 Constitution 或等效项目规则、Blueprint、`.project-kit/state.md`
- [ ] 已读取可选 `diagrams.md`、相关代码、测试和配置
- [ ] 已确认 Proposal 的全部 `DEC-##` 及 Spec 的全部 REQ / BR / AC

Plan 已 approved → 不重写，交接 `execute-plan`。

## Process

### Step 1：加载上下文

```bash
node scripts/project-docs.cjs context plan --target <CR-###> --root <项目根>
```

完整读取三件套和适用项目规则。只以落盘文档为需求来源；原始对话不能补充或覆盖 approved 契约。

### Step 2：记录代码基线

在探查前写入「代码基线」：

```markdown
## 代码基线

- repository：<仓库标识>
- branch：<分支>
- commit：<提交>
- inspected_at：<日期时间>
- worktree：<clean 或已知变更摘要>
```

执行时如果基线与当前代码不同，必须重新核对文件、Symbol、调用链和 Current Behavior；不得把过期 Plan 当成事实。

### Step 3：探索并写下当前技术现实

找到真实入口、调用关系、数据流、接口、测试和现有模式。把结论写入「技术设计 / 当前技术现状」：

- 系统入口与技术调用链：从入口到修改点逐层列出文件、Symbol、职责
- 关键文件与符号：当前职责、相关行为、本 Change 使用原因
- Current Behavior：代码、测试或配置证据
- 影响分析：调用方、被调用方、兼容和风险结论

外部研究、代码图或命令结果必须摘要结论。禁止只写“去运行分析”“参考某文档”。执行者可以复核，但不应重新完成作者的研究。

若 Spec 对 Current 的假设与代码冲突，写明冲突并停止；不得在 Plan 中偷换业务语义。

### Step 4：建立适用规范清单

从 Constitution、AGENTS 或等效规则中提取本 Change 适用的规则：

- 来源和规则要点
- 影响文件和 Task
- lint、format、type、test 或人工审查方式
- 最终验收证据

无法确定规则或验证方式时停止，不先写任务。

### Step 5：设计唯一技术方案

在 Plan 中完整写入：

- 实施目标
- 实现策略及未采用方案原因
- 目标调用链、模块职责、接口签名、数据流和依赖方向
- Current → Target 对照
- 全局不变量
- 非目标

技术方案必须是满足 Spec 的最小方案。不得把未来能力、顺手重构或 Spec 未授权的抽象带入 Plan。

### Step 6：完成条件技术设计

逐项填写适用性、真实原因和对应章节 / Task：

1. 状态机
2. 错误策略
3. 并发与幂等
4. 数据与事务
5. API / 事件
6. 配置
7. 兼容与迁移
8. 权限与安全
9. 可观测性
10. 参考实现

适用项必须展开到接口、顺序、状态、事务或错误级；不适用项必须说明为什么与当前需求和代码无关。

### Step 7：写明执行环境

「执行环境」必须列出每项前置依赖、检查方式和缺失时行为：

```markdown
| 依赖 | 检查方式 | 缺失时行为 |
| --- | --- | --- |
```

包括适用的运行时、包管理器、服务、数据库、测试数据、凭据和分析工具。不得让执行者自行决定跳过缺失门禁；必须明确“停止”“允许替代及替代命令”或“由谁提供”。

命令必须相对仓库、机器无关，禁止用户主目录和盘符绝对路径。

### Step 8：建立 Implementation Binding

用一张绑定表将冻结决定和契约映射到技术位置：

```markdown
## Implementation Binding

| DEC / REQ / BR / AC | 文件与 Symbol | 修改类型 | 验证 |
| --- | --- | --- | --- |
```

- 每个 `DEC-##` 必须被遵守
- 每个 REQ / BR / AC 必须绑定到 Task 和最终验证
- 不复制 Spec 正文，只引用编号
- 对外名称与内部 Symbol 必须明确区分

### Step 9：拆解可执行 Tasks

每个 Task 是可独立验证、可独立审查的最小交付单元，必须包含：

```markdown
### Task N: <任务名>

- files: <本 Task 涉及的精确相对路径>
- file_actions: <每个文件的 create / modify / delete / verify>
- symbols: <修改或验证的 Symbol；纯文档任务写定位对象>
- read_first: <按顺序读取的文件和 Symbol，并摘要依赖结论>
- depends_on: <前置 Task 或“无”>
- interfaces: <消费和产出的接口、数据或文档契约>
- current_behavior: <当前行为与证据>
- target_behavior: <完成后的唯一目标行为>
- implementation: <可直接执行的步骤；RED → GREEN → CHECK>
- outputs: <完成后必须存在的代码、类型、接口、脚本、测试或文档>
- decisions: <本 Task 遵守的 DEC-##；无则写“无”>
- invariants: <不得破坏的业务与技术约束>
- prerequisites: <环境、数据和前置产物>
- stop_if: <出现什么偏差必须停止，不得现场猜测>
- verify: <任务后立即运行的真实、机器无关命令>
- acceptance: <可观察结果，引用 REQ / BR / AC>
- done: <何时可以勾选>

- [ ] Task N
```

规则：

- `files` 不得写“相关文件”“所有页面”
- 新文件或脚本必须在 `file_actions` 标记 `create`
- `verify` 引用的脚本必须已存在，或由当前 / 前置 Task 的 `outputs` 创建
- `read_first` 不能只写“去读/去跑结果”，必须写下已确认结论
- Task 间名称、类型、字段和接口必须一致
- `depends_on` 必须无环
- TDD 按 RED → GREEN → CHECK，不把测试/实现/验证机械拆成无独立价值的空任务

### Step 10：契约与规范映射

「验收标准映射」逐项列出全部 REQ / BR / AC 的覆盖 Task 和最终验证。

「Constitution 规范映射清单」逐项列出规则来源、适用文件 / Task、验证方式和最终验收。

任何编号不得只出现在背景文字中。

### Step 11：执行交接自检

重新只读落盘三件套，假设执行者没有原始对话，模拟从 Task 1 开始：

1. 能否确定代码基线是否仍有效？
2. 每个文件是 create、modify、delete 还是 verify？
3. 每个 Symbol、接口和调用链能否精确定位？
4. `read_first` 是否已经包含关键结论？
5. 每个新脚本是否在使用前被创建？
6. 环境缺失时是否有唯一处理方式？
7. 代码现实与 Plan 不同是否有明确 `stop_if`？
8. 每个 Task 的输入、输出和依赖是否闭合？
9. 是否需要原始对话或作者补充任何产品 / 技术决定？
10. Proposal、Spec、Plan 是否定义了冲突事实？

只要执行者仍需猜测，就直接修正 Plan；涉及业务契约则返回 `spec`，涉及范围则返回 `change`。

### Step 12：用户批准

展示代码基线、技术策略、Implementation Binding、任务边界、执行环境和验证计划。用户明确批准后：

```bash
node scripts/project-docs.cjs transition CR-### --to approved --kind plan --root <项目根>
```

CLI 只检查章节、字段、编号覆盖、机器路径和状态；技术结论真实性与可执行性由文档作者负责。

## Quality Checklist

- [ ] Spec approved，Plan 原状态为 draft
- [ ] 代码基线、入口、调用链、文件、Symbol 和 Current Behavior 已落盘
- [ ] 目标设计、全局不变量、非目标和十类条件设计完整
- [ ] 执行环境明确检查方式和缺失行为
- [ ] Implementation Binding 覆盖全部 DEC / REQ / BR / AC
- [ ] 每个 Task 包含全部 17 个执行字段
- [ ] 新文件和脚本在使用前由 `file_actions` / `outputs` 声明创建
- [ ] read_first 有结论，verify 机器无关且可运行
- [ ] stop_if 阻止执行者现场补决定
- [ ] Plan 不复制 Spec 正文、不扩大范围
- [ ] 仅凭落盘三件套可以从 Task 1 开始，无需原始对话
- [ ] 用户明确批准并成功迁移状态

## Script / Author Responsibility

| CLI | 文档作者 |
| --- | --- |
| 输出上下文、校验结构和状态 | 探索代码、记录基线和真实 Current |
| 校验 Task 字段、路径模式、契约覆盖 | 选择技术方案、建立绑定、拆解任务 |
| 执行状态迁移 | 模拟执行交接并消除猜测点 |

CLI 不判断技术方案是否正确，也不替执行者研究代码。

## Stop Conditions

- Spec 未 approved 或仍有业务歧义 → 返回 `spec`
- Spec 与代码现实冲突 → 报告并返回 `spec` / `change`
- 需要扩大范围、改变 Blueprint 或新增业务能力 → 返回 `change`
- 无法给出真实路径、Symbol、接口或验证命令 → 停止，不猜测
- 环境或项目规范无法确定 → 先补齐
- 任何 Task 仍需要作者口头补充 → 不 approved

## Handoff Rule

Plan approved → `execute-plan`。本技能只写技术实施契约，不修改代码。
