---
change: CR-005
title: 强化 Full 三件套文档完备性
status: verified
created_at: 2026-08-27
---

# 强化 Full 三件套文档完备性

## 问题与依据

当前 Full Change 已将立项、业务设计和实施计划拆分到三件套，但文档结构还不能确保生成过程中的关键信息全部沉淀。Proposal 缺少明确的已确认决定与取舍；Spec 缺少统一术语入口；Plan 虽要求探索代码现实，却没有强制记录系统入口、调用链、关键符号、Current/Target Behavior、跨任务接口、不变量和复杂技术类别的适用性。结果是三件套之外仍可能存在隐含决定，执行者需要重新猜测修改层级、技术约束或失败行为。

## 目标

Full Change 的 proposal/spec/plan 共同构成唯一、完整、自解释的需求与实施上下文。执行者不依赖原始对话或生成者补充，读完三件套后能够准确确定需求背景、最终行为、当前技术现状、目标设计、修改位置、实施步骤、不变量和验收方法，并且不存在两种合理实现解释。

## 用户流程

1. 用户提出 Full 需求后，`change` 把真实背景、证据、范围、影响和已确认决定写入 Proposal；未决问题不为“无”时不接受。
2. Proposal accepted 后，`spec` 定义术语、场景、输入输出、Current/Target、业务规则、失败边界、禁止事项和 REQ/BR/AC；业务含义存在歧义时不批准。
3. Spec approved 后，`plan` 探查实际代码并把探查结论写入 Plan，包括入口、调用链、关键文件与符号、当前行为、目标技术设计、技术取舍、全局不变量和适用工程规范。
4. Plan 对每类复杂技术问题逐项判断适用性；适用时写明完整设计，不适用时说明原因。
5. Plan 把每个 Task 写成可直接实施的单元，明确文件、符号、依赖接口、Current/Target、实现步骤、不变量、验证和完成条件。
6. 三件套内容完整、无占位符、全部契约已映射且未决问题为“无”后，Plan 才能 approved 并进入实施。
7. 实施前重新核对 Plan 描述的入口、符号和 Current Behavior 与实际代码一致；不一致时停止并修订 Plan，不自行猜测。

## 范围

### 包含

- Proposal 增加已确认决定与取舍表达，完整保存需求来源和立项边界。
- Spec 增加术语与业务对象，强化 Current/Target、规则、示例和无歧义要求。
- Plan 固定包含实施目标、技术现状、目标技术设计、全局不变量、条件技术设计适用性、详细 Tasks、契约映射、工程规范映射、最终验证、非目标和未决问题。
- Plan 的技术现状包含入口与调用链、关键文件与符号、Current Behavior 和已有模式；目标设计包含目标调用链、模块职责、接口、数据流和 Current/Target 对照。
- 每个 Task 包含 files、symbols、read_first、depends_on、interfaces、current_behavior、target_behavior、implementation、invariants、verify、acceptance 和 done。
- 状态机、错误策略、并发幂等、数据事务、API/事件、配置、兼容迁移、权限安全、可观测性和参考实现逐项判断适用性。
- Proposal、Spec、Plan 的批准流程增加相应完备性要求；执行和验收以三件套记录的事实、约束和验证为依据。

### 不包含

- 不创建第四份概述、交接、研究或 implementation-notes 文档；缺失信息必须归入职责对应的三件套。
- 不把完整源代码或大段 diff 复制进 Plan；Plan 提供精确定位、接口、行为和步骤，实际代码仍是执行对象。
- 不要求简单 Change 展开不适用的复杂技术章节；适用性表写清“不适用”和原因即可。
- 不改变 Quick 零文档路径、Full 三件套目录或 proposal → spec → plan → execute-plan → verify-plan 状态机。
- 不让脚本判断调用链、技术方案或内容是否真实；脚本只执行确定性结构和字段门禁。
- 不批量重写已完成的历史 Change；新模板和新的批准动作采用增强后的完备性规则。

## 输入与输出

- 输入：用户原始需求和已确认回答、项目业务与工程规则、相关 Blueprint/Spec、当前代码、测试、配置及现有实现模式。
- 输出 Proposal：背景与证据、期望结果、包含/不包含、影响范围、已确认决定与取舍、未决问题。
- 输出 Spec：术语与业务对象、问题与目标、用户流程、范围、输入输出、REQ/BR/AC、失败边界、禁止事项、验收标准、未决问题。
- 输出 Plan：完整技术现状、目标技术设计、适用工程规范、全局不变量、条件技术设计、可执行 Tasks、契约覆盖和最终验证。
- API / 事件：本变更不修改 Project Kit 对外网络协议；Plan 内容契约新增 API/事件适用性判断。
- 数据与状态：文档章节和 Task 字段扩展，Proposal/Spec/Plan 状态机保持不变。
- 权限与安全：本变更不改变文档操作权限；Plan 必须判断具体 Change 是否涉及权限与安全。
- 重复与并发、超时与部分失败：本变更自身不新增并发或远程调用；Plan 必须判断具体 Change 是否需要对应设计。
- 兼容与迁移：历史 completed Change 不要求补写；新生成文档和后续批准动作使用新规则。
- 非功能与 UI：本变更不涉及 UI；文档长度没有固定字数，完整性以信息和契约覆盖为准。

