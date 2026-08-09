---
description: 查看当前项目的 Project Kit 状态——active milestone、feature 进度、阻塞项、下一动作
argument-hint: "[project-root]"
---

如果 `$ARGUMENTS` 非空,把它作为 `--root` 参数;否则使用当前工作目录。

运行 `node scripts/project-docs.cjs status --root <项目根>`,然后运行 `node scripts/project-docs.cjs next --root <项目根>`。

把 status 输出和 next 动作一起呈现给用户。这是只读命令,不修改任何文件。
