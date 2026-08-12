---
date: 2026-08-12
description: 定义项目从初始讨论、蓝图拆解到变更与 AI 接力的两档文档工作流——Quick(零文档)与 Full(proposal/spec/plan 三件套)。
---

# 项目文档与 AI 协作生命周期(两档路径)

## 1. 文档目的

大型项目不是从一份边界清楚的需求开始,而是从讨论开始。本文定义统一的项目生命周期,把想法逐层转换为边界明确、可追踪、可实施、可验收的工作单元。

**核心思想:文档数量从 0 起步,风险越大文档越多。** 一个小改动(改字段、重命名)不需要任何文档;复杂改动才需要三件套。这是对"所有需求都走全链路"的修正——后者让文档成本远超实现成本。

## 2. 核心原则

### 2.1 两档路径

所有新需求由 `change` 技能统一入口,按风险分流:

| 路径 | 判据 | 文档 |
| --- | --- | --- |
| **Quick** | 不触碰既有契约文档(blueprint/spec)、API、数据模型、权限;改动小;边界清晰 | **零文档** |
| **Full** | 多模块 / 架构 / 数据模型变化 / 多迭代 / 跨边界 / 高风险 | proposal + spec + plan 三件套 |

判定是"是否触碰契约类边界",不是简单文件数。拿不准 → 问用户。

### 2.2 文档角色

| 文档 | 回答 | 何时冻结 |
| --- | --- | --- |
| proposal | 为什么做、边界、包含/不包含 | 开发前,短 |
| spec | 做什么、验收标准(契约) | 批准后冻结,不随实现改动 |
| plan | 怎么做、步骤 + 验证命令 | 执行中更新(勾选) |

**spec(契约)与 plan(步骤)是两种本质不同的文档,不可合并**:spec 在开发前批准并冻结,plan 在执行中勾选更新。

### 2.3 单一事实来源

同一个事实只能有一个权威位置:

| 事实 | 权威文档 |
| --- | --- |
| 为什么开发、需求决策 | Full:proposal;Quick:git + STATE 一行 |
| 功能契约、验收标准 | Full:spec |
| 如何实现、步骤 | Full:plan |
| 是否完成、证据 | plan 勾选 + STATE |
| 阶段规划、任务清单与完成情况 | roadmap |
| 当前焦点、下一动作(动态状态) | STATE |
| 当前焦点、下一动作、接力 | STATE.md |
| 系统边界 | blueprint |
| 原始意图 | brief(一次性) |
| 开发准则 | constitution |

上层文档只引用下层文档,不复制下层的详细内容。

### 2.4 已完成事实不可被重写

已验收的 Spec 记录的是当时被批准和交付的功能契约。后续新增能力通过新的 change 表达,不回头把旧 Spec 扩写。允许修正错别字和失效链接,但不得静默改变已验收功能的边界或验收标准。

### 2.5 按用户价值纵向切片

阶段和功能应形成可以演示、运行或验收的闭环,不按数据库、后端、前端、测试等技术层横向拆分。

### 2.6 AI 不替用户补产品决定

遇到会改变目标、范围、用户行为或数据边界的未决问题时,必须暂停并让用户决定。未经确认的假设应进入"未决问题",而不是被 AI 当成既定事实。

## 3. 项目文档层级

### 3.1 全局文档(完整初始化时)

```text
docs/
├── constitution.md      # 开发准则
├── blueprint.md         # 系统边界:能力地图/模块职责/数据流/明确不做
├── roadmap.md           # 阶段规划 + 任务清单(checkbox 完成情况)
├── STATE.md             # 当前焦点/下一动作/阻塞(接力入口)
├── briefs/              # BRIEF-### 原始讨论存档(一次性,不重写)
├── changes/             # CR-###-<slug>/{proposal,spec,plan}.md(Full 变更)
└── research/
```

已有项目(未初始化)直接用 Quick/Full,不需要全局文档;按需补充。

### 3.2 Quick 变更(零文档)

