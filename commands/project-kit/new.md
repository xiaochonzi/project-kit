---
description: 创建 Project Kit 生命周期文档（change/proposal/spec/plan/brief）
argument-hint: "<type> --title <title> [options]"
---

`$ARGUMENTS` 必须提供文档类型和必需参数。解析参数，信息不足时先询问一次。

运行:

```bash
node scripts/project-docs.cjs new <type> [options] --root <项目根>
```

各类型必需参数:

- `change` — 需要 `--title`（创建 `changes/CR-###-<slug>/` 目录 + proposal.md）
- `proposal` — 需要 `--change <CR-###>`（change 目录已存在时补文件）
- `spec` — 需要 `--change <CR-###>`
- `plan` — 需要 `--change <CR-###>`
- `brief` — 需要 `--title` 和 `--source <原始需求文件>`

报告:创建的文档路径 + 文件命名（ID 由脚本分配）。然后提示:下一步是填写文档内容（对应技能的职责）。

**注意:Quick 变更（小改动）不需要创建任何文档——直接实现 + git commit + STATE 一行。**
