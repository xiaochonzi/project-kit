---
name: plan
description: Use when a Full change has an approved Spec and its draft plan.md must become an executable technical handoff. If Spec is not approved, use spec; if Plan is approved, use execute-plan.
---

# Plan

## Overview

把 approved Spec 绑定到真实代码现实，转化为自底向上的保姆级施工图纸，完整写入 `docs/changes/CR-###-<slug>/plan.md`。

Plan 必须清晰回答：“**第一步改哪些文件/Symbol、具体操作指令是什么、如何验证；第二步干什么……**”。它的唯一交付标准是：
> **任何没有原始对话上下文的执行 AI，从 Task 1 开始按部就班施工，绝不需要在编码阶段重新设计架构、发明工序、猜测调用链或脑补业务逻辑。**

**开始前宣布：**“我正在使用 plan 技能制定实现计划。”

## The Iron Law

```
NO PLAN WITHOUT AN APPROVED SPEC — NO DRIFT FROM THE CONTRACT
```

1. **契约忠实铁律**：Plan 是 Spec 的技术落地映射，严格覆盖全部 DEC / BR / AC。Plan 可以选择技术实现方案，但绝不新增、删除或改变 Spec 规定的业务行为。遇到代码现实冲突或契约缺失，立即停止并返回 `spec` 或 `change`。
2. **零上下文可执行铁律**：Plan 必须让没有原始对话的执行 AI 从 Task 1 开始闭环工作。严禁使用“按之前讨论”“自行决定”“适当处理”等需要现场脑补的模糊表述。
3. **任务原子性与工序流水线铁律**：任务必须按依赖自底向上分期推进；单个 Task 核心修改的生产代码文件严格控制在 1~3 个，严禁大包揽；`implementation` 必须写成代码级的保姆操作指令（`1. ...; 2. ...; 3. ...`），严厉禁止“实现装配”“完成逻辑”等空洞动词。

## 单一事实来源 (Single Source of Truth)

- Proposal 冻结背景、边界与 `DEC-##`
- Spec 冻结 BR / AC、字段权威、状态表与外部协议
- Plan 只承载代码现实、技术绑定与工序任务，通过编号引用契约，**绝不复制 Spec 正文**。

## Required Inputs

- [ ] `docs/changes/CR-###-<slug>/proposal.md` 存在且 `status: accepted`
- [ ] `docs/changes/CR-###-<slug>/spec.md` 存在且 `status: approved`
- [ ] `docs/changes/CR-###-<slug>/plan.md` 存在且 `status: draft`（正文为最小骨架）
- [ ] 已完整读取 `docs/constitution.md`（或等效项目规则 `AGENTS.md`）、`.project-kit/state.md` 与当前代码现状

Plan 已 approved → 不重写，交接 `execute-plan`。

## 施工图纸法定大纲

Plan 从空正文生成时，**必须严格包含以下 14 个标准二级标题（`##`），文字必须完全一致，严禁增加数字前缀（如 `## 1. 代码基线` 会导致门禁工具匹配失败，必须为 `## 代码基线`），严禁合并或省略，严禁使用“## 实施步骤”**：

```markdown
## 代码基线
## 实施目标
## 实现策略
## 技术设计
### 当前技术现状
### 目标技术设计
## 全局不变量
## 条件技术设计
## 执行环境
## Implementation Binding
## Tasks
## 验收标准映射
## Constitution 规范映射清单
## 最终验证
## 非目标
## 未决问题
```

## 施工图纸编写规范

### 1. 代码基线 (Code Baseline)
探查真实代码并准确记录：
```markdown
## 代码基线

- repository：<仓库标识>
- branch：<分支>
- commit：<准确提交 Hash>
- inspected_at：<日期时间>
- worktree：<clean 或已知变更摘要>
```
若基线过期或工作区存在冲突，必须重新核对后再制定。

### 2. 技术设计与当前技术现状
- **系统入口与技术调用链**：从系统入口到最终修改点，逐层写明文件、Symbol 与核心职责。
- **关键文件与符号**：文件相对路径、Symbol、当前职责与本 Change 修改原因。
- **Current Behavior**：记录当前真实行为与代码/单测/配置证据。
- **目标技术设计**：目标调用链、模块职责、接口签名、依赖方向、Current → Target 对照、全局不变量与非目标。

