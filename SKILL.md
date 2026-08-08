---
name: project-kit
description: 管理大型软件项目从文档初始化、开发准则制定、原始需求拆解、蓝图与路线图生成、里程碑和功能规格细化，到实现计划、计划执行、验收、新需求接入、Bug 修复及状态汇总的完整生命周期。用于用户提到 project kit、初始化项目文档、constitution、brief、blueprint、roadmap、milestone、feature spec、implementation plan、execute plan、verify plan、change request、需求迭代、Bug 修复文档或项目状态维护时。
---

# Project Kit

把大型项目文档逐层转换为边界明确、可实施、可验证的工作单元，并在后续迭代中保持追踪关系。

## 开始前

1. 查找并完整阅读目标仓库适用的 `AGENTS.md`、constitution 和现有项目文档。
2. 遵守仓库的编码前门禁、影响分析、测试和文档规则；本 Skill 不覆盖仓库规则。
3. 根据用户请求选择一个模式，不把多个模式隐式合并。
4. 写文件前说明拟创建或修改的文档并等待批准；用户已经明确批准当前操作时无需重复询问。
5. 需要目录、编号、模板或机械校验时运行 `node scripts/project-docs.cjs`。不要让脚本替代需求判断。

## 模式路由

| 用户意图 | 模式 | 主要产物 |
|---|---|---|
| 初始化项目文档目录 | `init` | 标准 `docs/` 结构 |
| 制定稳定开发准则 | `constitution` | `docs/constitution.md` |
| 处理原始大型需求 | `brief` | Brief、Blueprint、Roadmap、Milestones、Feature Maps、当前阶段 Specs |
| 细化阶段或功能 | `refine` | 更新后的 Milestone 或 Feature Spec |
| 为已批准功能制定计划 | `plan` | Implementation Plan |
| 执行已批准计划 | `execute-plan` | 代码、测试、计划执行状态 |
| 验证已实现计划 | `verify-plan` | 验收结果与 Feature 状态 |
| 接收新增需求 | `change` | Change Request，必要时 Capability、Milestones、Specs、ADR |
| 诊断并直接修复缺陷 | `bug` | 修复代码与 Bug Resolution，不创建 Plan |
| 查看文档与交付状态 | `status` | 只读状态与一致性报告 |

完整步骤见 [references/workflows.md](references/workflows.md)。拆解时读取 [references/decomposition-rules.md](references/decomposition-rules.md)。创建或校验文档时读取 [references/document-schema.md](references/document-schema.md)。

## `init`

运行：

```bash
node scripts/project-docs.cjs init --root <项目根目录>
```

只初始化目录和空模板，不接收需求、不推断项目内容、不覆盖已有文件。

## `constitution`

先与用户确认产品、架构、质量、安全、测试、依赖和文档原则，再填写 `docs/constitution.md`。只记录长期稳定的准则；功能需求进入 Spec，具体技术决定进入 ADR。除非用户明确要求，不修改 `AGENTS.md`。

## `brief`

1. 使用 `new brief` 保存原始文档，不改写原文。
2. 识别目标、场景、能力、规则、约束、假设、冲突、缺失和未决问题。
3. 对会改变项目边界的未决问题先向用户澄清。
4. 生成当前权威 Blueprint 和 Roadmap。
5. 拆分可交付 Milestones，并为每个 Milestone 建立 Feature Map。
6. 只为当前 Milestone 创建详细 Feature Specs；远期只保留目标、边界、依赖和退出标准。
7. 不生成 Implementation Plan，等待 `plan` 模式。

## `refine`

只细化用户指定的 Milestone 或 Feature。明确包含、不包含、输入输出、依赖、业务规则、失败行为和可验证验收标准。发现多个独立用户结果时继续拆分。完成评审后才推进 `draft → reviewed → approved → ready`。

## `plan`

只为 `approved` 或 `ready` 的单个 Feature Spec 创建计划。读取 Constitution、Blueprint、目标 Spec 和现有代码；按仓库要求执行影响分析。每个实现步骤必须对应范围和验证，不得把未批准需求带入计划。不修改代码。

## `execute-plan`

1. 确认目标 Feature 和 Plan 已获批准。
2. 按仓库规则完成编码前门禁与影响分析。
3. 严格按计划实施并运行直接相关验证。
4. 需要扩大范围时停止，转入 `change`。
5. 完成后标记 Feature 为 `implemented`；不要代替 `verify-plan` 标记为 `verified`。

## `verify-plan`

逐条核对 Spec 验收标准、Plan 步骤和实际实现，运行直接相关的测试、构建或人工检查。全部通过才标记 `verified`；未通过时报告具体差距，不伪造成功，也不隐式修复计划外问题。

## `change`

先创建 Change Request，再分类：

- 小型增强：创建新的 Feature Spec。
- 跨多个迭代的大型能力：创建 Capability，拆成多个纵向 Milestones。
- 跨模块架构变化：创建 ADR，并更新 Blueprint 与 Roadmap。
- 违反已有验收标准：转入 `bug`。

不回头扩写已 `verified` 的 Spec。新能力使用 `depends_on`、`extends` 或 `supersedes` 建立关系。只详细设计最近要开发的迭代。

## `bug`

先复现并判断是否违反已有验收标准。若是新增行为，停止并转入 `change`。确认根因后遵守仓库编码门禁，直接修复并运行相关验证，不创建 Implementation Plan。修复完成后使用 `new fix` 创建 Bug Resolution，记录现象、根因、影响、修改和验证事实。

## `status`

运行只读命令：

```bash
node scripts/project-docs.cjs validate --root <项目根目录>
node scripts/project-docs.cjs status --root <项目根目录>
```

报告 Active、Next、Later、Completed、Deferred，未解决 Changes，Feature 状态，尚未验证的实现、修复记录和无效依赖。除非用户另行要求，不修改任何文档。

## 脚本边界

`scripts/project-docs.cjs` 只负责：

- 初始化目录和空模板；
- 分配稳定 ID 并从模板创建文档；
- 检查 ID、状态和引用；
- 汇总文档状态。

它不理解需求、不拆分功能、不修改代码、不调用模型、不决定状态迁移。语义工作必须由 AI 与用户完成。
