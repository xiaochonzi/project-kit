---
id: CR-002
title: change 技能新增 diagrams 数据关系文档
status: completed
created_at: 2026-08-21
---

# change 技能新增 diagrams 数据关系文档

## 背景与问题

当前 change 的 Full 流程只有三件套：proposal / spec / plan。当一个需求涉及**新的数据模型设计**时，缺少一个专门承载"数据关系设计"的文档：

- 多个数据模型之间的关系（ER 关系）没有明确落点，散落在 spec 的输入输出/业务规则里，或者根本没有记录
- 设计依据（为什么这么设计）无处安放，后续难以追溯
- 数据对应的**前后端操作时机**（谁在何时读写）缺失，前后端开发各自猜测数据生命周期

这导致：涉及数据模型的 change 在 spec 之后、plan 之前缺乏数据层澄清，plan 的实现步骤建立在未确认的数据假设上。

## 期望结果

1. change 的 Full 流程新增 `diagrams.md` 数据关系文档，位于 `docs/changes/CR-###-<slug>/` 下，与 proposal/spec/plan 并列。
2. **生成顺序**：proposal → spec → **diagrams.md** → plan（spec 确认后、plan 之前生成）。
3. **触发条件（可选）**：仅当需求**涉及新的数据模型设计**时创建；不涉及数据模型的 change 不需要建。
4. 文档内容覆盖三方面：数据模型之间的关系（ER）、设计依据（为什么这么设计）、数据对应的前后端操作时机。
5. **脚本命令**：新增 `node scripts/project-docs.cjs new diagrams --change CR-###`,由脚本创建带模板的 diagrams.md（与 `new spec` / `new plan` 一致）。
6. **change 技能流程**：spec 确认后，若涉及新数据模型 → 提示生成 diagrams → 再 handoff 到 plan。
7. **暂不强制校验**：validate 不强制要求 diagrams.md 存在（Q3 确认）。

## 包含

- 新增模板 `assets/templates/diagrams.md`
- 脚本 `new diagrams` 命令（复用 createChangeArtifact 机制，`['proposal', 'spec', 'plan', 'diagrams']` 分支）
- change 技能流程更新：spec 后、plan 前增加 diagrams 步骤（条件触发：涉及新数据模型）
- 相关技能文档提及 diagrams 的读取/生成（plan / execute-plan / verify-plan / blueprint 如有）
- README / CHANGELOG 更新
- 测试：`new diagrams` 创建与 validate 不强制
- 示例项目（如 lifecycle 已有完整 change，可补充 diagrams 示例）

## 不包含

- **不强制校验**：validate 不要求每个 change 都有 diagrams.md
- 不改 diagrams 状态机（diagrams 无独立状态，跟随 change 生命周期）
- 不做数据模型自动生成 / ER 图渲染（纯 Markdown 文档）
- 不改 blueprint（blueprint 是系统级，diagrams 是 change 级数据关系）
- 个人验证/变更记录（与 CR-001 一致,不引入）

## 影响范围

- **模板**：`assets/templates/diagrams.md`（新增）
- **脚本**：`scripts/project-docs.cjs` 的 `new` 命令分支与 DOCUMENT_TYPES
- **技能**：change（流程新增 diagrams 步骤）、plan / execute-plan / verify-plan（读取 diagrams 作为数据依据）
- **文档**：README.md、CHANGELOG.md
- **测试**：`tests/project-docs.test.cjs`
- **示例**：`examples/lifecycle-project`（可选补充 diagrams 示例）

## 决定

用户于 2026-08-21 确认接受本提案：

- 新增 `docs/changes/CR-###-<slug>/diagrams.md`，与 proposal/spec/plan 并列
- 生成顺序：proposal → spec → diagrams.md → plan
- 仅当需求涉及新数据模型设计时创建（可选，不强制）
- 内容覆盖：数据模型关系（ER）、设计依据、前后端操作时机
- 新增脚本命令 `new diagrams --change CR-###`（复用 createChangeArtifact）
- change 技能 spec 确认后增加 diagrams 步骤，再 handoff 到 plan
- 暂不强制校验（validate 不要求 diagrams.md 存在）

## 未决问题

（无）
