---
name: bug
description: Use when there's a defect against an approved Spec — diagnose, fix minimally, and verify regression in a conversation, or route to change for Full treatment when the root cause is complex. If it's a new requirement rather than a defect, use change instead.
---

# Bug

## Overview

修复违反已批准 Spec 的缺陷。

默认走 **Quick 路径**：在当前对话内完成根因定位、最小修复与回归验证，零文档落盘（记录保留在 git commit 与本地 state 中）。
若根因复杂、涉及跨模块架构调整或破坏既有数据模型，停止并转入 `change` 走 Full 变更。

> **边界定义**：“系统行为不在已批准 Spec 范围内”属于新需求，不是 Bug —— 路由至 `change`。

## The Iron Law

```
MINIMAL FIX — NO SCOPE CREEP, NO SILENT SPEC CHANGES
```

**只做最小修复与回归验证。严禁借机夹带新功能，严禁通过静默篡改 Spec 验收标准来掩盖缺陷。**

**开始前宣布：**“我正在使用 bug 技能处理缺陷。”

## Required Inputs

- [ ] 缺陷现象违背了已批准的 Spec 验收标准（或已冻结的产品/架构契约）
- [ ] 具备明确的复现步骤或可运行的失败测试用例
- [ ] 若属于未定义或新期望的行为，停止并路由至 `change`

## 判断：Bug 还是新需求？

| 现象分类 | 判定类型 | 处理路径 |
|---|---|---|
| 实现违背已批准 Spec | Bug | 本技能（默认 Quick；复杂时转 `change` Full） |
| Spec 从未定义或要求该行为 | 新需求 | 停止，路由至 `change` |
| Spec 本身定义错误或矛盾 | 契约设计缺陷 | 停止，重新评审需求，严禁通过改代码掩盖 |

## Process

### Step 1：确认现象与编写复现用例

1. 对照已批准 Spec 的业务规则（`BR-##`）与验收标准（`AC-##`），确认偏离事实。
2. 编写最小自动化复现测试（或确定确定的本地复现脚本），运行确认 **FAIL**（严禁在无法稳定复现的情况下盲目改动代码）。

### Step 2：根因分析与路径分流

定位产生偏差的最小根因，并判断修复路径：
- **命中以下任一转 Full 信号，立即停止，转 `change`**：
  - 根因跨越多个模块，无法明确单一修改边界；
  - 修复需要修改数据库 Schema、公开 API 契约或系统权限模型；
  - 修复触及核心数据流或安全边界，影响面不可控；
  - 连续 3 次修改尝试未能修复（说明对根因认知存在偏差）。
- **未命中上述信号**：保持 Quick 路径，进行最小修复。

### Step 3：最小代码修复

仅修改消除缺陷所必需的代码行：
- 严禁顺手重构无关代码。
- 严禁擅自调整函数签名或扩大可见性。
- 严禁引入新的外部依赖。

### Step 4：严格回归验证

1. 重新运行复现测试，确认其转为 **PASS**。
2. 运行相关模块既有测试套件，确认未引入二次破坏（回归）。
3. 验证异常输入与边界情况（如空输入、越界值）。

### Step 5：提交与记录

1. 提交 git commit，提交信息注明缺陷原因、修复方式及复现测试。
2. 在 `.project-kit/state.md` 的 `last_completed` 中追加一行事实记录（如 `Bug: 修复 <模块名> 边界判定错误，回归测试通过`）。

## Quality Checklist

- [ ] 缺陷现象与已批准 Spec 契约确有违背
- [ ] 具备稳定的自动化失败测试或可复核复现脚本，且已亲眼目睹 FAIL
- [ ] 修复代码为最小改动，未夹带重构或新功能
- [ ] 复现测试与受影响模块回归测试全部 PASS
- [ ] 未篡改 Spec 验收标准
- [ ] 变更已提交 Git 并在 `.project-kit/state.md` 记录

## Stop Conditions

- 缺陷行为原本并未在 Spec 中规定 → 停止，路由至 `change`
- Spec 本身定义存在逻辑错误 → 停止代码修改，提示用户重新评审 Spec
- 命中任一转 Full 信号（跨模块、改契约、改数据模型）→ 停止 Quick，转入 `change` 技能在 Proposal 中记录问题与复现方式
- 连续 3 次修复未见成效 → 停止修改，重新与用户排查根因假设

## Handoff Rule

- Quick 修复完成 → `status`（确认当前焦点）或返回正在进行的 `execute-plan`
- 触发转 Full → `change`（创建新 Change，在 Proposal「背景与问题」中记录缺陷证据 `EVD-##`）

## Anti-Patterns 负面清单

1. **严禁凭空猜改**：严禁在无法稳定复现缺陷的情况下直接修改实现代码。
2. **严禁借机夹带**：严禁借 Bug 修复之名重构周围代码或顺带添加新功能。
3. **严禁篡改契约**：严禁通过降低或修改 Spec 中的验收标准来使测试“通过”。
4. **严禁为 Quick 新建文档**：Quick Bug 修复严禁在 `docs/changes/` 下创建目录或文档文件。
