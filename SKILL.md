---
name: project-kit
description: Project Kit 多 skill 插件总览。用于查看本插件提供的生命周期技能、共享规则位置和脚本边界。具体工作请优先使用对应的 project-* 技能。
---

# Project Kit

Project Kit 把大型项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元。

## 可用技能

| 技能 | 何时使用 |
|---|---|
| `project-init` | 初始化项目文档目录 |
| `project-constitution` | 制定稳定开发准则 |
| `project-brief` | 接收并拆解大型原始需求 |
| `project-refine` | 细化阶段或功能 |
| `project-plan` | 为已批准功能制定计划 |
| `project-execute-plan` | 执行已批准计划 |
| `project-verify-plan` | 独立验收已实现功能 |
| `project-change` | 接收后续新增需求 |
| `project-bug` | 诊断并直接修复缺陷 |
| `project-status` | 查看项目状态与下一动作 |

## 单一事实来源

- 共享总览: `shared/overview.md`
- 共享 workflow: `shared/workflows/`
- 共享规则: `shared/rules/`
- 共享模板: `shared/templates/`

规则正文只保留在 `shared/` 下。各技能应引用 `shared/`，不复制长规则正文。

## 脚本边界

`scripts/project-docs.cjs` 只负责确定性操作:
- 初始化目录与模板
- 分配稳定 ID 并创建文档
- 输出指定模式所需上下文
- 校验结构、状态、引用、需求覆盖与依赖环
- 执行合法状态迁移
- 汇总状态并给出机械可推导的下一动作

它不理解需求、不替用户做产品决定、不生成正文、不修改业务代码,也不证明软件已经正确。
