---
id: CR-004
title: 移除 Spec Hash 门禁
status: completed
created_at: 2026-08-27
---

# 移除 Spec Hash 门禁

## 背景与问题

当前 Full 流程在 Spec 从 `draft` 进入 `approved` 时计算 `spec_hash`，并在 Plan 批准、Spec 验证和项目校验时重新计算，用于阻止已批准 Spec 被静默修改。现在 Spec 已通过 `REQ-##`、`BR-##`、`AC-##` 契约编号、状态机和独立 `verify-plan` 保持实现对齐；额外 hash 将技术元数据写入业务文档，也增加了正常修订和状态迁移的负担。

## 期望结果

彻底移除 `spec_hash` 字段及相关生成、校验和文档要求。Spec 仍保留 `draft → approved → verified` 状态机，Plan 和 Verify 继续依赖已批准/已验证状态以及 REQ/BR/AC 契约，不再依赖内容 hash。

## 包含

- 删除 Spec 模板中的 `spec_hash` 字段。
- 删除脚本中的 hash 计算、写入以及 approved/plan/verified 阶段的 hash 门禁。
- 更新 `spec`、`plan`、`verify-plan` 技能中的 hash 前置条件和说明。
- 同步 `project-lifecycle.md`、`AGENTS.md`、示例、CHANGELOG 和直接相关测试。
- 已有 Spec 即使仍带有历史 `spec_hash` 字段，也不再参与状态判断。

## 不包含

- 不删除 Spec 的 approved/verified 状态。
- 不放宽 Spec 完整性、占位符、未决问题和 REQ/BR/AC 契约门禁。
- 不改变 Plan 全契约覆盖、任务完成和编码规范验收要求。
- 不增加新的冻结字段、状态源或替代 hash 机制。

## 影响范围

影响 `scripts/project-docs.cjs`、Spec 模板、`spec`/`plan`/`verify-plan` 技能、生命周期说明、示例 Spec、CHANGELOG 和相关测试。不会改变 Quick/Full 分流、三件套目录结构或各平台 command 注册方式。

## 决定

待用户确认 Proposal。建议采用“删除 hash、保留状态与契约验收”的最小方案。

## 未决问题

无。
