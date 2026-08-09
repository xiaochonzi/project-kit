---
description: 创建 Project Kit 生命周期文档(brief/milestone/feature/plan/execution/verification/change/fix/adr)
argument-hint: "<type> --title <title> [options]"
---

`$ARGUMENTS` 必须提供文档类型和必需参数。解析参数,信息不足时先询问一次。

运行:

```bash
node scripts/project-docs.cjs new <type> [options] --root <项目根>
```

各类型必需参数:

- `brief` — 需要 `--title` 和 `--source <原始需求文件>`
- `milestone` — 需要 `--title`
- `feature` — 需要 `--milestone <M#>` 和 `--title`
- `plan` — 需要 `--feature <F-M#-##>`
- `execution` — 需要 `--feature <F-M#-##>`
- `verification` — 需要 `--feature <F-M#-##>`
- `change` — 需要 `--title`
- `fix` — 需要 `--title`
- `adr` — 需要 `--title`
- `context` — 需要 `--milestone <M#>`

报告:创建的文档路径 + 文件命名(ID 由脚本分配)。然后提示:下一步是填写文档内容(对应技能的职责)。
