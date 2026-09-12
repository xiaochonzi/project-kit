---
name: spec
description: Use when a Full change has an accepted Proposal and its draft spec.md must become a complete, testable business contract. If Proposal is not accepted, use change; if Spec is approved, use plan.
---

# Spec

## 核心定位：系统架构师的绝对契约

Spec 是系统的**技术行为与领域架构总图**。它以**资深系统架构师（Principal System Architect）**的视角，把 accepted Proposal 编译为**自包含（Self-contained）、机器级确定（Machine-deterministic）、零歧义（Zero-ambiguity）**的业务设计契约，完整写入 `docs/changes/CR-###-<slug>/spec.md`。

Spec 回答“**系统对外必须呈现什么行为、具备哪些确定性数据契约与边界逻辑**”。它的唯一交付标准是：
> **任何没有原始对话上下文的普通 AI 工具，仅凭这份落盘文档，就能 100% 不偏离地实现全部功能与验收测试；绝不需要在开发时自行脑补领域模型、猜测边界分支，或在历史会话中考古。**

Spec 绝不规定内部类名、包名、私有函数名、文件路径和代码修改步骤；这些属于 Plan 的工程职责。但 Spec **必须将对外与核心领域数据 Schema（字段名、类型、枚举值、只读/可写、约束）、显式状态机与转移表、全量协议与错误响应、复杂流转拓扑绝对锁死**。

**开始前宣布：**“我正在使用 spec 技能设计业务契约。”

---

## 架构三大铁律 (Iron Laws)

```text
1. NO APPROVAL WHILE A SECOND REASONABLE INTERPRETATION EXISTS
2. THE SPEC MUST BE FULLY SELF-CONTAINED — NO EXTERNAL CR DEFERRALS
3. COMPLEX FLOWS AND POINTERS MUST BE VISUALIZED — NO PROSE-ONLY TOPOLOGY
```

1. **唯一解释铁律**：只要角色、输入、权威、状态、失败分支或验收标准仍存在第二种合理业务解释，就必须继续澄清。严禁把业务或架构决定推迟到 Plan 或编码阶段。
2. **自包含契约铁律**：严禁将目标模型定义、字段 Schema 或协议格式“甩锅”给外部或前序 CR（例如写“沿用 CR-041 正式图”）。哪怕复用既有结构，也必须就地给出完整的 Normative Schema 摘要。本文件必须是独立完整的单一事实源。
3. **拓扑结构化铁律**：凡涉及指针连接、图装配、多分支（如分叉与合流）、状态机流转的复杂关系，**严禁仅使用散文文字描述**，必须提供 ASCII 拓扑图与边连接决策矩阵表。

---

## 契约边界矩阵 (Contract Boundary)

| 架构师必须绝对锁死的契约（严密定义） | 架构师严禁越界规定的细节（解耦实现） |
|---|---|
| 业务角色、触发时机、前置条件、端到端业务流 | 内部类名、包名、私有函数名 |
| 对外及核心领域数据 Schema（字段名、类型、枚举、约束） | 文件路径和代码修改步骤 |
| 对外 API / 事件协议、参数定义、标准错误码与响应结构 | 内部调用链和模块分包实现细节 |
| 数据权威归属、业务状态集合、合法与非法转移矩阵 | DTO/VO 具体实现类名和任务拆分 |
| 复杂节点装配拓扑（ASCII 图）与条件决策矩阵表 | 具体第三方工具库选择与测试文件组织 |
| 权限、幂等、并发控制、异常边界防御与业务不变量 | 内部私有局部变量与临时算法缓存 |
| 可量化、输入输出确定闭环的 PASS / FAIL 验收标准 | 具体的代码行级修改指令 |

> **边界原则**：“不规定内部类名与文件路径”绝不意味着对技术契约放水；相反，架构师必须把数据结构、状态机和字段约束精确锁死到机器可解析的程度。

---

## 输入前置

- [ ] `docs/changes/CR-###-<slug>/proposal.md` 存在且 `status: accepted`
- [ ] `docs/changes/CR-###-<slug>/spec.md` 存在且 `status: draft`（正文可为最小骨架）
- [ ] 已完整掌握 Proposal 中的背景、EVD 证据、包含/不包含边界以及全部 DEC 冻结决定
- [ ] 当前 Change 是一个内聚、可独立交付与验收的业务闭环

Proposal 未 accepted → 返回 `change`。Spec 已 approved → 不重写，交接 `plan`。

---

## 核心契约六大支柱（从空正文生成规范）

架构师编写 Spec 时，必须从空白正文依次构建以下核心契约模块：

### 1. 术语与业务对象
- 确立领域词汇的唯一语义。每个概念、实体、对外 ID 必须有唯一确定定义，杜绝同名异义与概念泛化。

### 2. 数据权威表
- 建立单一事实来源，用表格严密回答“该业务事实以谁为准”：
```markdown
| 业务事实 | 唯一权威来源 | 非权威来源不得做什么 |
|---|---|---|
| 订单实付金额 | 结算服务支付单 | 客户端/缓存不得自行计算或覆盖 |
```