### 3. 实现策略与自底向上工序分期 (Pipeline Phasing)
必须规划出自底向上的清晰施工阶段，杜绝上下层逻辑倒置：
- **阶段一：基石与数据契约（Foundation & DTOs）**：定义类型、枚举、常量、接口桩代码与纯 DTO，确立编译底座。
- **阶段二：核心纯逻辑与状态算法（Core Logic & State）**：实现纯函数、数据转换、状态机转移逻辑，严格 TDD（先红后绿）。
- **阶段三：复杂拓扑与指针回填（Topology & Wiring）**：多分支展开、指针回填、跨层级图连接与合流。
- **阶段四：服务装配与调用链集成（Service Integration）**：将算法组装入业务 Service，串联上下游调用链与全局异常处理。
- **阶段五：清理与全链路验收（Cleanup & End-to-End）**：清理被废弃旧代码、全量回归测试、真实集成与数据落盘验证。

### 4. 条件技术设计（十类必须全集覆盖）
必须逐项判断以下 10 个法定类别（缺少任何一类都会被门禁脚本判定为缺失而拒绝批准）：
1. **状态机**：实体状态迁移规则，无则写“无状态机变动及原因”；
2. **错误策略**：校验失败、第三方超时、异常捕获与回滚；
3. **并发与幂等**：重试、锁、并发竞争防御机制；
4. **数据与事务**：数据库操作的事务传播性与数据一致性；
5. **API / 事件**：新增或修改的协议、事件发布与消费链路；
6. **配置**：涉及的新增环境变量、配置文件字段；
7. **兼容与迁移**：老数据升级、既有接口向下兼容性；
8. **权限与安全**：数据权限过滤、接口鉴权注解；
9. **可观测性**：日志打印、耗时监控、关键指标埋点；
10. **参考实现**：参考工程内既有规范的良好实现类与文件路径。

### 5. 执行环境与适用规范清单
- **执行环境**：列出运行时、依赖服务、数据凭据、检查方式与缺失时行为。命令必须相对仓库、机器无关，**严禁用户主目录和盘符绝对路径**。
- **Constitution 适用规范清单**：提取 Constitution 适用规则，映射到文件、Task 与自动化验证命令。

### 6. Implementation Binding 表
用表格将全部 DEC / BR / AC 唯一绑定到物理代码位置：
```markdown
## Implementation Binding

| DEC / BR / AC | 文件与 Symbol | 修改类型 | 验证 |
|---|---|---|---|
| BR-01, AC-01 | `<相对路径>` `<Symbol>` | modify | `<定点测试命令>` |
```

### 7. 原子任务拆解（17 字段交付单元）
**严禁使用散文段落或“## 实施步骤”！** 任务清单必须使用 `## Tasks`，每个 Task 必须以 `### Task N: <任务名>` 开头，且必须包含完整的 17 个连字符字段：
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
- acceptance: <可观察结果，引用 BR / AC>
- done: <何时可以勾选>

