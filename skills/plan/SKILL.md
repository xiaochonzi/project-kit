---
name: project-plan
description: 为已批准 Feature 制定 Implementation Plan 时使用; 当用户要求制定计划、拆实现步骤时触发。若无已批准 Spec,路由回 project-refine。
---

# Project Plan

## 目的
为一个已批准 Feature 编写可以逐步执行、逐步验证的实现计划。此模式不修改业务代码。

## HARD-GATE
> 无已批准、无阻断性未决问题的 Feature Spec,不得制定计划。

## 必读
- `../../shared/workflows/plan.md`
- `../../shared/rules/plan-quality.md`
- `../../shared/rules/requirement-traceability.md`
- `../../shared/overview.md`

## 流程要点
1. 明确唯一 Feature ID 并运行 `context plan`。
2. 核对代码现实与 Spec 是否一致。
3. 选择最小满足 Spec 的实现方式。
4. 生成带验证映射的分步任务。

## Validation Checklist
- [ ] 已读取 `shared/workflows/plan.md`
- [ ] 已运行 `node scripts/project-docs.cjs context plan --target <feature-id> --root <project>`
- [ ] 每条验收标准都映射到任务和最终验证
- [ ] 每个任务含 `files` / `read_first` / `action` / `verify` / `acceptance` / `done`
- [ ] 未引入计划外能力

## 停止条件
- Spec 未批准或仍有阻塞问题。
- 代码现实与 Spec 冲突,需要改变产品边界。
- 无法给出真实文件或可执行验证。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “Spec 已经够清楚,直接写代码吧” | 没有 Plan,执行无法按步验证,验收无从映射。 |
| “先写大步骤,细节之后补” | 缺文件、命令、验收条件的步骤无法执行。 |
| “测试可以最后统一补” | 没有任务级验证,问题会被堆到最后一起爆炸。 |
| “顺手重构一下结构更优雅” | Plan 只服务当前 Spec,不是顺手优化入口。 |

## REQUIRED SUB-SKILL
完成后进入 `project-execute-plan`。
