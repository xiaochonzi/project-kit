---
description: 初始化一个项目的 Project Kit 标准 docs/ 文档目录结构
argument-hint: "<project-root>"
---

`$ARGUMENTS` 必须提供项目根目录。执行前确认目标目录存在。

先探测现状:

```bash
test -d <项目根>/docs && echo "EXISTS" || echo "NEW"
```

如果 `EXISTS`,先运行 `node scripts/project-docs.cjs status --root <项目根>` 报告现状。存在非标准文件时列出冲突项(迁移/重建/保留),等用户决定后再继续。**不静默覆盖或删除任何文件。**

然后初始化:

```bash
node scripts/project-docs.cjs init --root <项目根>
```

然后校验:

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

报告:新建文件列表(4 根文档:constitution/blueprint/roadmap/STATE)、跳过文件列表(如有)、validate 结果(0 错误?)、下一步(constitution 或 brief)。
