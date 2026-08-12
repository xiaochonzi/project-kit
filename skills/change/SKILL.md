---
name: change
description: Use when receiving any new requirement, scope change, or enhancement — the single entry point that routes to Quick (zero documents, direct implementation) or Full (proposal/spec/plan three artifacts). If it's a defect against an approved Spec, use bug instead.
---

# Change

## Overview

新需求的唯一入口。先判定 Quick 还是 Full,再按路径处理。**小改动不产生任何文档,复杂改动才创建三件套。**

**开始前宣布:** "我正在使用 change 技能处理变更请求。"

## The Iron Law

```
NO DOCUMENTS FOR QUICK — FULL NEEDS THE THREE ARTIFACTS
```

**Violating the letter of this rule is violating the spirit of change management.** Quick 路径禁止创建文档(记录 = git commit + STATE 一行);Full 路径禁止跳件(spec/plan 不可省)。

## 路径判定(先判断再处理)

| 路径 | 判据 | 文档 |
|---|---|---|
| **Quick** | 不触碰既有契约文档(blueprint / spec)、API、数据模型、权限;改动小(字段增删、重命名、单模块内改动);边界清晰 | **零文档** |
| **Full** | 多模块 / 架构 / 数据模型变化 / 多迭代 / 跨边界 / 高风险 | `changes/CR-###-<slug>/` 三份:proposal + spec + plan |

拿不准 → 问用户,不猜。

需求分类(在路径判定内):

| 类型 | 判断 | 处理 |
|---|---|---|
| Bug | 实现违反已批准 Spec | 转 bug |
| 小型增强 | 边界独立的用户能力 | 通常 Quick;边界模糊 → Full |
| 大型能力 | 需多迭代 | Full |
| 架构变化 | 改跨模块约束 | Full + blueprint 更新 |
| 补充澄清 | 不改变已批准功能语义 | 更新未 approved 的 spec;已 verified → 走新 change |

## Quick 流程(全部在对话内,零文件产出)

```
用户提需求
  → 澄清:改什么 / 为什么 / 影响哪些文件 / 怎么验证
  → 用户同轮确认
  → 直接实现 + 测试 + commit
  → STATE.md 记一行(最近完成)
```

- **禁止**:创建任何文档文件、更新 roadmap 任务状态(那是 verify 的职责)。
- **记录** = git commit + `docs/STATE.md` 一行(如"Quick: 修改 XX 字段,测试通过")。
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

### Step 5: Handoff

Spec approved 后 → `plan` 技能(为 CR-### 编写实现计划)。

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

Full:Spec approved 后 → `plan`。Quick:直接完成,更新 STATE。判断为 Bug → `bug`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "需求小,直接塞当前 Plan" | 破坏当前迭代范围和验收边界 |
| "改一下旧 Spec 就好" | 已验证契约不能静默扩写 |
| "小改动也要记录文档" | Quick 零文档是设计,记录在 git + STATE |
| "顺手把状态文档也建了吧" | Full 之外不建文档,避免文档数量回涨 |
