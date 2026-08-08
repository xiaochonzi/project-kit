# Execute Plan Workflow

## 目的

严格实施一个已批准计划，保存实施事实；不把“代码已写”当作独立验收通过。

## 必读

- `references/execution-rules.md`
- `references/verification-rules.md`
- Constitution、STATE、Feature Spec、已批准 Plan 和相关 ADR。

## 流程

1. 运行 `context execute-plan --target <feature-id>`，确认 Plan 与 Feature 均可执行。
2. 在修改前批判性检查 Plan：路径存在、依赖成立、命令可运行、步骤没有越界。
3. 发现歧义或错误立即停止并说明，不一边猜测一边实施。
4. 取得明确执行授权后，将 Feature 与 Plan 分别迁移到 `in-progress`。
5. 按任务顺序实施。开始每项任务前读取 `read_first`，只修改 `files` 范围。
6. 先观察计划要求的失败证据，再做最小修改，再运行该任务的 `verify`。
7. 记录命令、结果、重要偏差和实际修改文件；不伪造执行记录。
8. 若验证失败，定位当前任务原因；不得用扩大范围或删除测试掩盖问题。
9. 若需要改变 Spec、增加功能、跨越模块边界或作新架构决定，停止并转 `change` 或回到 `plan`。
10. 完成所有任务后运行 Plan 的整体验证，并检查实际 diff 仅覆盖计划范围。
11. 创建 Execution Summary，记录计划任务结果、修改文件、验证证据、偏差与遗留项。
12. 所有计划任务和直接验证完成后，把 Plan 置为 `completed`，Feature 置为 `implemented`。
13. 更新 STATE，将下一动作设为 `verify-plan`；不得标记 Feature 为 `verified`。

## 停止条件

- Plan 不完整、过期或与仓库现实冲突。
- 需要未获授权的外部写操作或破坏性操作。
- 连续修复没有改善，表明计划假设错误。
- 发现安全、数据迁移或高风险影响未被计划覆盖。

## 成功标准

- 所有任务有真实执行和验证记录。
- 实际改动与 Spec、Plan 一致。
- Feature 最多推进到 `implemented`，等待独立验收。
