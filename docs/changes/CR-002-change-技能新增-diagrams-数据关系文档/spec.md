---
change: CR-002
title: change 技能新增 diagrams 数据关系文档
status: verified
created_at: 2026-08-21
spec_hash: 4a3ea567abf3154230658064cd1271b2a2d1dbf4aae8f1612ca5c125bd3c9b92
---

# change 技能新增 diagrams 数据关系文档

## 问题与依据

当前 change 的 Full 流程只有 proposal / spec / plan 三件套。当需求涉及**新的数据模型设计**时，缺少专门承载数据关系设计的文档：

- 多个数据模型之间的关系（ER）无处安放，散落在 spec 的输入输出/业务规则里或缺失
- 设计依据（为什么这么设计）无法追溯
- 数据的前后端操作时机（谁在何时读写）缺失，前后端开发各自猜测

这导致：涉及数据模型的 change 在 spec 之后、plan 之前缺少数据层澄清，plan 的实现建立在未确认的数据假设上。

依据：CR-002 proposal（用户已确认，2026-08-21）。

## 目标

在 change 的 Full 流程中新增 `diagrams.md` 数据关系文档，作为 spec 与 plan 之间的数据层澄清环节：

- 生成顺序：proposal → spec → **diagrams.md** → plan
- 仅当需求涉及新数据模型设计时创建（可选）
- 内容：数据模型关系（ER）+ 设计依据 + 前后端操作时机
- 脚本提供 `new diagrams` 命令创建带模板的文档
- 暂不强制校验

## 用户流程

**开发者创建一个涉及新数据模型的 Full change**：

1. 走 change 技能：创建 proposal → 确认 → 创建 spec → spec approved。
2. change 技能检测需求涉及新数据模型（proposal 影响范围或 spec 输入输出提到数据模型）。
3. 开发者运行 `node scripts/project-docs.cjs new diagrams --change CR-###`，生成 `docs/changes/CR-###-<slug>/diagrams.md`。
4. 开发者填写：数据模型清单、模型间关系（ER）、设计依据、前后端操作时机。
5. 与用户确认 diagrams 内容后，handoff 到 plan（plan 步骤依据 diagrams 的数据设计制定实现步骤）。

**开发者创建一个不涉及数据模型的 change**：

1. 走正常三件套流程，不创建 diagrams.md。
2. validate 不报错（diagrams 非强制）。

**后续技能读取**：

- plan：读取 diagrams 了解数据模型与操作时机，据此写实现步骤。
- execute-plan / verify-plan：如需，读取 diagrams 核对数据实现是否符合设计。

## 范围

### 包含

- 新增模板 `assets/templates/diagrams.md`
- 脚本 `new diagrams --change CR-###` 命令（复用 createChangeArtifact 机制）
- change 技能流程：spec 确认后增加"若涉及新数据模型 → 生成 diagrams → 再 handoff 到 plan"步骤
- plan / execute-plan / verify-plan 技能文档提及 diagrams 为数据依据
- README / CHANGELOG 更新
- 测试：`new diagrams` 创建成功、validate 不强制 diagrams
- 示例项目：lifecycle-project 补充 diagrams 示例（可选，若 CR-001 示例本就涉及数据模型）

### 不包含

- **强制校验**：validate 不要求每个 change 都有 diagrams.md
- diagrams 独立状态机（无 status，跟随 change 生命周期）
- 数据模型自动生成 / ER 图渲染（纯 Markdown）
- 改 blueprint（系统级数据权威仍归 blueprint）
- 个人验证/变更记录

## 输入与输出

### `new diagrams --change CR-###`

- 输入：`--change CR-###`（必须）、可选 `--title`
- 前置：CR-### 的 proposal 存在且 accepted
- 输出：`docs/changes/CR-###-<slug>/diagrams.md`（渲染 diagrams.md 模板，含 CHANGE/TITLE/DATE 替换）
- 幂等：已存在则报错不覆盖（与 createChangeArtifact 的 writeNewFile 一致）

### diagrams.md 模板结构

```markdown
---
change: CR-###
title: <变更标题>
created_at: <日期>
---

# <标题> 数据关系文档

## 数据模型清单
<涉及的数据模型及其用途>

## 模型间关系（ER）
<模型之间的关联，一对多/多对多等，可用 Mermaid/文本描述>

## 设计依据
<为什么这么设计，取舍与理由>

## 前后端操作时机
<每个数据模型由谁在何时创建/读取/更新/删除>

## 未决问题
```

## 业务规则

1. **条件触发**：仅当需求涉及新数据模型设计时创建 diagrams.md；不涉及则不建。
2. **生成顺序**：必须在 spec approved 之后、plan 创建之前生成。
3. **非强制**：validate 不校验 diagrams.md 存在性；`new diagrams` 是显式命令，不自动触发。
4. **复用机制**：`new diagrams` 走 createChangeArtifact，与 `new spec` / `new plan` 相同的创建逻辑与幂等行为。
5. **无独立状态**：diagrams.md 无 frontmatter status，不参与状态机迁移。
6. **数据权威归属**：change 级数据关系归 diagrams；系统级数据权威仍归 blueprint。

## 失败与边界情况

| 场景 | 处理 |
|---|---|
| `new diagrams` 时 proposal 不存在/未 accepted | 报错"Change 不存在"或提示先接受 proposal（与 spec/plan 一致） |
| diagrams.md 已存在 | 报错不覆盖（writeNewFile 的 wx flag） |
| change 不涉及数据模型但创建了 diagrams | 允许（可选文档），validate 不报错 |
| change 涉及数据模型但未创建 diagrams | 允许（非强制），validate 不报错 |
| diagrams.md 有残留模板变量 | validate 会捕获（`{{...}}` 检查覆盖所有文档） |

## 验收标准

1. **模板存在**：`assets/templates/diagrams.md` 存在，包含"数据模型清单 / 模型间关系（ER）/ 设计依据 / 前后端操作时机"章节。
2. **new diagrams 命令**：对已 accepted 的 change 运行 `new diagrams --change CR-###`，生成 `diagrams.md` 且含正确 frontmatter（change/title/created_at）。
3. **顺序约束**：`new diagrams` 依赖 proposal accepted（与 spec/plan 相同的"Change 不存在"校验）。
4. **幂等**：diagrams.md 已存在时再次运行 `new diagrams` 报错不覆盖。
5. **validate 不强制**：无 diagrams.md 的 change validate 通过（非强制）。
6. **模板变量替换**：生成的 diagrams.md 无 `{{...}}` 残留（validate 通过）。
7. **change 技能文档**：change SKILL.md 包含"spec 确认后涉及新数据模型 → 生成 diagrams → handoff 到 plan"步骤。
8. **相关技能引用**：plan / execute-plan / verify-plan SKILL.md 提及 diagrams 为数据依据（如适用）。
9. **测试覆盖**：tests 新增 `new diagrams` 创建与 validate 非强制的测试用例，全部通过。
10. **插件校验**：`validate-plugin --root .` 0 错误；README/CHANGELOG 更新。

## 未决问题

（无）