- [ ] Task N
```

#### 任务三大约束：
1. **任务原子性（Task Atomicity）**：核心生产文件严格控制在 1~3 个（加其直接单测），严禁大包揽巨型任务。
2. **指令具体化（Actionable Implementation）**：`implementation` 严禁出现“实现装配”“完成逻辑”等空洞动词，必须写为代码级的保姆步骤（`1. 创建 <类名> 声明属性；2. 在 <方法名> 实现回填算法；3. 运行定点单测`）。
3. **闭环 TDD**：按 RED（先写失败单测） $\to$ GREEN（编写最小实现） $\to$ CHECK（验证 AC 预期）闭环推进。

## Process

### Step 1：上下文加载与代码现状探查

```bash
node scripts/project-docs.cjs context plan --target <CR-###> --root <项目根>
```

探查真实代码入口、调用链、现有模式与基线，确保技术设计立足于代码现状。

### Step 2：制定技术方案、分期工序与契约绑定

确立 Target 架构，按自底向上依赖规划 Phase 1~5，填充 Implementation Binding 确保 Spec 契约 100% 覆盖。

### Step 3：拆解原子 Tasks 并填全 17 字段

遵循原子性与保姆指令原则，将工序转化为可线性执行的任务清单。

### Step 4：工长自检

依据落盘的 `plan.md` 逐项确认：
1. 任务是否自底向上，是否存在底层结构未建就提前装配上层逻辑的倒置？
2. 是否存在包含过多生产文件（>3个）的大包揽 Task？
3. `implementation` 是否包含了清晰的代码级操作步骤（1. 2. 3.），是否存在空洞动词？
4. 执行者没有原始对话，能否仅凭本 Plan 从 Task 1 顺利施工到最后一个 Task？

### Step 5：用户批准与状态冻结

向用户展示代码基线、流水线分期、Implementation Binding 与 Task 清单。用户明确批准后，通过 CLI 完成状态迁移：

```bash
node scripts/project-docs.cjs transition CR-### --to approved --kind plan --root <项目根>
```

**严禁在 markdown frontmatter 中手动编辑 `status: ready` 或 `status: approved`！**

## Quality Checklist

- [ ] Spec 处于 approved，Plan 从空正文完整生成
- [ ] 14 个法定二级标题精确匹配且无数字前缀，严禁使用“## 实施步骤”
- [ ] 代码基线、系统入口与技术调用链、关键 Symbol 与 Current Behavior 准确落盘
- [ ] 任务严格遵循自底向上流水线工序分期，依赖无前后倒置
- [ ] 任务颗粒度原子化，核心生产文件单任务控制在 1~3 个，无大包揽巨型 Task
- [ ] 每个 Task 完整具备 17 个连字符执行字段
- [ ] implementation 写明具体操作步骤（1. 2. 3.），无“实现XXX”等抽象动词
- [ ] Implementation Binding 覆盖全部 DEC / BR / AC
- [ ] 验证命令机器无关，无用户主目录和盘符绝对路径
- [ ] 用户明确批准并经 CLI 成功迁移至 approved

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| `context plan` 输出只读上下文 | 探查代码基线，设计调用链与数据映射 |
| 校验 14 个二级章节、10 类条件设计与 17 个 Task 字段 | 自底向上拆解原子任务，编写代码级操作指令 |
| `transition ... --to approved --kind plan` 执行状态迁移 | 绑定 DEC/BR/AC，不替用户做产品架构决策 |

## Stop Conditions

- Spec 未 approved 或仍有业务歧义 $\to$ 返回 `spec`
- Spec 与代码现实冲突 $\to$ 报告并返回 `spec` 或 `change`
- 存在大包揽任务（单个任务涉及过多生产文件） $\to$ 拆分为独立递进任务
- implementation 包含空洞动词或缺乏代码级步骤 $\to$ 细化为具体操作步骤
- 无法给出真实路径、Symbol、接口或验证命令 $\to$ 停止，不盲目猜测

## Handoff Rule

Plan approved → `execute-plan`。本技能只写技术实施契约，不修改代码。

## Anti-Patterns 负面清单

1. **严禁手动篡改 status 为 ready 或 approved**：初始必须保持 `status: draft`，严禁由模型手动在 frontmatter 中写 `status: ready`（状态机中根本不存在该状态）或 `status: approved`；状态推进必须且只能由用户明确批准后通过 CLI 命令 `node scripts/project-docs.cjs transition CR-### --to approved --kind plan` 完成。
2. **严禁散文式实施步骤替代 Tasks**：严禁写 `## 实施步骤` 或无字段叙述，必须使用 `## Tasks`，且每个任务必须以 `### Task N: <任务名>` 开头，完整包含 17 个连字符字段。
3. **严禁大包揽巨型任务**：严禁在一个 Task 中揉入多个模块，单个 Task 核心修改生产文件必须控制在 1~3 个，必须按自底向上流水线逐层推进。
4. **严禁二级标题加数字前缀**：严禁写成 `## 1. 代码基线`，必须直接写为 `## 代码基线`，否则门禁脚本正则提取将判定为空章节。
