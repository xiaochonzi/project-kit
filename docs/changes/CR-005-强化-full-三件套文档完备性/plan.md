---
change: CR-005
title: 强化 Full 三件套文档完备性
status: completed
created_at: 2026-08-27
---

# 强化 Full 三件套文档完备性 实现计划

## 实施目标

让 Full Change 的 proposal/spec/plan 完整保存需求与实施所需上下文：新生成的三件套不依赖原始对话即可明确背景、业务契约、代码现状、目标设计、实施任务、不变量和验证方法，同时保持 Quick、三件套目录和现有状态机不变。

## 实现策略

在现有三件套中扩充职责对应的信息，不新增文档或状态源。模板提供固定核心和条件适用性骨架；技能负责探查事实、写全内容并消除歧义；CLI 只机械检查新章节、Task 字段、占位符、未决问题和契约覆盖。历史 completed Change 不补写，新生成文档和新的批准动作采用增强规则。不采用把完整代码复制进 Plan 的方案，因为代码会漂移且增加噪音；Plan 只保留精确定位、职责、行为、接口和实施要求。

## 技术设计

### 当前技术现状

#### 系统入口与调用链

Full 创建：slash command 或技能 → Project Kit CLI `main` → `createDocument` → `renderTemplate` → 同目录 proposal/spec/plan。

文档批准：技能请求迁移 → CLI `main` → `transitionDocument` → `emptySections` / `validatePlanTasks` / `contractIds` → 更新 frontmatter status。

项目校验：CLI `main` → `validateProject` → required sections / content gates / Plan task fields / reference checks。

显式执行入口：Claude/OpenCode/Pi command → command markdown → 对应生命周期技能；其中 change/spec/plan command 已是薄路由，execute/verify command 仍复制旧流程文本。

#### 关键文件与符号

| 文件 | Symbol/区域 | 当前职责 | 本次作用 |
| --- | --- | --- | --- |
| `assets/templates/proposal.md` | Proposal sections | 创建立项骨架 | 增加已确认决定与完整性提示 |
| `assets/templates/spec.md` | Spec sections / REQ skeleton | 创建业务契约骨架 | 增加术语入口和无歧义提示 |
| `assets/templates/plan.md` | Plan sections / Task skeleton | 创建六字段任务骨架 | 扩展技术现状、条件设计和十二字段 Task |
| `scripts/project-docs.cjs` | `APPROVAL_PLACEHOLDER_PATTERN` | 拒绝模板占位符 | 覆盖新增模板标记 |
| `scripts/project-docs.cjs` | `validatePlanTasks` | 校验 files/read_first/action/verify/acceptance/done | 新批准动作校验十二字段 Task |
| `scripts/project-docs.cjs` | `transitionDocument` | Proposal/Spec/Plan 状态门禁 | 加入新核心章节和未决问题门禁 |
| `skills/change/SKILL.md` | Full Proposal 流程 | 写背景、范围、影响和决定 | 固化证据、取舍与无上下文依赖要求 |
| `skills/spec/SKILL.md` | 业务设计流程 | 写 REQ/BR/AC 和边界 | 增加术语、示例与禁止模糊引用 |
| `skills/plan/SKILL.md` | 技术设计与任务拆解 | 探查代码并写 Plan | 强制把探查结果、条件设计和任务上下文落入 Plan |
| `skills/execute-plan/SKILL.md` | 执行前检查 | 校验文件、read_first 和 verify | 核对路径、Symbol、调用链、Current Behavior 与接口 |
| `skills/verify-plan/SKILL.md` | 独立验收 | 核对 Spec、Plan 和规范 | 按新增技术契约检查实现是否偏离 |

#### Current Behavior

- Proposal 模板有“决定”但没有结构化要求已确认选择、未采用方向和原因；accepted 只机械检查背景、期望和决定。
- Spec 有 REQ/BR/AC、Current/Target 和条件业务设计，但没有固定“术语与业务对象”章节。
- Plan 技能要求探索代码，模板却只保留概括性技术设计和六字段 Task；入口、调用链、Symbol、Current/Target、接口和不变量可能只停留在生成过程上下文。
- Plan approved 检查核心章节、六字段 Task 和 REQ/BR/AC 覆盖，未检查未决问题和条件技术设计。
- execute-plan 已检查 files、read_first 和 verify，但没有逐项核对 Plan 记录的调用链、Current Behavior 和接口是否与代码一致。

