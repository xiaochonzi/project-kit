# Project Kit

Project Kit 是一个面向团队内部复用的 Claude Code 多 skill 插件,用于把项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元。**所有需求按风险分流为 Quick(零文档)与 Full(三件套)两档,文档数量从 0 起步,风险越大文档越多。**

对于 Full Change，proposal/spec/plan 是完整且唯一的需求与实施上下文：没有原始对话的执行 AI 只读三件套，即可确定为什么改、最终业务行为、当前代码如何工作、具体修改位置、停止条件和验收方法。CLI 只创建无指导注释、无示例、无待填占位符的 `schema_version: 2` 最小骨架；技能负责从空正文生成并自检完整文档，历史 completed 文档保持兼容读取。

## 设计原则

- **两档路径**:小改动(Quick)不产生任何文档,直接实现 + git + 本地 state 一行;复杂改动(Full)原子创建 proposal/spec/plan 最小骨架
- **文档即交接**:三件套不得依赖原始对话；Proposal 冻结范围和 DEC，Spec 冻结唯一业务契约，Plan 提供可直接执行的技术绑定
- **从空正文生成**:持久化骨架不含指导注释、示例契约或示例 Task，技能根据真实需求构建文档
- **技能自包含**:每个技能写全可独立执行的流程(前置条件、步骤、校验清单、停止条件),触发即用,不依赖共享文档
- **单一事实来源**:同一事实只在职责对应文档定义一次，Plan 通过 DEC/BR/AC 引用，不复制 Spec
- **脚本承载机械门禁**:`scripts/project-docs.cjs` 负责确定性操作与校验,不替 AI 做语义判断

## 安装

插件由 `plugin.json`、`skills/`、`assets/templates/` 与 `scripts/project-docs.cjs` 组成。支持 Claude Code / Codex / Cursor / OpenCode / Pi,完整安装说明见 [INSTALL.md](INSTALL.md)。

### Pi

```bash
pi install git:github.com/xiaochonzi/project-kit
```

安装后自动加载 12 个 skills,并提供 `/project-kit:init`、`/project-kit:spec`、`/project-kit:status` 等命令。Pi extension 会从安装包目录调用 Project Kit CLI,不依赖当前项目存在 `scripts/project-docs.cjs`。

OpenCode 与 Pi 分别由 `.opencode/plugins/project-kit.js`、`.pi/extensions/project-kit.js` 适配。两端都支持 command 主动触发和 skill 自动触发;平台 adapter 只维护加载、bootstrap、命令路由与工具映射,共享内容仅为 `skills/`、`scripts/project-docs.cjs` 与 assets。

### Claude Code(推荐)

```bash
claude plugin install github:xiaochonzi/project-kit
```

安装后 `/project-kit:<command>` 即可用,技能按描述自动触发。或克隆后在项目 `.claude/settings.json` 中引用技能目录:

```json
{
  "skills": { "paths": ["~/project-kit/skills"] }
}
```

## 可用技能

| 技能 | 何时使用 |
|---|---|
| `init` | 初始化项目 `docs/` 目录结构 |
| `constitution` | 制定稳定开发准则 |
| `brief` | 接收并固化大型原始需求存档 |
| `blueprint` | 基于已确认需求建立系统架构 |
| `roadmap` | 拆分为可交付的阶段 |
| `change` | **新需求唯一入口**:Quick/Full 分流 |
| `spec` | 为已接受 Proposal 完成业务逻辑、边界与验收契约设计(Full) |
| `plan` | 为已批准 Spec 制定实现计划(Full) |
| `execute-plan` | 按计划实施并勾选记录(Full) |
| `verify-plan` | 用新鲜证据独立验收(Full) |
| `bug` | 诊断并最小修复缺陷(默认 Quick) |
| `status` | 只读查看项目状态与下一动作 |

## docs/ 目录约定

```text
<项目根>/docs/
├── constitution.md      # 稳定开发准则
├── blueprint.md         # 系统边界与能力地图
├── roadmap.md           # 阶段规划 + 任务表格(状态列)
├── briefs/              # BRIEF-###(原始讨论存档)
├── changes/             # CR-###-<slug>/{proposal,spec,plan,diagrams?}.md(Full 变更文档;diagrams 可选,涉及新数据模型时创建)
└── research/

<项目根>/.project-kit/    # 本地私有(gitignored,不提交)
└── state.md             # 当前本地人员的焦点与下一动作(个人接力入口)
```

**Quick 变更不落盘**——记录 = git commit + 本地 state 一行。只有 Full 变更在 `changes/` 下创建目录。团队共享进度看 `docs/changes/`,个人当前焦点看 `.project-kit/state.md`(每位成员各自维护,互不干扰)。

## 两档路径

