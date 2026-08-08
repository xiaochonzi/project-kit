# 校验说明

## 命令

```bash
node scripts/project-docs.cjs help
node scripts/project-docs.cjs validate-plugin --root .
node scripts/project-docs.cjs init --root <project>
node scripts/project-docs.cjs validate --root <project>
node scripts/project-docs.cjs coverage --root <project>
node scripts/project-docs.cjs next --root <project>
```

## 边界

`validate-plugin` 校验插件结构、技能文件、shared 链接和根文档存在性。

`validate` 校验被管理项目的 docs/ 结构、状态、引用与需求覆盖。

脚本只做机械校验,不做产品语义判断。
