---
description: 运行 Project Kit 项目文档校验——检查结构、状态、引用、需求覆盖和插件结构
argument-hint: "[project-root]"
---

如果 `$ARGUMENTS` 提供路径,作为 `--root` 参数;否则使用当前目录。

运行两个维度的校验:

**项目文档校验:**

```bash
node scripts/project-docs.cjs validate --root <项目根>
node scripts/project-docs.cjs coverage --root <项目根>
```

**插件结构校验(如果需要):**

```bash
node scripts/project-docs.cjs validate-plugin --root <plugin-root>
```

报告:错误数、每个错误的修复方向、未覆盖的 accepted REQ 及缺失的映射。如果 errors 非零,exit code 为 1。只报告,不修改文件。
