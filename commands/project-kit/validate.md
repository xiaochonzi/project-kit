---
description: 运行 Project Kit 项目文档校验,检查结构、状态、引用和需求覆盖
argument-hint: "[project-root]"
---

如果 `$ARGUMENTS` 提供了路径,作为 `--root` 参数;否则使用当前目录。

运行 `node scripts/project-docs.cjs validate --root <项目根>` 和 `node scripts/project-docs.cjs coverage --root <项目根>`。

报告错误数、覆盖率、未覆盖的 accepted REQ。错误非零时逐条说明修复方向。