```
用户提需求
  → 澄清:改什么/为什么/影响哪些文件/怎么验证
  → 用户同轮确认
  → 直接实现 + 测试 + commit
  → STATE.md 记一行
```

记录 = git commit + STATE 一行。不创建任何文档文件。验证责任由 git 与 STATE 承担。

### 3.3 Full 变更(三件套)

```text
changes/CR-###-<slug>/
├── proposal.md   # 为什么 + 边界 + 影响
├── spec.md       # 契约 + 验收标准
└── plan.md       # 步骤 + 验证命令
```

#### proposal(需求)

最低内容:背景与问题 / 期望结果 / 包含 / 不包含 / 影响范围 / 决定 / 未决问题。

proposal 的状态即 change 目录的状态:

```text
proposed → accepted → completed
                 ↘ deferred | rejected
```

accepted 前必须填写「背景与问题/期望结果/决定」;completed 前 spec 必须 verified 且 plan 必须 completed。

#### spec(契约)

最低内容:问题与依据 / 目标 / 用户流程 / 范围(包含/不包含)/ 输入与输出 / 业务规则 / 失败与边界情况 / **验收标准** / 未决问题。

状态:`draft → approved → verified`。

- approved 时脚本记录 `spec_hash`;verified 时核对 hash,spec 被静默修改会报错。
- 验收标准必须可验证,禁止"工作正常""体验良好"。
- 需要继续拆分的信号:包含多个不同的用户结果、多个独立验收流程、同时改变多个无关业务域。

#### plan(步骤)

最低内容:实现策略 / Tasks / 验收标准映射 / 最终验证 / 非目标。

状态:`draft → approved → completed`。

- 每个任务 = 单一动作(2-5 分钟):files/read_first/action/verify/acceptance/done 六字段。
- 禁止 TBD、TODO、"适当处理"、"类似 Task N"。
- 每条 Spec 验收标准映射到至少一个任务和最终验证。
- completed 前全部任务必须勾选(无 `- [ ]` 残留)。
- plan 不得扩大 spec 范围。

#### 执行与验收(无独立文档)

- 执行:按 plan 步骤 TDD 实施,勾选任务,验证命令与输出写回 plan 的「最终验证」区。
- 验收:独立重跑 spec 每条验收标准(不引用执行阶段旧输出),结果写回 plan + STATE。
- **不产出 execution / verification 独立文档**——验证结果记录在 plan 勾选与 STATE,与最小上下文原则一致。

## 4. 变更处理

### 4.1 统一入口

蓝图形成后的所有新需求先进入 `change` 技能:Quick/Full 分流 → 处理。

不要直接修改 roadmap、当前 spec 或 plan。

### 4.2 需求分类

| 类型 | 判断 | 处理方式 |
| --- | --- | --- |
| Bug | 当前实现违反已批准 Spec | bug(默认 Quick 最小修复 + 回归验证) |
| 小型增强 | 新增一个边界独立的用户能力 | Quick;边界模糊 → Full |
| 大型能力 | 需要多个迭代才能形成最终能力 | Full(一个 change 或多个有依赖的 change) |
| 架构变化 | 改变跨模块约束或系统基本形态 | Full + blueprint 更新 |
| 补充澄清 | 不改变已批准功能语义 | 更新未 approved 的 spec;已 verified → 新 change |

### 4.3 不同开发状态下的处理

- **Spec 仍是 draft**:直接整合新增信息。
- **Spec 已 approved,尚未开发**:澄清可更新并重新批准;新增能力 → 新 change。
- **正在开发**:默认不插入当前 Plan。先创建新 change,并决定进入当前阶段、Next 或 Later。
- **已 verified**:不修改旧 Spec 语义。创建新 change,用 `depends_on` / `extends` / `supersedes` 表达关系。

### 4.4 多迭代能力

一项需求需要多个可独立发布阶段时,在 roadmap 列出每个阶段(阶段名 + 任务清单),每个任务由一个 change 承接。只细化当前阶段,远期保持粗粒度,避免过早细化制造大量失效文档。动态状态(当前做哪个阶段/任务)归 STATE.md。

