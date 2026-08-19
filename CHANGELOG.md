# Changelog

## 0.3.1 - 2026-08-17

- **OpenCode npm 插件化**:新增根 `package.json`(type: module, main: plugin.js)与根 `plugin.js`,使仓库可直接作为 npm/git 依赖被 opencode 安装(`project-kit@git+...`);`.opencode/plugins/project-kit.js` 改为 re-export 根插件,消除重复逻辑;`.opencode/INSTALL.md` 更新安装说明。
- **命令同步**:插件启动时将 `commands/project-kit/*.md` 幂等同步到 `~/.config/opencode/commands/project-kit/`(opencode 不支持插件注册命令,命令只能落地到命令目录;`argument-hint` 为 Claude Code 专用字段,同步时剥离)。
- **Cursor Plugin 补全**:`.cursor-plugin/plugin.json` 增加 `hooks` 字段指向 `hooks/hooks-cursor.json`;新增 `hooks/hooks-cursor.json` 与 `hooks/run-hook.cmd`,使 Cursor 安装后自动注入会话引导。

## 0.4.0 - 2026-08-12

- **两档路径**:所有新需求由 `change` 技能统一入口,按风险分流——Quick(零文档,直接实现 + git + STATE 一行)或 Full(proposal/spec/plan 三件套)。
- **文档模型收敛**:删除 requirements 表、milestone/spec/plan/execution/verification/fix 独立文档;变更自包含于 `docs/changes/CR-###-<slug>/`;验证结果写回 plan 与 STATE,不再产出独立 execution/verification 文档。
- **状态机收敛**:proposal(change 目录状态)proposed→accepted→completed;spec draft→approved→verified(含 spec_hash 防篡改);plan draft→approved→completed。
- **技能调整**:删除 refine;roadmap 瘦身(一行一阶段,无独立 milestone 文档);bug 默认 Quick 修复;init 产出 4 根文档(constitution/blueprint/roadmap/STATE)+ 3 目录。
- **脚本**:删除 coverage 命令与 REQ 覆盖校验;validate 只校验 Full 三件套完整性;模板从 16 份收敛为 9 份。

## 0.2.0 - 2026-08-09

- 重构技能为自包含形式:每个 SKILL.md 内嵌完整流程(前置条件、步骤、校验清单、停止条件、交接),删除 shared/、workflows/、references/ 共享层。
- 技能名与目录名统一(plan / execute-plan / verify-plan 等),与 Claude Code 技能发现约定一致。
- validate-plugin 改为校验自包含结构:技能名匹配、无共享/旧路径引用、围绕 docs/ 约定、模板完整。
## 0.1.0 - 2026-08-08

- 从单一 `SKILL.md` 路由重构为 10 个薄壳 skills。
- 新增 `shared/` 中央事实层,统一承载 workflows、rules、templates 与 overview。
- `scripts/project-docs.cjs` 新增 `validate-plugin` 命令,用于插件结构与链接校验。
