---
name: project-kit
description: Project Kit 插件总览。用于查看本插件的技能列表、docs 目录约定与脚本边界。具体工作请直接使用对应的技能(init / constitution / brief / refine / plan / execute-plan / verify-plan / change / bug / status)。
---

# Project Kit

Project Kit 把大型项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元。每个技能自包含完整执行流程,触发即用,不依赖共享文档。

## 可用技能

| 技能 | 何时使用 |
|---|---|
| `init` | 初始化项目 `docs/` 目录结构 |
| `constitution` | 制定稳定开发准则 |
| `brief` | 接收并拆解大型原始需求 |
| `refine` | 细化 Milestone / Feature Spec |
| `plan` | 为已批准 Feature 制定实现计划 |
| `execute-plan` | 按计划实施并记录执行事实 |
| `verify-plan` | 用新鲜证据独立验收 |
| `change` | 接收后续新增需求 |
| `bug` | 诊断并修复违反已批准 Spec 的缺陷 |
| `status` | 只读查看项目状态与下一动作 |

## docs/ 目录约定(所有技能的共同契约)

```text
<项目根>/docs/
├── constitution.md      # 稳定开发准则
├── requirements.md      # 原子需求(REQ-###)
├── blueprint.md         # 系统边界与能力地图
├── roadmap.md           # 交付顺序
├── STATE.md             # 当前焦点与下一动作
├── briefs/              # BRIEF-###
├── capabilities/        # C-###
├── milestones/          # M# + M#-CONTEXT.md
├── specs/<M#>/          # F-M#-##
├── plans/               # F-M#-##-plan.md
├── executions/          # F-M#-##-execution.md
├── verifications/       # F-M#-##-verification.md
├── changes/             # CR-###
├── fixes/               # BUG-###
├── decisions/           # ADR-###
└── research/
```

技能按此约定落盘与读取;`init` 技能负责创建,`project-docs.cjs` 负责校验。

## 脚本边界

`scripts/project-docs.cjs` 只负责确定性操作:

- 初始化目录与模板
- 分配稳定 ID 并创建文档
- 输出指定模式所需上下文
- 校验结构、状态、引用、需求覆盖与依赖环
- 执行合法状态迁移
- 汇总状态并给出机械可推导的下一动作

它不理解需求、不替用户做产品决定、不生成正文、不修改业务代码,也不证明软件已经正确。
