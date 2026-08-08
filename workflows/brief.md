# Brief Workflow

## 目的

接收一次原始大型需求文档，把它拆成完整可追踪的项目蓝图与分阶段路线；只详细设计当前阶段。

## 必读

- `references/questioning.md`
- `references/clarity-gates.md`
- `references/decomposition-rules.md`
- `references/requirement-traceability.md`
- `references/document-schema.md`
- Brief、Requirements、Blueprint、Roadmap、Milestone、Feature Spec 模板。

## 流程

1. 运行 `new brief --source <file>`，原样保存用户输入；以后不得改写其正文。
2. 提取并分组：目标、用户、场景、业务结果、能力、规则、数据、接口、约束、非功能要求、风险和明确排除项。
3. 将陈述分为 `事实`、`用户决定`、`合理推断`、`待确认假设`，不得把推断伪装成需求。
4. 合并重复表达，拆开包含多个行为或结果的复合需求。
5. 为每条原子需求分配稳定 `REQ-###`，写入 Requirements；记录来源、优先级、状态和验收提示。
6. 列出冲突、缺失和高影响歧义，并按 [clarity-gates](../references/clarity-gates.md) 评分。
7. 使用 [questioning](../references/questioning.md) 逐个澄清阻塞问题；一次只问一个问题。
8. 提出 2–3 种整体边界或交付策略，说明推荐项及代价。
9. 分节呈现 Blueprint：目标与非目标、用户与场景、能力地图、模块边界、数据流、外部边界、非功能约束、风险。每节获得确认后再继续。
10. 对 Blueprint 做一致性自审：无隐含新范围、无模块职责重叠、无需求遗漏。
11. 按纵向用户价值拆分 Milestones；每个 Milestone 必须形成可演示或可验证的系统状态。
12. 为每个 Milestone 建立 Feature Map；远期 Feature 只记录目标、边界、依赖和验收方向。
13. 检查依赖方向和循环，优先关闭最高风险假设和最小端到端闭环。
14. 建立两层覆盖：每个 accepted REQ 映射到至少一个 Milestone，也映射到至少一个 Feature。
15. 将未纳入路线的 REQ 明确标记 `deferred` 或 `rejected` 并说明理由。
16. 选定唯一 Active Milestone；其他阶段进入 Next 或 Later。
17. 只为 Active Milestone 创建完整 Feature Specs。逐个明确问题、目标、范围、输入输出、规则、失败行为和可验证验收标准。
18. 不创建 Implementation Plan，不预测远期文件名或代码步骤。
19. 更新 `STATE.md`：当前 Milestone、当前 Feature、关键决定、阻塞、下一动作。
20. 运行 `coverage` 与 `validate`，修复结构和追踪缺口后提交用户整体审阅。

## 门禁

- Blueprint 门禁：目标、边界、关键约束和成功标准清楚，用户批准整体方向。
- Roadmap 门禁：每阶段可独立验证、无技术层阶段、无依赖环。
- Coverage 门禁：所有 accepted REQ 均有 Milestone 与 Feature 映射。
- Detail 门禁：仅 Active Milestone 有详细 Specs。
- Spec 门禁：每个当前 Feature 达到清晰度阈值且没有阻塞未决问题。

## 失败处理

- 原始文档互相冲突：保留冲突并请求决定，不自行合并。
- 需求过大：先确认 Blueprint 范围，再分批生成 Milestones；不跳过覆盖检查。
- 用户暂时无法决定：把问题和影响写入 Open Questions，将相关 REQ 标记 `blocked`。

## 成功标准

- 原始输入可追溯且未被改写。
- 项目边界、路线、阶段和当前功能均获确认。
- accepted REQ 覆盖率为 100%。
- 当前阶段具备进入 `refine` 或 `plan` 的信息，远期阶段没有过度设计。
