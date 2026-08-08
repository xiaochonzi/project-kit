---
name: project-init
description: 初始化项目文档目录并生成 Project Kit 标准 docs/ 骨架时使用; 当用户提到 init docs、初始化文档结构、创建项目文档目录时触发。
---

# Project Init

## 目的
初始化 Project Kit 管理所需的标准 docs/ 目录与基础文档。此技能只负责搭建骨架,不替用户补需求内容。

## HARD-GATE
> 未明确目标项目根目录时,不得初始化文档目录。

## 必读
- `../../shared/workflows/init.md`
- `../../shared/rules/document-schema.md`
- `../../shared/overview.md`

## 流程要点
1. 确认目标项目根目录。
2. 运行 `node scripts/project-docs.cjs init --root <project>`。
3. 检查生成的基础文档与目录是否齐全。
4. 运行 `validate` 做结构校验。

## Validation Checklist
- [ ] 已读取 `shared/workflows/init.md`
- [ ] 已运行 `init --root <project>`
- [ ] 已确认 `docs/constitution.md`、`docs/requirements.md`、`docs/blueprint.md`、`docs/roadmap.md`、`docs/STATE.md`
- [ ] 已运行 `node scripts/project-docs.cjs validate --root <project>`

## 停止条件
- 无法确定目标项目根目录。
- 目标目录已有冲突文档且需要用户决定是否覆盖。
- `init` 或 `validate` 失败。

## Common Rationalizations
| 借口 | 现实 |
| --- | --- |
| “先手工建几个目录更快” | 会绕过模板和脚本约束,后续校验不可靠。 |
| “README 以后再说” | 这个技能只负责标准骨架,不要顺手扩范围。 |
| “目录差一点没关系” | 目录名是脚本和规则契约的一部分。 |
| “先不跑 validate” | 没有结构校验,后续问题会变成隐性成本。 |

## REQUIRED SUB-SKILL
完成初始化后,按需要进入 `project-constitution` 或 `project-brief`。
