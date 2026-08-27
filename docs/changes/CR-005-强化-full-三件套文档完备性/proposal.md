---
id: CR-005
title: 强化 Full 三件套文档完备性
status: completed
created_at: 2026-08-27
---

# 强化 Full 三件套文档完备性

## 背景与问题

当前 Full Change 已将背景、业务契约和实现任务拆分到 proposal/spec/plan，但部分关键信息只存在于生成文档时的对话上下文。尤其是 Plan 虽要求规划者探索代码现实，却没有强制记录入口、调用链、关键符号、Current/Target Behavior、技术取舍、不变量和条件技术设计。后续执行者只读取三件套时，仍可能需要重新猜测原始意图，导致实现范围、层级或失败行为发生偏差。

## 期望结果

Full Change 的三件套成为完整、自解释、无隐含上下文的可执行实施依据。执行者不需要查看原始对话或请求生成者补充说明；读取 proposal/spec/plan 后即可准确理解为什么修改、最终行为、当前技术现状、修改位置、实现方式、不可破坏的约束和验收方法。

## 包含

- 明确 Proposal、Spec、Plan 共同承担的文档完备性要求。
- Proposal 固化真实背景、证据、范围、影响和已确认决定。
- Spec 固化术语、业务行为、输入输出、规则、失败边界、禁止事项和可验证契约。
- Plan 固化当前技术现状、入口与调用链、关键文件与符号、Current/Target Behavior、技术设计、不变量、条件技术设计和可执行 Tasks。
- 对状态机、错误策略、并发幂等、数据事务、配置、兼容迁移、权限安全、可观测性和参考实现建立适用性判断。
- 加强 Plan approved 和执行前的完备性门禁，禁止依赖原始对话、模糊引用或未记录决定。
- 同步模板、相关生命周期技能、脚本机械校验、说明文档和测试。

## 不包含

- 不创建第四份概述、交接或 implementation-notes 文档。
- 不把完整源代码复制进 Plan，Plan 记录定位、行为、接口和实现要求，执行时仍以实际代码为准。
- 不要求简单 Change 展开所有复杂技术章节；不适用项只需说明原因。
- 不改变 Quick 零文档路径。
- 不改变 proposal → spec → plan → execute-plan → verify-plan 状态机。

## 影响范围

主要影响 proposal/spec/plan 模板与对应技能，Plan 的批准门禁、execute-plan 的执行前检查、verify-plan 的验收依据、生命周期说明、CHANGELOG 和相关测试。可能同步更新 change 技能，确保 Proposal 记录已确认决定，但不改变 Quick/Full 分流规则。

## 决定

Accepted。采用“三件套完备性、无上下文依赖、可执行实施依据”的定义，不使用额外文档承载缺失信息。

## 未决问题

无
