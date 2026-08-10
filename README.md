# Project Kit

Project Kit 是一个面向团队内部复用的 Claude Code 多 skill 插件,用于把大型项目意图逐层转化为边界明确、可追踪、可实施、可验证的工作单元。

## 设计原则

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
| `brief` | 接收并拆解大型原始需求 |
| `blueprint` | 基于已确认需求建立系统架构 |
| `roadmap` | 拆分为可交付的 Milestones |
| `refine` | 细化 Milestone / Feature Spec |
| `plan` | 为已批准 Feature 制定实现计划 |
| `execute-plan` | 按计划实施并记录执行事实 |
| `verify-plan` | 用新鲜证据独立验收 |
| `change` | 接收后续新增需求 |
| `bug` | 诊断并修复违反已批准 Spec 的缺陷 |
| `status` | 只读查看项目状态与下一动作 |

## docs/ 目录约定

```text
<项目根>/docs/
├── constitution.md      # 稳定开发准则
├── requirements.md      # 原子需求(REQ-###)
├── blueprint.md         # 系统边界与能力地图
├── roadmap.md           # 交付顺序
├── STATE.md             # 当前焦点与下一动作
├── briefs/              # BRIEF-###
├── capabilities/        # C-###
├── milestones/          # M# + M#-CONTEXT.md
├── specs/<M#>/          # F-M#-##
├── plans/               # F-M#-##-plan.md
├── executions/          # F-M#-##-execution.md
├── verifications/       # F-M#-##-verification.md
├── changes/             # CR-###
├── fixes/               # BUG-###
├── decisions/           # ADR-###
└── research/
```

## 常用命令

```bash
node scripts/project-docs.cjs help
node scripts/project-docs.cjs validate-plugin --root .
node scripts/project-docs.cjs init --root <project>
node scripts/project-docs.cjs validate --root <project>
node scripts/project-docs.cjs coverage --root <project>
node scripts/project-docs.cjs next --root <project>
```

## 工程生命周期示例

以"团队知识库"项目为例：用户粘贴公众号/网页链接，系统自动整理成带引用来源的 Wiki 页面。下面走一遍完整生命周期——每个阶段说明做什么、用哪个技能、得到什么。

### 全流程一览

| 步骤 | 你要做什么 | 用什么 | 产出 |
|---|---|---|---|
| 1 | 新项目引入 Project Kit | `/project-kit/init` | `docs/` 标准目录骨架 |
| 2 | 制定开发准则 | `constitution` | `docs/constitution.md` |
| 3 | 把模糊想法拆成需求 | `brief` | `docs/briefs/BRIEF-001.md`、`docs/requirements.md` |
| 4 | 设计系统架构 | `blueprint` | `docs/blueprint.md` |
| 5 | 拆成可交付里程碑 | `roadmap` | `docs/roadmap.md`、`docs/milestones/M1.md` |
| 6 | 细化当前里程碑 | `refine` | `docs/specs/M1/F-M1-01.md` |
| 7 | 为 Feature 制定实现计划 | `/project-kit/plan F-M1-01` | `docs/plans/F-M1-01-plan.md` |
| 8 | 按计划写代码 | `execute-plan` | 代码、测试、`docs/executions/F-M1-01-execution.md` |
| 9 | 独立验收 | `verify-plan` | `docs/verifications/F-M1-01-verification.md` |
| 10 | 新增需求 | `change` | `docs/changes/CR-001.md` → 回到步骤 6 |
| 11 | 修缺陷 | `bug` | `docs/fixes/BUG-001.md` |
| 随时 | 查看状态 / 校验一致性 | `/project-kit/status`、`/project-kit/validate` | — |

### 1. 初始化

把 Project Kit 引入新项目：

```text
/project-kit/init ~/workspace/knowledge-base
```

`init` 创建 `docs/` 标准目录结构（briefs/、specs/、plans/ 等），这是后续所有技能共同遵守的约定。

