---
name: project-execute-plan
description: 执行已批准计划时使用; 当用户要求按 Plan 实施、落代码、完成执行记录时触发。若无批准 Plan,路由回 project-plan。
---

# Project Execute Plan

## 目的
严格实施一个已批准计划,保存实施事实; 不把“代码已写”当作独立验收通过。

## HARD-GATE
> 无已批准 Plan 或 Plan/Feature 不可执行时,不得开始实施。

## 必读
- `../../shared/workflows/execute-plan.md`
- `../../shared/rules/execution-rules.md`
- `../../shared/rules/verification-rules.md`
- `../../shared/overview.md`

## 流程要点
1. 运行 `context execute-plan` 确认 Plan 与 Feature 可执行。
2. 修改前批判性检查 Plan。
3. 按任务顺序实施并逐步验证。
4. 生成 Execution Summary,把 Feature 推进到 `implemented`。

## Validation Checklist
- [ ] 已读取 `shared/workflows/execute-plan.md`
- [ ] 已运行 `node scripts/project-docs.cjs context execute-plan --target <feature-id> --root <project>`
- [ ] 每项任务都先读 `read_first`,只改计划内文件
- [ ] 每完成一组相关步骤就运行对应验证
- [ ] 已生成执行事实记录,且未越权标记 `verified`

## 停止条件
- Plan 过期、冲突或不完整。
- 连续修复无改善,表明计划假设错误。
- 需要改变 Spec、扩大范围或作新架构决定。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “先写完再统一测” | 没有任务级验证,无法知道是哪一步引入问题。 |
| “这个文件顺手也一起改了” | 超出 Plan 范围会破坏可审查性。 |
| “Feature 差不多完成了,直接标 verified” | `verified` 只能来自独立验收,不是执行阶段。 |
| “测试失败先注释掉,后面再补” | 这会掩盖根因,不是执行。 |

## REQUIRED SUB-SKILL
完成后进入 `project-verify-plan`。
