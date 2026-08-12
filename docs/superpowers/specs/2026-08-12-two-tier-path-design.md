---
date: 2026-08-12
status: approved
topic: two-tier-path
---

# project-kit 两档路径设计（Quick / Full）

## 1. 背景与问题

### 1.1 Token 消耗过大

当前完整链路为一个需求产出 6 类文档：change → milestone → REQ → spec → plan → execution → verification。以 lifecycle-sim 示例实测，一个小需求（CR-001 标签筛选）产出约 7.6KB 文档（CR 1.2KB + milestone 0.3KB + spec 1.3KB + plan 2.2KB + execution 1.3KB + verification 1.3KB），外加 STATE / roadmap 更新；单个 Feature 的开发闭环（spec + plan + execution + verification）约 9KB。对"改一个字段""文件重命名"级别的改动，文档成本远超实现成本。

### 1.2 文档职责重叠

- **roadmap 与 milestone**：roadmap.md 有 Active/Next/Later/Completed 分节，milestone 文档 frontmatter 也有 `status: planned/active/completed`，且两者都写阶段目标与依赖，同一事实两处维护。
- **change 与 spec**：CR 有"期望结果 / 接入方案与取舍 / 决定 / 新增 Requirements"，spec 有"问题与依据 / 目标 / 范围 / 业务规则 / 验收标准"，小需求场景下基本同一件事写两遍。
- **STATE 与 roadmap**：STATE.md 的 `active_milestone` + 当前焦点 + 下一动作，与 roadmap 的 Active/Next 分节重复。

### 1.3 需求 / spec / plan 三者的角色混淆

project-kit 把三者都做成独立文档并叠加 requirements 表，导致小需求也要全走一遍。三者的正确角色：

| 文档 | 回答 | 何时冻结 |
| --- | --- | --- |
| 需求（proposal） | 为什么做、边界、包含/不包含 | 开发前，短 |
| spec | 做什么、验收标准（契约） | 开发前冻结，不随实现改动 |
| plan | 怎么做、步骤 + 验证命令 | 执行中更新（勾选） |

## 2. 参考方案

### 2.1 superpowers

只有 2 种文档：spec（= design，回答"做什么"+验收标准，开发前冻结）与 plan（回答"怎么做"，bite-sized 步骤，执行时勾选）。没有 requirements 表、没有里程碑、没有 roadmap、没有独立 STATE、没有 execution/verification 文档。验证 = 跑命令，结果留在 plan 勾选与聊天记录中。对最小改动，spec 允许只有几句话。

### 2.2 spec-superflow

核心是**风险分级选路径**：

- Quick（≤3 文件、单模块、低风险）→ 不创建规划文档，同轮推荐/接受，只记录范围与验证策略，直接实现 + 验证。
- Tweak（≤4 文件纯配置/文档）→ 跳过规划与桥接，直接编辑。
- Full（复杂/多模块/架构）→ 4 工件：proposal（为什么+边界）→ specs（需求契约）→ design（技术决策）→ tasks（步骤批次）→ contract-builder 压缩为 execution-contract → 执行。
- 每次变更一个自包含目录 `changes/<change>/`，resume 只读该目录；内容级状态检测（比较 proposal 范围 vs 契约意图锁）路由到正确阶段。

### 2.3 结论

两个方案的共同点：**小功能变更的解法不是"合并文档"而是"跳过文档"**——小改动根本不产出规划文档，复杂改动才完整走。project-kit 应借鉴：按风险分流，文档数量从 0 起步，风险越大文档越多。

## 3. 核心设计：两档路径

| 路径 | 判据 | 文档 |
| --- | --- | --- |
| **Quick** | 不触碰既有契约文档（blueprint / spec）、API、数据模型、权限；改动小（字段增删、重命名、单模块内改动）；边界清晰 | **零文档** |
| **Full** | 多模块 / 架构 / 数据模型变化 / 多迭代 / 跨边界 / 高风险 | `changes/CR-###-<slug>/` 三份：proposal + spec + plan |

判定在 change 入口，判据是"是否触碰契约类边界"，不是简单文件数。拿不准 → 问用户。

## 4. Quick 流程（零文件产出）

```
用户提需求
  → 澄清：改什么 / 为什么 / 影响哪些文件 / 怎么验证
  → 用户同轮确认
  → 直接实现 + 测试 + commit
  → STATE.md 记一行（最近完成）
```

记录 = git commit + STATE 一行。不创建任何文档文件。验证责任由 git 与 STATE 承担。

## 5. Full 流程

```
changes/CR-###-<slug>/
├── proposal.md   # 为什么 + 边界 + 影响（短，需求澄清产物）
├── spec.md       # 契约 + 验收标准（做什么，批准后冻结）
└── plan.md       # 步骤 + 验证命令（怎么做，执行时勾选）

proposal → spec 批准 → plan 批准 → 执行（勾选 plan + 验证写回）
  → 独立验收（重跑 spec 验收标准，结果写回 plan + STATE）
```

