---
name: project-refine
description: 细化当前 Milestone、Feature Map 或 Feature Spec 时使用; 当用户要求 refine milestone、细化功能规格、拆当前阶段时触发。
---

# Project Refine

## 目的
把已接受的阶段或功能边界细化为可独立验收的 Milestone、Feature Map 或 Feature Spec。

## HARD-GATE
> 未确认的需求边界不得被细化成已批准功能契约。

## 必读
- `../../shared/workflows/refine.md`
- `../../shared/rules/questioning.md`
- `../../shared/rules/clarity-gates.md`
- `../../shared/rules/decomposition-rules.md`
- `../../shared/rules/requirement-traceability.md`

## 流程要点
1. 只细化当前或下一个可交付阶段。
2. 拆出可独立验收的 Feature。
3. 明确包含/不包含、依赖、验收标准。
4. 保持与上层 REQ / Roadmap 追踪一致。

## Validation Checklist
- [ ] 已读取 `shared/workflows/refine.md`
- [ ] 每个 Feature 只有单一主要目标
- [ ] 依赖无环且验收标准可验证
- [ ] 未细化远期不必要内容

## 停止条件
- 当前阶段目标仍模糊。
- Feature 无法形成独立验收闭环。
- 存在会改变方案的阻断性未决问题。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “顺手把后面两期也细化掉” | 远期计划过早固化会很快失效。 |
| “按钮/表结构也算 Feature” | 那是 Plan 任务,不是功能契约。 |
| “验收标准先模糊写一下” | 模糊验收标准等于没有边界。 |
| “依赖之后再补” | 缺依赖图会直接破坏执行顺序。 |

## REQUIRED SUB-SKILL
完成后进入 `project-plan`。
