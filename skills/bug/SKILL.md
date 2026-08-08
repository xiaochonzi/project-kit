---
name: project-bug
description: 诊断并直接修复违反已批准 Spec 的缺陷时使用; 当用户要求修 bug、定位根因、做回归验证时触发。若本质是新增需求,路由回 project-change。
---

# Project Bug

## 目的
诊断已实现系统中违反已批准 Spec 的缺陷,记录根因、最小修复与回归验证。

## HARD-GATE
> 未能把问题归类为“违反已批准 Spec”的缺陷前,不得按 bug 路径直接修复。

## 必读
- `../../shared/workflows/bug.md`
- `../../shared/rules/debugging-rules.md`
- `../../shared/rules/verification-rules.md`

## 流程要点
1. 复现现象并定位对应 Spec 期望。
2. 做根因分析,找出最小修复路径。
3. 实施修复并运行回归验证。
4. 记录 Bug Resolution 与证据。

## Validation Checklist
- [ ] 已读取 `shared/workflows/bug.md`
- [ ] 已记录现象、预期、根因、修复与验证
- [ ] 修复范围最小,未借机加入新能力
- [ ] 已运行回归验证并记录证据

## 停止条件
- 找不到对应 Spec 依据,问题更像新增需求。
- 无法稳定复现问题。
- 需要扩大范围或改变产品边界才能修复。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “先改了再找根因” | 没有根因分析,同类问题会重复出现。 |
| “顺便把相关小需求也做了” | Bug 修复不是增强功能入口。 |
| “这个看起来像 bug,不用对 Spec” | 没有 Spec 依据就可能是新需求。 |
| “回归测试省掉吧,改动很小” | 小改动一样可能打破已有行为。 |

## REQUIRED SUB-SKILL
完成后进入 `project-verify-plan` 或 `project-status`。
