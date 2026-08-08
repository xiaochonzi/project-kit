---
name: constitution
description: Use when a project needs stable development rules established or updated — coding gates, testing, documentation discipline, collaboration conventions. If the project has no docs yet, use init first.
---

# Constitution

## Overview

为目标项目制定稳定开发准则,写入 `docs/constitution.md`。准则约束后续所有技能的执行(plan 的影响分析、execute 的编码门禁、verify 的验收边界)。**Constitution 只写长期稳定规则,不写具体功能方案。**

**开始前宣布:** "我正在使用 constitution 技能制定开发准则。"

## Required Inputs

- [ ] `docs/` 已初始化(`init`)
- [ ] 已读取目标仓库现有约束:根 `AGENTS.md` / `CLAUDE.md`、已有文档、CI 配置、测试约定

## Process

### Step 1: 梳理现状

读取并归纳目标仓库已有的稳定约束,按以下分类:

- 编码门禁:lint、类型检查、格式化命令
- 测试要求:测试框架、必测场景、覆盖率约定
- 文档要求:改动是否必须更新文档、更新哪些
- 协作约定:分支策略、提交信息格式、PR 要求
- 禁止事项:不可变约束(如"不引入 X 依赖")

### Step 2: 区分稳定规则与临时决策

- **稳定规则**:跨 Feature 长期有效 → 写入 Constitution
- **临时决策**:本迭代有效 → 写入对应 Spec/Change,不写进 Constitution
- 依赖未决产品决定 → 标为未决,不硬写

### Step 3: 写入 docs/constitution.md

```bash
node scripts/project-docs.cjs new <无需> --root <项目根>   # constitution.md 由 init 创建,直接编辑
```

内容结构(模板为骨架,按项目补充):

```markdown
# Constitution

## 项目目标与边界
## 编码门禁
## 测试要求
## 文档要求
## 协作约定
## 明确不做的内容
```

每条规则必须**可验证**(有命令、有判断标准),禁止"代码要写好"这类空话。

### Step 4: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

## Stop Conditions

- 规则依赖未决产品决定
- 现有约束彼此冲突且需用户裁决
- 无法确认哪些规则应长期生效

## Handoff Rule

准则确立后,若需求未拆解 → `brief`;若已有需求 → `refine`。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先写功能再补准则" | 后续 plan/execute 失去统一边界 |
| "把当前需求细节写进准则" | Constitution 是长期规则,不是功能 spec |
