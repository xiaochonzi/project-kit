---
id: CR-001
title: 状态本地化：团队成员各自的私人 state
status: completed
created_at: 2026-08-21
---

# 状态本地化：团队成员各自的私人 state

## 背景与问题

团队协作场景下，多位成员各自执行不同的需求功能，进度各不相同。当前 Project Kit 用全局 `docs/STATE.md` 表达"全团队唯一焦点 + 下一动作"，存在两个问题：

1. **无法表达每个人的进度**：单份 STATE 只有一组 `active_change` / `next_action`，只能描述"团队现在整体在做什么"，不能描述"每个人各自在做什么"。
2. **互相干扰**：A 成员更新 STATE 会覆盖 B 成员的焦点与下一步，同一批文件上多人写入互相踩踏。

需求来源：BRIEF-001（用户已确认）。

## 期望结果

1. **共享区保持不变**：blueprint / roadmap / `docs/changes/` 全部保留，change 三件套（proposal/spec/plan）与状态机照旧——需求是团队性的产物。
2. **删除全局 `docs/STATE.md`**：不再有团队级唯一焦点/下一动作。
3. **新增本地私有目录 `.project-kit/`**（gitignored，不提交），内含唯一一个文件 `state.md`：
   - 记录当前本地人员最近在做的 change（引用共享 `docs/changes/CR-###-<slug>/`）
   - 记录该人员的个人下一步
   - 保留最近一条完成记录（每次 change 完成时记一条"XX 于 {日期} 完成"的短历史）
   - 单焦点：同一时间只聚焦一个 change
4. **init 行为**：init 时先创建本地 `.project-kit/state.md`，并创建 gitignore（自忽略），确保仓库根 `.gitignore` 忽略 `.project-kit/`。
5. **status / next 语义转变**：从"团队在做什么"变为"我在做什么"，读写 `.project-kit/state.md`。

## 包含

- 本地私有目录 `.project-kit/` 的创建（init）与仓库根 `.gitignore` 忽略机制（含 `.project-kit/`，不创建目录内 `.gitignore`）
- 本地 `state.md` 的字段设计：当前焦点（change ID）、个人下一步、最近一条完成记录
- 全局 `docs/STATE.md` 的删除（含模板、示例、技能引用）
- `status` / `next` 命令改为读写 `.project-kit/state.md`
- 相关技能（init/change/bug/status/brief/plan/execute-plan/verify-plan/roadmap/constitution）的引用更新
- 仓库根 `.gitignore` 加入 `.project-kit/`

## 不包含

- 个人验证记录（不产生）
- 个人变更记录（不产生）
- 个人路线/roadmap 子集（暂不考虑，将来项目路线把很多功能分配给同一人时再加）
- 团队级"焦点/下一动作"的替代机制（不再有全局状态）

## 影响范围

- **契约文档**：`docs/blueprint.md` / `docs/roadmap.md` / 各 SKILL.md 中对 `docs/STATE.md` 的引用
- **脚本**：`scripts/project-docs.cjs` 的 `init` / `status` / `next` 命令
- **模板**：`assets/templates/state.md`
- **技能**：init / change / bug / status / brief / plan / execute-plan / verify-plan / roadmap / constitution
- **示例项目**：`examples/minimal-project`、`examples/lifecycle-project`（含 `docs/STATE.md`）
- **测试**：`tests/project-docs.test.cjs` 等
- **文档**：README.md / CHANGELOG.md / INSTALL.md

## 决定

用户于 2026-08-21 确认接受本提案：

- 共享区（blueprint / roadmap / `docs/changes/`）保持不变
- 删除全局 `docs/STATE.md`
- 新增本地私有目录 `.project-kit/`（gitignored），内含唯一一个文件 `state.md`（当前焦点 + 个人下一步 + 最近一条完成记录，单焦点）
- init 时创建 `.project-kit/state.md` 与自忽略 gitignore，仓库根 `.gitignore` 加入 `.project-kit/`
- status / next 语义从"团队在做什么"变为"我在做什么"
- 明确不做：个人验证记录、个人变更记录、个人路线/roadmap 子集

## 未决问题

（无）
