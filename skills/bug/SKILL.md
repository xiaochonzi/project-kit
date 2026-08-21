---
name: bug
description: Use when there's a defect against an approved Spec — diagnose, fix minimally, and verify regression in a conversation, or route to change for Full treatment when the root cause is complex. If it's a new requirement rather than a defect, use change instead.
---

# Bug

## Overview

修复违反已批准 Spec 的缺陷。**默认走 Quick:对话内诊断+最小修复+回归验证,零文档。** 根因复杂或需架构决定 → 转 change 走 Full。

**"行为本就不在 Spec 里"是新增需求,不是 Bug——转 change。**

**开始前宣布:** "我正在使用 bug 技能处理缺陷。"

## The Iron Law

```
MINIMAL FIX — NO SCOPE CREEP, NO SILENT SPEC CHANGES
```

**Violating the letter of this rule is violating the spirit of defect handling.** 只做最小修复+回归验证。不借机加功能。不改 Spec 验收标准来掩盖缺陷。修复后必须有新鲜证据(重跑测试)。

## 判断:是 Bug 还是新需求?

| 情况 | 类型 | 处理 |
|---|---|---|
| 实现违反已批准 Spec | Bug | 本技能(Quick 或转 change Full) |
| 原 Spec 从未要求该行为 | 新需求 | 转 change |
| Spec 本身错误 | Spec 缺陷 | 停止,重新评审需求,不通过改代码掩盖 |

## Quick 流程(默认,对话内完成,零文档)

```
确认现象与预期(对照 Spec 验收标准)
  → 定位根因(不连续试错:先复现,再找根因)
  → 最小修复
  → 回归验证:重跑相关测试 + 复现路径确认
  → commit
  → 本地 state 记一行
```

- **禁止**:创建缺陷文档文件、扩大修复范围、顺手重构。
- **记录** = git commit + `.project-kit/state.md` 一行(如"Bug: 修复 XX,回归通过")。

## 转 Full 的信号(根因复杂或需架构决定)

出现以下任一情况 → 停止,转 `change` 走 Full(proposal + spec + plan):

- 根因跨越多个模块,无法确定最小修复边界
- 修复需要数据迁移、接口契约变化或架构调整
- 修复触及数据/权限/安全边界,影响面不可控
- 连续 3 次修复尝试无改善(怀疑对根因的理解错误)

转 change 时在 proposal 的「背景与问题」中记录:现象、复现方式、已尝试的修复与失败原因(proposal 位于 `docs/changes/CR-###-<slug>/`)。

## 回归验证要求

- 重跑与修改直接相关的全部测试
- 重新执行复现路径,确认原症状消失
- 检查相邻路径未被破坏(边界输入/异常输入)

## 场景路由

| 场景 | 处理 |
|---|---|
| **最小修复可行** | Quick:直接修复+回归+commit |
| **根因复杂/需架构决定** | 转 change(Full) |
| **行为不在 Spec 里** | 转 change(新需求) |
| **Spec 本身错误** | 停止,重新评审需求 |

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "顺手把这个相关的问题也修了" | 扩大修复范围=借 Bug 夹带新需求 |
| "改一下验收标准就不算 bug 了" | 静默改 Spec=掩盖缺陷,Spec 错误应重新评审 |
| "复现不出来,猜着改吧" | 没复现=没根因,连续试错是浪费 |
| "修好了,不用跑测试" | 无新鲜证据=未验证,回归风险留给下游 |
