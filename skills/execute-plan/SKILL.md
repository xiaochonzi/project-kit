---
name: execute-plan
description: Use when a Full change's Plan is approved and needs execution — implementing task-by-task with TDD discipline, checking off plan.md tasks and recording verification results back into the plan. If no approved Plan exists, use plan first. If the change is already implemented, use verify-plan.
---

# Execute Plan

## Overview

严格按已批准三件套实施变更，按任务逐项进行 TDD 落地，并在 `plan.md` 中勾选任务并写回验证事实证据。

执行者把落盘的 `proposal.md` / `spec.md` / `plan.md` 视为**唯一需求与实施上下文**。严禁依赖原始对话口头补充决定，严禁在执行阶段擅自重新设计业务，严禁绕过任务清单直接写代码。

- **“代码写完”不等于“任务完成”**：每个 Task 必须真实产生 `outputs`，并通过可验证的命令输出证实满足 `acceptance`。
- **不产出独立执行文档**：执行记录直接写回 `plan.md` 的勾选框与「最终验证」区，结论同步更新至本地 `.project-kit/state.md`。

## The Iron Law

```
NO IMPLEMENTATION WITHOUT AN APPROVED AND VALID PLAN
```

**没有经过 CLI 批准（status 严格为 `approved`）且格式完备的 Plan，严禁触碰或修改任何项目代码文件。执行中遇到 Plan 假设与代码现实冲突，必须停止并返回 `plan` 修订，严禁边执行边现场篡改契约。**

**开始前宣布：**“我正在使用 execute-plan 技能执行此计划。”

## Required Inputs（不满足即停止执行）

- [ ] `docs/changes/CR-###-<slug>/proposal.md` 存在且 `status: accepted`
- [ ] `docs/changes/CR-###-<slug>/spec.md` 存在且 `status: approved`
- [ ] `docs/changes/CR-###-<slug>/plan.md` 存在且 `status: approved`（若为 `draft`、`ready` 等非法或未批准状态，必须先通过 `plan` 技能完成审批）
- [ ] 已完整读取 `docs/constitution.md`（或项目等效编码规则 `AGENTS.md`），以及 Plan 中的「Constitution 规范映射清单」；若存在 `diagrams.md`，一并读取
- [ ] 已核对 Plan 的「代码基线」「执行环境」「Implementation Binding」
- [ ] 每个 Task 完整具备 17 个关键字段（特别是 `file_actions`、`outputs`、`decisions`、`prerequisites`、`stop_if`）
- [ ] 当前环境满足 Plan 声明的「执行环境」，缺失项按 Plan 指定动作处理

## TDD Iron Law（每任务强制执行）

```
RED   → 编写/运行失败测试，确认因目标行为未实现而真实 FAIL
GREEN → 编写仅满足该测试的最小实现代码，运行确认 PASS
CHECK → 对照 acceptance 与 outputs，确认可观察结果与产物完备
```

**严禁**：在测试前直接写实现；跳过 RED 阶段；测试失败时注释测试；将测试失败当作“后续再修的已知问题”强行推进。

## Process

### Step 1：前置门禁与上下文核对

运行上下文检查命令：

```bash
node scripts/project-docs.cjs context execute-plan --target <CR-###> --root <项目根>
```

确认上下文文件完整，且 Plan 状态严格为 `approved`。若 Plan 处于 `ready` 或缺少必备章节，立刻停止并交回 `plan` 技能补齐。

### Step 1.1：代码规范预检（写代码前）

在读取目标实现文件和执行第一个 Task 前：
1. 完整读取 `docs/constitution.md`；不存在时读取 Plan 指定的项目等效编码规则（如 `AGENTS.md`）；
2. 读取 Plan 的「Constitution 规范映射清单」表；
3. 为本次变更列出适用规则、影响文件和验证命令；
4. 确认每条规则已映射到 Task 和最终验证。

缺少 Constitution、规范映射表或验证命令时立即停止，回 `plan` 补齐；**严禁直接写测试或实现**。

### Step 2：批判性核对 Plan 与代码基线（改代码前最后一道防线）

1. **基线核对**：当前 Git commit、分支和未提交改动是否与 Plan 的「代码基线」一致；
2. **文件真实性**：Plan 声明为 `modify`/`delete`/`verify` 的文件在磁盘上真实存在；声明为 `create` 的路径尚未被占用；
3. **Symbol 对齐**：`symbols` 与 `read_first` 引用的类名、方法名真实存在且签名与描述一致；
4. **调用链一致**：Plan 描述的系统入口与技术调用链与当前代码一致；
5. **绑定一致**：每个 DEC / BR / AC 在 Implementation Binding 与任务中有明确对应。

任一条件不满足或触发 `stop_if`，**立即停止**，向用户报告偏差并返回 `plan` 修订，严禁擅自猜测推演。

### Step 3：逐任务 TDD 循环实施