## 业务规则

- BR-01：三件套是 Full Change 唯一的需求与实施上下文，不得把必要决定留在原始对话或生成工具内部。
- BR-02：Proposal、Spec、Plan 必须分别回答“为什么与边界”“最终业务行为”“当前技术现实与怎样实施”，同一事实不得互相冲突。
- BR-03：文档不得使用“按之前讨论”“同上”“相关逻辑”“适当处理”“根据实际情况”“后续再定”等需要外部解释的表述。
- BR-04：引用代码、规则或参考实现时，必须同时写明其职责、相关行为和本 Change 使用它的原因，不能只给路径或名称。
- BR-05：Proposal 必须记录所有影响范围或方向的已确认决定、未采用选择和原因；未决问题批准前必须为“无”。
- BR-06：Spec 必须定义可能影响理解的术语与业务对象；无新增术语时明确说明沿用的现有含义。
- BR-07：Plan 必须记录真实 Current Behavior 和可定位的代码证据，再描述 Target Behavior；不得以目标描述冒充当前事实。
- BR-08：Plan 必须包含当前入口与调用链、关键文件与符号、目标技术设计和全局不变量，使修改层级和依赖方向唯一明确。
- BR-09：条件技术设计的每个类别都必须回答“适用/不适用、原因、对应章节或 Task”；适用项必须写到可实施程度。
- BR-10：每个 Task 必须自包含其文件、符号、阅读顺序、依赖、输入输出接口、Current/Target、实现步骤、不变量、验证、契约映射和完成条件。
- BR-11：全部 REQ/BR/AC 和适用工程规范必须映射到具体 Task 与最终验证，不得只出现在背景说明中。
- BR-12：简单 Change 仍必须填写固定核心，但可把条件技术类别标记为不适用并说明原因，不得用篇幅替代完整性。
- BR-13：存在未定义术语、未记录决定、模糊引用、占位符、不可运行验证或阻断性问题时，相关文档不得批准。
- BR-14：实施前发现 Plan 的路径、符号、调用链或 Current Behavior 与当前代码不一致时必须停止，返回 Plan 修订。

### REQ-01：建立三件套唯一上下文

- Current：必要决定和技术理解可能只存在于文档生成过程的对话中。
- Trigger：创建和完善任意 Full Change 三件套。
- Target：所有理解需求与实施所需的信息都归入职责对应的 Proposal、Spec 或 Plan，不依赖三件套之外的原始对话。
- Business Rules：BR-01、BR-02、BR-03、BR-04
- Acceptance：AC-01、AC-02

### REQ-02：完善 Proposal 的立项决定

- Current：Proposal 有决定章节，但没有要求完整记录已确认选择、未采用方向和理由。
- Trigger：`change` 完善并请求接受 Proposal。
- Target：Proposal 完整保存问题证据、范围、影响和所有影响后续设计的决定，未决问题为“无”。
- Business Rules：BR-02、BR-03、BR-05、BR-13
- Acceptance：AC-03

### REQ-03：完善 Spec 的无歧义业务契约

- Current：Spec 已有 REQ/BR/AC 和边界设计，但可能缺少术语定义、示例或明确的 Current/Target 对照。
- Trigger：`spec` 设计并请求批准业务契约。
- Target：业务对象、行为、规则、失败和验收只有一种合理解释，所有业务决定都可由三件套直接定位。
- Business Rules：BR-02、BR-03、BR-06、BR-11、BR-13
- Acceptance：AC-04

### REQ-04：完善 Plan 的技术现状与目标设计

- Current：Plan 要求规划者探索代码，却不要求把入口、调用链、符号、当前行为和不变量完整写出。
- Trigger：`plan` 把 approved Spec 转化为技术设计。
- Target：Plan 明确记录代码现状、证据、目标结构、技术取舍、接口和不可破坏的约束，执行者无需重新猜测修改层级。
- Business Rules：BR-04、BR-07、BR-08、BR-11
- Acceptance：AC-05、AC-06

### REQ-05：建立条件技术设计

- Current：模块职责、接口、数据流、兼容迁移虽被建议，但复杂技术类别可能被静默遗漏。
- Trigger：Plan 涉及或可能涉及状态、错误、并发、事务、配置、兼容、安全或可观测性。
- Target：所有类别都有适用性结论；适用项形成完整契约，不适用项有真实原因，简单 Change 不被无关章节膨胀。
- Business Rules：BR-09、BR-12、BR-13
- Acceptance：AC-07

### REQ-06：让每个 Task 可直接实施

