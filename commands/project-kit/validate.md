---
description: 运行 Project Kit 项目文档校验——检查结构、Full 变更三件套完整性、状态、引用和插件结构
argument-hint: "[project-root]"
---

如果 `$ARGUMENTS` 提供路径,作为 `--root` 参数;否则使用当前目录。

运行两个维度的校验:

**项目文档校验:**

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

校验内容:根文档存在、Full 变更三件套(proposal/spec/plan)完整性、状态合法性、章节与内容门禁、spec_hash 防篡改、plan 任务勾选、引用有效性与依赖环。

**插件结构校验(如果需要):**

```bash
node scripts/project-docs.cjs validate-plugin --root <plugin-root>
```

报告:错误数、每个错误的修复方向。如果 errors 非零,exit code 为 1。只报告,不修改文件。

**注意:Quick 变更(零文档)不参与校验——其验证责任在 git commit 与 STATE。**
