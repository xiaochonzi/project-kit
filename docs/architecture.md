# 架构说明

Project Kit 采用方案 A:中央共享、技能薄壳。

- `skills/` 提供 10 个生命周期技能入口
- `shared/workflows/` 提供流程正文
- `shared/rules/` 提供规则正文
- `shared/templates/` 提供模板
- `scripts/project-docs.cjs` 提供确定性操作与机械门禁

这种结构让规则保持单一事实来源,同时让技能触发更精确。
