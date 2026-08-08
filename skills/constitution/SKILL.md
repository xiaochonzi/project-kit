---
name: constitution
description: Use when a project needs stable development rules established or updated — coding gates, testing, documentation discipline, collaboration conventions. If the project has no docs yet, use init first.
---

# Constitution

## Overview

为目标项目制定稳定开发准则,写入 `docs/constitution.md`。准则约束后续所有技能的执行:plan 的影响分析、execute 的编码门禁、verify 的验收边界、bug 的回归要求。**Constitution 只写长期稳定规则,不写具体功能方案。**

**开始前宣布:** "我正在使用 constitution 技能制定开发准则。"

## Required Inputs(不满足即停止)

- [ ] `docs/` 已初始化(`init` 技能)
- [ ] 已读取目标仓库现有约束:根 `AGENTS.md` / `CLAUDE.md`、CI 配置、测试约定
- [ ] 已区分:长期稳定规则 vs 本迭代临时决策

## 产物契约(docs/constitution.md)

必须包含以下章节(全部填写,禁止留空):

```markdown
## 产品原则            ← 产品级不可违背的边界
## 架构原则            ← 技术选型与结构约束
## 模块与进程边界      ← 模块职责、允许的调用方向
## 数据权威与一致性    ← 数据唯一来源、写入策略
## 类型与接口原则      ← 接口契约、字段定义
## 安全与隐私原则      ← 数据收集边界
## 测试与验证原则      ← 测试框架、必测场景、验证命令
## 文档与追踪原则      ← 文档落盘与状态流转纪律
## 依赖管理原则        ← 允许/禁止的依赖
## 禁止事项            ← 明确不做的内容
## 准则变更流程        ← 改准则要走什么流程
## 修订记录            ← 每次变更的日期与摘要
```

**每条规则必须可验证** —— 有具体命令、有明确判断标准。禁止空话。

## Process

### Step 1: 梳理现状

读取目标仓库已有约束,按产物契约的 12 类归纳。信息来源:AGENTS.md、CI 配置、package.json scripts、README、已有文档。

### Step 2: 区分稳定规则与临时决策

- 稳定规则(跨 Feature 长期有效)→ 写入 Constitution
- 临时决策(本迭代有效)→ 写入对应 Spec/Change
- 依赖未决产品决定 → 标为未决,不硬写

### Step 3: 写入 docs/constitution.md

直接编辑 `docs/constitution.md`(init 已生成骨架,替换 `{{DATE}}` 为当前日期,填写各章节)。

### Step 4: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error
- [ ] 无模板变量残留:`grep -r "{{" docs/constitution.md` 无输出
- [ ] 每条规则可验证:通读一遍,任何一条无法用命令或判断标准核实的 → 重写

## 好/坏示例

**坏**(空话,无法验证):

```markdown
## 测试与验证原则
- 代码要写得好,测试要覆盖到位。
```

后果:execute 技能无法判断"写得好"是否满足,门禁形同虚设。

**好**(可验证):

```markdown
## 测试与验证原则
- 使用 node:test 编写单元测试,覆盖数据层全部公开接口。
- 每次变更必须运行: node --test 与 node --check <file>。
- 修复 bug 必须先有复现测试。
```

## Stop Conditions

- 规则依赖未决产品决定
- 现有约束彼此冲突且需用户裁决
- 无法确认哪些规则应长期生效
- 目标仓库没有可依据的现有约束且用户未提供 → 问用户,不编造

## Exception Handling

- **模板变量残留**:脚本渲染的模板若含 `{{DATE}}` 未替换,validate 报"未替换模板变量"。逐处替换为当前日期。
- **已有 constitution.md 但内容为空话**:按产物契约重写,修订记录注明本次重写。
- **用户口头给规则但无文档依据**:记录为"用户确认的规则"写入,并在修订记录注明来源;不要臆造目标仓库的 CI/测试约定。

## Handoff Rule

准则确立后:需求未拆解 → `brief`;已有需求 → `refine`。本技能不进入功能设计。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先写功能再补准则" | 后续 plan/execute 失去统一边界,验收无从对照 |
| "把当前需求细节写进准则" | Constitution 是长期规则,功能细节进 Spec |
| "测试约定大概写一下就行" | 无法验证的规则 = 没有规则,execute 不会遵守 |
| "CI 配置我不看了,凭经验写" | 准则必须基于真实仓库事实,编造会误导 execute |
| "这条规则改起来麻烦,先留着" | 过时规则比没有规则更糟,会约束错误行为 |
