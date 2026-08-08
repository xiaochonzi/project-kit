# Changelog

## 0.2.0 - 2026-08-09

- 重构技能为自包含形式:每个 SKILL.md 内嵌完整流程(前置条件、步骤、校验清单、停止条件、交接),删除 shared/、workflows/、references/ 共享层。
- 技能名与目录名统一(plan / execute-plan / verify-plan 等),与 Claude Code 技能发现约定一致。
- validate-plugin 改为校验自包含结构:技能名匹配、无共享/旧路径引用、围绕 docs/ 约定、模板完整。
## 0.1.0 - 2026-08-08

- 从单一 `SKILL.md` 路由重构为 10 个薄壳 skills。
- 新增 `shared/` 中央事实层,统一承载 workflows、rules、templates 与 overview。
- `scripts/project-docs.cjs` 新增 `validate-plugin` 命令,用于插件结构与链接校验。