### 目标技术设计

- Proposal 模板和 change 技能使用“已确认决定”表达选择、未采用方向与原因，accepted 前全部核心章节非空且未决问题为“无”。
- Spec 模板增加“术语与业务对象”；spec 技能要求任何可能产生不同解释的术语、Current/Target、示例和规则显式落盘。
- Plan 模板采用“实施目标 → 实现策略 → 技术现状 → 目标设计 → 全局不变量 → 条件技术设计 → Tasks → 映射与验证”的固定结构。
- 条件技术设计用十类适用性表阻止静默遗漏；适用项在 Plan 对应章节或 Task 中详细展开，不适用项写明原因。
- `validatePlanTasks` 保留历史六字段读取能力，但 Plan approved 使用十二字段集合；新模板只生成十二字段格式。
- execute-plan 把 Plan 中的路径、Symbol、调用链、Current Behavior、depends_on 和 interfaces 纳入实施前检查；任一失真即停止返回 Plan。
- 显式 commands 统一为加载对应技能的薄路由，避免流程正文与技能再次漂移。

#### Current → Target 对照

| 当前 | 目标 |
| --- | --- |
| 探查事实可能只存在于生成过程 | 入口、调用链、Symbol 和 Current Behavior 固化在 Plan |
| Task 只有六个字段 | Task 包含十二个实施字段 |
| 复杂技术类别靠规划者主动想到 | 十类条件技术设计逐项判断 |
| 执行前只检查文件和 verify | 同时核对调用链、Symbol、Current Behavior 和接口 |
| command 复制执行流程 | command 只负责加载自包含技能 |

## 全局不变量

- Quick 保持零文档，不受 Full 完备性门禁影响。
- Full 仍只有 proposal/spec/plan 三件套，不创建第四份上下文文档。
- Proposal 不写文件级实现，Plan 不发明 Spec 外业务行为。
- CLI 只做确定性结构与状态校验，不判断技术描述真实性。
- 三个文档状态机和 REQ/BR/AC 覆盖门禁保持不变。
- 历史 completed Change 不批量改写；增强规则不能阻止它们被读取。
- 技能保持自包含，显式 command 与自动触发执行同一技能规则。
- 不增加依赖、配置、hook、状态源或平台 adapter。

## 条件技术设计

### 适用性

| 类别 | 是否适用 | 原因 | 对应设计或 Task |
| --- | --- | --- | --- |
| 状态机 | 是 | 扩充 accepted/approved 门禁但不改变状态集合 | Task 2 |
| 错误策略 | 是 | 缺失章节、字段、契约或未决问题必须给出明确失败 | Task 1、Task 2 |
| 并发与幂等 | 否 | 本地同步 CLI 不新增并发写入 | 无 |
| 数据与事务 | 否 | 不新增数据模型或事务，仅修改 Markdown 契约 | 无 |
| API / 事件 | 否 | 不改变外部网络 API 或事件 | 无 |
| 配置 | 否 | 不新增配置键或环境变量 | 无 |
| 兼容与迁移 | 是 | 历史 completed Change 保持可读，新批准动作使用增强规则 | Task 2、Task 4 |
| 权限与安全 | 否 | 不改变文件权限或信任边界 | 无 |
| 可观测性 | 是 | CLI 失败信息和测试必须指出缺失的章节或 Task 字段 | Task 1、Task 2 |
| 参考实现 | 是 | 借鉴 Superpowers 零上下文 Plan 和 GSD Plan-as-Prompt，但保持 Project Kit 三件套 | Task 3、Task 4 |

### 状态与错误策略

- Proposal accepted：缺少固定核心、仍有模板标记或未决问题不为“无”时拒绝，状态不变。
- Spec approved：缺少术语与业务对象或现有核心、仍有占位符/未决问题/契约缺口时拒绝，状态不变。
- Plan approved：缺少新核心章节、条件适用性、十二字段 Task、规范映射、契约覆盖或未决问题时拒绝，状态不变。
- 错误输出列出具体缺失章节或 `Task N` 字段，不使用笼统“文档不完整”。

### 兼容与参考原则

- `validate` 继续识别历史 Plan 的原六字段，不要求 completed 历史文档补写；`transition ... plan --to approved` 对新的批准动作执行十二字段门禁。
- 不复制 Superpowers 的独立 Plan 位置或 GSD 的额外 CONTEXT/SUMMARY 文档，只采用“执行者无原会话上下文”和“Plan 是完整实施提示”的内容标准。

