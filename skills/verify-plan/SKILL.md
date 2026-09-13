---
name: verify-plan
description: Use when a Full change is implemented and needs independent acceptance against its Spec and project coding standards, with fresh evidence recorded in plan.md and local state. If the change is still in progress, use execute-plan.
---

# Verify Plan

## Overview

使用**新鲜证据**独立核对 Proposal 冻结决定、Spec 业务契约、Plan 实施事实与 Constitution 代码规范。

验收者只依赖落盘三件套、当前代码基线和本轮重新采集的命令证据，不使用原始对话解释目标，也不引用执行阶段的历史输出。

- **“执行者声称完成了”绝不是证据**：每条验收标准（`AC-##`）与 Constitution 规范检查必须在本轮重新运行命令；只有全部客观满足，才能判定通过。
- **不产出独立验收文档**：验收证据直接写回 `plan.md` 的「最终验证」区，结论同步更新至本地 `.project-kit/state.md`，并将 `docs/roadmap.md` 中的对应任务状态更新为 `已完成`。

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

**严禁在没有本轮可复核命令输出的情况下声称验收通过。严禁引用 execute 阶段的历史日志，严禁凭“代码看起来正确”宣称完成，严禁通过降低或篡改验收标准来掩盖失败。**

**开始前宣布：**“我正在使用 verify-plan 技能进行独立验收。”

## Red Flags（出现任一信号，立刻停止）

- 想说“应该没问题”“看起来正确”“之前测试跑过了”；
- 想在未重新执行验证命令的情况下表达满意（如“完美”“通过”）；
- 采信 execute 阶段的历史输出（“刚才那次是通过的” —— 那次不是这次）；
- 验收命令执行失败，但试图在文档中写成“已知限制”或“遗留问题”强行放行；
- 试图在验收过程中直接动手修改代码“顺手修一下”；
- 任何在没有真实验证命令输出支撑下暗示通过的表述。

## Required Inputs（不满足即停止）

- [ ] `docs/changes/CR-###-<slug>/spec.md` 存在且 `status: approved`（业务验收基准）
- [ ] `docs/changes/CR-###-<slug>/plan.md` 存在且 `status: completed`（全部任务已完成勾选）
- [ ] `docs/constitution.md`（或 Plan 指定的项目等效编码规则如 `AGENTS.md`）在核对代码前已完整阅读
- [ ] `plan.md` 的「代码基线」「执行环境」「Implementation Binding」「Constitution 规范映射清单」均完整存在
- [ ] 每个 Task 的 `outputs` 已真实产生，`file_actions` 可与真实 `git diff` 精确对照
- [ ] Proposal 全部 DEC、Spec 全部 BR / AC 在 Plan 中已具备映射
- [ ] 若存在 `docs/changes/CR-###-<slug>/diagrams.md`，已读取作为数据架构核对依据

## Process

### Step 1：加载上下文与规范预备

运行上下文载入命令：

```bash
node scripts/project-docs.cjs context verify-plan --target <CR-###> --root <项目根>
```

**严格遵循顺序**：先完整读取 `docs/constitution.md`（或项目等效编码规则），再读取 Plan 的「Constitution 规范映射清单」，最后才开始核对变更代码。

### Step 2：逐条核对 Spec 契约与 Plan 落地事实

对 Spec 的**每一条**验收标准（`AC-##`）与业务规则（`BR-##`）：
1. 选取直接客观证据：自动化测试、CLI 命令输出、静态断言或数据校验；
2. **重新运行证据命令**，捕获真实的命令输出（严禁粘贴 execute 历史输出）；
3. 给出客观判定：`pass`（证据充分满足）/ `fail`（证据不满足）/ `blocked`（环境阻塞无法验证）；
4. 核查代码基线：确认 Plan 依赖的 Symbol、入口调用链和 Current Behavior 依然成立；
5. 核查文件范围：实际 `git diff --stat` 是否完全符合 `file_actions` 声明范围，有无越界文件；
6. 核实产物真实性：声明的 `outputs` 是否真实存在于磁盘；
7. 核实绑定完备性：全部 DEC / BR / AC 的 Implementation Binding 均有实现与新鲜证据支撑；
8. 确认实现无需原始对话即可解释，无开发人员自行臆造的未经批准决定。

### Step 3：独立审查 Constitution 代码规范符合性

