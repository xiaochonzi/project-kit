# 方法来源

Project Kit 的工作流结构借鉴并重新组合了以下开源项目的方法；本文用于归因和后续核对，不表示复制其运行时实现。

## GSD Core

- 项目：https://github.com/open-gsd/gsd-core
- 许可证：MIT
- 调研快照：`343835facc80ad02b1a7133cd7fac6dd0c239293`
- 借鉴点：薄命令路由与详细 workflow 分离、项目状态文档、阶段上下文、需求覆盖、计划 frontmatter、must-haves、计划检查与修订循环。
- 关键参考：
  - https://github.com/open-gsd/gsd-core/blob/main/gsd-core/workflows/new-project.md
  - https://github.com/open-gsd/gsd-core/blob/main/gsd-core/workflows/spec-phase.md
  - https://github.com/open-gsd/gsd-core/blob/main/docs/reference/planning-artifacts.md
  - https://github.com/open-gsd/gsd-core/blob/main/docs/reference/plan-md.md
  - https://github.com/open-gsd/gsd-core/blob/main/docs/reference/state-md.md

## Superpowers

- 项目：https://github.com/obra/superpowers
- 许可证：MIT
- 调研快照：`44c9b2d6e889982ac18c27d05a19fefe335194e1`
- 借鉴点：设计前硬门禁、一次一个问题、方案对比与分节批准、细粒度计划、执行前批判性检查、无新鲜证据不宣称完成、根因优先的系统化调试。
- 关键参考：
  - https://github.com/obra/superpowers/blob/master/skills/brainstorming/SKILL.md
  - https://github.com/obra/superpowers/blob/master/skills/writing-plans/SKILL.md
  - https://github.com/obra/superpowers/blob/master/skills/executing-plans/SKILL.md
  - https://github.com/obra/superpowers/blob/master/skills/verification-before-completion/SKILL.md
  - https://github.com/obra/superpowers/blob/master/skills/systematic-debugging/SKILL.md

## 有意不采用

- 不引入 GSD 的运行时适配器、能力注册表或多 AI 框架。
- 不强制 worktree、自动提交或子 Agent。
- 不复制两者的命令命名和完整提示词；Project Kit 保持自己的文档模型和 CJS 工具边界。
