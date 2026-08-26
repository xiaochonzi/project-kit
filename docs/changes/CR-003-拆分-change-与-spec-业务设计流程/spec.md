---
change: CR-003
title: 拆分 Change 与 Spec 业务设计流程
status: verified
created_at: 2026-08-26
spec_hash: e9b101a096d42cee35f382195249a66103595c05e84a4c2af3ebbd380cee0d2c
---

# 拆分 Change 与 Spec 业务设计流程

## 问题与依据

现有 Full 流程由 `change` 在同一技能内继续编写 Spec，复杂需求容易只得到概括性目标和少量验收描述。后续模型必须重新解释自然语言，可能漏掉范围、业务规则、失败行为或禁止事项。现有脚本还存在 `new change` 只创建 Proposal、`validate` 却要求三件套齐全的瞬时无效状态。

## 目标

Full 变更一经创建即拥有稳定的三件套路径；Proposal、业务 Spec、实现 Plan 由三个职责独立的技能依次完成。批准后的 Spec 使用稳定契约编号和 `spec_hash` 成为后续模型不可自行改写的实现依据。

## 用户流程

1. 用户提出新需求，`change` 根据用户意图和影响范围判定 Quick 或 Full。
2. Quick 保持零文档直接实现；Full 原子创建三件套，`change` 只完善 Proposal 并请用户决定是否接受。
3. Proposal accepted 后，引导用户调用 `spec`；`spec` 先读取 Proposal、项目约束、Blueprint 和代码现实，再通过逐项澄清完成业务设计。
4. Spec 无阻断性未决问题且用户批准后记录 `spec_hash`，引导调用 `plan`。
5. `plan` 读取已存在的 `plan.md` 骨架、Spec、编码规范和代码现实，选择技术方案并把每个契约编号映射到任务与验证。
6. Plan approved 后进入 `execute-plan`，完成后由 `verify-plan` 按相同契约编号验收。

## 范围

### 包含

- REQ-01：Full change 原子创建三件套。
  - Current：`new change` 只创建 `proposal.md`。
  - Target：同一命令创建同目录下的 `proposal.md`、`spec.md`、`plan.md`，后两者为 `draft` 占位骨架。
  - Acceptance：AC-01、AC-02。
- REQ-02：`change` 只负责分流、Proposal 和向 `spec` 的交接。
  - Current：`change` 继续创建并填写 Spec。
  - Target：Proposal accepted 后停止，不编写 Spec 或 Plan 正文，明确提示下一步使用 `spec`。
  - Acceptance：AC-03。
- REQ-03：新增独立 `spec` 技能设计业务契约。
  - Current：没有 `skills/spec/SKILL.md`。
  - Target：`spec` 负责代码现实探查、业务场景、范围、规则、状态、输入输出、失败边界、禁止事项和验收标准；不写文件级实现任务。
  - Acceptance：AC-04、AC-05、AC-06。
- REQ-04：`plan` 填写已有 Plan 并完成技术实现映射。
  - Current：`plan` 调用 `new plan` 创建文件。
  - Target：`plan` 直接填写 Full change 初始化时生成的 `plan.md`，技术方案和任务不得引入 Spec 外业务能力。
  - Acceptance：AC-07。
- REQ-05：批准门禁阻止占位内容和契约遗漏。
  - Current：模板占位文本可能被非空检查视为完成，Plan 没有机械核对 Spec ID 覆盖。
  - Target：Spec/Plan approved 前拒绝模板占位符；Spec 必须包含稳定契约编号且未决问题为“无”；Plan 必须覆盖 Spec 中全部 REQ/BR/AC 编号。
  - Acceptance：AC-08、AC-09。
- REQ-06：各平台都能发现并显式调用 `spec`。
  - Current：插件只有 11 个技能和 7 个 OpenCode/Pi 命令。
  - Target：插件包含 12 个技能；Claude/Codex 自动发现 `spec`，Claude/OpenCode/Pi 均提供对应显式 command。
  - Acceptance：AC-10。

### 不包含

