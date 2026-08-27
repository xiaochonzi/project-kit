---
change: CR-004
title: 移除 Spec Hash 门禁
status: verified
created_at: 2026-08-27
---

# 移除 Spec Hash 门禁

## 问题与依据

当前系统把 Spec 内容摘要作为生命周期门禁：批准时生成，Plan 批准、Spec 验证和项目校验时再次比对。这个机制原本用于发现批准后的内容变化，但现在会把实现层元数据暴露在业务契约中，并使正常状态迁移依赖额外字段。用户已明确决定不需要该机制；REQ/BR/AC、Spec 状态、Plan 映射和独立验收继续承担需求对齐职责。

## 目标

Spec 生命周期完全不再生成、要求或校验内容摘要字段，同时保持 Full 流程的其他契约完整性和状态门禁不变。

## 用户流程

1. 用户创建 Full change 后，得到不包含内容摘要字段的 draft Spec。
2. Spec 内容完整、无占位符、无未决问题且契约编号有效时，用户可以批准 Spec；批准动作只改变状态。
3. Plan 在 Spec 为 approved 且覆盖全部 REQ/BR/AC 后可以批准，不检查内容摘要。
4. 实施完成后，独立验收仍逐项核对当前 Spec 和项目编码规范；Plan completed 后可以把 Spec 标记为 verified。
5. 旧 Spec 若保留历史摘要字段，系统忽略该字段，不要求迁移，也不依据其值阻止后续操作。

## 范围

### 包含

- 新建 Spec 不再包含内容摘要字段。
- Spec approved、Plan approved、Spec verified 和项目校验不再读取或比较内容摘要。
- Spec、Plan、Verify 的用户指引不再把内容摘要作为前置条件或完成证据。
- 历史 Spec 中已有的摘要字段不影响读取、校验和状态迁移。

### 不包含

- 不删除 `draft → approved → verified` 状态机，因为状态仍表达设计、批准和验收阶段。
- 不修改 REQ/BR/AC、占位符、必填章节、未决问题和 Plan 契约覆盖门禁，因为它们与内容摘要无关。
- 不自动批量改写历史 change 文档，避免把机制删除扩大为文档迁移。
- 不引入版本号、时间戳、签名或其他替代冻结机制，因为用户要求的是取消该类门禁。

## 输入与输出

- 输入：Spec 当前状态和正文、Proposal 状态、Plan 状态、REQ/BR/AC 契约映射以及用户的状态迁移请求。
- 输出：符合现有状态机的 approved/verified 结果，或由其他既有门禁产生的明确失败结果；输出不包含新生成的内容摘要。
- API / 事件：本变更不涉及对外网络 API 或事件协议，只改变 Project Kit 文档生命周期行为。
- 数据与状态：保留现有 Proposal、Spec、Plan 状态；仅取消 Spec 内容摘要这一派生元数据。
- 权限与安全：本变更不改变谁能批准或验证文档。
- 重复、并发、超时与部分失败：本变更不增加远程调用或并发语义，沿用现有单次本地状态迁移行为。
- 兼容与迁移：历史摘要字段允许继续存在但被忽略；新文档不再生成该字段。
- 非功能与 UI：本变更不涉及性能阈值、审计系统或 UI 状态。

## 业务规则

- BR-01：新建 Spec 不得生成内容摘要字段。
- BR-02：Spec approved 只依赖 Proposal accepted、Spec 完整性、契约编号和未决问题状态，不得依赖内容摘要。
- BR-03：Plan approved 只依赖 Spec approved、Plan 完整性和全部 REQ/BR/AC 覆盖，不得依赖内容摘要。
- BR-04：Spec verified 仍要求 Plan completed，但不得比较 Spec 内容摘要。
- BR-05：项目校验不得因 approved 或 verified Spec 缺少、保留或改变历史摘要字段而失败。
- BR-06：历史摘要字段视为无业务含义的未知元数据，不自动删除、不更新、不校验。
- BR-07：除内容摘要外，Full 流程现有状态和契约门禁必须保持不变。

