---
name: plan
description: Use when a Full change has an approved business Spec and its existing draft plan.md needs technical design and executable task decomposition. If the Spec is not approved, use spec; if the Plan is already approved, use execute-plan.
---

# Plan

## Overview

把已批准业务 Spec 转化为当前代码库中的技术设计和可逐步执行计划，填写已存在的 `docs/changes/CR-###-<slug>/plan.md`。Plan 必须把代码探查结论完整落盘，使三件套本身即可明确当前技术现实、目标设计、修改位置、实施步骤、不变量和验证方法。

**开始前宣布：**“我正在使用 plan 技能制定实现计划。”

## The Iron Law

```
NO PLAN WITHOUT AN APPROVED SPEC
```

Plan 可以选择技术方案，但不得新增、改变或删除 Spec 中的业务行为。Spec 有歧义、与代码现实冲突或缺少契约时，停止并返回 `spec`。

## Required Inputs

- [ ] `proposal.md` 存在且 `status: accepted`
- [ ] `spec.md` 存在且 `status: approved`
- [ ] 同目录已有 `plan.md` 且 `status: draft`
- [ ] 已完整读取 `docs/constitution.md` 或项目等效编码规则、`docs/blueprint.md`（如有）、`.project-kit/state.md`
- [ ] 已读取可选 `diagrams.md`、相关代码和测试模式

Plan 已 approved 时不重写，直接交接 `execute-plan`。

## Process

### Step 1：加载上下文

```bash
node scripts/project-docs.cjs context plan --target <CR-###> --root <项目根>
```

读取三件套、项目规则、Blueprint、state 和可选 diagrams。确认 Spec 的全部 `REQ-##`、`BR-##`、`AC-##`。

### Step 2：探索代码现实

找到真实文件、接口、调用关系和测试入口，确认现有模式与集成点。把结论写入 Plan 的「技术设计 / 当前技术现状」：

- 系统入口与调用链：从触发入口到修改点逐层列出 Symbol 和职责
- 关键文件与符号：文件、Symbol、当前职责、相关行为和本 Change 使用原因
- Current Behavior：当前如何运行，以及代码、测试或配置证据

若 Spec 假设和代码冲突，报告具体冲突并停止，不通过改 Plan 偷换业务语义。

### Step 3：建立适用规范清单

从 Constitution、AGENTS 或项目等效规则中只提取本 change 适用的规则：

- 规则来源和原文要点
- 影响文件和任务
- lint、format、type、test 或人工审查方式
- 最终由 `verify-plan` 复核的证据

无法确定适用规则或验证方式时停止，不先写任务。

### Step 4：设计技术实现

选择最小满足 Spec 的方案，并在已有 `plan.md` 填写：

- 实施目标和实现策略，以及未采用方案的原因
- 目标调用链、模块职责、接口签名、数据流和依赖方向
- Current Behavior → Target Behavior 逐项对照
- 全局不变量：所有 Task 都不得破坏的业务与技术约束
- 需要创建、修改、测试的精确文件
- Spec 契约到任务和最终验证的映射

引用规则、代码或参考实现时必须说明其职责、相关行为和采用原因，不能只列路径或名称。

技术设计不得把 Spec 未授权的重构、抽象或未来能力带入计划。

### Step 5：完成条件技术设计

逐项填写适用性、原因和对应章节或 Task。适用项必须展开到可实施程度；不适用项写明真实原因：

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

### Step 6：拆解 Tasks

每个任务是可独立验证、可独立审查的最小交付单元。任务必须包含：

```markdown
### Task N: <任务名>

- files: <精确文件路径>
- symbols: <修改或验证的 Symbol；纯文档任务说明定位对象>
- read_first: <执行前必须读取的文件和 Symbol，按顺序列出>
- depends_on: <前置 Task 或“无”>
- interfaces: <本 Task 消费和产出的接口、数据或文档契约>
- current_behavior: <当前行为和证据>
- target_behavior: <完成后的唯一目标行为>
- implementation: <可直接执行的实现步骤>
- invariants: <本 Task 不得破坏的约束>
- verify: <任务后立即运行的真实命令>
- acceptance: <可观察通过条件，并引用 REQ/BR/AC>
- done: <何时可以勾选>

- [ ] Task N
```

