# Project Kit Agent Rules

## 文档与语言

- 所有用户可见文档以中文为主。
- 技术标识、代码标识和命令名称保留英文原名。

## 单一事实来源

- 规则正文只能放在 `shared/` 下。
- `shared/workflows/` 是流程正文唯一位置。
- `shared/rules/` 是规则正文唯一位置。
- `shared/templates/` 是模板唯一位置。
- `skills/*/SKILL.md` 只做薄壳触发与导航,不得复制长规则正文。

## 脚本边界

`scripts/project-docs.cjs` 只负责确定性操作和机械门禁校验:
- 初始化目录与模板
- 分配稳定 ID 并创建文档
- 输出上下文
- 校验结构、状态、引用、覆盖与依赖环
- 状态迁移
- 插件结构校验

它不替用户做产品决定,不生成需求正文,不引入 YAML/JSON 状态源。

## 变更纪律

- 修改 `skills/`、`shared/` 或 `scripts/project-docs.cjs` 后,必须运行 `node scripts/project-docs.cjs validate-plugin --root .`。
- 不引入 `capability.json`、hooks、eval。
- 保持 Node.js CommonJS 无依赖脚本风格。
- 迁移期间以 `docs/blueprint.md` 和 `docs/fixes/` 为目标项目权威命名。
