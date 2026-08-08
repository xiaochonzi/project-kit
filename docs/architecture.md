# 架构说明

Project Kit 采用**自包含技能 + docs 目录约定**的架构(参考 superpowers / spec-superflow 的形式):

- `skills/<name>/SKILL.md` — 10 个自包含技能,每个写全可独立执行的流程
- `assets/templates/` — 文档模板(由 `project-docs.cjs` 的 init/new 命令使用)
- `scripts/project-docs.cjs` — 确定性操作与机械门禁校验器
- `plugin.json` — Claude Code 插件清单

技能之间不共享文档;协作通过统一的项目 `docs/` 目录约定与 Handoff Rule 完成。
