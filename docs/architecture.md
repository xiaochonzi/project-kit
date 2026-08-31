# 架构说明

Project Kit 采用**自包含技能 + docs 目录约定 + 确定性机械门禁**的架构：

- `skills/<name>/SKILL.md` — 12 个自包含技能，每个写全可独立执行的前置条件、流程、自检、停止条件与交接
- `assets/templates/` — init 文档模板，以及 Change 三件套的最小骨架；Proposal/Spec/Plan 骨架只含带 `schema_version: 2` 的 frontmatter、标题和状态
- `scripts/project-docs.cjs` — ID 分配、原子创建、上下文输出、状态迁移和机械门禁校验器
- `plugin.json` / `package.json` — 平台插件和 Pi Package 清单

## 文档生成边界

`new change` 不生成需求正文，也不向持久化三件套写入 HTML 指导注释、示例契约、示例 Task 或待填占位符。`change`、`spec`、`plan` 技能分别从最小骨架完整生成职责对应的文档：

- Proposal：EVD 证据、范围、DEC 冻结决定
- Spec：数据权威、唯一业务契约、REQ/BR/AC
- Plan：代码基线、Implementation Binding、十七字段 Tasks 和验证

三件套必须可以直接交给没有原始对话上下文的执行 AI。技能负责语义探查、写作和自检；CLI 只负责可确定性验证，不替用户做产品或技术决定。`schema_version: 2` 的成熟文档执行增强门禁，未声明该版本的历史 completed 文档按旧核心门禁兼容读取。

技能之间不共享流程文档；协作通过统一的 `docs/` 结构、稳定编号和 Handoff Rule 完成。