对 Plan 中的每个 Task N 按顺序独立执行：
1. **核对前置与阻断**：核验 `prerequisites` 已满足，未触发 `stop_if`；
2. **阅读只读材料**：阅读 `read_first` 指定文件与 Symbol，理清当前与目标行为差异；
3. **文件操作隔离**：严格仅在 `file_actions` 声明的 `files` 范围内创建、修改或删除文件，**严禁修改声明范围外的任何文件**；
4. **RED**：编写目标行为的自动化测试，运行并确认真实 FAIL；
5. **GREEN**：编写最小满足测试的业务实现，运行确认测试 PASS；
6. **CHECK**：核实声明的 `outputs` 真实生成，`acceptance` 中的规则完全兑现；
7. **事实写回**：在 `plan.md` 中将该任务勾选为 `- [x] Task N`，将执行命令、输出关键摘要追加至「最终验证」区；
8. **小步提交**：按项目规范进行 Git commit，说明该 Task 交付的成果。

### Step 4：验证失败处理与阻断边界

- 测试或验证失败时，首先排查是当前 Task 引入还是既有逻辑被破坏；
- 严禁删除测试、注释断言或弱化验收要求；
- **连续 3 次尝试仍无法 PASS**：说明 Plan 的底层技术假设可能存在错误，必须停止修改，回退本 Task 改动并返回 `plan` 修订。

### Step 5：整体验证与无越界检查

全部 Task 完成后，运行整体验证：

```bash
node scripts/project-docs.cjs validate --root <项目根>
git diff --stat
```

核对清单：
- `git diff --stat` 实际改动文件与 Plan 声明的 `files` 完全一致，绝无范围外文件被修改；
- `validate` 无新增错误；
- Plan 声明的「最终验证」命令全部通过，且事实记录已写回 `plan.md`；
- Constitution 规范映射的所有检查全部通过；
- `plan.md` 任务清单中已无任何 `- [ ]` 未勾选项。

### Step 6：状态收口与迁移

运行 CLI 完成 Plan 状态迁移：

```bash
node scripts/project-docs.cjs transition CR-### --to completed --kind plan --root <项目根>
```

> **注意**：脚本会机械核对是否所有 Task 均已勾选。
> **严禁在 execute-plan 中标记 spec verified** —— 独立的业务契约验收与规范审查属于 `verify-plan` 的法定职责。

### Step 7：同步本地 state

编辑 `.project-kit/state.md`：
- 更新 `last_completed` 记录本次实施完成事实；
- 更新 `next_action` 为推荐动作：`verify-plan CR-###`；
- 更新 frontmatter 中的对应字段。

## Quality Checklist

- [ ] Plan 在执行前已处于 `status: approved` 状态，未从 `draft` 或 `ready` 违规开工
- [ ] 完整执行代码规范预检，明确了 Constitution 规则与验证命令
- [ ] 严格按顺序逐任务执行 TDD（RED → GREEN → CHECK），测试均真实经历从 FAIL 到 PASS
- [ ] 实际修改的文件严格限制在 Plan 声明的 `file_actions` 范围内，`git diff --stat` 无越界
- [ ] 每个 Task 的 `outputs` 真实生成，且在 `plan.md` 中勾选了 `- [x]`
- [ ] 验证输出与事实已追加写回 `plan.md` 的「最终验证」区
- [ ] 通过 CLI 成功将 Plan 迁移为 `completed`
- [ ] 未越权标记 `spec verified` 或 `change completed`

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 文档作者 (AI) |
| --- | --- |
| `context execute-plan` 输出只读上下文 | 批判性核对代码基线，排查潜在假设偏差 |
| `transition ... --to completed --kind plan` 机械核验任务勾选 | 严格执行 TDD 编码，杜绝无测试代码 |
| `validate` 校验全库文档合法性 | 写回真实验证命令与输出，杜绝虚构证据 |

## Stop Conditions

- Plan 尚未批准（如处于 `draft` 或 `ready`）→ 严禁写代码，返回 `plan`
- 触发 Task 声明的 `stop_if` 或前置 `prerequisites` 不满足 → 立即停止修改
- 必须修改 `file_actions` 声明范围之外的文件 → 停止，回退并返回 `plan` 重新评估影响
- 必须修改 Spec 契约、增减字段或调整产品决定 → 停止，返回 `spec` 或 `change`
- 连续 3 次调试修复未能解决测试失败 → 停止盲目尝试，返回 `plan`

## Handoff Rule

Plan 成功迁移为 `completed` 后 → `verify-plan`。本技能严禁自行声称“最终验收通过”，必须由 `verify-plan` 独立采集新鲜证据完成闭环。

## Anti-Patterns 负面清单

1. **严禁在未批准的 Plan 上开工**：Plan 处于 `ready` 或 `draft` 时严禁执行，必须先经由 `plan` 技能通过门禁审批为 `approved`。
2. **严禁跳过 TDD 盲写实现**：严禁直接编写业务代码后再补测试，必须遵循 RED → GREEN → CHECK 循环。
3. **严禁越界修改范围外文件**：`git diff` 出现 Plan 未声明的文件属于严重事故，必须立即查明或回退。
4. **严禁注释测试或掩盖错误**：测试失败严禁注释断言，连续 3 次失败必须停工回 `plan`。
5. **严禁越权标记 spec verified**：execute-plan 只能推进 `plan completed`，严禁擅自推进 `spec verified` 或 `change completed`。
