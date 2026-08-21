---
name: constitution
description: Use when a project needs stable development rules established or updated — coding gates, testing requirements, documentation discipline, collaboration conventions. Use even for simple-sounding requests like "set up project rules" or "define our coding standards". If the project has no docs yet, use init first.
---

# Constitution

## Overview

通过和用户对话,为项目制定长期稳定的开发准则,写入 `docs/constitution.md`。

**## The Iron Law

```
NO RULES WITHOUT USER CONFIRMATION — NO FABRICATED FACTS
```

**Violating the letter of this rule is violating the spirit of establishing project discipline.** 每条规则必须有来源(代码事实或用户明确确认)。无用户对话确认的规则不写入。AI 禁止臆造仓库事实。

constitution 定义"怎么做",不定义"做什么"。** 它是 plan(影响分析)、execute(编码门禁)、verify(验收边界)、bug(回归标准)的统一约束来源。新加入的 AI 读到 constitution,就知道这个项目的质量门槛——不需要从代码里猜。

**开始前宣布:** "我正在使用 constitution 技能和您一起制定开发准则。"

## Required Inputs(不满足即停止)

- [ ] `docs/` 已初始化(`init` 技能)。未初始化 → 路由到 init,不自己建
- [ ] 用户愿意参与对话。准则需要用户确认,AI 不能单方面替团队定规则

## 产物契约(docs/constitution.md)

init 技能已经生成了 `docs/constitution.md` 的骨架,包含 12 个章节。本技能的任务是用**可验证的规则**填满它们:

| 章节 | 写什么 | 不可写 |
|---|---|---|
| 产品原则 | 产品级不可违背的边界 | 功能方案 |
| 架构原则 | 技术选型约束、模块结构规则 | 模块内部实现细节 |
| 模块与进程边界 | 模块职责划分、允许的调用方向 | 配置细节 |
| 数据权威与一致性 | 数据唯一来源、写入策略 | 字段定义(进 Spec) |
| 类型与接口原则 | 接口契约规则、字段命名 | 具体接口列表 |
| 安全与隐私原则 | 数据收集边界、认证要求 | 具体实现 |
| 测试与验证原则 | 测试框架、必测场景、覆盖要求 | 具体测试用例 |
| 文档与追踪原则 | 文档落盘纪律、状态流转规则 | 文档模板(模板在 `assets/templates/`) |
| 依赖管理原则 | 允许/禁止的依赖、版本约束 | package.json 内容 |
| 禁止事项 | 明确不做的内容 | 原因解释(可简写) |
| 准则变更流程 | 改这条准则本身要走什么流程 | — |
| 修订记录 | 每次变更的日期与摘要 | 冗长描述 |

## 规则写作铁律

**每条规则必须可验证**——有具体命令或明确判断标准。好的规则可以让一个陌生的 AI 在读完 constitution 后独立判断"我有没有违反"。

**坏**("写了等于没写,execute 无法对照"):

```markdown
## 测试与验证原则
- 代码要写得好,测试要覆盖到位。
```

**好**(可验证):

```markdown
## 测试与验证原则
- 使用 node:test 编写单元测试,覆盖数据层全部公开接口。
- 每次变更必须运行: `node --test` 与 `node --check <file>`。
- 修复 bug 必须先有复现测试,回归证据写入 git commit 与本地 state。
```

**每条规则必须有来源**——AI 不能臆造。来源是以下两者之一:

- **代码事实**:来自对目标仓库的扫描(package.json scripts、lint 配置、测试配置、实际代码模式)。呈现给用户:"我看到你用了 X,要纳入准则吗?"
- **用户确认**:用户口头给规则,但仓库无证据。标注 `(用户确认)`。

**禁止**(AI 臆造,没有来源):

```markdown
- 使用 TypeScript strict mode。  ← 仓库明明是 JavaScript,没人提过 TS
```

## 对话流程(按场景路由)

### Step 1: 确认场景

检查目标项目现状:

- **docs/constitution.md 存在且不是骨架**(内容已被写过):场景 D(更新)
- **docs/constitution.md 是 init 生成的骨架**(`{{DATE}}` 残留或章节空):场景 A/B/C
- **docs/ 不存在**:路由到 `init`

### Step 2: 扫描已有代码(已有项目才有这一步)

```bash
# 读取关键配置文件,提取现有模式
ls package.json .eslintrc* .prettierrc* tsconfig.json jest.config.* vitest.config.* 2>/dev/null
head -30 AGENTS.md CLAUDE.md README.md 2>/dev/null
```

