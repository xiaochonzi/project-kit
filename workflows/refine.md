# Refine Workflow

## 目的

把指定 Milestone 或 Feature 从方向性描述收敛为可批准的交付契约，不进入代码实现。

## 必读

- `references/questioning.md`
- `references/clarity-gates.md`
- `references/decomposition-rules.md`
- `references/requirement-traceability.md`
- 目标父级文档、Constitution、Blueprint、Requirements 和 STATE。

## 流程

1. 明确唯一目标 ID；运行 `context refine --target <id>` 获取机械上下文清单。
2. 读取目标、父级、来源 REQ、依赖与相关已验证 Specs。
3. 判断目标是否包含多个独立用户结果；若是，先提出拆分并获得确认。
4. 区分用户已决定的事实、从代码发现的约束和仍待确认的假设。
5. 从五个视角检查：用户结果、最简边界、系统边界、失败路径、遗留未决项。
6. 一次只澄清一个高影响问题；有多种方案时给出推荐和取舍。
7. 若是 Milestone，完善目标、包含/不包含、Feature Map、依赖和退出标准。
8. 若是 Feature，完善用户流程、输入输出、数据和接口、业务规则、失败行为、验收标准和追踪关系。
9. 对每条验收标准检查：可观察、可重复、无实现细节依赖、覆盖正常与关键失败路径。
10. 运行 `validate`，展示完整草案供用户评审。
11. 使用 `transition` 按合法顺序推进状态；不得越过评审与批准。

## 门禁

- Spec 清晰度达到阈值。
- 不包含独立的第二个用户结果。
- 所有范围内 REQ 可追踪，所有范围外 REQ 有明确去向。
- 未决问题不会改变范围、接口、数据权威或验收。

## 停止条件

- 发现需求实际属于新 Change。
- 依赖尚未决定或与现有已验证行为冲突。
- 需要架构决策但尚无 ADR。

## 成功标准

- `reviewed` 表示内容已共同审阅。
- `approved` 表示边界和验收已获用户批准。
- `ready` 只在存在有效、已批准 Plan 时设置。
