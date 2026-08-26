---
id: CR-003
title: 拆分 Change 与 Spec 业务设计流程
status: completed
created_at: 2026-08-26
---

# 拆分 Change 与 Spec 业务设计流程

## 背景与问题

当前 `change` 技能在 Full 路径中同时负责分流、Proposal、Spec 业务设计和交接，复杂需求容易在一次上下文中被压缩成过浅的 Spec，遗漏业务边界、异常规则和可验证契约。与此同时，`new change` 只创建 `proposal.md`，而 `validate` 又要求 Full change 同时存在 proposal/spec/plan，创建动作与结构门禁不一致。

## 期望结果

把 Full 变更拆成职责单一的 `change → spec → plan → execute-plan → verify-plan` 流程：`change` 只完成分流、三件套初始化和 Proposal；独立 `spec` 技能完成业务逻辑设计；`plan` 根据已批准 Spec 设计技术实现并拆解任务。通过稳定 Requirement/Business Rule/Acceptance ID 和机械门禁，降低不同能力模型接力时的语义偏差。

## 包含

- Full 分流时一次性创建 `proposal.md`、`spec.md`、`plan.md`。
- `change` 只填写和批准 Proposal，随后交接给独立 `spec` 技能。
- 新增自包含 `spec` 技能，规定业务设计内容、完整性检查和批准门禁。
- `plan` 填写已存在的占位文件，并将 Spec 契约映射为实现任务。
- Claude Code、Codex、OpenCode、Pi 同步暴露 `spec` 技能；支持自动触发和显式 command 触发。
- 增加占位符、Spec 完整性和 Plan 契约覆盖的机械校验。

## 不包含

- 不增加 discuss、research 或其他生命周期文档。
- 不引入 GSD 的数值歧义评分、子代理编排或额外状态源。
- 不改变 Quick 零文档路径。
- 不改变 Blueprint、Roadmap、Bug 的业务职责。
- 不移除现有可选 `diagrams.md`。

## 影响范围

- `scripts/project-docs.cjs` 与 proposal/spec/plan 模板。
- `skills/change`、新增 `skills/spec`、`skills/plan`。
- Claude command、OpenCode adapter、Pi extension 和插件 manifests。
- README、CHANGELOG 及直接相关测试。

## 决定

Accepted。采用“Superpowers 的对话确认方式 + GSD 的契约完整性与覆盖检查”，保留 Project Kit 三件套，不增加新的流程文档。

## 未决问题

无。
