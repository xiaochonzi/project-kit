---
description: 创建 Project Kit 生命周期文档(brief/milestone/feature/plan/execution/verification/change/fix/adr)
argument-hint: "<type> --title <title> [options]"
---

`$ARGUMENTS` 必须提供文档类型和必需参数。运行:

```bash
node scripts/project-docs.cjs new <type> <options> --root <项目根>
```

类型:`brief`(需 `--source`)、`milestone`(需 `--title`)、`feature`(需 `--milestone`、`--title`)、`plan`(需 `--feature`)、`execution`(需 `--feature`)、`verification`(需 `--feature`)、`change`(需 `--title`)、`fix`(需 `--title`)、`adr`(需 `--title`)

报告创建的文档路径和下一步(填写内容、推进状态)。