对 Plan「Constitution 规范映射清单」中的**每条规则**：
1. 对照 Constitution 原文核实规则意图，不自行脑补或扩大解释；
2. 运行规则指定的 lint、format、typecheck 或测试命令，捕获实际输出；
3. 对无法机械验证的规范执行人工代码审查，记录审查的具体文件与逻辑依据；
4. 独立判定：`pass` / `fail` / `blocked`。
5. **规范审查铁律**：Constitution 代码规范符合性检查如果出现 `fail` 或 `blocked`，**绝对不得推进 `spec verified` 或 `change completed`**！

### Step 4：全局回归与边界防线

- 运行相关模块既有测试套件，确认未引发意外回归；
- 验证关键失败路径（空参数、异常数据、非法租户/权限边界）；
- 确认系统安全与数据权威边界未被破坏。

### Step 5：写回真实验证证据

将所有测试命令、最新输出摘要、审查依据追加写回 `plan.md` 的「最终验证」区，更新各检查条目的最终判定。

### Step 6：判定与状态收口

#### 全部项为 pass 时：

```bash
node scripts/project-docs.cjs transition CR-### --to verified --kind spec --root <项目根>
node scripts/project-docs.cjs transition CR-### --to completed --root <项目根>
```

> **门禁边界**：`transition 脚本只负责`机械检查文档状态与字段完整性；`不替 AI 判断代码规范`，也不替 AI 判断契约是否达成。AI 必须在调用 transition 前亲自确认所有规范与契约全部 pass。

推进完成后：
1. 将 `docs/roadmap.md` 中对应任务的状态更新为 `已完成`；
2. 在 `.project-kit/state.md` 记录完成事实。

#### 任一项为 fail 或 blocked 时：
**严禁推进任何完成状态**：
- `fail`：记录失败原因与偏差，路由至 `execute-plan`（代码修复）或 `bug`（根因排查）；
- `blocked`：记录环境或依赖阻塞事实，保持当前状态，通知用户协助解除。

### Step 7：同步本地 state

更新 `.project-kit/state.md`：
- 更新 `last_completed` 或记录遗留阻塞；
- 更新 `active_change` 与推荐的 `next_action`。

## Quality Checklist

- [ ] 所有验收判定均基于本轮运行获取的**新鲜证据**，未复用 execute 历史日志
- [ ] 覆盖了 Proposal 全部 DEC、Spec 全部 BR / AC 以及 Plan 全部 Implementation Binding
- [ ] 逐条完成 Constitution 代码规范符合性审查，并记录了命令输出或代码审查依据
- [ ] 规范检查无 fail 或 blocked；若有，已严格阻断推进
- [ ] `git diff --stat` 严格与 `file_actions` 一致，确认无越界修改
- [ ] 验收事实已全部持久化写回 `plan.md` 的「最终验证」区
- [ ] 通过 CLI 成功将 Spec 迁移为 `verified`、Change 迁移为 `completed`
- [ ] `docs/roadmap.md` 对应任务状态已更新为 `已完成`

## Script / Author Responsibility

| CLI (`project-docs.cjs`) | 验收审查者 (AI) |
| --- | --- |
| `context verify-plan` 输出三件套与关联信息 | 逐条重新运行验证命令，捕获新鲜事实输出 |
| `transition` 执行机械门禁检查与状态跃迁 | 独立审查代码规范符合性与契约满足度，判定 pass/fail/blocked |
| — | **禁止**：使用旧日志、动手改代码、“看起来正确”、降低验收标准 |

## Stop Conditions

- Plan 尚未处于 `status: completed` → 停止，路由至 `execute-plan`
- 任一验收标准或规范检查判定为 `fail` → 严禁标记完成，记录证据后交由 `execute-plan` 或 `bug`
- 关键验证环境损坏或命令受阻（`blocked`）→ 停止推进状态，报告阻塞项
- 发现实现严重偏离已批准 Spec，必须大改设计 → 停止，提示重新评审需求或立项新 Change

## Handoff Rule

- 验收全部通过并 completed → `status`（推导下一阶段焦点）或启动下一个任务的 `change`
- 验收发现实现缺陷（fail）→ `execute-plan`（按计划修复）或 `bug`（复杂缺陷排查）

## Anti-Patterns 负面清单

1. **严禁引用执行阶段历史输出**：必须在当前会话重新运行命令，旧输出不代表当前代码状态。
2. **严禁在验收中动手修改业务代码**：验收者是裁判而非实施者，发现错误必须判 `fail` 并交回实施技能。
3. **严禁将失败粉饰为已知限制**：凡与 Spec 不符或规范报错，一律不得放行。
4. **严禁在规范检查失败时完成变更**：Constitution 规范检查未 pass 时，严禁迁移为 `verified` 或 `completed`。
