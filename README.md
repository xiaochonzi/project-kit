# Project Kit

Project Kit 是一个面向团队内部复用的 Claude Code 多 skill 插件,用于把大型项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元。

## 设计原则

- **技能自包含**:每个技能写全可独立执行的流程(前置条件、步骤、校验清单、停止条件),触发即用,不依赖共享文档
- **围绕 docs 约定**:所有技能围绕统一的项目文档结构工作(`init` 技能创建,脚本校验)
- **渐进式**:每个技能只负责生命周期中的一环,通过 Handoff Rule 交接下一技能
- **脚本承载机械门禁**:`scripts/project-docs.cjs` 负责确定性操作与校验,不替 AI 做语义判断

## 安装

团队内部使用 Claude Code plugin 方式安装本仓库。插件由 `plugin.json`、`skills/`、`assets/templates/` 与 `scripts/project-docs.cjs` 组成。

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

## docs/ 目录约定

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

## 常用命令

```bash
node scripts/project-docs.cjs help
node scripts/project-docs.cjs validate-plugin --root .
node scripts/project-docs.cjs init --root <project>
node scripts/project-docs.cjs validate --root <project>
node scripts/project-docs.cjs coverage --root <project>
node scripts/project-docs.cjs next --root <project>
```

## 不支持的能力

本插件明确不引入:

- `capability.json` 多平台运行时适配
- hooks 强制注入
- eval 门禁
- YAML/JSON 状态事实源
- 技能间共享文档目录(技能自包含)

## 验证与测试

```bash
node scripts/project-docs.cjs validate-plugin --root .
node --test tests/project-docs.test.cjs
node scripts/project-docs.cjs validate --root examples/minimal-project
node scripts/project-docs.cjs validate --root examples/lifecycle-project
```

## 示例

- `examples/minimal-project` — 最小初始化结果
- `examples/lifecycle-project` — 生命周期文档校验基线
