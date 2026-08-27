---
description: 把已批准业务 Spec 转化为技术设计与可执行实现计划
argument-hint: "<change-id>"
---

读取并严格执行 `skills/plan/SKILL.md` 对应的 `plan` 技能。`$ARGUMENTS` 必须提供 Change ID（如 `CR-001`）。

读取已批准的 `docs/changes/CR-###-<slug>/spec.md`、项目编码规范和代码现实，填写同目录已存在的 `plan.md`，覆盖全部 REQ/BR/AC 并建立 Constitution 规范映射。不得再次创建 Plan，也不得引入 Spec 外业务能力。
