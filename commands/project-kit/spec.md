---
description: 为已接受 Proposal 完成业务 Spec 设计、边界与验收契约
argument-hint: "<change-id>"
---

读取并严格执行 `skills/spec/SKILL.md` 对应的 `spec` 技能。`$ARGUMENTS` 必须提供 Change ID（如 `CR-001`）。

填写既有的 `docs/changes/CR-###-<slug>/spec.md`，完整设计 REQ/BR/AC、范围、失败边界和禁止事项。用户批准后用安装包中的 Project Kit CLI 迁移 Spec 状态，再交接 `plan`。不得编写实现任务或代码。
