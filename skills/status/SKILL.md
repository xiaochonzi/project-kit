---
name: project-status
description: 查看项目当前状态、一致性问题和下一动作时使用; 当用户问现在做到哪了、当前 active milestone 是什么、下一步该做什么时触发。
---

# Project Status

## 目的
只读汇总当前项目状态、追踪一致性和机械可推导的下一动作。

## HARD-GATE
> 本技能只读,不得修改项目文档或代码。

## 必读
- `../../shared/workflows/status.md`
- `../../shared/rules/state-model.md`
- `../../shared/rules/requirement-traceability.md`
- `../../shared/overview.md`

## 流程要点
1. 运行 `status`、`coverage`、`next`。
2. 汇总当前 Active Milestone / Feature / Plan。
3. 报告 implemented 未 verified、accepted 未落位等一致性问题。
4. 给出唯一下一动作。

## Validation Checklist
- [ ] 已读取 `shared/workflows/status.md`
- [ ] 已运行 `node scripts/project-docs.cjs status --root <project>`
- [ ] 已运行 `node scripts/project-docs.cjs coverage --root <project>`
- [ ] 已运行 `node scripts/project-docs.cjs next --root <project>`
- [ ] 输出仅基于当前事实,未擅自修改文档

## 停止条件
- 目标项目 docs 结构不完整,无法得出可信状态。
- 基础命令失败或状态自相矛盾到无法判断。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “顺手把状态修一下” | 这个技能是只读,不能一边报告一边改事实。 |
| “大概能猜到下一步” | `next` 的价值就在于减少猜测。 |
| “coverage 先不跑” | 没有追踪报告,状态结论容易失真。 |
| “implemented 基本等于完成” | 没有 verify 证据就不能说完成。 |

## REQUIRED SUB-SKILL
无后继; 如需行动,按结果进入对应技能。
