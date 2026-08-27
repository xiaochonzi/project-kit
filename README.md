# Project Kit

Project Kit 是一个面向团队内部复用的 Claude Code 多 skill 插件,用于把项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元。**所有需求按风险分流为 Quick(零文档)与 Full(三件套)两档,文档数量从 0 起步,风险越大文档越多。**

对于 Full Change，proposal/spec/plan 是完整且唯一的需求与实施上下文：只读这三份文档即可确定为什么改、最终业务行为、当前代码如何工作、具体修改位置、实施约束和验收方法，不需要原始对话补充。

## 设计原则

- **两档路径**:小改动(Quick)不产生任何文档,直接实现 + git + 本地 state 一行;复杂改动(Full)原子创建 proposal/spec/plan 三件套
- **技能自包含**:每个技能写全可独立执行的流程(前置条件、步骤、校验清单、停止条件),触发即用,不依赖共享文档
- **围绕 docs 约定**:所有技能围绕统一的项目文档结构工作(`init` 技能创建,脚本校验)
- **渐进式**:每个技能只负责生命周期中的一环,通过 Handoff Rule 交接下一技能
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
- **Full 流程**:`change` 原子创建三件套并确认 proposal → `spec` 设计业务契约与验收标准 → `plan` 设计技术实现并拆解任务 → 执行勾选 → 独立验收 → 更新本地 state

### Full 三件套的职责

| 文档 | 必须完整回答 |
|---|---|
| `proposal.md` | 背景与证据、期望结果、包含/不包含、影响范围、已确认选择、未采用方向与原因 |
| `spec.md` | 术语与业务对象、Current/Target、用户流程、输入输出、REQ/BR/AC、失败边界和禁止事项 |
| `plan.md` | 系统入口与调用链、关键文件与 Symbol、Current/Target Behavior、接口、不变量、条件技术设计、实施任务和验证 |

Plan 的每个 Task 必须包含 `files`、`symbols`、`read_first`、`depends_on`、`interfaces`、`current_behavior`、`target_behavior`、`implementation`、`invariants`、`verify`、`acceptance` 和 `done`。状态机、错误、并发幂等、数据事务、API/事件、配置、兼容迁移、权限安全、可观测性和参考实现必须逐项判断是否适用并说明原因。

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
| 6 | 新需求入口与分流 | `change` | Quick:零文档 / Full:原子创建 `changes/CR-001-<slug>/` 三件套 |
| 7 | 填写 proposal 并确认 | `change` | `proposal.md`(为什么+边界) |
| 8 | 设计业务契约与验收标准 | `/project-kit/spec CR-001` | `spec.md`(做什么、规则与边界) |
| 9 | 制定实现计划 | `/project-kit/plan CR-001` | `plan.md`(怎么做,逐步验证) |
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
