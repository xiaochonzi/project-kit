---
description: 为一个模糊想法或原始需求启动 Brief 需求梳理流程
argument-hint: "[idea-file]"
---

如果 `$ARGUMENTS` 提供了文件路径且文件存在,读取作为原始需求。否则给用户两个选择:提供原始需求文件,或直接描述想法(本 command 会将对话记录作为 Brief 素材)。

**第一步:保存原始输入**

```bash
node scripts/project-docs.cjs new brief --title <标题> --source <原始需求文件> --root <项目根>
```

创建 `docs/briefs/BRIEF-###.md`,包含原始输入——确认后正文不再改写。

**第二步:结构化审计**

把 Brief 内容归类为 9 类(产品目标/用户场景/功能能力/业务规则/数据约束/非功能要求/假设/未决问题/不做)。识别重复、矛盾、模糊、缺失。阻断性问题→暂停让用户决定。

**第三步:校验**

```bash
node scripts/project-docs.cjs validate --root <项目根>
```

validate 0 错误。不写 Blueprint、不写 Roadmap、不创建 change——那些是 blueprint/roadmap/change 技能的事。需求落地由 change 技能承接(每个需求一个 change)。
