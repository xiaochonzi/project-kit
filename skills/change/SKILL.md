---
name: change
description: Use when receiving any new requirement, scope change, or enhancement — the single entry point that routes to Quick (zero documents, direct implementation) or Full (proposal/spec/plan three artifacts). If it's a defect against an approved Spec, use bug instead.
---

# Change

## Overview

新需求的唯一入口。先判定 Quick 还是 Full,再按路径处理。**小改动不产生任何文档,复杂改动才创建三件套。**

**开始前宣布:** "我正在使用 change 技能处理变更请求。"

## 用户意图优先

先判断用户明确的路径意图:是在请求“直接完成一个局部修改”,还是请求“创建/设计一项需求”。“使用 change”是入口指令,本身不等于 Quick。

用户明确要求创建、设计、梳理需求,或要求 proposal/spec/plan/完整生命周期 → 视为 Full 意图。

用户明确要求直接修改某个文件时,仍必须先检查 Quick 的全部条件;“直接修改”不能覆盖实际影响范围。文件类型(包括 `.sql`)也不能单独决定路径。

用户意图不明确或 Quick/Full 信号冲突时,先询问澄清,不直接实现也不擅自创建 proposal。

## The Iron Law

```
FULL PATH ONLY: PROPOSAL → SPEC → PLAN → EXECUTE → VERIFY
```

**这条铁律只适用于已经分流为 Full 的需求。** Quick 路径不创建 proposal/spec/plan,直接实现、验证并记录本地 state。

## 路径判定(先判断再处理)

| 路径 | 判据 | 文档 |
|---|---|---|
| **Quick** | 以下条件**全部满足**:只有一个明确用户结果;单一局部模块;不改变契约/API/数据模型/权限;一次小范围实现即可完成;只有一组验收流程;用户没有要求创建或设计需求文档 | **零文档** |
| **Full** | 以下信号**任一命中**:用户要求创建/设计需求;多个模块;多个独立结果;架构/API/数据模型/权限变化;需要多轮实现;存在多组独立验收;影响范围不清或风险无法排除 | `changes/CR-###-<slug>/` 三件套:proposal + spec + plan |

Quick 必须是“全部满足”,Full 只需“任一命中”。拿不准或信号冲突时,先列出影响范围和判定理由,再询问用户,不直接进入实现。

典型判断:

- “直接改这个 SQL 查询”且只影响一个查询 → 可能 Quick。
- “使用 change 创建一个数据库需求” → Full。
- “把这批 SQL、模型和接口一起改” → Full。
- “直接修改多个模块实现这个能力” → Full。

需求分类(在路径判定内):

| 类型 | 判断 | 处理 |
|---|---|---|
| Bug | 实现违反已批准 Spec | 转 bug |
| 小型增强 | 边界独立的用户能力且满足 Quick 全部条件 | Quick;任一条件不满足 → Full |
| 大型能力 | 需多迭代 | Full |
| 架构变化 | 改跨模块约束 | Full + blueprint 更新 |
| 补充澄清 | 不改变已批准功能语义 | 更新未 approved 的 spec;已 verified → 走新 change |

## Quick 流程(全部在对话内,零文件产出)

```
用户提需求
  → 澄清:改什么 / 为什么 / 影响哪些文件 / 怎么验证
  → 用户同轮确认
  → 直接实现 + 测试 + commit
  → 本地 state 记一行(最近完成)
```

- **禁止**:创建任何文档文件、更新 roadmap 任务状态(那是 verify 的职责)。
- **记录** = git commit + `.project-kit/state.md` 一行(如"Quick: 修改 XX 字段,测试通过")。
- **验证**:测试命令真实运行,结果在对话中报告。

## Full 流程

### Step 1: 创建 change 目录与 proposal

```bash
node scripts/project-docs.cjs new change --title <变更标题> --root <项目根>
```

生成 `docs/changes/CR-###-<slug>/proposal.md`,填写:

- 背景与问题(需求来源、现状不足)
- 期望结果
- 包含 / 不包含(边界,阻止膨胀)
- 影响范围(模块、文档)
- 决定(待用户确认后填写)
- 未决问题

### Step 2: 影响分析

- 影响哪些现有 change / 契约文档 / 模块?
- 是否改变 blueprint(模块边界/跨模块约束)?是 → 同步更新 blueprint 并在修订记录引用 CR。
- 是否涉及 API / 数据模型 / 权限?是 → 检查是否误判为 Quick,应走 Full。

### Step 3: 用户决策

把 proposal + 影响分析呈现给用户,得到明确结论:

- **Accepted** → 填写「决定」章节,推进状态:
  ```bash
  node scripts/project-docs.cjs transition CR-### --to accepted --root <项目根>
  ```
- **Deferred** / **Rejected** → 记录原因,`transition CR-### --to deferred|rejected`。

### Step 4: 创建 Spec

```bash
node scripts/project-docs.cjs new spec --change CR-### --root <项目根>
```

填写契约(问题与依据/目标/用户流程/范围/输入与输出/业务规则/失败与边界情况/**验收标准**/未决问题)。验收标准必须可验证,禁止"工作正常"。

和用户确认验收标准 → 推进:

```bash
node scripts/project-docs.cjs transition CR-### --to approved --kind spec --root <项目根>
```

脚本会记录 `spec_hash`,用于验收时防篡改核对。

### Step 5: 数据关系文档(可选)

若该 change 涉及**新的数据模型设计**，在 spec 确认后创建数据关系文档：

```bash
node scripts/project-docs.cjs new diagrams --change CR-### --root <项目根>
```

填写 `docs/changes/CR-###-<slug>/diagrams.md`：

- 数据模型清单（涉及的数据模型及用途）
- 模型间关系（ER）
- 设计依据（为什么这么设计、取舍）
- 前后端操作时机（谁在何时创建/读取/更新/删除）

与用户确认后进入 Handoff。**不涉及新数据模型的 change 跳过本步骤**（diagrams 非强制）。

### Step 6: Handoff

Spec approved（且需要时 diagrams 已确认）→ `plan` 技能(为 CR-### 编写实现计划)。

## 场景路由

| 场景 | 处理 |
|---|---|
| **Bug(实现违反 Spec)** | 转 bug |
| **Spec 仍是 draft** | 直接整合;不新建 change |
| **Spec approved 但未开发** | 澄清→更新并重新批准;新增能力→新 change |
| **Feature 开发中** | 默认不插入当前 Plan;新 change → 决定当前/Next/Later |
| **已 verified** | 不修改旧 Spec 语义;新 change,用 depends_on/extends/supersedes 表达关系 |
| **架构变化** | Full + blueprint 更新 |

## 脚本/AI 分工

| 脚本 | AI |
|---|---|
| `new change` 创建目录与 proposal | 路径判定(Quick/Full) |
| `new spec` 创建契约骨架 | 填写契约与验收标准,与用户确认 |
| `transition` 状态迁移 | 影响分析 |
| `validate` 校验 | **禁止**:Quick 路径创建文档、跳件、静默改已验证 Spec |

## Handoff Rule

Full:Spec approved 后 →（涉及新数据模型时先创建 diagrams）→ `plan`。Quick:直接完成,更新本地 state。判断为 Bug → `bug`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "需求小,直接塞当前 Plan" | 破坏当前迭代范围和验收边界 |
| "改一下旧 Spec 就好" | 已验证契约不能静默扩写 |
| "小改动也要记录文档" | Quick 零文档是设计,记录在 git + 本地 state |
| "顺手把状态文档也建了吧" | Full 之外不建文档,避免文档数量回涨 |
