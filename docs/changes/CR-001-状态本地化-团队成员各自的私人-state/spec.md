---
change: CR-001
title: 状态本地化：团队成员各自的私人 state
status: verified
created_at: 2026-08-21
spec_hash: 6f4fb3d1ee85a47d159a86f79b3708553a33adf4971a9255f27d9846451cd33f
---

# 状态本地化：团队成员各自的私人 state

## 问题与依据

团队协作场景下，多位成员各自执行不同的需求功能，进度各不相同。当前 Project Kit 用全局 `docs/STATE.md` 表达"全团队唯一焦点 + 下一动作"：

1. **无法表达每个人的进度**：单份 STATE 只有一组 `active_change` / `next_action`，只能描述"团队整体在做什么"，不能描述"每个人各自在做什么"。
2. **互相干扰**：多位成员在同一工作区更新 STATE 会互相覆盖焦点与下一步，同一批文件上多人写入互相踩踏。

依据：BRIEF-001（用户已确认）。

## 目标

将"当前焦点 / 下一动作"从**团队级全局状态**迁移为**个人级本地状态**：

- 团队共享部分（blueprint / roadmap / changes）不变——需求是团队性产物。
- 删除全局 `docs/STATE.md`，不再有团队级唯一焦点。
- 每个本地人员在 `.project-kit/state.md` 维护自己的私人状态（当前焦点 change + 个人下一步 + 最近一条完成记录）。

## 用户流程

**成员开始工作（status）**：

1. 成员在项目里运行 `node scripts/project-docs.cjs status --root <项目>`（或 `/project-kit:status`）。
2. 输出"我"的当前焦点（`.project-kit/state.md` 的 `active_change`）、我的下一步（`next_action`）、以及全部共享 changes 及其状态。
3. 若 `.project-kit/state.md` 不存在（首次使用或 init 未跑），status 输出提示并给出初始化引导。

**成员切换 / 开始一个新 change**：

1. 成员通过 `change` 技能创建或认领一个共享 change（CR-###）。
2. 成员更新 `.project-kit/state.md`：`active_change` 指向该 CR-###，`next_action` 设为下一步。
3. 后续 status / next 从本地 state 读取该成员自己的焦点。

**成员完成一个 change（verify-plan / change Quick 路径）**：

1. 共享区照旧推进：change 状态机、roadmap 对应任务标记完成。
2. 成员更新 `.project-kit/state.md`：把完成记录写入"最近完成"（如"CR-### 于 2026-08-21 完成"），`active_change` 清空或指向下一个 change。

**全新项目初始化（init）**：

1. `node scripts/project-docs.cjs init --root <项目>` 创建 `docs/` 结构。
2. 同时创建 `.project-kit/`：内含 `state.md`（初始空状态）与 `.gitignore`（内容 `*`，自忽略）。
3. 仓库根 `.gitignore` 追加 `.project-kit/`（若不存在则创建）。
4. init 输出中报告本地私有目录已创建。

## 范围

### 包含

- 新增本地私有目录 `.project-kit/`，由 `init` 创建：
  - `.project-kit/state.md` — 个人私人状态（frontmatter：`active_change`、`next_action`、`last_completed`；正文：当前焦点、个人下一步、最近完成、恢复上下文）
  - （**不**创建 `.project-kit/.gitignore`，不采用目录内自忽略机制）
- 删除全局 `docs/STATE.md`：init 不再创建；模板 `assets/templates/state.md` 改为 `.project-kit/state.md` 的私有模板
- 仓库根 `.gitignore` 追加 `.project-kit/`（唯一忽略机制）
- `status` 命令：改为读取 `.project-kit/state.md`，语义为"我"的状态
- `next` 命令：改为读取 `.project-kit/state.md`
- 相关技能（init / status / change / bug / brief / plan / execute-plan / verify-plan / roadmap / constitution）中对 `docs/STATE.md` 的引用改为 `.project-kit/state.md`
- 示例项目与测试同步更新

### 不包含

- 个人验证记录（不产生）
- 个人变更记录（不产生）
- 个人路线/roadmap 子集（暂不考虑，将来项目路线把很多功能分配给同一人时再加）
- 团队级"焦点/下一动作"的替代机制（不再有全局状态）
- 多成员间的状态同步 / 冲突解决机制（本地状态天然隔离）

## 输入与输出

### `init --root <项目>`

