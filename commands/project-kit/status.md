---
description: 查看当前项目的 Project Kit 状态——active milestone、feature 进度、阻塞项、追踪一致性与下一动作
argument-hint: "[project-root]"
---

如果 `$ARGUMENTS` 提供了路径,作为 `--root` 参数;否则使用当前目录。

三步,按序执行:

```bash
node scripts/project-docs.cjs status --root <项目根>
node scripts/project-docs.cjs coverage --root <项目根>
node scripts/project-docs.cjs next --root <项目根>
```

只使用脚本返回的内容作为事实依据。如果 status/coverage/next 输出存在矛盾(如 STATE.md 说 verified 但 status 显示 implemented),列出所有不一致项。**只读,不修改任何文件。**

coverage 低于 100% 时列出未覆盖的 accepted REQ。脚本不可用或报错时如实报告,不猜测状态。
