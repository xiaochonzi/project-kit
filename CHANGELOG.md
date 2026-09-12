# Changelog

## Unreleased

- **Spec 技能架构师与自包含契约强化**：注入资深系统架构师视角，澄清“不规定内部实现”不等于放弃技术严密性，强制将对外/核心数据模型 Schema、枚举、状态机转移矩阵锁死至机器可解析级别；确立“自包含契约铁律”，严禁将目标模型定义“甩锅”给外部或前序 CR，必须就地提供 Normative Schema；确立复杂流转可视化规范，凡涉及图装配、指针回填与多分支合流，强制提供 ASCII 拓扑图或决策矩阵表。
- **Plan 技能工序流水线与任务原子性强化**：注入交付总工/施工队长视角，强制梳理自底向上流水线工序分期（基础类型/DTO → 核心纯逻辑与状态机 → 复杂拓扑与指针回填 → 服务集成与调用链 → 最终验收与清理），彻底解决“第一步干嘛、第二步干嘛”的时序问题；确立“任务原子性铁律”，单个 Task 核心修改的生产文件原则上控制在 1~3 个，严禁大包揽巨型任务；`implementation` 强制编写代码级操作步骤指令（1. 2. 3.），严厉禁止“实现装配”“完成逻辑”等空洞偷懒动词。
- **三件套改为最小骨架生成**：`new change` 仍分配稳定 ID 并原子创建 proposal/spec/plan，但三个持久化文件只含 frontmatter（含 `schema_version: 2`）、标题和初始状态；移除 HTML 指导注释、示例契约、示例 Task 与尖括号占位符。draft/proposed 缺少正文结构只产生提醒，accepted/approved/completed 继续执行严格门禁。
- **change/spec/plan 从头重写**：技能不依赖模板填空；Proposal 从空正文生成 EVD 证据和 DEC 冻结决定，Spec 按需求生成核心与条件契约块并保证单一事实来源，Plan 记录代码基线、执行环境和 Implementation Binding，面向没有原始对话上下文的执行 AI。
- **Plan 执行契约扩展**：Task 从十二字段扩展为十七字段，新增 `file_actions`、`outputs`、`decisions`、`prerequisites`、`stop_if`；`execute-plan` 与 `verify-plan` 同步核对代码基线、产物、决定绑定和实际 diff。
- **历史文档兼容**：`schema_version: 2` 的成熟文档与新 accepted/approved 迁移强制执行增强章节和十七字段门禁；`validate` 对未声明该版本、缺少新增章节的历史 completed 三件套只给 warning，并继续按旧核心章节与十二字段 Task 校验，避免要求回写已冻结历史契约。
- **三件套写入规范强化**：Proposal 明确证据可定位、细节度上限；Spec 增加“对外契约 vs 内部实现”判定表、数据权威表、响应变体覆盖与规范关键词（必须/不得/应该）；Plan 铁律新增单一事实来源，`read_first` 改为“摘要依赖结论”而非“去读 X 结果”，自审新增未落盘引用、机器绝对路径、不存在脚本、复制 Spec 正文四项。
- **脚本新增确定性门禁**：`validate` 拒绝契约编号字母后缀变体（如 AC-09a）；Plan 含机器绝对路径时告警；proposal/spec/plan 批准动作同步拒绝缺失 EVD/DEC、遗漏 Implementation Binding、字母后缀编号与机器绝对路径。

## 0.3.4 - 2026-08-27

- **Full 三件套完备性**：Proposal 增加已确认选择与未采用方向，Spec 增加术语与业务对象，Plan 固化代码入口、调用链、Symbol、Current/Target、全局不变量、十类条件技术设计和十二字段 Task。新的 accepted/approved 动作执行对应机械门禁，历史 completed Plan 仍可读取。
- **实施与验收对齐**：`execute-plan` 开始实施前核对 Plan 的路径、Symbol、调用链、Current Behavior 和 interfaces；`verify-plan` 复核 Target Behavior、不变量、条件技术设计和契约映射。五个显式 command 统一为加载同名技能的薄路由。
- **移除 Spec Hash 门禁**：新 Spec 不再生成 `spec_hash`；Spec approved、Plan approved、Spec verified 和项目校验不再依赖内容摘要，继续由状态、REQ/BR/AC 映射与独立验收约束 Full 流程。历史字段保留但不参与判断。

## 0.3.3 - 2026-08-26

- **Change / Spec / Plan 职责拆分**：Full 分流时由 `new change` 一次创建 proposal/spec/plan；`change` 只完成 Proposal，新增独立 `spec` 技能负责业务行为、边界、失败和 REQ/BR/AC 契约设计，`plan` 只负责技术设计与任务拆解。
- **三件套契约门禁**：Spec/Plan 批准前拒绝模板占位符与 TODO/TBD；Spec 要求无未决问题并包含 REQ/BR/AC，Plan 必须覆盖全部契约编号。OpenCode、Pi 和 Claude command 同步增加 `spec` 入口，插件共 12 个技能。

## 0.6.0 - 2026-08-21

- **change 技能新增 diagrams 数据关系文档（可选）**：Full 变更新增可选的 `docs/changes/CR-###-<slug>/diagrams.md`，当需求涉及新数据模型设计时创建，沉淀数据模型清单、模型间关系（ER）、设计依据与前后端操作时机。生成顺序：proposal → spec → diagrams → plan。新增 `node scripts/project-docs.cjs new diagrams --change CR-###` 命令（复用 change 文档创建机制）；validate 不强制要求（非必填），diagrams 无独立状态机。

## 0.5.0 - 2026-08-21

- **状态本地化(架构变更)**:删除全局 `docs/STATE.md`,新增 gitignored 的本地私有目录 `.project-kit/state.md`,每位成员各自维护个人焦点(active_change)、个人下一步(next_action)与最近一条完成记录(last_completed)。团队共享部分(blueprint / roadmap / changes)不变,需求仍是团队性产物。`status` / `next` 语义从"团队在做什么"变为"我在做什么"。init 时自动创建 `.project-kit/state.md` 并在仓库根 `.gitignore` 追加 `.project-kit/`。

## 0.3.2 - 2026-08-21

- **Change 路由修正**:区分“使用 change 作为入口”和 Quick/Full 路径意图;Quick 必须全部条件满足,Full 任一高风险信号命中即成立,避免多模块需求被误判为 Quick。
- **验收规范增强**: `plan` 在写计划前建立 Constitution 规范映射,`execute-plan` 在写代码前执行规范预检,`verify-plan` 独立核对代码是否符合 Constitution 并将规范检查纳入完成门禁。
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