## 5. 状态模型

```text
Change(proposal): proposed → accepted → completed
                      ↘ deferred | rejected
Spec:            draft → approved → verified
Plan:            draft → approved → completed
                          ↘ blocked
Brief:           captured
```

**roadmap 无状态机**——它是静态规划文档,任务完成情况用 checkbox 就地标记;进行中的状态(active/next)在 STATE.md。

| 状态 | 含义 |
| --- | --- |
| `proposed` | 变更已提出,范围未确认 |
| `accepted` | 范围和决定已由用户确认 |
| `approved` | spec/plan 的目标与内容已批准 |
| `verified` | 同一轮新鲜证据证明所有验收标准通过,spec 的完成状态 |
| `completed` | change/plan 的完成状态 |
| `blocked` | 存在明确阻塞条件 |
| `deferred` / `rejected` | 已决定暂缓 / 不接受并记录原因 |

状态变化必须有事实依据,不能因为"看起来差不多完成"而跳转。

## 6. AI 接力协议

### 6.1 AI 开始工作前

新 AI 会话不应读取所有历史文档,按顺序建立上下文:

1. 仓库 `AGENTS.md`:稳定开发约束。
2. `docs/STATE.md`:当前焦点、阻塞和下一动作。
3. `docs/roadmap.md`:阶段规划与任务清单(按需)。
4. 当前 change 目录:`changes/CR-###-<slug>/` 三件套(如进行中)。
5. 与当前任务直接相关的 blueprint 章节和代码。

AI 开始行动前必须复述:当前目标、包含范围、不包含范围、当前权威文档、依赖和阻塞项、下一动作。如果复述与文档矛盾,先澄清,不开始实施。

### 6.2 AI 工作中的防偏移规则

- 每项修改都能映射到当前 spec 或 plan(Quick 变更映射到用户确认的对话范围)。
- 不因为发现相邻问题就扩大范围。
- 不把远期 roadmap 项目提前塞进当前 change。
- 不把候选方案写成已决定事实。
- 不静默改变验收标准。
- 不修改已 verified spec 的语义。
- 发现代码事实与 plan 不同时立即报告。

### 6.3 AI 结束工作时

每次工作结束必须留下接力信息:

- 完成了什么。
- 没有完成什么。
- 修改了哪些关键文件。
- 运行了哪些验证,结果是什么。
- 是否偏离计划,为什么。
- 新发现了哪些问题。
- 下一步唯一动作是什么。

更新 `STATE.md`(frontmatter 的 `active_change` / `next_action` + 正文),让下一位 AI 从明确位置继续。

### 6.4 AI 上下文包

```text
必读:
- AGENTS.md
- STATE.md
- 当前 change 三件套(如进行中)

按需:
- blueprint 相关章节
- 直接相关代码和测试
- roadmap 任务清单

不默认读取:
- 已完成 change 的全部文档
- 所有历史 plan
- 与当前任务无关的模块文档
```

## 7. 防止文档和实现偏移

### 7.1 文档更新责任

| 事件 | 必须更新 |
| --- | --- |
| 初始想法确认 | Brief |
| 系统边界确认 | Blueprint |
| 阶段顺序确认 | Roadmap |
| 新需求进入 | change(Quick 零文档 / Full 三件套) |
| 功能边界确认 | spec |
| 实现方案确认 | plan |
| 实现、测试和验收完成 | plan 勾选、STATE |
| 跨模块技术决定 | Blueprint |
| Bug 修复 | git commit + STATE(根因复杂 → Full) |
| 工作暂停或交接 | STATE |

### 7.2 不重复维护细节

