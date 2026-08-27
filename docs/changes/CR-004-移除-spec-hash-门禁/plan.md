---
change: CR-004
title: 移除 Spec Hash 门禁
status: completed
created_at: 2026-08-27
---

# 移除 Spec Hash 门禁 实现计划

## 实现策略

直接删除 `spec_hash` 的唯一生成链路和所有读取门禁，由现有 Spec 状态、REQ/BR/AC 覆盖及独立验收继续约束 Full 流程。历史 frontmatter 的额外字段本来就会被解析器容忍，因此不增加忽略列表、迁移脚本或兼容分支。

## 技术设计

- 文档创建：Spec 模板不再声明 `spec_hash`，`new change` 渲染后自然得到无 hash 的 draft Spec。
- 状态迁移：Spec approved 仅更新 `status`；Plan approved 保留 Spec 状态、Plan 内容和契约映射校验；Spec verified 保留 Plan completed 校验。
- 项目校验：删除 approved/verified Spec 的 hash 检查，保留结构、状态、引用、任务和依赖环校验。
- 历史文档：解析器继续接受未识别的 frontmatter 字段，不主动删除或更新历史 `spec_hash`。
- 用户流程：三个相关技能、Verify command、生命周期说明和项目规则同步删除 hash 要求，保持各自流程自包含。

## Tasks

### Task 1: 先用失败测试定义无 Hash 生命周期

- files: tests/project-docs.test.cjs
- read_first: tests/project-docs.test.cjs 的 contentHash helper、Spec approval 测试、Plan contract coverage 测试，scripts/project-docs.cjs 的 validateProject 与 transitionDocument
- action: 删除测试中的 crypto/hash fixture；增加断言覆盖新建 Spec 无 `spec_hash`、批准前后不生成字段、无 hash 的 approved Spec 可批准 Plan、completed Plan 后可验证 Spec、approved/verified Spec 正文变化不产生 hash 错误，以及带任意历史 hash 的 Spec 仍被忽略；保留现有占位符、未决问题、契约覆盖和 Plan completed 失败断言。
- verify: node --test tests/project-docs.test.cjs
- acceptance: 新增 AC-01 至 AC-06 测试在实现前因现有模板或 hash 门禁失败；其他生命周期测试继续证明 BR-07 和 AC-08。
- done: 失败原因只指向 `spec_hash` 生成或校验，不是 fixture、结构或契约编号错误。

- [x] Task 1

### Task 2: 删除模板和脚本中的 Hash 机制

- files: assets/templates/spec.md, scripts/project-docs.cjs
- read_first: assets/templates/spec.md frontmatter，scripts/project-docs.cjs 的 crypto import、contentHash、validateProject、transitionDocument
- action: 从模板删除 `spec_hash`；删除 `node:crypto` 引入和 contentHash；删除 approved/verified Spec 的项目 hash 校验、Spec verified 的 hash 门禁、Plan approved 的 hash 前置门禁，以及 Spec 状态迁移时写入或重置 hash 的分支；不得改变其他内容完整性、契约映射、Plan completed 和 Proposal completed 条件。
- verify: node --test tests/project-docs.test.cjs
- acceptance: REQ-01、REQ-02、REQ-03 与 BR-01 至 BR-07 全部由测试通过证明；脚本中不存在 `spec_hash`、contentHash 或 crypto 引用。
- done: AC-01 至 AC-06 通过，原有非 hash 生命周期测试无回归。

- [x] Task 2

### Task 3: 同步技能、命令、规则和示例

- files: skills/spec/SKILL.md, skills/plan/SKILL.md, skills/verify-plan/SKILL.md, commands/project-kit/verify.md, project-lifecycle.md, AGENTS.md, examples/lifecycle-project/docs/changes/CR-001-支持按标签筛选待办/spec.md, CHANGELOG.md, tests/skill-process.test.cjs
- read_first: 三个技能的 Required Inputs、批准/迁移步骤、校验清单、脚本分工、停止条件和 Common Rationalizations，commands/project-kit/verify.md，project-lifecycle.md 的 Spec 状态说明，AGENTS.md 的脚本边界，CHANGELOG.md 顶部版本记录
- action: 删除所有现行 hash 前置条件、生成说明和核对说明；把 Verify 描述改为只核对 Spec 状态、Plan 状态、当前契约和编码规范；从生命周期示例移除字段；在 CHANGELOG 顶部新增 Unreleased 行为变更记录；补充静态技能测试，证明 Spec/Plan/Verify 不再要求 hash 且其他职责和门禁仍保留。
- verify: node --test tests/skill-process.test.cjs && node scripts/project-docs.cjs validate-plugin --root .
- acceptance: REQ-04、AC-07、AC-08 通过；三个技能仍 self-contained，frontmatter、触发路由和原有职责不变。
- done: 现行脚本、模板、技能、command、根规则和示例中不再把 `spec_hash` 作为要求；历史 change 与历史设计档不批量改写。

- [x] Task 3

### Task 4: 完整验证并记录结果

