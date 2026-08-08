---
name: project-verify-plan
description: 使用新鲜证据独立验收已实现功能时使用; 当用户要求 verify、验收、确认是否完成时触发。若 Feature 未 implemented,路由回 project-execute-plan。
---

# Project Verify Plan

## 目的
使用新鲜证据独立核对 Spec、Plan 与实际实现,只在全部标准满足时宣布完成。

## HARD-GATE
> 无新鲜证据,不得宣布功能完成或把 Feature 标记为 `verified`。

## 必读
- `../../shared/workflows/verify-plan.md`
- `../../shared/rules/verification-rules.md`
- `../../shared/rules/state-model.md`

## 流程要点
1. 运行 `context verify-plan` 确认 Feature 为 `implemented`。
2. 重新运行证据命令,不得复用 execute 阶段旧输出。
3. 逐条记录验收标准的 pass/fail/blocked。
4. 全部通过后推进 Feature/Milestone/STATE。

## Validation Checklist
- [ ] 已读取 `shared/workflows/verify-plan.md`
- [ ] 已运行 `node scripts/project-docs.cjs context verify-plan --target <feature-id> --root <project>`
- [ ] 每条验收标准都有同轮新鲜证据
- [ ] 已检查 Plan 任务完成与 diff 越界
- [ ] 只有全部通过时才标记 `verified`

## 停止条件
- Feature 尚未 implemented。
- 任一必需标准失败或证据不新鲜。
- 验收过程中发现范围外问题需要单独处理。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “执行阶段已经测过了,这里不用重跑” | 没有新鲜证据就不是独立验收。 |
| “看起来正确,先标完成” | `verified` 只能由证据支持,不能靠感觉。 |
| “失败项就写成限制吧” | 失败是失败,不能用表述掩盖。 |
| “顺手把别的问题修了再验收” | 验收不是范围外修复入口。 |

## REQUIRED SUB-SKILL
完成后根据结果进入 `project-status` 或下一轮 `project-brief` / `project-refine`。