### REQ-01：停止生成 Spec 内容摘要

- Current：新建 Spec 包含空摘要字段，批准时会写入计算结果。
- Trigger：创建 Full change 或批准 draft Spec。
- Target：新建 Spec 不包含摘要字段，批准动作只更新 Spec 状态。
- Business Rules：BR-01、BR-02
- Acceptance：AC-01、AC-02

### REQ-02：移除生命周期中的摘要门禁

- Current：Plan approved、Spec verified 和项目校验会因摘要缺失或不匹配而失败。
- Trigger：批准 Plan、验证 Spec 或校验项目。
- Target：这些操作完全不读取或比较摘要，只执行各自剩余的状态和契约门禁。
- Business Rules：BR-03、BR-04、BR-05、BR-07
- Acceptance：AC-03、AC-04、AC-05

### REQ-03：保持历史文档可用

- Current：历史 approved/verified Spec 带有已计算摘要。
- Trigger：读取、校验或推进包含历史摘要字段的 change。
- Target：历史字段被忽略且不会被自动改写，其值是否存在或过期都不影响结果。
- Business Rules：BR-05、BR-06
- Acceptance：AC-06

### REQ-04：同步用户可见流程规则

- Current：技能和生命周期说明仍要求生成和核对摘要。
- Trigger：用户使用 Spec、Plan 或 Verify 流程，或阅读生命周期说明。
- Target：所有现行指引只描述状态、契约映射和独立验收，不再要求摘要。
- Business Rules：BR-02、BR-03、BR-04、BR-07
- Acceptance：AC-07、AC-08

## 失败与边界情况

- Proposal 未 accepted 时，Spec 仍不能 approved。
- Spec 存在占位符、缺少核心章节或 REQ/BR/AC、未决问题不为“无”时，仍不能 approved。
- Spec 未 approved 或 Plan 未完整覆盖全部契约时，Plan 仍不能 approved。
- Plan 未 completed 时，Spec 仍不能 verified；Spec 未 verified 或 Plan 未 completed 时，Proposal 仍不能 completed。
- approved Spec 内容发生变化时，不再产生摘要不匹配错误；独立验收以当前 Spec 内容为验收依据。
- 历史摘要字段为空、格式异常或与正文不一致时，不得影响任何校验或迁移。

## 禁止事项

- 不得用其他字段或隐式摘要重新实现同等冻结门禁。
- 不得因为删除摘要而跳过用户批准、独立验收或编码规范检查。
- 不得顺带删除 REQ/BR/AC、Plan 映射或状态迁移门禁。
- 不得批量重写已完成 change 的历史 Spec。

## 验收标准

- [ ] AC-01：创建新的 Full change 后，Spec frontmatter 中不存在内容摘要字段。
- [ ] AC-02：完整 draft Spec 可以迁移到 approved，迁移前后都不生成内容摘要字段。
- [ ] AC-03：approved Spec 不含内容摘要字段时，只要 Plan 完整且覆盖全部契约，Plan 可以 approved。
- [ ] AC-04：Plan completed 后，不含内容摘要字段的 approved Spec 可以迁移到 verified。
- [ ] AC-05：项目校验不会因 approved/verified Spec 缺少内容摘要字段或正文变化而报告摘要错误。
- [ ] AC-06：历史 Spec 保留任意摘要值时仍可读取和校验，系统不会自动更新或删除该字段。
- [ ] AC-07：Spec、Plan、Verify 的现行技能和显式 Verify 指引均不再要求生成、检查或填写内容摘要。
- [ ] AC-08：除摘要机制外，Spec 完整性、REQ/BR/AC、Plan 覆盖、Plan completed 和独立验收规则仍有测试或静态检查证明保持有效。

## 未决问题

无