- 输入：项目根路径
- 输出：
  - `docs/` 3 个根文档（constitution / blueprint / roadmap，**不再有 STATE.md**）+ 3 个受管子目录
  - `.project-kit/state.md`（初始：`active_change: null`、`next_action: null`、`last_completed: null`）
  - 仓库根 `.gitignore` 追加 `.project-kit/`（若根 `.gitignore` 不存在则创建）

### `status --root <项目>`

- 输入：项目根路径
- 输出（本地私有部分）：
  - `当前焦点`（`.project-kit/state.md` 的 `active_change`）
  - `下一动作`（`.project-kit/state.md` 的 `next_action`）
  - `最近完成`（`.project-kit/state.md` 的 `last_completed`）
- 输出（共享部分，不变）：全部 changes 及其状态
- 若 `.project-kit/state.md` 不存在：输出提示"本地状态未初始化，请运行 init"，不报错

### `next --root <项目>`

- 输入：项目根路径
- 输出：基于 `.project-kit/state.md` 的 `next_action` 推导下一模式；若未初始化则回退到基于共享 changes 的机械推导

## 业务规则

1. **单焦点**：`.project-kit/state.md` 的 `active_change` 同一时间只指向一个 CR-###，聚焦完成再切换。
2. **引用共享 ID**：`active_change` 必须是共享 `docs/changes/` 下存在的 CR-###，不新建本地 change。
3. **最近完成只保留一条**：`last_completed` 只记录最近一次完成的 change（如"CR-### 于 {日期} 完成"），不累积历史。
4. **本地私有**：`.project-kit/` 整个目录不提交、不进共享文档扫描（`validate` / `collectDocuments` 忽略它）。
5. **唯一忽略机制**：仓库根 `.gitignore` 包含 `.project-kit/`；不创建目录内 `.gitignore`。
6. **共享 changes 不因本地化而改变**：change 三件套、状态机、roadmap 任务状态更新逻辑不变。

## 失败与边界情况

| 场景 | 处理 |
|---|---|
| `.project-kit/state.md` 不存在，运行 status | 输出提示"本地状态未初始化，请运行 init"，不报错；changes 部分照常输出 |
| 仓库根 `.gitignore` 不存在 | init 创建它并写入 `.project-kit/` |
| `active_change` 指向不存在的 CR-### | status 提示"焦点 change 不存在"，仍显示 raw 值；不自动清除 |
| 旧项目升级（已有 `docs/STATE.md`） | 不自动迁移；文档说明手动处理（保留或删除），init 幂等不覆盖 |
| `.project-kit/` 被误提交（用户手动 git add -f） | 仓库根 `.gitignore` 是唯一忽略机制；文档说明不提交 |

## 验收标准

1. **init 创建本地目录与忽略**：对空项目运行 `init --root <项目>`，生成 `.project-kit/state.md`，仓库根 `.gitignore` 含 `.project-kit/`。
2. **init 不再创建 STATE.md**：init 后 `docs/` 下不存在 `STATE.md`（4 根文档变为 constitution / blueprint / roadmap + 3 子目录）。
3. **status 读取本地状态**：设置 `.project-kit/state.md` 的 `active_change: CR-001`、`next_action: "plan CR-001"` 后，`status` 输出"当前焦点: CR-001"、"下一动作: plan CR-001"。
4. **status 未初始化降级**：删除 `.project-kit/state.md` 后运行 `status`，不报错，输出本地状态未初始化提示 + changes 列表。
5. **next 读取本地状态**：`.project-kit/state.md` 设置 `next_action` 后，`next` 以该值为准推导。
6. **validate 忽略本地目录**：`validate --root <项目>` 不报 `.project-kit/` 相关错误，且 `.project-kit/state.md` 不在输出文档列表中。
7. **gitignore 生效**：`git status` 显示 `.project-kit/` 被忽略（`git check-ignore .project-kit/state.md` 成功）。
8. **技能文档无残留引用**：全部技能 SKILL.md 中不再出现 `docs/STATE.md`（改为 `.project-kit/state.md`）。
9. **示例项目同步**：`examples/minimal-project` 与 `examples/lifecycle-project` 通过 `validate-plugin --root .` 校验，且不再包含 `docs/STATE.md`。
10. **测试更新**：`tests/project-docs.test.cjs` 全部通过。

## 未决问题

（无）
