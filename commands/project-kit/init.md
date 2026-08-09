---
description: 初始化一个项目的 Project Kit 标准 docs/ 文档目录结构
argument-hint: "<project-root>"
---

`$ARGUMENTS` 必须提供一个项目根目录。执行前先确认目标目录存在且用户同意创建 docs/。

运行 `node scripts/project-docs.cjs init --root <项目根>`,然后运行 `node scripts/project-docs.cjs validate --root <项目根>`。

报告创建的目录结构和 validate 结果。如果 validate 报错,逐条说明并给出修复建议。
