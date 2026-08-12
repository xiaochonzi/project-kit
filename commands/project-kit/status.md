---
description: 查看当前项目的 Project Kit 状态——当前 change 焦点、changes 状态、阻塞项与下一动作
argument-hint: "[project-root]"
---

如果 `$ARGUMENTS` 提供了路径,作为 `--root` 参数;否则使用当前目录。

两步,按序执行:

```bash
node scripts/project-docs.cjs status --root <项目根>
node scripts/project-docs.cjs next --root <项目根>
```

只使用脚本返回的内容作为事实依据。如果 status/next 输出存在矛盾(如 STATE.md 说 next_action 是 A 但 status 显示另一个 change 进行中),列出所有不一致项。**只读,不修改任何文件。**

脚本不可用或报错时如实报告,不猜测状态。