## Tasks

### Task 1: 用失败测试定义三件套完备性门禁

- files: `tests/project-docs.test.cjs`, `tests/skill-process.test.cjs`
- symbols: Proposal/Spec/Plan transition tests；skill process assertions
- read_first: `tests/project-docs.test.cjs` 的 new change、Spec approval、Plan coverage 测试；`tests/skill-process.test.cjs` 的 change/spec/plan/execute/verify 断言；`validatePlanTasks` 与 `transitionDocument`
- depends_on: 无
- interfaces: Consumes 当前 CLI 与模板输出；Produces Task 2/3 必须满足的 RED 行为契约
- current_behavior: 新 Plan 没有十二字段和条件设计；Proposal/Spec/Plan 新核心缺失时部分迁移仍可能成功
- target_behavior: 测试证明新模板包含完整结构，三个批准动作拒绝缺失内容，历史 completed fixture 仍可读取，Quick 无回归
- action: 先补充模板结构、Proposal/Spec/Plan 门禁、十二字段 Task、技能内容和 execute preflight 的失败断言
- implementation: 创建最小完整三件套 fixture 与逐项删减 fixture；断言错误精确指向章节或 Task 字段；保留原 REQ/BR/AC 和状态测试
- invariants: RED 失败必须来自本 Spec 的完备性缺口，不得通过修改旧测试预期掩盖回归
- verify: `node --test tests/project-docs.test.cjs tests/skill-process.test.cjs`
- acceptance: AC-03、AC-04、AC-05、AC-07、AC-08、AC-10、AC-11 在实现前出现预期失败，Quick 和旧状态测试继续通过
- done: 新增测试稳定复现模板、门禁和技能缺口，失败原因与目标行为一一对应

- [x] Task 1

### Task 2: 扩充三件套模板和确定性批准门禁

- files: `assets/templates/proposal.md`, `assets/templates/spec.md`, `assets/templates/plan.md`, `scripts/project-docs.cjs`
- symbols: `APPROVAL_PLACEHOLDER_PATTERN`, `validatePlanTasks`, `transitionDocument`
- read_first: 三个模板完整内容；脚本的 required/content gates、`sectionBody`、`emptySections`、`validatePlanTasks`、Proposal/Spec/Plan transition 分支
- depends_on: Task 1
- interfaces: Consumes RED fixtures；Produces change/spec/plan skills 使用的新文档骨架和 CLI 批准契约
- current_behavior: Proposal/Spec 缺少新核心，Plan 只有六字段；迁移门禁不检查新章节和 Plan 未决问题
- target_behavior: 新 change 原子创建增强三件套；Proposal/Spec/Plan 只有在新核心、十二字段 Tasks、契约映射和未决问题完整时才能推进状态
- action: 更新三个模板；为 Plan 定义十二字段批准集合；在 transition 分支加入 Proposal、Spec、Plan 新章节和未决问题检查，同时保持历史 validate 读取六字段 Plan
- implementation: 模板注释说明每节输出；Plan 提供固定核心、十类适用性表和十二字段 Task；错误消息输出缺失章节/字段；脚本不分析内容真实性
- invariants: 不改变状态集合、Quick 行为、三件套路径、REQ/BR/AC 覆盖和历史 completed 文档读取
- verify: `node --test tests/project-docs.test.cjs`
- acceptance: AC-03、AC-04、AC-05、AC-07、AC-08、AC-10 通过，CLI 保持 CommonJS 无依赖和确定性边界
- done: 新模板与迁移测试全部通过，脚本 diff 只包含结构、字段和状态门禁

- [x] Task 2

### Task 3: 让生命周期技能完整生成和执行三件套