### 5.1 proposal.md（需求）

最低内容：背景与问题 / 期望结果 / 包含 / 不包含 / 影响范围（模块、文档）/ 未决问题。

### 5.2 spec.md（契约）

最低内容：问题与依据 / 目标 / 用户流程 / 范围（包含/不包含）/ 输入与输出 / 业务规则 / 失败与边界情况 / 验收标准 / 未决问题。

### 5.3 plan.md（步骤）

bite-sized 任务，每步 = 修改文件 + 验证命令 + 预期结果；执行时勾选并记录命令输出；最后核对全部 spec 验收标准。plan 不得扩大 spec 范围。

## 6. 文档职责（单一事实来源）

| 事实 | 权威位置（唯一） |
| --- | --- |
| 为什么开发、需求决策 | Full：proposal.md；Quick：git + STATE 一行 |
| 功能契约、验收标准 | Full：spec.md；Quick：对话确认（无文档） |
| 如何实现、步骤 | Full：plan.md |
| 是否完成、证据 | plan 勾选 + STATE |
| 交付顺序、阶段状态 | roadmap 分组（仅完整初始化） |
| 当前焦点、下一动作、接力 | STATE.md |
| 系统边界 | blueprint（仅完整初始化） |
| 原始意图 | brief（仅完整初始化，一次性不重写） |
| 开发准则 | constitution（仅完整初始化） |

删除的文档：`requirements.md` 表、`milestones/` 独立文档、`specs/`、`plans/`、`executions/`、`verifications/` 独立目录、`fixes/` 独立目录、独立 execution/verification 文档（验证结果写入 plan 勾选 + STATE，与 superpowers 一致）。

## 7. 全局文档（仅完整初始化）

新项目完整初始化时产出 4 份全局文档：

```text
docs/
├── constitution.md   # 开发准则
├── briefs/BRIEF-###.md  # 原始讨论存档（一次性）
├── blueprint.md      # 系统边界：能力地图/模块职责/数据流/明确不做
└── roadmap.md        # 阶段分组（Active/Next/Later/Completed）+ 当前焦点 + 链接
```

roadmap 瘦身为"一行一阶段 + 当前焦点"，吸收 milestone 摘要与 STATE 焦点职责。里程碑不再有独立文档。已有项目（未初始化）直接用 Quick/Full，不需要全局文档；按需补充。

## 8. 技能变化

| 技能 | 变化 |
| --- | --- |
| `init` | 创建新目录结构（含 `changes/`） |
| `constitution` / `brief` / `blueprint` | 不变 |
| `roadmap` | 瘦身：一行一阶段 + 当前焦点 + 链接 |
| `change` | **入口技能**：Quick/Full 分流判定；Quick 走对话流程；Full 创建 change 目录 |
| `refine` | 删除（职责并入 change） |
| `plan` | Full 路径内：在 change 目录写 plan.md（bite-sized 步骤） |
| `execute-plan` | Full 路径内：勾选 plan.md 步骤，验证结果写回 |
| `verify-plan` | Full 路径内：独立重跑 spec.md 验收标准，结果写回 plan + STATE |
| `bug` | Quick（最小修复 + 回归验证）或 Full（根因复杂） |
| `status` | 读 STATE + roadmap |

## 9. 脚本与校验

- `project-docs.cjs` 校验脚本只校验 Full 变更的完整性（proposal/spec/plan 三件套、状态流转、链接有效性）。
- Quick 零文档不要求校验；其验证责任在 git commit 与 STATE。
- 状态模型收敛：Feature/Plan/Execution/Verification 的细粒度状态仅存在于 Full 变更内部（plan 勾选、验收结果），全局状态只保留 roadmap 分组与 STATE 焦点。

## 10. Token 预估

- **Quick**：现状 ≈ 7.6KB / 6 份文档 → **0 文档**，省 100%。
- **Full**：现状 6 份文档链 → 3 份（proposal/spec/plan 自包含目录），且每次会话只读 STATE + 当前 change 目录，省去 execution/verification 的重复书写与读取。

## 11. 迁移策略

- 现有旧结构项目不迁移历史文档，从下一个新需求开始用两档路径（与 project-lifecycle.md 既有原则一致）。
- project-kit 自身文档（README、project-lifecycle.md、scripts/project-docs.cjs、tests、模板 assets/templates/、示例 examples/）同步重构为两档路径。
- 保留 `validate-plugin` 对插件自身的校验。

## 12. 未决问题

- Quick 与 Full 的判定在对话中执行，是否需要脚本辅助（如基于 `git diff --stat` 的事后核对）——暂不做，观察实际使用后再定。
- Full 路径下 proposal 与 spec 是否允许合并为一份（当需求极简时）——按用户决策：保持三份，proposal 允许极短。