- Current：Task 只有 files、read_first、action、verify、acceptance、done，可能缺少符号、Current/Target、接口依赖和不变量。
- Trigger：Plan 拆解任意实施任务。
- Target：每个 Task 自包含实施所需技术信息，并明确覆盖的契约和可运行验证。
- Business Rules：BR-10、BR-11、BR-13
- Acceptance：AC-08、AC-09

### REQ-07：加强批准和实施门禁

- Current：机械门禁主要检查占位符、核心章节和契约编号，不能阻止关键技术上下文未落盘。
- Trigger：Proposal accepted、Spec approved、Plan approved 或开始执行 Plan。
- Target：确定性字段和章节由脚本校验；内容真实性和无歧义由相应技能与用户确认；执行前发现代码漂移时停止修订。
- Business Rules：BR-03、BR-11、BR-13、BR-14
- Acceptance：AC-10、AC-11、AC-12

## 失败与边界情况

- Proposal 缺少已确认决定、未采用方向的原因或未决问题不为“无”时，不得 accepted。
- Spec 使用未定义领域术语、REQ 未关联 BR/AC、存在模糊行为或未决问题时，不得 approved。
- Plan 只列文件路径但未说明职责和相关行为，不能视为技术现状完整。
- Plan 使用不存在或无法定位的 Symbol、调用链断裂、Current Behavior 没有代码或测试依据时，不得 approved。
- Task 缺少任一必填字段、依赖接口未定义、验证命令不可运行或验收结果不可观察时，不得 approved。
- 条件技术类别被留空或仅写“不涉及”而没有原因时，不得 approved。
- 文档型 Task 没有代码 Symbol 时，允许写“无：本 Task 只修改文档”并说明定位对象；不得伪造函数名。
- 简单 Change 可把复杂类别标记为不适用，但 Proposal、Spec、Plan 的固定核心仍必须完整。
- 引用外部规则、代码或其他文档时，三件套必须摘要记录本次所需结论；只有引用地址不算完成。
- 实施开始后代码已经变化，导致 Plan 描述失真时，停止实施并修订 Plan，不以现场猜测替代文档。
- 已完成历史 Change 缺少新章节时保持历史状态，不批量补写；不得因此放宽新批准动作的要求。

## 禁止事项

- 不得新增第四份文档承载三件套缺失的背景、业务契约或技术设计。
- 不得把“执行时再看代码”“模型自行判断”当作省略 Current Behavior、接口或不变量的理由。
- 不得复制大段实现代码制造表面完整；应记录精确 Symbol、签名、行为和修改要求。
- 不得让 Proposal 提前决定文件级实现，也不得让 Plan 发明 Spec 未授权的业务行为。
- 不得把所有条件类别机械写成不适用；每项结论必须来自当前需求和代码现实。
- 不得使用篇幅、术语数量或 Task 数量作为文档完备性的替代指标。

## 验收标准

- [ ] AC-01：三件套现行技能明确规定，理解和实施 Full Change 所需的信息不得依赖原始对话或生成者补充。
- [ ] AC-02：三件套的职责和输出互补且无重叠冲突，执行者可以从文档直接回答为什么改、最终行为、当前技术现实、怎样改、不能破坏什么和怎样验收。
- [ ] AC-03：新 Proposal 模板与 `change` 流程要求背景证据、完整范围、影响、已确认决定与取舍、未决问题；缺少核心内容时无法 accepted。
- [ ] AC-04：新 Spec 模板与 `spec` 流程要求术语与业务对象、Current/Target、稳定契约、失败边界和无歧义表达；未决问题或核心内容不完整时无法 approved。
- [ ] AC-05：新 Plan 固定包含实施目标、技术现状、入口与调用链、关键文件与符号、Current Behavior、目标技术设计、全局不变量和非目标。
- [ ] AC-06：Plan 中引用的代码、规则和参考实现都说明职责、相关行为和采用原因，不允许只有路径或名称。
- [ ] AC-07：Plan 包含十类条件技术设计适用性表；适用项有详细设计，不适用项有原因和对应任务说明。
- [ ] AC-08：每个 Task 都包含 files、symbols、read_first、depends_on、interfaces、current_behavior、target_behavior、implementation、invariants、verify、acceptance 和 done。
- [ ] AC-09：每个 Task 的验收引用对应 REQ/BR/AC，任务间使用的接口、名称和数据结构前后一致，验证命令具体可运行。
- [ ] AC-10：Proposal/Spec/Plan approved 前的机械门禁拒绝缺失核心章节、Task 字段、占位符、未决问题和契约覆盖；不让脚本判断主观真实性。
- [ ] AC-11：`execute-plan` 在实施前核对 Plan 的路径、Symbol、调用链和 Current Behavior；与当前代码不一致时停止并返回 Plan 修订。
- [ ] AC-12：直接相关测试、技能校验和插件校验证明增强后的三件套结构可生成、可批准、可实施，且 Quick 与现有状态机无回归。

## 未决问题

无