- files: `skills/change/SKILL.md`, `skills/spec/SKILL.md`, `skills/plan/SKILL.md`, `skills/execute-plan/SKILL.md`, `skills/verify-plan/SKILL.md`, `commands/project-kit/change.md`, `commands/project-kit/spec.md`, `commands/project-kit/plan.md`, `commands/project-kit/execute.md`, `commands/project-kit/verify.md`
- symbols: 五个 SKILL.md 的 Required Inputs、Process、checklist、stop/handoff；五个 command entrypoints
- read_first: 五个技能完整内容；五个 command；新三件套模板；CR-005 Spec 的 BR-01 至 BR-14
- depends_on: Task 2
- interfaces: Consumes 新模板与 CLI 门禁；Produces 自动触发和显式 command 一致的文档生成、执行、验收流程
- current_behavior: 技能要求探索但未规定全部事实落盘；execute/verify commands 复制旧流程；spec 技能仍存在能力工具相关表述
- target_behavior: change/spec/plan 分别写全职责内容；plan 强制技术现状、条件设计和十二字段任务；execute 核对代码与 Plan；verify 核对实现与三件套；commands 只加载技能
- action: 按新模板重写相关流程、检查清单和停止条件；删除依赖生成工具能力的措辞；把 execute/verify command 收敛成薄路由
- implementation: change 固化决定与取舍；spec 固化术语和无歧义契约；plan 把探查结果写入文档；execute 校验 paths/symbols/call graph/current behavior/interfaces；verify 检查 Target、invariants、条件设计和契约映射
- invariants: 技能保持自包含，description 只写触发与路由，Proposal/Spec/Plan 职责不重叠，执行和验收不修改批准契约
- verify: `node --test tests/skill-process.test.cjs && node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: AC-01、AC-02、AC-06、AC-09、AC-11 通过，显式 commands 与技能行为一致
- done: 五个技能和 commands 无旧六字段、旧 STATE 路径、依赖原始对话或模糊补全的流程

- [x] Task 3

### Task 4: 更新生命周期说明和完整示例

- files: `project-lifecycle.md`, `README.md`, `AGENTS.md`, `CHANGELOG.md`, `examples/lifecycle-project/docs/changes/CR-001-支持按标签筛选待办/proposal.md`, `examples/lifecycle-project/docs/changes/CR-001-支持按标签筛选待办/spec.md`, `examples/lifecycle-project/docs/changes/CR-001-支持按标签筛选待办/plan.md`
- symbols: Full 文档角色、Spec/Plan 最低内容、脚本边界、Unreleased；lifecycle example 三件套
- read_first: 上述根文档相关章节；example 三件套；CR-005 Proposal/Spec/Plan
- depends_on: Task 2、Task 3
- interfaces: Consumes最终模板与技能规则；Produces 用户可见说明和一套可直接阅读的完整三件套示例
- current_behavior: 生命周期说明仍描述六字段 Task，示例未展示术语、技术现状、条件设计和十二字段 Task
- target_behavior: 文档统一说明三件套唯一上下文、固定核心和条件类别；示例完整体现 Proposal 决定、Spec 契约和 Plan 技术实施依据
- action: 更新 README/lifecycle/AGENTS/CHANGELOG，并将 lifecycle example 改写为新格式但保持原业务语义和 completed 状态
- implementation: 用职责表和紧凑示例说明规则；AGENTS 仅更新脚本机械门禁边界；CHANGELOG 记录行为变更；示例覆盖简单 Change 如何标记条件类别不适用
- invariants: 用户可见文档中文为主，不改历史 CR-001～CR-005 语义，不引入第四份文档或新目录
- verify: `node scripts/project-docs.cjs validate --root examples/lifecycle-project --json && node scripts/project-docs.cjs validate-plugin --root .`
- acceptance: AC-01、AC-02、AC-03、AC-04、AC-05、AC-07、AC-08、AC-12 在说明和示例中可直接观察
- done: 根说明、规则、CHANGELOG 和 example 与最终模板/技能一致，示例项目校验通过

- [x] Task 4

### Task 5: 完整验证并记录证据

- files: `docs/changes/CR-005-强化-full-三件套文档完备性/plan.md`, `.project-kit/state.md`
- symbols: CR-005 验收标准映射、执行记录、本地状态
- read_first: `AGENTS.md`、CR-005 三件套、`package.json`、实际 git diff
- depends_on: Task 1、Task 2、Task 3、Task 4
- interfaces: Consumes所有实现与测试结果；Produces verify-plan 可独立复核的证据和下一动作
- current_behavior: 任务尚未执行，验收映射只有计划命令
- target_behavior: AC-01 至 AC-12 和适用工程规范都有命令或文件级证据，Plan completed，本地下一动作指向 verify-plan CR-005
- action: 运行完整测试、三个相关技能 validator、插件校验、npm 打包预检、example 校验和 diff 审查；记录结果并收口 Plan 状态
- implementation: 逐项核对实际文件与本 Plan files；扫描旧六字段和禁止表述；记录历史仓库 validate 基线但不修改范围外旧文档
- invariants: 不把执行阶段旧输出当独立验收，不提交、不推送、不顺手修历史文档
- verify: `node --test tests/*.test.cjs && node scripts/project-docs.cjs validate-plugin --root . && node scripts/project-docs.cjs validate --root examples/lifecycle-project --json && npm pack --dry-run --json && git diff --check`
- acceptance: AC-01 至 AC-12 全部有新鲜执行证据，所有直接相关命令退出码为 0
- done: 五个 Task 全部勾选、Plan completed、state 指向 verify-plan CR-005

- [x] Task 5

## 验收标准映射
| Spec 契约（REQ/BR/AC） | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| REQ-01；BR-01、BR-02、BR-03、BR-04；AC-01、AC-02 | Task 3、Task 4 | PASS（2026-08-27）：skill process tests 及 README/lifecycle/示例静态审查 |
| REQ-02；BR-02、BR-03、BR-05、BR-13；AC-03 | Task 1、Task 2、Task 3、Task 4 | PASS（2026-08-27）：Proposal 模板、transition 失败测试和完整示例 |
| REQ-03；BR-02、BR-03、BR-06、BR-11、BR-13；AC-04 | Task 1、Task 2、Task 3、Task 4 | PASS（2026-08-27）：Spec 模板、transition 失败测试和完整示例 |
| REQ-04；BR-04、BR-07、BR-08、BR-11；AC-05、AC-06 | Task 1、Task 2、Task 3、Task 4 | PASS（2026-08-27）：Plan 结构测试、技能与示例文件级审查 |
| REQ-05；BR-09、BR-12、BR-13；AC-07 | Task 1、Task 2、Task 3、Task 4 | PASS（2026-08-27）：十类条件设计模板、技能、示例及测试 |
| REQ-06；BR-10、BR-11、BR-13；AC-08、AC-09 | Task 1、Task 2、Task 3 | PASS（2026-08-27）：十二字段 transition 测试、Plan/execute 技能及示例审查 |
| REQ-07；BR-03、BR-11、BR-13、BR-14；AC-10、AC-11、AC-12 | Task 1 至 Task 5 | PASS（2026-08-27）：39 项测试、五个 skill validator、plugin/example validate、pack/diff |

## Constitution 规范映射清单
| 规则来源 | 适用文件/任务 | 验证方式 | 最终验收 |
| --- | --- | --- | --- |
| AGENTS.md「技能纪律」 | Task 3 | frontmatter、description、自包含、docs 路径审查 | PASS：五个 `quick_validate.py` 和 `validate-plugin` 全部通过 |
| AGENTS.md「脚本边界」 | Task 1、Task 2 | 只增加确定性章节/字段/状态门禁 | PASS：CLI tests 通过；script diff 仅包含模板标记、章节/字段/状态门禁 |
| AGENTS.md「核心原则」 | Task 1 至 Task 5 | 不加第四文档、状态源、依赖、抽象或兼容迁移脚本 | PASS：scope diff 与 `rg` 确认无平台 adapter/package 改动，CR-005 仅三件套 |
| AGENTS.md「文档与语言」 | Task 3、Task 4 | 用户文档中文为主，技术标识保留英文 | PASS：模板、技能、README、生命周期和示例文件级审查通过 |
| AGENTS.md「变更纪律」 | Task 3 至 Task 5 | 更新 CHANGELOG，运行 `validate-plugin` | PASS：CHANGELOG 已记录；`validate-plugin` 0 errors / 0 warnings |

## 最终验证

- Spec 验收标准: 完整 Node tests、template/transition/skill assertions、example validate、定向静态扫描和完整示例审查。
- Constitution 规范: `validate-plugin`、相关 skill validators、`npm pack --dry-run --json`、`git diff --check` 和最小 diff 人工审查。

### 执行记录

- Task 1 RED：`node --test tests/project-docs.test.cjs tests/skill-process.test.cjs`，28 项中 8 项按预期失败；失败集中在新模板章节、批准门禁、十二字段 Task、技能技术基线和 command 薄路由，Quick 与原状态测试通过。
- Task 2 GREEN：`node --test tests/project-docs.test.cjs`，18/18 通过。
- Task 2 插件校验：`node scripts/project-docs.cjs validate-plugin --root . --json`，`valid: true`，12 skills、9 templates。
- Task 3 技能流程：`node --test tests/skill-process.test.cjs`，10/10 通过；五个受影响技能分别通过 `skill-creator` 的 `quick_validate.py`。
- Task 3 command 与插件校验：change/spec/plan/execute/verify 均为薄路由；`validate-plugin` 返回 `valid: true`。
- Task 4 示例校验：`node scripts/project-docs.cjs validate --root examples/lifecycle-project --json`，`valid: true`，6 documents、1 change。
- Task 4 表述扫描：README、生命周期、CHANGELOG、五个技能和示例中未发现旧六字段、能力工具相关表述或交接自检措辞。
- Task 5 完整测试：`node --test tests/*.test.cjs`，39/39 通过，0 failures。
- Task 5 完整门禁：`validate-plugin` 0 errors / 0 warnings；lifecycle example `valid: true`；`git diff --check` 通过。
- Task 5 打包预检：`npm pack --dry-run --json` 生成 `project-kit@0.3.3` 清单，36 entries，版本保持 0.3.3。
- Task 5 范围检查：实际改动仅覆盖本 Plan 的模板、脚本、测试、五个技能与 command、根说明、示例、CR-005 Plan 和本地 state；未修改平台 adapter、Quick 分流或 package 版本。
- 已知基线：`node scripts/project-docs.cjs validate --root . --json` 仍报告缺少根 `docs/constitution.md`/`blueprint.md`/`roadmap.md`、CR-001/002 历史 Plan 和旧 superpowers 文档占位；均不在 CR-005 范围内，本次未修改。

### 独立验收记录（2026-08-27）

- AC-01 PASS：静态审查确认 change/spec/plan 技能明确要求必要事实和决定写入三件套，不依赖原始对话。
- AC-02 PASS：README、生命周期说明和完整示例分别定义 Proposal 的背景与边界、Spec 的行为契约、Plan 的技术现实与实施依据。
- AC-03 PASS：Proposal 模板包含证据、范围、影响、已确认选择、未采用方向与原因；transition 测试证明空取舍或未决问题无法 accepted。
- AC-04 PASS：Spec 模板包含术语与业务对象、Current/Target、REQ/BR/AC、失败与禁止事项；缺少术语或存在未决问题时批准测试失败。
- AC-05 PASS：Plan 模板固定包含实施目标、入口与调用链、关键文件与 Symbol、Current Behavior、目标设计、全局不变量和非目标。
- AC-06 PASS：plan 技能和 lifecycle example 要求引用文件、Symbol、规则与参考实现时同时说明职责、相关行为和采用原因。
- AC-07 PASS：Plan 模板、plan 技能和示例均覆盖十类条件技术设计，并要求适用性、原因和对应设计或 Task。
- AC-08 PASS：模板包含十二字段；Plan transition 失败测试逐项报告缺少的七个新增字段。
- AC-09 PASS：plan 技能要求 Task acceptance 引用 REQ/BR/AC，并要求 depends_on、interfaces、名称和数据结构前后一致；完整示例提供对应映射。
- AC-10 PASS：Proposal/Spec/Plan transition tests 覆盖核心章节、空内容、占位符、未决问题、十二字段和契约覆盖拒绝行为。
- AC-11 PASS：execute-plan 技能与测试覆盖路径、Symbol、调用链、Current Behavior、interfaces 和 invariants 的实施前核对。
- AC-12 PASS：`node --test tests/*.test.cjs` 39/39；`validate-plugin` 和 lifecycle example 均 `valid: true`；五个技能 validator、`npm pack --dry-run --json`、`git diff --check` 全部通过。
- 兼容性 PASS：隔离临时项目验证历史六字段 `completed` Plan 仍可被 `validate` 读取，0 errors / 0 warnings。
- 范围 PASS：CR-005 目录仅 proposal/spec/plan；没有第四份文档、平台 adapter、依赖或 package 版本改动，打包版本保持 `0.3.3`。

## 非目标

- 不创建第四份 Full 文档或新状态源。
- 不改变 Quick/Full 分流、三件套路径或状态机。
- 不引入代码生成、语义评分、hook、eval、外部依赖或平台 adapter 修改。
- 不批量补写历史 completed Change。
- 不在 Plan 中复制完整实现代码或 diff。

## 未决问题

无
