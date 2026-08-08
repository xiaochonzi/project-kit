---
name: project-kit
description: 管理大型软件项目从文档初始化、开发准则制定、原始大型需求澄清与拆解、蓝图和路线图生成、里程碑与功能规格细化，到实现计划、执行、验收、新需求接入、Bug 修复及状态汇总的完整生命周期。用于用户提到 project kit、init、constitution、brief、blueprint、roadmap、milestone、feature spec、implementation plan、execute plan、verify plan、change request、需求迭代、Bug 修复文档或项目状态维护时。
---

# Project Kit

把大型项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元，并让后续变更延续同一套项目事实。

## 使用规则

1. 完整读取目标仓库适用的 `AGENTS.md`、`docs/constitution.md` 和已有项目文档。
2. 遵守仓库的编码前门禁、影响分析、测试和文档规则；本 Skill 不覆盖仓库规则。
3. 从下表选择一个模式，完整读取对应 workflow 后执行，不把多个模式隐式合并。
4. workflow 要求的参考文件必须完整读取；模板只在创建对应产物时读取。
5. 写文件或代码前说明方案并取得批准；用户已经明确批准当前操作时不要重复询问。
6. 使用 `node scripts/project-docs.cjs` 完成初始化、编号、状态迁移和机械校验。脚本不代替语义判断。
7. 遇到范围变化、关键歧义、计划失效或验证失败时，遵守 workflow 的停止条件，不猜测完成。

## 模式路由

| 用户意图 | 模式 | 必读 workflow | 主要产物 |
|---|---|---|---|
| 初始化项目文档目录 | `init` | [shared/workflows/init.md](workflows/init.md) | 标准 `docs/` 结构 |
| 制定稳定开发准则 | `constitution` | [shared/workflows/constitution.md](workflows/constitution.md) | Constitution |
| 接收并拆解原始大型需求 | `brief` | [shared/workflows/brief.md](workflows/brief.md) | Brief、Requirements、Blueprint、Roadmap、Milestones、Feature Maps、当前阶段 Specs |
| 细化阶段或功能 | `refine` | [shared/workflows/refine.md](workflows/refine.md) | Context、Milestone 或 Feature Spec |
| 为已批准功能制定计划 | `plan` | [shared/workflows/plan.md](workflows/plan.md) | Implementation Plan |
| 执行已批准计划 | `execute-plan` | [shared/workflows/execute-plan.md](workflows/execute-plan.md) | 代码、测试、Execution Summary |
| 独立验收已实现功能 | `verify-plan` | [shared/workflows/verify-plan.md](workflows/verify-plan.md) | Verification、状态更新 |
| 接收后续新增需求 | `change` | [shared/workflows/change.md](workflows/change.md) | Change Request 及必要的项目文档更新 |
| 诊断并直接修复缺陷 | `bug` | [shared/workflows/bug.md](workflows/bug.md) | 修复代码、回归验证、Bug Resolution |
| 查看项目状态与下一动作 | `status` | [shared/workflows/status.md](workflows/status.md) | 只读一致性与进度报告 |

## 通用门禁

- 需求门禁：目标、边界、约束和验收标准未达到 [shared/rules/clarity-gates.md](rules/clarity-gates.md) 时，不进入详细设计或计划。
- 追踪门禁：每个已接受需求必须映射到 Milestone 和 Feature，或明确标记为 Deferred/Rejected。见 [shared/rules/requirement-traceability.md](rules/requirement-traceability.md)。
- 计划门禁：Plan 未通过 [shared/rules/plan-quality.md](rules/plan-quality.md) 时，不执行。
- 执行门禁：严格遵守 [shared/rules/execution-rules.md](rules/execution-rules.md)，范围扩大时停止。
- 完成门禁：没有新鲜验证证据时，不声称完成或标记 `verified`。见 [shared/rules/verification-rules.md](rules/verification-rules.md)。
- 历史门禁：不得重写已 `verified` 的 Feature Spec；使用 Change、新 Spec 和关系字段表达演进。

## 文档层级

```text
Brief（原始输入，不可变）
  → Requirements（原子、可追踪的需求清单）
    → Blueprint（当前系统边界与能力）
      → Roadmap（交付顺序）
        → Milestone + Feature Map（可验证阶段）
          → Feature Spec（功能契约）
            → Implementation Plan（实现步骤）
              → Execution Summary（实施事实）
                → Verification（独立验收证据）

Change Request → Requirements / Capability / Milestone / Feature / ADR
Bug → Bug Resolution（不创建 Plan）
STATE.md → 当前焦点、决定、阻塞和下一动作
```

完整字段、位置和状态见 [shared/rules/document-schema.md](rules/document-schema.md) 与 [shared/rules/state-model.md](rules/state-model.md)。

## 参考导航

- 需求访谈与方案对比：[questioning.md](rules/questioning.md)
- 清晰度评分与阻塞条件：[clarity-gates.md](rules/clarity-gates.md)
- Milestone、Feature、Capability 拆解：[decomposition-rules.md](rules/decomposition-rules.md)
- REQ 双层覆盖：[requirement-traceability.md](rules/requirement-traceability.md)
- 文档字段和目录：[document-schema.md](rules/document-schema.md)
- 生命周期状态：[state-model.md](rules/state-model.md)
- Plan 十二项质量门禁：[plan-quality.md](rules/plan-quality.md)
- 实施停止条件：[execution-rules.md](rules/execution-rules.md)
- 新鲜验收证据：[verification-rules.md](rules/verification-rules.md)
- Bug 根因分析：[debugging-rules.md](rules/debugging-rules.md)
- GSD Core 与 Superpowers 方法归因：[influences.md](rules/influences.md)

## 脚本边界

`scripts/project-docs.cjs` 只负责确定性操作：

- 初始化目录与模板；
- 分配稳定 ID 并创建文档；
- 输出指定模式所需上下文；
- 校验结构、状态、引用、需求覆盖与依赖环；
- 执行合法状态迁移；
- 汇总状态并给出机械可推导的下一动作。

它不理解需求、不替用户做产品决定、不生成正文、不修改业务代码，也不证明软件已经正确。
