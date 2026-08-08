# Verify Plan Workflow

## 目的

使用新鲜证据独立核对 Spec、Plan 与实际实现，只在全部标准满足时宣布完成。

## 必读

- `../rules/verification-rules.md`
- Constitution、Feature Spec、Plan、Execution Summary、相关 Change/ADR 和实际 diff。

## 流程

1. 运行 `context verify-plan --target <feature-id>`，确认 Feature 为 `implemented` 且存在执行记录。
2. 创建 Verification 文档，在 `implementation_ref` 记录 commit、构建 ID 或明确的工作树版本，并记录环境。
3. 对 Spec 每条验收标准选择直接证据：自动测试、构建、静态检查、数据检查或人工流程。
4. 重新运行证据命令；不得仅引用 execute 阶段的旧成功输出。
5. 检查 Plan 每项任务是否完成、实际文件是否越界、相关 REQ 是否仍满足。
6. 检查 Constitution、关键失败路径、回归范围、安全和数据边界。
7. 对每条标准记录 `pass`、`fail` 或 `blocked`，附命令与观察事实。
8. 汇总未批准范围、残留风险和人工验证限制。
9. 任一必需标准失败或证据不新鲜时，不标记完成；给出最小下一动作。
10. 全部通过后，把 Verification 置为 `passed`，Feature 从 `implemented` 迁移为 `verified`。
11. 若 Milestone 所有 Feature 均 verified 且退出标准满足，才将 Milestone 标记 `completed`。
12. 更新 STATE 与 Roadmap，选定下一 Feature 或下一 Milestone。

## 禁止

- 不使用“应该可以”“看起来正确”代替证据。
- 不因实现者声称完成而跳过复验。
- 不在验收过程中隐式修复范围外问题；失败后回到 execute、bug 或 change。

## 成功标准

- 每条验收标准都有同一轮次的新鲜证据。
- 结论可由他人按记录复现。
- 状态与证据一致，无 implemented-but-claimed-verified。
