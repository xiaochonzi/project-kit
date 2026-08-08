---
name: execute-plan
description: 当用户要求按 Implementation Plan 执行、实施计划、落代码、完成执行记录时使用。触发前提:存在 status=approved 的 Plan 与 status=approved 的 Feature Spec。若 Plan 不存在或未批准,路由回 plan;若用户要求的是验收,路由回 verify-plan。
---

# Execute Plan

## Overview

按已批准 Implementation Plan 严格实施,保存实施事实。**"代码写完了"不等于"功能完成"** —— 本技能最多把 Feature 推进到 `implemented`,独立验收属于 verify-plan 的职责。

**开始前宣布:** "我正在使用 execute-plan 技能执行此计划。"

## HARD-GATE

> **NO IMPLEMENTATION WITHOUT AN APPROVED PLAN.** 没有 `status: approved` 的 Plan,或者 Plan 与当前代码现实冲突,禁止开始修改任何文件。发现 Plan 有歧义或错误,先停止,回 plan 修订,不边猜边写。

## 输入与前置条件(不满足即停止)

执行前必须逐项确认,任何一项不满足都不得开始:

- [ ] Feature Spec 存在且 `status: approved`:`docs/specs/<M#>/F-<M#>-<NN>.md`
- [ ] Implementation Plan 存在且 `status: approved`:`docs/plans/F-<M#>-<NN>-plan.md`
- [ ] 已读取 `docs/STATE.md`,确认当前焦点与下一动作就是本 Feature
- [ ] 目标仓库可构建、测试命令可运行
- [ ] 本技能只读文档与代码,不修改 Spec、Plan 的语义

## 必读文件(按顺序,全部读完再动手)

1. `docs/STATE.md` — 当前焦点、阻塞、下一动作
2. `docs/specs/<M#>/F-<M#>-<NN>.md` — Feature 契约:范围、验收标准、需求追踪
3. `docs/plans/F-<M#>-<NN>-plan.md` — 本次执行的唯一依据:任务顺序、files、verify、acceptance
4. `docs/constitution.md` — 目标仓库的开发约束(编码门禁、测试、文档规则)
5. 相关 `docs/changes/CR-*.md` 或 `docs/decisions/ADR-*.md`(Plan 引用的)
6. Plan 每个任务 `read_first` 指定的代码文件

## 执行流程(按序,不许跳步)

### 1. 上下文核对(执行前)

```bash
node scripts/project-docs.cjs context execute-plan --target <F-<M#>-<NN>> --root <项目根>
```

确认输出的上下文文件齐全。同时用脚本确认状态可迁移:

```bash
node scripts/project-docs.cjs transition F-<M#>-<NN> --to in-progress --root <项目根>   # 预期:成功
node scripts/project-docs.cjs transition F-<M#>-<NN> --to in-progress --kind plan  # 用 feature id --root <项目根>  # 预期:成功
```

如果 `transition` 报"非法迁移",说明前置状态不对,停止并向用户报告,不要绕过。

### 2. 批判性检查 Plan(改代码前,逐项核对)

- [ ] Plan 里每个任务 `files` 指向的文件/目录真实存在,或明确是新建
- [ ] `read_first` 引用的符号/文件存在,读到的接口签名与 Plan 描述一致
- [ ] 每个任务的 `verify` 命令在目标仓库可运行(命令拼写、脚本路径)
- [ ] 任务依赖顺序无环,迁移/数据库步骤顺序合理
- [ ] Plan 只覆盖本 Feature 范围,没有把相邻问题、未来设计塞进来
- [ ] `acceptance` 条件是**可观察的**(命令输出、测试结果、界面行为),不是"看起来正确"

**发现任何一项不满足 → 停止,记录具体偏差,回 plan 修订。禁止边执行边改 Plan。**

### 3. 状态推进

```bash
node scripts/project-docs.cjs transition <feature-id> --to in-progress --kind plan  # 用 feature id(plan 无独立 id) --root <项目根>
node scripts/project-docs.cjs transition <feature-id> --to in-progress --root <项目根>
```

### 4. 按任务顺序实施(每个任务一个循环)

对 Plan 中每个任务:

1. **读 `read_first`** 指定的文件,确认理解当前代码现实
2. **只修改 `files` 范围内的文件** —— 不在范围内的文件,哪怕"顺手就能改",也不许碰
3. **先观察失败证据**:任务要求测试驱动时,先写/运行失败测试,看到 RED,再做修改
4. **做最小修改**:只实现该任务要求的逻辑,不做重构、不优化、不加注释美化
5. **运行该任务的 `verify` 命令**,记录输出
6. **对照 `acceptance`**:可观察结果满足才算完成
7. **记录到执行日志**:命令、输出摘要、实际修改的文件、与 Plan 的任何偏差

