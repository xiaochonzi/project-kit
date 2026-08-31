# Project Kit Agent Rules

## 文档与语言

- 所有用户可见文档以中文为主。
- 技术标识、代码标识和命令名称保留英文原名。

## 技能纪律

- 每个技能**自包含**:SKILL.md 必须写全可独立执行的流程(前置条件、步骤、校验清单、停止条件、交接),不得依赖技能间共享文档。
- SKILL.md frontmatter 的 `name` 必须与所在目录名一致(如 `skills/plan/SKILL.md` → `name: plan`)。
- description 只写触发时机与路由，不复制流程正文。
- 技能围绕 `docs/` 目录约定工作(见 README 的目录结构)，不得发明新的文档位置。
- `change` / `spec` / `plan` 必须指导模型从最小骨架完整生成正文；三件套应可直接交给没有原始对话的执行 AI。
- 同一事实只在职责对应文档定义一次：Proposal 冻结 EVD/DEC，Spec 冻结业务契约，Plan 通过编号建立技术绑定，不复制契约正文。
- 技能中的示例必须是占位符（`<类名>`、`<方法名>`、`<数据表>.<字段>`）或虚构示例，**禁止引用具体项目的类名、库表名、工具名**；真实项目的具体细节只能出现在该项目自己的 change 三件套里。

## 脚本边界

`scripts/project-docs.cjs` 只负责确定性操作和机械门禁校验:

- 初始化目录与非 Change 文档模板
- 分配稳定 ID，并创建只有 frontmatter、标题和状态的 Change 三件套最小骨架
- 输出上下文
- 校验结构、状态、引用与依赖环(只校验 Full 变更完整性,Quick 零文档不校验)
- 状态迁移(Spec/Plan 状态、plan 勾选门禁)
- Proposal/Spec/Plan 批准前的章节、占位符、未决问题、DEC/契约覆盖和 Plan Task 字段门禁
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
