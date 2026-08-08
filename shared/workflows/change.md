# Change Workflow

## 目的

让后续新增需求进入已有项目事实体系，在不重写已验证历史的前提下重新确定范围、优先级和交付阶段。

## 必读

- `../rules/questioning.md`
- `../rules/decomposition-rules.md`
- `../rules/requirement-traceability.md`
- `../rules/state-model.md`
- 当前 Requirements、Blueprint、Roadmap、STATE、受影响 Specs 和 ADR。

## 流程

1. 运行 `new change --title <title>`，保存来源、当前问题、期望结果和触发背景。
2. 判断它是：违反现有验收标准的 Bug、单 Feature 增强、跨迭代 Capability、或跨模块架构变化。
3. 若违反已有验收标准，停止 Change 流程并转 `bug`。
4. 提取新的原子需求，分配新 REQ ID；不得改写旧 REQ 的历史含义。
5. 分析受影响的 Blueprint 能力、模块、Milestones、已验证 Specs、依赖和当前进行中工作。
6. 一次只澄清一个会改变范围或优先级的问题。
7. 给出 2–3 种接入策略，例如立即插入、下个 Milestone、独立 Capability，并说明推荐和代价。
8. 用户接受后，把 Change 置为 `accepted`，将新 REQ 映射到明确去向。
9. 单一结果：创建新 Feature Spec，通过 `extends`、`depends_on` 或 `supersedes` 关联旧 Spec。
10. 跨多个可独立交付迭代：创建 Capability，按纵向价值新增 Milestones 和 Feature Maps。
11. 改变长期模块边界或技术决策：创建 ADR，更新当前 Blueprint。
12. 更新 Roadmap 的 Active/Next/Later/Deferred；说明对现有承诺的影响。
13. 只为新的 Active Milestone 创建详细 Specs，远期仍保持粗粒度。
14. 运行 `coverage` 和 `validate`；全部落位后将 Change 标记 `completed`。
15. 更新 STATE 的 Decisions、Current Focus 和 Next Action。

## 停止条件

- 用户尚未选择接入策略。
- 新需求与 Constitution 或不可变安全边界冲突。
- 会修改正在执行的 Plan；先停止执行并重新计划。
- 影响已验证行为但关系与迁移方式不清楚。

## 成功标准

- 新需求都有稳定 REQ ID 和明确交付去向。
- 已验证 Spec 未被悄悄扩写。
- 路线优先级变化透明，当前工作只有一个明确焦点。
