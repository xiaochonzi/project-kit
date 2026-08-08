---
name: project-change
description: 接收现有系统的新增需求、范围变化或后续增强时使用; 当用户提出 change request、新需求、架构变化时触发。若只是缺陷修复,路由回 project-bug。
---

# Project Change

## 目的
接收初始蓝图之后的新需求,完成影响分析并决定它应进入哪个 Milestone / Feature / Blueprint 更新路径。

## HARD-GATE
> 新需求不得直接插入当前 Plan 或已完成 Spec,必须先作为 Change 处理。

## 必读
- `../../shared/workflows/change.md`
- `../../shared/rules/questioning.md`
- `../../shared/rules/decomposition-rules.md`
- `../../shared/rules/requirement-traceability.md`
- `../../shared/rules/state-model.md`

## 流程要点
1. 判断是 Bug、增强、大型能力还是架构变化。
2. 记录需求来源、当前问题、期望结果与影响范围。
3. 决定进入现有 Milestone、新 Milestone 或 Deferred/Rejected。
4. 更新追踪关系与相关文档。

## Validation Checklist
- [ ] 已读取 `shared/workflows/change.md`
- [ ] 已完成影响分析,未直接改旧 completed 语义
- [ ] 已明确 accepted / deferred / rejected 结果
- [ ] 已更新 REQ / Milestone / Feature 追踪关系或记录不纳入原因

## 停止条件
- 无法判断它是 bug 还是新需求。
- 影响范围超出当前已知架构边界且需要用户决定。
- 变更会改写已验证功能契约但未获批准。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “这个需求很小,直接塞进当前 Plan” | 会破坏当前迭代范围和验收边界。 |
| “改一下旧 Spec 就好了” | 已完成或已验证契约不能静默扩写。 |
| “先实现再补 CR” | Change 的价值就在于先分析影响。 |
| “用户只是顺口一提,不用记录” | 未记录的变化最容易造成范围漂移。 |

## REQUIRED SUB-SKILL
完成后按结论进入 `project-refine` 或 `project-plan`; 若判断为缺陷则进入 `project-bug`。
