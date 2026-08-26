---
change: CR-003
title: 拆分 Change 与 Spec 业务设计流程
status: completed
created_at: 2026-08-26
---

# 拆分 Change 与 Spec 业务设计流程 实现计划

## 实现策略

保持现有三件套和状态机，只移动职责：让 `new change` 原子渲染三个既有模板，新增一个自包含 `spec` 技能，并在 Spec/Plan 状态迁移时增加确定性占位符与契约覆盖校验。不采用额外 discuss 文档或主观歧义评分，避免扩大生命周期复杂度。

## Tasks

### Task 1: 为原子创建和批准门禁补充失败测试

- files: tests/project-docs.test.cjs, tests/skill-process.test.cjs
- read_first: tests/project-docs.test.cjs, tests/skill-process.test.cjs, scripts/project-docs.cjs, assets/templates/spec.md, assets/templates/plan.md
- action: 先增加测试，断言 `new change` 直接生成三件套；Spec 占位符和非“无”未决问题阻止批准；Plan 漏掉任意 REQ/BR/AC 时阻止批准；skill 测试断言 change→spec→plan 职责边界。
- verify: node --test tests/project-docs.test.cjs tests/skill-process.test.cjs
- acceptance: 新测试在实现前因缺少原子创建、spec 技能或契约门禁而失败，且失败点与本 Spec 一致。
- done: 测试覆盖 AC-01、AC-02、AC-03、AC-08、AC-09。

- [x] Task 1

### Task 2: 改造三件套模板、原子创建和状态迁移

- files: scripts/project-docs.cjs, assets/templates/spec.md, assets/templates/plan.md
- read_first: scripts/project-docs.cjs 的 createDocument、transitionDocument、validatePlanTasks、contentHash，assets/templates/proposal.md、spec.md、plan.md
- action: `new change` 在同一目录依次渲染 proposal/spec/plan；Spec/Plan 模板加入明确生成标记和新的业务契约/技术映射骨架；批准前扫描生成标记与 TODO/TBD，Spec 校验 REQ/BR/AC 和「未决问题: 无」，Plan 从 approved Spec 提取全部编号并验证正文覆盖。
- verify: node --test tests/project-docs.test.cjs
- acceptance: AC-01、AC-02、AC-08、AC-09 通过，旧的 completed CR 仍能被读取和校验。
- done: 脚本只执行确定性创建、正则提取和状态门禁，不包含产品判断。

- [x] Task 2

### Task 3: 新增 Spec 技能并收紧 Change/Plan 职责

- files: skills/spec/SKILL.md, skills/change/SKILL.md, skills/plan/SKILL.md, commands/project-kit/spec.md, commands/project-kit/change.md, commands/project-kit/plan.md
- read_first: skills/change/SKILL.md, skills/plan/SKILL.md, skills/blueprint/SKILL.md, commands/project-kit/change.md, commands/project-kit/plan.md
- action: 新建自包含 `spec` 技能，写全前置条件、代码现实探查、苏格拉底式澄清、核心/条件设计清单、自审、批准、停止和交接；change 只到 Proposal accepted；plan 直接编辑已有骨架并增加契约 ID 映射；三条 command 与技能一致。
- verify: python3 /Users/stone/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/spec && node --test tests/skill-process.test.cjs
- acceptance: AC-03 至 AC-07 通过，三个技能无职责重叠且均可独立执行。
- done: `spec` 可自动发现，也能由显式 command 调用。

- [x] Task 3

### Task 4: 同步插件平台入口和元数据

- files: plugin.json, .claude-plugin/plugin.json, .claude-plugin/marketplace.json, .codex-plugin/plugin.json, .cursor-plugin/plugin.json, .cursor-plugin/marketplace.json, package.json, .opencode/plugins/project-kit.js, .pi/extensions/project-kit.js, README.md, CHANGELOG.md, tests/opencode-plugin.test.cjs, tests/pi-package.test.cjs
- read_first: plugin.json, .claude-plugin/plugin.json, package.json, .opencode/plugins/project-kit.js, .pi/extensions/project-kit.js, README.md, CHANGELOG.md
- action: 技能清单从 11 更新为 12并加入 `./skills/spec`；Claude commands 加入 spec；OpenCode/Pi 各自在本地 commands 数组注册 spec；更新 README 生命周期和 CHANGELOG，补充平台测试断言。
- verify: node --test tests/opencode-plugin.test.cjs tests/pi-package.test.cjs && node scripts/project-docs.cjs validate-plugin --root .
- acceptance: AC-10 通过，OpenCode/Pi 仍使用各自 adapter，不引入共享平台脚本。
- done: 所有清单、描述、命令数量和打包内容一致。

- [x] Task 4

### Task 5: 完整验证并记录验收证据