| 路径 | 判据 | 文档 |
|---|---|---|
| **Quick** | 不触碰既有契约文档(blueprint/spec)、API、数据模型、权限;改动小;边界清晰 | **零文档** |
| **Full** | 多模块 / 架构 / 数据模型变化 / 多迭代 / 跨边界 / 高风险 | proposal + spec + plan 三件套 |

- **Quick 流程**:澄清 → 用户同轮确认 → 直接实现 + 测试 + commit → 本地 state 记一行
- **Full 流程**:`change` 原子创建最小三件套并从空正文完成 proposal → `spec` 构建唯一业务契约 → `plan` 绑定当前代码并生成可执行任务 → 执行勾选 → 独立验收 → 更新本地 state

### Full 三件套的职责

| 文档 | 必须完整回答 |
|---|---|
| `proposal.md` | 背景、EVD 证据快照、期望结果、包含/不包含、影响范围、DEC 冻结决定与未采用方向 |
| `spec.md` | 术语与对象、数据权威、适用契约块、BR/AC、失败边界和唯一可验收行为 |
| `plan.md` | 代码基线、调用链、文件与 Symbol、Implementation Binding、执行环境、任务、停止条件和验证 |

Plan 的每个 Task 必须包含 `files`、`file_actions`、`symbols`、`read_first`、`depends_on`、`interfaces`、`current_behavior`、`target_behavior`、`implementation`、`outputs`、`decisions`、`invariants`、`prerequisites`、`stop_if`、`verify`、`acceptance` 和 `done`。状态机、错误、并发幂等、数据事务、API/事件、配置、兼容迁移、权限安全、可观测性和参考实现必须逐项判断是否适用并说明原因。

## 常用命令

```bash
node scripts/project-docs.cjs help
node scripts/project-docs.cjs validate-plugin --root .
node scripts/project-docs.cjs init --root <project>
node scripts/project-docs.cjs new change --title <变更标题> --root <project>
node scripts/project-docs.cjs transition CR-001 --to accepted --root <project>
node scripts/project-docs.cjs validate --root <project>
node scripts/project-docs.cjs status --root <project>
node scripts/project-docs.cjs next --root <project>
```

## 工程生命周期示例

以"待办命令行工具"项目为例,展示 Quick 与 Full 两条路径。

### Quick 路径(小改动,零文档)

```text
"列表显示短 ID 就行了"
  → change 判定:Quick(不触碰契约/API/数据模型)
  → 澄清 + 用户确认
  → 直接修改 + 测试 + commit
  → 本地 state 记一行
```

### Full 路径(有验收标准的需求)

| 步骤 | 你要做什么 | 用什么 | 产出 |
|---|---|---|---|
| 1 | 新项目引入 Project Kit | `/project-kit/init` | `docs/` 骨架(3 根文档 + 3 目录)+ `.project-kit/state.md` |
| 2 | 制定开发准则 | `constitution` | `docs/constitution.md` |
| 3 | 把模糊想法固化为存档 | `brief` | `docs/briefs/BRIEF-001.md` |
| 4 | 设计系统架构 | `blueprint` | `docs/blueprint.md` |
| 5 | 拆成可交付阶段 | `roadmap` | `docs/roadmap.md` |
| 6 | 新需求入口与分流 | `change` | Quick:零文档 / Full:原子创建 `changes/CR-001-<slug>/` 最小三件套 |
| 7 | 从空正文生成 Proposal 并确认 | `change` | `proposal.md`(EVD 证据+边界+DEC 决定) |
| 8 | 从空正文生成唯一业务契约 | `/project-kit/spec CR-001` | `spec.md`(数据权威+BR/AC) |
| 9 | 绑定代码并生成执行计划 | `/project-kit/plan CR-001` | `plan.md`(代码基线+Implementation Binding+Tasks) |
| 10 | 按计划实施 | `execute-plan` | 代码 + 测试 + plan 勾选 |
| 11 | 独立验收 | `verify-plan` | 重跑验收标准,写回 plan + 本地 state |
| 随时 | 查看状态 | `/project-kit/status` | — |

### 迭代与缺陷

```text
每个 Full 变更走 6 → 11;Quick 变更随时发生。
"导入网页时引用链接丢了" → bug:默认 Quick 最小修复 + 回归验证;
  根因复杂 → 转 change 走 Full。
```

开始新的实施会话时,先运行 `/project-kit/status`，再读 `.project-kit/state.md` 与当前 Full 三件套，即可从明确的下一动作继续，不需要翻聊天记录。

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

- `examples/minimal-project` — 最小初始化结果(4 根文档,validate 基线)
- `examples/lifecycle-project` — Full 三件套示例(一个完整 change:proposal accepted + spec verified + plan completed)