- 不新增第四种 Full 文档或独立 discuss 阶段。
- 不要求 Quick 创建任何文档。
- 不让脚本判断产品范围、业务规则或适用的边界类别。
- 不采用主观数值歧义分数作为批准条件。
- 不移除 `new spec`、`new plan` 的底层 CLI 能力；它们不再出现在正常技能流程中。

## 输入与输出

- 输入：用户的新需求、已接受 Proposal、项目 `AGENTS.md`/Constitution、Blueprint、已有代码与测试模式。
- `change` 输出：Full change 目录、完整 Proposal、draft Spec、draft Plan。
- `spec` 输出：approved `spec.md`，包含 `REQ-##`、`BR-##`、`AC-##` 及 `spec_hash`。
- `plan` 输出：approved `plan.md`，包含技术实现策略、精确任务、契约映射和编码规范映射。
- 显式命令：Claude `/project-kit/spec`、OpenCode `/project-kit/spec`、Pi `/project-kit:spec`。

## 业务规则

- BR-01：Quick/Full 判定继续以用户意图优先，并以影响范围校正；本变更不放宽或收紧现有分流条件。
- BR-02：Full 的三件套必须由 `new change` 一次创建，任何创建失败都不能报告成功。
- BR-03：`change` 不得替 `spec` 编写业务设计正文，`spec` 不得替 `plan`编写文件级实现任务。
- BR-04：Spec 的必填核心包括目标与现状、角色和场景、范围、行为需求、业务规则、失败边界、禁止事项、验收标准和未决问题。
- BR-05：接口、数据/状态、权限、并发/幂等、兼容迁移、性能/审计等条件按适用性设计；不适用时写明原因，不留空白。
- BR-06：Plan 必须显式引用每个 `REQ-##`、`BR-##`、`AC-##`；缺少任何编号都不能 approved。
- BR-07：阻断性问题不能交给 Plan 或执行模型猜测；Spec 批准前「未决问题」必须为“无”。
- BR-08：脚本只做确定性的结构和门禁校验，不替用户或 AI 作产品决定。

## 失败与边界情况

- Full change 目录已存在同名目标文件时，保持 `writeNewFile` 的拒绝覆盖行为。
- draft Spec/Plan 可以包含明确的生成标记并通过结构校验，但不能通过 approved 状态迁移。
- Spec 缺少契约编号、存在 TODO/TBD/模板标记或仍有未决问题时，批准失败并指出原因。
- Plan 缺少某个 Spec 契约编号时，批准失败并列出未覆盖编号。
- 已完成的旧 CR 文档不因新模板增加章节而失效；新门禁作用于新的批准动作和新模板。
- `spec` command 的安装路径替换继续由各平台 adapter 独立处理，不把平台脚本重新合并。

## 验收标准

- [ ] AC-01：执行一次 `new change` 后，同一 CR 目录立即存在 proposal/spec/plan 三个文件。
- [ ] AC-02：刚创建的 Full change 执行 `validate` 不报告缺少 spec/plan。
- [ ] AC-03：`change` 技能不包含创建或填写 Spec/Plan 的步骤，Handoff 指向 `spec`。
- [ ] AC-04：新增 `skills/spec/SKILL.md`，frontmatter `name: spec`，描述只包含触发与路由。
- [ ] AC-05：`spec` 明确区分必填核心与按适用性设计项，并要求先探查代码现实、逐项澄清和用户批准。
- [ ] AC-06：`spec` 明确禁止文件路径、函数名、代码步骤和实现任务进入业务 Spec。
- [ ] AC-07：`plan` 不再调用 `new plan`，而是填写已有文件，并先读取 Constitution/AGENTS 与代码现实。
- [ ] AC-08：带模板占位符或未决问题不为“无”的 Spec 无法 approved；完整 Spec 可以 approved 并生成 `spec_hash`。
- [ ] AC-09：遗漏任意 REQ/BR/AC 编号的 Plan 无法 approved，完整覆盖后可以 approved。
- [ ] AC-10：插件校验、OpenCode 测试和 Pi 测试证明 12 个技能及 `spec` command 被正确打包和注册。
- [ ] AC-11：相关单元测试、`validate-plugin` 和 `npm pack --dry-run` 全部通过。

## 未决问题

无
