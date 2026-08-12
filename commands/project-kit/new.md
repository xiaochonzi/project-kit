---
description: 创建一个新的 Full 变更（change 目录 + proposal 骨架）
argument-hint: "<title>"
---

`$ARGUMENTS` 必须提供变更标题。

**Quick 变更不需要本命令**——小改动（不触碰契约/API/数据模型/权限，边界清晰）直接实现 + git commit + STATE 一行，零文档。

**Full 变更入口:**

```bash
node scripts/project-docs.cjs new change --title <变更标题> --root <项目根>
```

创建 `docs/changes/CR-###-<slug>/proposal.md`（ID 由脚本分配）。

然后:

1. 填写 proposal（背景与问题/期望结果/包含/不包含/影响范围/决定/未决问题）
2. 用户确认 → `transition CR-### --to accepted`
3. 流程内创建并填写 spec、plan（由 change / plan 技能驱动，不需要手动调用）

报告:创建的目录与 proposal 路径，下一步填写 proposal 内容并请用户确认范围。