- files: docs/changes/CR-003-拆分-change-与-spec-业务设计流程/plan.md
- read_first: package.json, AGENTS.md, docs/changes/CR-003-拆分-change-与-spec-业务设计流程/spec.md, docs/changes/CR-003-拆分-change-与-spec-业务设计流程/plan.md
- action: 运行直接相关测试、完整 Node 测试、validate-plugin 和 npm pack dry-run；检查 git diff 无无关修改；把每条 AC 的命令、结果和结论写入最终验证并完成状态迁移。
- verify: node --test tests/*.test.cjs && node scripts/project-docs.cjs validate-plugin --root . && npm pack --dry-run
- acceptance: AC-01 至 AC-11 均有新鲜证据，所有命令退出码为 0。
- done: Spec verified、Plan completed、Proposal completed，并更新本地 state。

- [x] Task 5

## 验收标准映射
| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| AC-01、AC-02、AC-08、AC-09 | Task 1、Task 2 | `node --test tests/project-docs.test.cjs` |
| AC-03、AC-04、AC-05、AC-06、AC-07 | Task 1、Task 3 | skill validator + `tests/skill-process.test.cjs` |
| AC-10 | Task 4 | OpenCode/Pi tests + `validate-plugin` |
| AC-11 | Task 5 | 完整测试 + `npm pack --dry-run` |

## Constitution 规范映射清单
| 规则来源 | 适用文件/任务 | 验证方式 | 最终验收 |
| --- | --- | --- | --- |
| AGENTS.md「技能纪律」 | Task 3、Task 4 | frontmatter、self-contained、目录和 description 检查 | `quick_validate.py` + `validate-plugin` |
| AGENTS.md「脚本边界」 | Task 2 | 代码审查只含确定性创建/校验 | `tests/project-docs.test.cjs` |
| AGENTS.md「核心原则」 | 全部任务 | git diff 检查无额外抽象和兼容层 | 最终 diff 审查 |
| AGENTS.md「变更纪律」 | Task 4、Task 5 | 更新 CHANGELOG 并运行插件校验 | `validate-plugin` |

## 最终验证
- Spec 验收标准: `node --test tests/*.test.cjs`、`node scripts/project-docs.cjs validate-plugin --root .`、`npm pack --dry-run`
- Constitution 规范: 检查技能自包含、frontmatter 匹配、脚本只做确定性操作、CommonJS 无依赖、diff 范围仅覆盖 CR-003。

### 执行记录

- Task 1 RED：`node --test tests/project-docs.test.cjs tests/skill-process.test.cjs tests/opencode-plugin.test.cjs tests/pi-package.test.cjs` → 30 项中 11 项按预期失败，覆盖三件套、门禁、spec 技能和平台 command 缺口。
- Task 2 GREEN：`node --test tests/project-docs.test.cjs` → 原子创建、draft 占位、Spec/Plan 批准门禁和 next→spec 路由通过。
- Task 3 GREEN：`python3 /Users/stone/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/spec` → `Skill is valid!`；skill process tests 通过。
- Task 4 GREEN：OpenCode 注册 8 个命令，Pi 注册 8 个命令；Claude/Codex/Cursor manifests 和 marketplaces 均显示 12 个技能。
- Task 5 GREEN：`node --test tests/*.test.cjs` → 32/32 通过；`validate-plugin --json` → valid=true、12 skills、9 templates；Codex `validate_plugin.py .` 通过；`npm pack --dry-run --json` 包含 `skills/spec/SKILL.md` 和 `commands/project-kit/spec.md`；`git diff --check` 通过。
- 已知基线：`node scripts/project-docs.cjs validate --root . --json` 仍报告旧根文档、旧 Brief、CR-001/CR-002 和旧 superpowers plan 的历史格式错误；无错误指向 CR-003 或本次新增技能、模板、命令和适配器。

### 独立验收（2026-08-26）

| 验收项 | 新鲜证据 | 结果 |
| --- | --- | --- |
| AC-01、AC-02 | `tests/project-docs.test.cjs` 覆盖一次创建三件套及新建后结构校验 | PASS |
| AC-03 | 静态检查 `skills/change/SKILL.md` 与 command：只完善 Proposal，交接 `spec`，不填写 Spec/Plan | PASS |
| AC-04、AC-05、AC-06 | `quick_validate.py skills/spec` 通过；静态检查确认 frontmatter、自包含流程、核心/条件设计、代码现实探查及实现细节禁令 | PASS |
| AC-07 | 静态检查 `skills/plan/SKILL.md`：填写已有 `plan.md`，先读项目规则和代码现实，不调用 `new plan` | PASS |
| AC-08、AC-09 | `tests/project-docs.test.cjs` 覆盖 Spec 占位/未决问题门禁和 Plan 全契约覆盖门禁 | PASS |
| AC-10 | OpenCode/Pi 注册与打包测试通过；平台元数据一致显示 12 个技能；`validate-plugin` 返回 valid=true | PASS |
| AC-11 | `node --test tests/*.test.cjs` 32/32；两项插件 validator、`npm pack --dry-run --json`、`git diff --check` 均退出 0 | PASS |

编码规范独立审查：变更只覆盖 CR-003 必要的脚本、模板、三个技能、平台入口、文档和测试；未增加新状态源、兼容 shim、feature flag 或额外抽象。`scripts/project-docs.cjs` 保持 CommonJS 无依赖，仅新增确定性文件创建、契约提取和状态迁移门禁；技能 frontmatter、目录、self-contained 和 description 规则均由 validator 与人工检查确认。

## 非目标

- 不新增第四种 Full 文档或额外状态机。
- 不把平台 adapter 合并回共享脚本。
- 不为旧流程增加兼容 shim 或 feature flag。
- 不修改与本变更无关的 lifecycle 技能。
