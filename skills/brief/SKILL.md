---
name: project-brief
description: 接收并拆解大型原始需求时使用; 当用户给出一份大文档、模糊想法、需要从讨论生成 Brief/Requirements/Roadmap 时触发。
---

# Project Brief

## 目的
把原始讨论或大文档整理为可追踪的 Brief、Requirements、Blueprint、Roadmap 和当前阶段产物。

## HARD-GATE
> 阻断性未决问题未澄清前,不得直接进入 Feature Spec 或 Implementation Plan。

## 必读
- `../../shared/workflows/brief.md`
- `../../shared/rules/questioning.md`
- `../../shared/rules/clarity-gates.md`
- `../../shared/rules/decomposition-rules.md`
- `../../shared/rules/requirement-traceability.md`

## 流程要点
1. 识别产品目标、场景、约束、假设和未决问题。
2. 建立带稳定 ID 的 Requirements。
3. 形成 Blueprint 与 Roadmap。
4. 只细化当前阶段需要的 Milestone / Feature。

## Validation Checklist
- [ ] 已读取 `shared/workflows/brief.md`
- [ ] 已把事实、假设、候选方案、未决问题分开
- [ ] 已建立 REQ 追踪关系或明确 deferred/rejected
- [ ] 未越级进入代码计划

## 停止条件
- 需求仍存在重大矛盾。
- 无法把模糊输入拆成原子需求。
- 用户尚未决定会改变系统边界的问题。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “先写个 plan 再说” | 没有需求边界,Plan 只会把猜测结构化。 |
| “这个功能很明显,不用拆 REQ” | 没有稳定 ID 就无法追踪后续交付。 |
| “把远期功能也一起细化” | 过早细化会制造大量失效文档。 |
| “直接从大文档生成代码任务” | 跳过能力地图和阶段边界会让范围失控。 |

## REQUIRED SUB-SKILL
完成后进入 `project-refine`。