### 2. 制定开发准则

```text
给项目制定开发准则：每个改动必须有测试，文档与代码同步更新。
```

`constitution` 产出 `docs/constitution.md`，把测试门禁、文档纪律等稳定规则固化下来，后续每个技能都会遵守。

### 3. 需求梳理

```text
我想做一个团队知识库：用户粘贴链接，系统自动生成带引用的 Wiki 页面。
```

`brief` 把模糊想法整理成 `docs/briefs/BRIEF-001.md`（原始想法存档，不再改写），再拆成带 ID 的原子需求写入 `docs/requirements.md`（REQ-001、REQ-002 …），并和你逐条确认优先级。

### 4. 系统架构

```text
基于已确认的需求设计系统架构。
```

`blueprint` 产出 `docs/blueprint.md`：能力地图、模块职责、核心数据流、跨模块约束，以及明确不做的内容。不进入文件级实现细节。

### 5. 交付路线

```text
把系统拆成可交付的里程碑。
```

`roadmap` 按用户价值纵向切片：

```text
M1：用户导入并归档一篇来源（可演示、可验收）
M2：系统把来源编译为带引用的 Wiki 页面
```

### 6. 细化当前里程碑

```text
细化 M1，拆出 Feature 并写 Spec。
```

`refine` 生成 `docs/milestones/M1.md` 和 Feature Map，并为每个 Feature 写 Spec：

```text
F-M1-01 导入并规范化来源内容
F-M1-02 提取知识单元（依赖 F-M1-01）
```

Spec 定义"必须实现什么"和验收标准，是后续开发和验收共同使用的契约。

### 7. 实现计划

```text
/project-kit/plan F-M1-01
```

`plan` 基于已批准的 Spec 产出 `docs/plans/F-M1-01-plan.md`：按依赖排序的实施步骤、每步涉及的文件、对应的测试和验收标准。

### 8. 执行计划

```text
按计划实现 F-M1-01。
```

`execute-plan` 按计划逐步实现，每完成一组相关步骤就运行对应验证，并把执行事实写入 `docs/executions/F-M1-01-execution.md`，同步更新 `docs/STATE.md`。遇到需要扩大范围或要你决定的事项会停下来问。

### 9. 独立验收

```text
对 F-M1-01 做独立验收。
```

`verify-plan` 不信任执行者的自述，用新鲜证据逐条核对 Spec 验收标准，产出 `docs/verifications/F-M1-01-verification.md`。验收通过后 Feature 才标记为 verified。

### 10. 迭代

每个 Feature 走一遍 7 → 8 → 9；当前里程碑的 Feature 全部完成，回到步骤 6 细化下一个里程碑。每次工作结束，`STATE.md` 都记录已完成内容、验证结果和下一动作。

### 11. 新增需求

```text
用户想把 Wiki 页导出成 PDF，这是一个新需求。
```

`change` 先创建 `docs/changes/CR-001.md`（为什么变、影响什么），评审决定接受后映射为新 Feature，重新走 6 → 9。不回头改写已验收的旧 Spec。

### 12. 缺陷修复

```text
导入网页时引用链接丢了，帮我查一下。
```

`bug` 判断这属于违反已批准 Spec 的缺陷，记录 `docs/fixes/BUG-001.md`，做最小修复并回归验证。如果行为本就不在 Spec 里，则它是新需求，走 `change`。

### 随时：状态查看与交接

```text
/project-kit/status
/project-kit/validate
```

- `status` 报告当前里程碑、Feature 进度、阻塞项和下一动作。
- `validate` 检查文档结构、状态、引用和需求覆盖是否一致。

新 AI 会话或换人接手时，先运行 `/project-kit/status` 再读 `docs/STATE.md`，即可从明确的下一动作继续，不需要翻聊天记录。

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

- `examples/minimal-project` — 最小初始化结果
- `examples/lifecycle-project` — 生命周期文档校验基线