- files: docs/changes/CR-004-移除-spec-hash-门禁/plan.md, .project-kit/state.md
- read_first: AGENTS.md, docs/changes/CR-004-移除-spec-hash-门禁/spec.md, docs/changes/CR-004-移除-spec-hash-门禁/plan.md, package.json
- action: 运行完整 Node 测试、插件校验、Spec 技能校验、npm 打包预检和 diff 检查；逐项记录 AC-01 至 AC-08 及编码规范证据，勾选任务并更新本地 state，交给 verify-plan 独立验收。
- verify: node --test tests/*.test.cjs && node scripts/project-docs.cjs validate-plugin --root . && python3 /Users/stone/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/spec && npm pack --dry-run --json && git diff --check
- acceptance: 全部命令退出码为 0，所有 AC 和适用 AGENTS.md 规则都有新鲜证据，没有新增替代 hash、迁移机制或无关改动。
- done: Plan 任务全部勾选、状态为 completed，本地下一动作指向 verify-plan CR-004。

- [x] Task 4

## 验收标准映射
| Spec 契约（REQ/BR/AC） | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| REQ-01；BR-01、BR-02；AC-01、AC-02 | Task 1、Task 2 | `node --test tests/project-docs.test.cjs` 验证新建与批准均不生成 hash |
| REQ-02；BR-03、BR-04、BR-05、BR-07；AC-03、AC-04、AC-05 | Task 1、Task 2 | Plan/Spec transition 与项目校验测试 |
| REQ-03；BR-05、BR-06；AC-06 | Task 1、Task 2 | 历史 hash 任意值被忽略且不改写的测试 |
| REQ-04；BR-02、BR-03、BR-04、BR-07；AC-07、AC-08 | Task 3、Task 4 | skill process 静态测试、`validate-plugin` 与完整测试 |

## Constitution 规范映射清单
| 规则来源 | 适用文件/任务 | 验证方式 | 最终验收 |
| --- | --- | --- | --- |
| AGENTS.md「脚本边界」 | Task 1、Task 2 | 人工检查只删除确定性 hash 机制，不引入产品判断 | `tests/project-docs.test.cjs` + diff 审查 |
| AGENTS.md「技能纪律」 | Task 3 | 检查三个技能自包含、frontmatter 与职责 | skill process tests + `validate-plugin` |
| AGENTS.md「核心原则」 | Task 1 至 Task 4 | 不加替代字段、迁移脚本、兼容分支或额外抽象 | `rg` + diff 审查 |
| AGENTS.md「变更纪律」 | Task 3、Task 4 | 更新 CHANGELOG，保持 CommonJS 无依赖并执行指定校验 | `validate-plugin` + 完整测试 |

## 最终验证

- Spec 验收标准: 运行完整 Node 测试，逐项记录 AC-01 至 AC-08；使用 `rg` 证明现行运行时与流程说明不存在 hash 要求。
- Constitution 规范: 运行 `validate-plugin`、Spec skill validator、`npm pack --dry-run --json`、`git diff --check`，并人工检查脚本边界和最小 diff。

### 执行记录

- Task 1 RED：`node --test tests/project-docs.test.cjs` → 15 项中 12 pass、3 fail；失败分别证明模板仍生成 `spec_hash`、Spec approved 仍要求该字段、Plan approved 仍执行 hash 门禁，其他生命周期测试保持通过。
- Task 2 GREEN：`node --test tests/project-docs.test.cjs` → 15/15 pass；`rg` 确认 `scripts/project-docs.cjs` 与 Spec 模板中不存在 `spec_hash`、contentHash 或 `node:crypto`。
- Task 3 RED/GREEN：新增流程静态测试先因三个技能仍要求 `spec_hash` 而失败；同步后 `node --test tests/skill-process.test.cjs` → 7/7 pass，`validate-plugin --json` → valid=true、12 skills、9 templates。
- Task 4 GREEN：`node --test tests/*.test.cjs` → 33/33 pass；`validate-plugin --json` → valid=true、12 skills、9 templates；`quick_validate.py` 对 spec、plan、verify-plan 均通过；`npm pack --dry-run --json` → `project-kit@0.3.3` 打包成功；`git diff --check` 通过；现行运行时、模板、技能、Verify command、生命周期规则、AGENTS 和示例的定向 `rg` 无 `spec_hash` 命中。
- 已知基线：`node scripts/project-docs.cjs validate --root . --json` 仍报告缺少三个根文档、旧 Brief、CR-001/CR-002 和历史 superpowers Plan 格式错误；错误列表没有 hash 项，也没有 CR-004 新增错误。

### 独立验收（2026-08-27）

| 验收项 | 新鲜证据 | 结论 |
| --- | --- | --- |
| AC-01、AC-02 | `tests/project-docs.test.cjs` 新建并批准无 hash Spec；模板与脚本定向扫描无 hash 逻辑 | PASS |
| AC-03、AC-04 | 无 hash approved Spec 可批准 Plan，Plan completed 后可迁移 Spec verified | PASS |
| AC-05、AC-06 | approved/verified 校验不检查正文摘要；历史 `spec_hash: stale` 被保留且不影响校验和迁移 | PASS |
| AC-07 | Spec、Plan、Verify skills、Verify command、生命周期说明和 AGENTS 定向扫描无 `spec_hash` | PASS |
| AC-08 | `node --test tests/*.test.cjs` → 33/33，原有占位符、未决问题、REQ/BR/AC、Plan 覆盖、Plan completed 与独立规范验收测试通过 | PASS |

编码规范独立审查：脚本 diff 仅删除 `node:crypto`、contentHash 及其调用分支，继续保持 CommonJS 无依赖和确定性边界；三个技能仍自包含且 validator 全部通过；CHANGELOG 已记录行为变化；实际文件与 Plan 范围一致，没有替代 hash、兼容分支、迁移脚本、额外抽象或平台 adapter 修改。`validate-plugin`、`npm pack --dry-run --json` 和 `git diff --check` 均退出 0。

## 非目标

- 不删除或合并 Spec 状态。
- 不改变 Proposal/Spec/Plan 的其他批准和完成门禁。
- 不批量清理已完成 change 和历史设计文档中的 `spec_hash` 文本。
- 不新增替代冻结机制、迁移脚本、依赖或平台 adapter 改动。
