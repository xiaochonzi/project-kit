# Project Kit

Project Kit 是一个面向团队内部复用的 Claude Code 多 skill 插件,用于把项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元。**所有需求按风险分流为 Quick(零文档)与 Full(三件套)两档,文档数量从 0 起步,风险越大文档越多。**

## 设计原则

- **两档路径**:小改动(Quick)不产生任何文档,直接实现 + git + STATE 一行;复杂改动(Full)才创建 proposal/spec/plan 三件套
- **技能自包含**:每个技能写全可独立执行的流程(前置条件、步骤、校验清单、停止条件),触发即用,不依赖共享文档
- **围绕 docs 约定**:所有技能围绕统一的项目文档结构工作(`init` 技能创建,脚本校验)
- **渐进式**:每个技能只负责生命周期中的一环,通过 Handoff Rule 交接下一技能
- **脚本承载机械门禁**:`scripts/project-docs.cjs` 负责确定性操作与校验,不替 AI 做语义判断

## 安装

团队内部使用 Claude Code plugin 方式安装本仓库。插件由 `plugin.json`、`skills/`、`assets/templates/` 与 `scripts/project-docs.cjs` 组成。

## 可用技能

| 技能 | 何时使用 |
|---|---|
| `init` | 初始化项目 `docs/` 目录结构 |
| `constitution` | 制定稳定开发准则 |
| `brief` | 接收并固化大型原始需求存档 |
| `blueprint` | 基于已确认需求建立系统架构 |
| `roadmap` | 拆分为可交付的阶段 |
| `change` | **新需求唯一入口**:Quick/Full 分流 |
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
├── roadmap.md           # 交付顺序(一行一阶段 + 链接)
├── STATE.md             # 当前焦点与下一动作(AI 接力入口)
├── briefs/              # BRIEF-###(原始讨论存档)
├── changes/             # CR-###-<slug>/{proposal,spec,plan}.md(Full 变更三件套)
└── research/
```

**Quick 变更不落盘**——记录 = git commit + STATE 一行。只有 Full 变更在 `changes/` 下创建目录。

## 两档路径

| 路径 | 判据 | 文档 |
|---|---|---|
| **Quick** | 不触碰既有契约文档(blueprint/spec)、API、数据模型、权限;改动小;边界清晰 | **零文档** |
| **Full** | 多模块 / 架构 / 数据模型变化 / 多迭代 / 跨边界 / 高风险 | proposal + spec + plan 三件套 |

- **Quick 流程**:澄清 → 用户同轮确认 → 直接实现 + 测试 + commit → STATE 记一行
- **Full 流程**:proposal(为什么+边界)→ 用户确认 → spec(契约+验收标准)→ plan(步骤)→ 执行勾选 → 独立验收 → 更新 STATE

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
  → STATE.md 记一行
```

### Full 路径(有验收标准的需求)

| 步骤 | 你要做什么 | 用什么 | 产出 |
|---|---|---|---|
| 1 | 新项目引入 Project Kit | `/project-kit/init` | `docs/` 骨架(4 根文档 + 3 目录) |
| 2 | 制定开发准则 | `constitution` | `docs/constitution.md` |
| 3 | 把模糊想法固化为存档 | `brief` | `docs/briefs/BRIEF-001.md` |
| 4 | 设计系统架构 | `blueprint` | `docs/blueprint.md` |
| 5 | 拆成可交付阶段 | `roadmap` | `docs/roadmap.md` |
| 6 | 新需求入口与分流 | `change` | Quick:零文档 / Full:`changes/CR-001-<slug>/` |
| 7 | 填写 proposal 并确认 | `change` | `proposal.md`(为什么+边界) |
| 8 | 填写契约与验收标准 | `change` | `spec.md`(做什么) |
| 9 | 制定实现计划 | `/project-kit/plan CR-001` | `plan.md`(怎么做,逐步验证) |
| 10 | 按计划实施 | `execute-plan` | 代码 + 测试 + plan 勾选 |
| 11 | 独立验收 | `verify-plan` | 重跑验收标准,写回 plan + STATE |
| 随时 | 查看状态 / 校验 | `/project-kit/status`、`/project-kit/validate` | — |

### 迭代与缺陷

```text
每个 Full 变更走 6 → 11;Quick 变更随时发生。
"导入网页时引用链接丢了" → bug:默认 Quick 最小修复 + 回归验证;
  根因复杂 → 转 change 走 Full。
```

新 AI 会话或换人接手时,先运行 `/project-kit/status` 再读 `docs/STATE.md`,即可从明确的下一动作继续,不需要翻聊天记录。

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