### 3. 自包含目标模型与字段 Schema（输入与输出）
- 无论数据来自外部输入还是由后端装配产出，**必须提供自包含的数据契约（Normative Schema）**：
  - 字段名、物理类型、必填性、枚举候选值、默认值、只读/可写约束。
  - 数据结构示例必须明确标注：
    - `Normative`：字段名、层级嵌套、数据类型属于硬性契约，实现必须严格一致。
    - `Illustrative`：仅为便于人类阅读的业务示意样例数据。

### 4. 复杂流转与装配拓扑（如适用）
- 涉及分支、合并、链表、指针跳转或状态机时，必须提供两件套：
  1. **ASCII 拓扑示意图**：清晰展示节点派生、分支流向与汇聚出口。
  2. **连接 / 状态转移决策矩阵表**：
```markdown
| 当前节点/条件 | 展开节点类型 | 内部边连接 (nextItemId) | 外部/出口边连接 |
|---|---|---|---|
| 条件 A | 节点 X | X.next -> Y.id | 指向后续集合首节点 |
```

### 5. 条件契约块（按需激活）
按需逐项明确以下适用块（不适用的明确写“不适用及原因”）：
- **状态迁移表**：合法起点 $\to$ 触发动作 $\to$ 目标状态 $\to$ 非法迁移拦截。
- **决策矩阵表**：条件组合 $\to$ 唯一确定结果。
- **全量错误字典**：业务错误码、触发条件、用户可见表现、HTTP/RPC 状态映射。
- **并发与幂等**：幂等键生成规则、重复请求返回策略、竞争冲突锁策略。
- **边界防御**：空值、非法边界、越权拦截、超时熔断、回滚策略。

### 6. 稳定需求契约（REQ / BR / AC）
- **需求单元（REQ-##）**：
```markdown
### REQ-01：<需求名称>
- Current：<当前可观察行为与技术现状>
- Trigger：<角色、前置条件与触发时机>
- Target：<唯一目标行为与产生的结果>
- Business Rules：BR-01、BR-02
- Acceptance：AC-01、AC-02
```
- **业务规则（BR-##）**：系统在任何时刻都必须满足的业务不变量。
- **验收标准（AC-##）**：**禁止使用字母后缀变体（如 AC-01a）**。每条 AC 必须是可由无上下文 AI 直接转化为断言的精准测试用例（GIVEN 前置条件 + WHEN 触发输入 + THEN 唯一可观察结果）。

### 7. 未决问题
- 在提交用户批准前，必须彻底消除所有假设与分歧，**精确填写为“无”**。

---

## 极简执行流程 (Streamlined Lifecycle)

### Step 1: 上下文加载与真实探查
```bash
node scripts/project-docs.cjs context spec --target <CR-###> --root <项目根>
```
探查现有代码契约、API 现状与系统行为，确保 Spec 立足于代码现实而非主观臆测。

### Step 2: 架构建模与消除歧义
逐一锁定：角色流程 $\to$ 权威归属 $\to$ 目标 Schema $\to$ 拓扑图与决策表 $\to$ 异常边界。遇到 2 种以上合理方案时，给出权衡并让用户决定，决不允许带着未决假设推进。

### Step 3: 单一事实来源与自包含核查
核实每个事实在全文仅定义一次；核实核心数据结构全部就地自包含，不存在“参考外部 CR”等隐式依赖。

### Step 4: 架构师自审 (Self-Audit)
重新审视落盘的 `spec.md`：
1. 能否仅凭 Spec 为每条 AC 写出确定性的输入、执行与期望断言？
2. 目标数据结构是否完全自包含？有无外部 CR 甩锅？
3. 复杂分支和指针是否有 ASCII 拓扑图与决策矩阵支持？
4. 是否无意中泄漏了内部实现细节（如类名、私有函数、文件路径）？
5. 是否依然能构想出第二种合理的业务解释？（若有，继续消除歧义）

### Step 5: 用户批准与状态冻结
向用户展示架构契约摘要、关键 Schema、拓扑图与 AC 清单。用户明确批准后：
```bash
node scripts/project-docs.cjs transition CR-### --to approved --kind spec --root <项目根>
```

---

## Quality Checklist

- [ ] Proposal 处于 accepted，Spec 从空正文完整生成
- [ ] 术语定义无歧义，数据权威表覆盖全部核心业务事实
- [ ] 目标数据模型与 Schema 100% 自包含，无跨 CR 甩锅
- [ ] 复杂流转、多分支合流具备 ASCII 拓扑图与决策矩阵表
- [ ] 样例明确区分 Normative 契约与 Illustrative 示意
- [ ] 每个 REQ 关联 BR 与独立可 PASS/FAIL 的 AC，无字母后缀编号
- [ ] 无内部类名、私有函数、内部调用链或文件修改步骤
- [ ] 未决问题为“无”，用户明确批准并成功迁移至 approved

## Stop Conditions

- Proposal 未 accepted 或范围变化 $\to$ 返回 `change`
- 目标数据模型未就地定义，仅引用外部/历史 CR $\to$ 补全 Schema 前禁止 approved
- 复杂网络逻辑未提供拓扑图或决策矩阵 $\to$ 补全前禁止 approved
- 业务行为存在第二种合理推论 $\to$ 暂停并向用户提问

## Handoff Rule

Spec approved $\to$ 交接给 `plan`。本技能专注架构契约设计，不编写 Plan，不修改代码。

