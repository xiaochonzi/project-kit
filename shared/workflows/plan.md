# Plan Workflow

## 目的

为一个已批准 Feature 编写可以逐步执行、逐步验证的实现计划。此模式不修改业务代码。

## 必读

- `../rules/plan-quality.md`
- `../rules/requirement-traceability.md`
- Constitution、Blueprint、STATE、目标 Spec、相关 ADR 和依赖 Specs。
- 目标仓库的实际代码、测试和配置。

## 流程

1. 明确唯一 Feature ID；运行 `context plan --target <feature-id>`。
2. 拒绝为 `idea`、`draft` 或存在阻塞歧义的 Feature 制定计划。
3. 探索现有实现与执行流，找到可复用模式、真实文件、接口和测试位置。
4. 按仓库规则执行影响分析；高风险先报告，不隐瞒影响面。
5. 选择最小满足 Spec 的实现方式，列出不采用的复杂方案及原因。
6. 确定计划的 `depends_on`、执行 wave、预计修改文件、关联 REQ 和 must-haves。
7. 将工作拆成短小顺序任务。每个任务必须包含：
   - `files`：精确文件路径；
   - `read_first`：执行前必须读取的符号或文件；
   - `action`：具体修改及关键逻辑；
   - `verify`：该任务后立即运行的命令或检查；
   - `acceptance`：可观察的通过条件；
   - `done`：何时可勾选完成。
8. 测试驱动适用时明确写出失败测试、最小实现、通过测试三个动作。
9. 建立每条 Spec 验收标准到任务和最终验证的映射。
10. 检查任务间文件冲突、遗漏依赖、迁移顺序、公开接口变化和回滚影响。
11. 使用 [plan-quality](../rules/plan-quality.md) 的全部维度自审并修订。
12. 创建或更新 Plan，提交用户批准。批准前不修改代码。
13. 批准后把 Plan 置为 `approved`，把 Feature 从 `approved` 推进为 `ready`。

## 停止条件

- Spec 未批准或仍有阻塞问题。
- 代码现实与 Spec 冲突，需要改变产品边界。
- 影响分析发现需新增 ADR 或 Change。
- 无法给出真实文件或可执行验证。

## 成功标准

- 执行者不需要猜测文件、行为或完成条件。
- 每个验收标准均被任务和验证覆盖。
- 计划只实现目标 Spec，没有顺手重构或未来设计。
