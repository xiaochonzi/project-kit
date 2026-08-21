# Changelog

## 0.6.0 - 2026-08-21

- **change 技能新增 diagrams 数据关系文档（可选）**：Full 变更新增可选的 `docs/changes/CR-###-<slug>/diagrams.md`，当需求涉及新数据模型设计时创建，沉淀数据模型清单、模型间关系（ER）、设计依据与前后端操作时机。生成顺序：proposal → spec → diagrams → plan。新增 `node scripts/project-docs.cjs new diagrams --change CR-###` 命令（复用 change 文档创建机制）；validate 不强制要求（非必填），diagrams 无独立状态机。

## 0.5.0 - 2026-08-21

- **状态本地化(架构变更)**:删除全局 `docs/STATE.md`,新增 gitignored 的本地私有目录 `.project-kit/state.md`,每位成员各自维护个人焦点(active_change)、个人下一步(next_action)与最近一条完成记录(last_completed)。团队共享部分(blueprint / roadmap / changes)不变,需求仍是团队性产物。`status` / `next` 语义从"团队在做什么"变为"我在做什么"。init 时自动创建 `.project-kit/state.md` 并在仓库根 `.gitignore` 追加 `.project-kit/`。

## 0.3.2 - 2026-08-21

- **平台 adapter 隔离**:OpenCode 实现归位 `.opencode/plugins/project-kit.js`,Pi 实现归位 `.pi/extensions/project-kit.js`;删除根 `plugin.js` 与旧 `pi/` 入口。两个平台分别维护 bootstrap、tool mapping 和薄 command 路由,仅共享 skills、确定性 CLI 与 assets。
- **Pi 完整支持**:新增 Pi Package manifest;通过 `pi install git:github.com/xiaochonzi/project-kit` 自动加载 11 个 skills、7 个 `/project-kit:*` 命令及会话引导,并从安装包目录安全调用 Project Kit CLI。
- **元数据校正**:各平台 manifest 与 package 描述统一为当前 11 个技能,移除已删除的 `refine`。

## 0.3.1 - 2026-08-21

- **OpenCode CLI 路径修复**:同步 slash command 时将 `scripts/project-docs.cjs` 替换为插件安装目录中的绝对路径;Project Kit bootstrap 使用独有标识去重,避免与 Superpowers 的 `EXTREMELY_IMPORTANT` 提示冲突。
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
