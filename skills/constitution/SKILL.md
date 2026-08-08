---
name: project-constitution
description: 制定或更新稳定开发准则、Constitution 文档时使用; 当用户提到 constitution、开发准则、项目规则时触发。
---

# Project Constitution

## 目的
定义项目级稳定开发约束,为后续计划、执行、验收提供统一边界。

## HARD-GATE
> 未明确项目边界与协作方式时,不得编写或修改 Constitution。

## 必读
- `../../shared/workflows/constitution.md`
- `../../shared/rules/clarity-gates.md`
- `../../shared/templates/constitution.md`
- `../../shared/overview.md`

## 流程要点
1. 读取目标仓库现有约束与文档。
2. 明确哪些是稳定规则,哪些是临时决策。
3. 生成或更新 Constitution。
4. 运行 `validate` 确认结构合法。

## Validation Checklist
- [ ] 已读取 `shared/workflows/constitution.md`
- [ ] 已区分稳定规则与临时决策
- [ ] Constitution 内容未越界到具体功能方案
- [ ] 已运行 `node scripts/project-docs.cjs validate --root <project>`

## 停止条件
- 规则仍依赖未决产品决定。
- 目标仓库现有约束彼此冲突。
- 无法确认哪些规则应长期生效。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “先把功能做了再补规则” | 后续 Plan 和 Verify 会失去统一边界。 |
| “把当前需求细节写进 Constitution” | Constitution 只写长期规则,不是功能 spec。 |
| “现有 README 已经够了” | 说明文档不等于稳定约束。 |
| “先不校验” | 结构错误会让后续技能读取失败。 |

## REQUIRED SUB-SKILL
完成后按项目阶段进入 `project-brief` 或 `project-refine`。
