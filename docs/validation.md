# 校验说明

## 命令

```bash
node scripts/project-docs.cjs help
node scripts/project-docs.cjs validate-plugin --root .
node scripts/project-docs.cjs init --root <project>
node scripts/project-docs.cjs validate --root <project>
node scripts/project-docs.cjs next --root <project>
```

## 边界

- `validate-plugin`：校验插件结构、技能 frontmatter、技能名、模板数量、禁止路径和 Markdown 链接。
- `validate`：校验被管理项目的 docs 结构、状态、引用、契约编号、依赖环、Plan Task 字段和机器路径。
- `new change`：只创建稳定 ID、目录及 proposal/spec/plan 最小骨架；不生成需求正文。
- 新 Change 骨架以 `schema_version: 2` 标识增强契约；proposed/draft 缺少正文结构时只产生提醒，成熟状态与 accepted/approved 状态迁移执行增强章节和十七字段严格门禁。
- 未声明该版本的历史 completed 三件套缺少新增增强章节时只产生 warning，仍按旧核心章节和十二字段 Task 做兼容校验。
- CLI 只做可确定性检查，不判断业务含义、技术方案或文档是否已经消除所有歧义；语义探查、写作和自检由对应技能负责。
