# Project Kit Agent Rules

## 文档与语言

- 所有用户可见文档以中文为主。
- 技术标识、代码标识和命令名称保留英文原名。

## 技能纪律

- 每个技能**自包含**:SKILL.md 必须写全可独立执行的流程(前置条件、步骤、校验清单、停止条件、交接),不得依赖技能间共享文档。
- SKILL.md frontmatter 的 `name` 必须与所在目录名一致(如 `skills/plan/SKILL.md` → `name: plan`)。
- description 只写触发时机与路由,不复制流程正文。
- 技能围绕 `docs/` 目录约定工作(见根 SKILL.md 的目录结构),不得发明新的文档位置。

## 脚本边界

`scripts/project-docs.cjs` 只负责确定性操作和机械门禁校验:

- 初始化目录与模板
- 分配稳定 ID 并创建 change 目录与三件套
- 输出上下文
- 校验结构、状态、引用与依赖环(只校验 Full 变更完整性,Quick 零文档不校验)
- 状态迁移(spec_hash 防篡改、plan 勾选门禁)
- 插件结构校验(`validate-plugin`)

它不替用户做产品决定,不生成需求正文,不引入 YAML/JSON 状态源。

## 两档路径

- **Quick**(小改动):零文档,记录 = git commit + STATE 一行。
- **Full**(复杂改动):`docs/changes/CR-###-<slug>/{proposal,spec,plan}.md` 三件套。
- 判定:是否触碰既有契约文档(blueprint/spec)、API、数据模型、权限;改动是否小、边界是否清晰。拿不准 → 问用户。

## 变更纪律

- 修改 `skills/`、`scripts/project-docs.cjs` 或根文档后,必须运行 `node scripts/project-docs.cjs validate-plugin --root .`。
- 技能行为变更(流程、门禁、路由)必须记录到 `CHANGELOG.md`。
- 不引入 `capability.json`、hooks、eval。
- 保持 Node.js CommonJS 无依赖脚本风格。
