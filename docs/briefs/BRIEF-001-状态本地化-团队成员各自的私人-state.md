---
id: BRIEF-001
title: 状态本地化：团队成员各自的私人 state
status: captured
created_at: 2026-08-21
---

# 状态本地化：团队成员各自的私人 state

## 原始需求文档

# 讨论记录：状态本地化

## 背景问题（用户确认）

团队协作场景下，多位成员各自执行不同的需求功能，进度各不相同。当前 Project Kit 用全局 `docs/STATE.md` 表达"全团队唯一焦点 + 下一动作"，无法表达每个成员各自的焦点与进度，互相干扰。

## 目标方案（用户确认）

1. **共享区保持不变**：blueprint / roadmap / `docs/changes/` 全部保留，change 三件套（proposal/spec/plan）与状态机照旧——需求是团队性的产物。
2. **删除全局 `docs/STATE.md`**：不再有团队级唯一焦点/下一动作。
3. **新增本地私有目录 `.project-kit/`**（gitignored，不提交），内含唯一一个文件 `state.md`：
   - 记录当前本地人员最近在做的 change（引用共享 `docs/changes/CR-###-<slug>/`）
   - 记录该人员的个人下一步（替代原全局 next_action 的个人版）
   - 保留最近一条完成记录（每次 change 完成时记一条"XX 于 {日期} 完成"的短历史）
   - 单焦点：同一时间只聚焦一个 change
4. **init 行为**：init 时先创建本地 `.project-kit/state.md`，并创建 gitignore（自忽略），确保仓库根 `.gitignore` 忽略 `.project-kit/`。

## 明确不做（用户确认）

- 个人验证记录（不产生）
- 个人变更记录（不产生）
- 个人路线/roadmap 子集（暂不考虑，将来项目路线把很多功能分配给同一人时再加）

## 影响面（AI 候选）

- 8 个技能（init/change/bug/status/brief/plan/execute-plan/verify-plan/roadmap/constitution）从"读全局 STATE"改为"读/写本地 `.project-kit/state.md`"
- 3 个脚本命令（status/next/init）的 STATE 读写改为 `.project-kit/state.md`
- `status`/`next` 语义从"团队在做什么"变为"我在做什么"
- init 模板、示例项目、测试需同步更新；`.gitignore` 加入 `.project-kit/`

## 参照

- Superpowers 的 `.superpowers/sdd/<plan>/`：gitignored 隐藏目录 + 目录内自忽略 `.gitignore`（内容 `*`）+ 生命周期结束清理。本项目借鉴"隐藏目录 + gitignored + 自忽略"机制，但语义改为"按人隔离的私人 state"。

## 捕获说明

此处保存首次输入的原文，不作为后续改写的权威设计；后续需求通过 `change` 技能承接（Quick 零文档 / Full 三件套）。