每完成一个任务,把勾选状态记录在 Plan 文档的对应任务前(`- [x]`)。

### 5. 验证失败时的处理(禁止掩盖)

- 定位失败是当前任务还是之前的任务引入
- **禁止**:删除/注释掉失败的测试、扩大范围绕开、把失败标成"已知问题"继续
- **禁止**:为了通过验证偷偷改 Spec 或 Plan 的语义
- 连续 3 次修复无改善 → 停止,向用户报告:计划假设可能错了,需要回 plan 或 change

### 6. 整体验证与范围检查

所有任务完成后:

```bash
# 运行 Plan 中"最终验证"一节列出的全部命令
node scripts/project-docs.cjs validate --root <项目根>
git status --short          # 检查实际改动
git diff --stat             # 检查改动规模
```

- [ ] 实际 diff 只覆盖 Plan 声明的文件
- [ ] `validate` 无 error
- [ ] Plan 的最终验证全部通过

### 7. 创建 Execution Summary

创建执行记录文档(用脚本生成骨架再填写):

```bash
node scripts/project-docs.cjs new execution --feature <F-<M#>-<NN>> --root <项目根>
```

在 `docs/executions/F-<M#>-<NN>-execution.md` 中如实记录:

- **Task Results**:每个任务完成/失败、验证输出摘要
- **实际修改文件**:真实文件列表(与 Plan 的 files 对比)
- **验证记录**:运行过的命令与结果;失败的项写明原因
- **最终结果**:整体验证结论
- **偏差与遗留**:与 Plan 的任何偏差、未完成项、发现的相邻问题(只记录,不顺手修)

**禁止伪造执行记录** —— 没跑过的命令不写"通过"。

### 8. 状态收口

```bash
node scripts/project-docs.cjs transition <feature-id> --to completed --kind plan  # 用 feature id --root <项目根>
node scripts/project-docs.cjs transition <feature-id> --to implemented --root <项目根>
```

**HARD-GATE:禁止把 Feature 标记为 `verified`。** `verified` 只能由 verify-plan 的独立验收产生。

### 9. 更新 STATE.md

在 `docs/STATE.md` 中更新:

- 已完成的工作(本次执行摘要)
- 验证结果(命令 + 结论)
- 计划偏差(如有)
- 下一动作:`verify-plan F-<M#>-<NN>`

## 停止条件(出现任一,立即停止并报告)

- Plan 未批准、过期或与代码现实冲突
- 需要修改 Plan 范围外的文件才能继续
- 需要改变 Spec 语义、增加功能、跨模块边界、新架构决定 —— 转 change 技能
- 需要未获授权的外部写操作、破坏性操作(删除数据、推送远端等)
- 连续修复没有改善,表明 Plan 假设错误
- 发现安全、数据迁移、高风险影响未被 Plan 覆盖
- 验证失败且根因不属于当前范围

## Common Rationalizations(防跳步)

| 借口 | 现实 |
| --- | --- |
| "Plan 有点旧了,我按最新代码直接写" | 计划过期 = 计划失效,停止回 plan,不是边执行边改 |
| "这个文件顺手一起改了,反正相关" | 只改 `files` 范围内的文件,越界改动破坏可审查性 |
| "先写完再统一测试" | 每个任务有独立 verify,延迟验证 = 不知道哪一步引入问题 |
| "测试失败了先注释掉,后面再补" | 掩盖失败 = 伪造通过,根因会留到验收时爆炸 |
| "功能差不多了,直接标 verified 吧" | `verified` 只能来自独立验收,执行阶段最多到 `implemented` |
| "执行记录不重要的,代码能跑就行" | 没有执行事实,verify-plan 无法独立核对,整个闭环断裂 |
| "状态就先不改了,省事" | 状态是后续技能的入口,不更新状态 = 交接断裂 |

## 成功标准

- [ ] 所有任务按顺序完成,每个都有真实执行与验证记录
- [ ] 实际改动与 Spec、Plan 完全一致,无越界文件
- [ ] Execution Summary 记录真实命令、结果与偏差
- [ ] Feature 处于 `implemented`,未越权标记 `verified`
- [ ] `docs/STATE.md` 已更新,下一动作明确为 verify-plan