TDD 工作按 RED → GREEN → CHECK 排序。不要把“写测试、实现、验证、提交”机械拆成没有独立审查价值的空任务；每个任务必须产生一个可验证交付物。

任务间使用的接口、名称和数据结构必须前后一致；`depends_on` 必须形成无环顺序。

### Step 7：契约与规范映射

在「验收标准映射」中逐项列出全部 `REQ-##`、`BR-##`、`AC-##`，对应覆盖任务和最终验证。任何编号不得只出现在背景文字中而没有任务与验证。

在「Constitution 规范映射清单」中写清规则来源、适用任务、验证方式和最终验收。

### Step 8：No Placeholders 自审

以下任一出现都表示 Plan 未完成：

- 模板注释、`<任务名>`、TBD、TODO、稍后补充
- “按之前讨论”“同上”“相关逻辑”“适当处理”“根据实际情况”“后续再定”
- 只有动作名称，没有具体目标状态、接口或验证命令
- 使用未在任何任务定义的函数、类型或字段
- Spec 编号没有任务或验证覆盖
- 任务引用不存在的旧文件、命令或接口
- 调用链、Symbol、Current Behavior 或接口只存在于探查过程，没有写入 Plan

再检查任务依赖、类型和命名前后一致，验证命令能在目标仓库执行。

### Step 9：用户批准

向用户展示技术策略、任务边界、Spec 覆盖和规范映射。用户明确批准后：

```bash
node scripts/project-docs.cjs transition CR-### --to approved --kind plan --root <项目根>
```

脚本会拒绝占位符、空章节、字段不完整或遗漏任一 Spec 契约编号的 Plan。

## 校验清单

- [ ] Spec 为 approved
- [ ] 已有 `plan.md` 被完整填写，没有再次创建
- [ ] 技术设计记录系统入口与调用链、关键文件与符号、Current/Target Behavior 和全局不变量
- [ ] 十类条件技术设计均有适用性、原因和对应设计或 Task
- [ ] 每个任务有 files/symbols/read_first/depends_on/interfaces/current_behavior/target_behavior/implementation/invariants/verify/acceptance/done
- [ ] 全部 REQ/BR/AC 和适用编码规范均已映射
- [ ] 用户明确批准，状态迁移成功

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `context plan` 输出上下文路径 | 探索代码、选择技术实现 |
| `transition` 校验任务字段、占位符和契约覆盖 | 填写已有 Plan、建立任务和规范映射 |
| `validate` 校验结构与状态 | 不引入 Spec 外能力，不开始实施 |

## 停止条件

- Spec 未 approved 或仍有业务歧义 → 返回 `spec`。
- Spec 与代码现实冲突 → 报告冲突，返回 `spec` 或 `change`。
- 需要修改 Blueprint、扩大范围或新增业务能力 → 返回 `change`。
- 无法给出真实文件路径、接口或验证命令 → 停止，不猜测。
- 缺少项目编码规则或无法建立验证方式 → 先补齐规则。

## Handoff Rule

Plan approved → `execute-plan`。本技能只写计划，不修改代码。

## Common Rationalizations

| 借口 | 现实 |
|---|---|
| “已有骨架不完整，重新 new plan” | Full 创建时已生成唯一 Plan，直接填写它 |
| “Spec 没写，Plan 顺便决定” | Plan 不能成为隐形业务契约 |
| “写大步骤，执行时再探索” | 可执行 Plan 必须提前记录精确文件、Symbol、接口、现状和验证 |
| “只映射 AC 就够了” | REQ 和 BR 也可能在拆解中被静默遗漏 |