从扫描结果中提取**成形的开发模式**:测试框架、lint 规则、提交前脚本、构建命令。

**不要**从 AGENTS.md 直接复制——AGENTS.md 里的内容可能本身就是 AI 生成的、未经验证的,是"对话素材"而不是"事实源"。

### Step 3: 逐个话题对话(一次一个,不一次抛一堆)

按优先级顺序,逐个话题和用户确认。**一次只问一个话题**,确认了再进入下一个:

1. **技术栈与构建**:"项目用 Node.js,构建命令是 `npm run build`,这个要写入架构原则吗?"
2. **代码质量**:"我看到有 `.eslintrc.json`,lint 命令是什么?每次提交前必须通过吗?"
3. **测试**:"测试用 `node:test`,哪些场景必须测试?有没有覆盖要求?"
4. **提交规范**:"提交信息有约定格式吗?(如 conventional commits)"
5. **禁止事项**:"项目有没有'绝对不能做'的事情?比如不引入第三方运行时依赖?"

每个话题确认后即时写入对应章节。

### Step 4: 写入 constitution.md

直接编辑 `docs/constitution.md`,逐章节填写。如果当前章节还没有可确认的内容,标注 `(待确认)` 并跳过,不编造。

### Step 5: 更新 AGENTS.md/CLAUDE.md(按需)

constitution 写完后,检查项目是否有 AGENTS.md 或 CLAUDE.md:

- **不存在**:创建 AGENTS.md,内容:
```markdown
# <项目名> 开发准则

本项目开发准则见 `docs/constitution.md`。所有代码变更必须遵守其中的约束。
```

- **已存在**:读已有内容。区分:
  - 长期稳定规则 → 应已迁入 constitution;已有 AGENTS.md 中重复的删除,改为指向 constitution
  - AI 操作指引(如"必须运行 validate-plugin")→ 保留
  - 如果是旧格式且内容杂乱 → 建议用户重写,不静默删

### Step 6: 校验

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

- [ ] `validate` 无 error
- [ ] 通读 constitution.md:是否有无来源的规则?是否有不可验证的规则?

## 场景路由

### 场景 A:新项目(无代码,无已有准则)

和用户逐个话题对话。顺序:技术栈→开发流程→测试→提交规范→禁令。用户可能不熟悉技术细节,用具体例子帮助决策。

### 场景 B:已有项目(有代码,无已有准则)

先扫描代码提取模式,呈现"我看到你用了 X"的发现。每个发现问用户"要成为规则吗?"。未发现但有价值的规则同样可以问。

### 场景 C:已有项目但有 AGENTS.md

读 AGENTS.md 作为对话素材(不是权威)。识别其中可转为准则的内容,问用户确认后写入 constitution;纯操作指引(如"运行这个命令")保留在 AGENTS.md。

### 场景 D:更新已有 constitution

读当前 `docs/constitution.md`,确认用户要改哪些章节。更新对应章节,在修订记录中记录变更。**不静默改变已有规则的语义**。

## 脚本/AI 分工

| 脚本(`project-docs.cjs`) | AI(本技能) |
|---|---|
| init 生成 constitution.md 骨架 | 和用户对话,逐话题确认规则 |
| validate 校验结构 | 扫描代码提取模式(对话素材) |
| — | 写入规则、确保可验证性、记录来源 |
| — | 按需更新 AGENTS.md/CLAUDE.md |
| — | **禁止**:手建文件、臆造规则(无来源)、一次抛多个话题 |

## Handoff Rule

准则确立后:需求未拆解 → `brief`;已有需求 → `change`。本技能不进入功能设计。

## Common Rationalizations

| 借口 | 现实 |
| --- | --- |
| "先把功能做了,准则以后补" | 没有准则,plan/execute 失去统一边界,每个 AI 各自解释怎么做事 |
| "准则我可以自己写,不用对话" | 准则的核心价值在于"用户确认过"——AI 单方面写的规则不是承诺 |
| "从 AGENTS.md 抄过来就完了" | AGENTS.md 可能是 AI 生成的、未验证的,不能当事实源 |
| "这条规则明显是对的,不用问" | 用户才是规则的所有者,AI 不替用户定纪律 |
| "一次把所有话题都问完效率高" | 逐个话题让用户专注单点决策,减少认知负载 |
