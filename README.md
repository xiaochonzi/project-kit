# Project Kit

Project Kit 是一个面向团队内部复用的 Claude Code 多 skill 插件,用于把大型项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元。

## 适用场景

- 初始化项目文档结构
- 接收并拆解大型原始需求
- 细化当前阶段或功能规格
- 为已批准功能制定计划
- 执行计划并记录实施事实
- 独立验收已实现功能
- 接收后续新增需求
- 诊断并修复违反已批准 Spec 的缺陷
- 汇总项目状态与下一动作

## 安装

团队内部使用 Claude Code plugin 方式安装本仓库。插件核心由 `plugin.json`、`skills/`、`shared/` 与 `scripts/project-docs.cjs` 组成。

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

- `shared/overview.md` — 总览与导航
- `shared/workflows/` — 10 个流程正文
- `shared/rules/` — 规则正文
- `shared/templates/` — 文档模板

规则正文只保留在 `shared/` 下。各技能应引用 `shared/`, 不复制长规则正文。

## 常用命令

```bash
node scripts/project-docs.cjs help
node scripts/project-docs.cjs validate-plugin --root .
node scripts/project-docs.cjs init --root <project>
node scripts/project-docs.cjs validate --root <project>
node scripts/project-docs.cjs coverage --root <project>
node scripts/project-docs.cjs next --root <project>
```

## 当前命名约定

第一轮多 skill 迁移期间,目标项目仍以以下命名为权威:

- `docs/blueprint.md`
- `docs/fixes/`

`system-design.md`、`fix/` 与 `reference/` 不在本轮迁移范围内。

## 不支持的能力

本插件当前明确不引入:

- `capability.json` 多平台运行时适配
- hooks 强制注入
- eval 门禁
- YAML/JSON 状态事实源

## 验证

```bash
node scripts/project-docs.cjs validate-plugin --root .
node --test tests/project-docs.test.cjs
node scripts/project-docs.cjs validate --root examples/minimal-project
node scripts/project-docs.cjs validate --root examples/lifecycle-project
```

## 示例

- `examples/minimal-project` — 最小初始化结果
- `examples/lifecycle-project` — 生命周期文档校验基线