Roadmap 不复制 spec 验收标准,spec 不复制 plan 文件列表。文档之间通过稳定 ID(CR-###)和相对链接建立关系。

### 7.3 定期一致性检查

每个 change 完成或开始新 change 前检查:

- Roadmap 任务 checkbox 是否与 change 完成情况一致。
- 是否存在已完成 change 仍有阻断性未决问题。
- 是否存在失效 plan 仍标记为 approved。
- `STATE.md` 是否指向真实的当前工作。
- 相对链接是否有效。

## 8. 常用 AI 提示词

### 8.1 接收新需求

```text
这是针对现有系统的新需求。请先用 change 技能判定 Quick 还是 Full:
- Quick(不触碰契约/API/数据模型/权限,改动小):对话确认后直接实现,零文档。
- Full:创建 changes/CR-###-<slug>/,先写 proposal(背景与问题/期望结果/包含/不包含/影响范围/决定/未决问题),用户确认后再进入 spec。
不要直接修改已 verified 的 spec。
```

### 8.2 生成 Spec

```text
现在只处理 CR-### 的 spec。
根据 proposal 和蓝图生成 spec,包含:问题与依据/目标/用户流程/范围/输入与输出/业务规则/失败与边界情况/验收标准/未决问题。
验收标准必须可验证。不要生成代码步骤,不要扩大范围。
```

### 8.3 生成 Plan

```text
基于已批准 Spec 和当前代码事实生成 CR-### 的 plan。
每个任务必须说明:修改文件/读取符号/具体改动/验证命令/通过条件/完成条件。
如果代码事实与 Spec 冲突,或需要扩大范围,停止并报告,不要自行调整需求。
```

### 8.4 AI 接力

```text
请先阅读 AGENTS.md、STATE.md 和当前 change 三件套。
在采取行动前复述:当前目标/包含范围/不包含范围/依赖和阻塞/当前事实来源/下一步动作。
发现文档冲突、范围变化或需要用户决策时停止,不要猜测。
```

## 9. 检查清单

### 9.1 初始项目

- [ ] 原始讨论已保存为 Brief(如需)。
- [ ] Blueprint 已说明能力、模块和数据边界(如需)。
- [ ] Roadmap 按阶段 + 任务清单拆分(多迭代项目)。
- [ ] STATE 已初始化。

### 9.2 Quick 变更

- [ ] 不触碰契约文档/API/数据模型/权限。
- [ ] 用户同轮确认范围与验证方式。
- [ ] 测试真实运行,结果如实报告。
- [ ] STATE 记一行,git commit 完成。

### 9.3 Full 变更

- [ ] proposal 已 accepted(背景/期望/边界/决定齐全)。
- [ ] spec 已 approved,验收标准可验证,无阻断性未决问题。
- [ ] plan 已 approved,基于当前代码事实,无扩大范围。
- [ ] 每个关键步骤有测试和验收映射。
- [ ] plan 全部任务勾选,最终验证记录在 plan。
- [ ] 独立验收重跑全部验收标准,spec verified + change completed。
- [ ] STATE 已更新,roadmap 任务已勾选。

### 9.4 新需求进入时

- [ ] 已判定 Quick/Full(拿不准问用户)。
- [ ] 已判断 Bug、增强、大型能力或架构变化。
- [ ] 没有静默修改已 verified spec。
- [ ] 多迭代能力已拆成边界明确的多个阶段。

### 9.5 AI 交接时

- [ ] 当前目标和范围明确。
- [ ] 当前权威文档链接明确。
- [ ] 已完成与未完成内容分开。
- [ ] 验证命令和结果已记录。
- [ ] 阻塞项明确说明需要谁决定。
- [ ] 下一步只有一个清楚动作。

## 10. 最终工作流

```text
第一次建立项目:
Discussion → Brief → Blueprint → Roadmap → change(首个需求)

后续继续开发:
新需求 → change 判定
  ├── Quick → 对话确认 → 实现 + 测试 + commit → STATE 一行
  └── Full → proposal → 用户确认 → spec → plan → 执行勾选 → 独立验收 → STATE

AI 接力:
AGENTS.md → STATE.md → 当前 change 三件套 → 核对范围后继续
```

整套方法的核心:Quick 零文档,Full 三件套(proposal 保存需求决策、spec 冻结功能契约、plan 指导一次实施),Blueprint 保存系统边界,Roadmap 安排交付顺序,代码和 Git 保存实施事实,`STATE.md` 保存当前结果并负责 AI 接力。
