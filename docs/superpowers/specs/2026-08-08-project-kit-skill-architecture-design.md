---
date: 2026-08-08
status: approved
topic: project-kit 多技能体系架构
---

# project-kit 多技能体系架构设计

## 1. 背景与目标

project-kit 当前是单一 skill(`SKILL.md` 入口 + 内部 10 模式路由 + 中央 workflows/references/templates + CJS 脚本)。目标是将其重构为**可持续复用的多 skill 体系**:10 个可独立触发的生命周期技能,供团队内部项目复用。

成功标准:

- 10 个技能各可独立触发(description 触发词准确)。
- 规则只有一份(单一事实来源),技能不复制共享规则。
- 机械门禁由脚本校验,语义判断由文档 + AI 承担(混合门禁)。
- 仓库自身用这套体系管理自己(吃狗粮)。
- 团队可通过 `claude plugin install` 一次性安装。

## 2. 研究结论与归因

参考三个开源项目(均为 MIT):

| 项目 | 形态 | 中央承载 | 借鉴点 |
|---|---|---|---|
| gsd-core | 74 个薄壳技能(1-2KB SKILL.md)| 中央文档三件套(workflows/references/templates)| 薄壳技能 + 中央共享结构(方案 A 的实践背书) |
| spec-superflow | 9 个 ~100 行薄壳技能 | CLI + yaml 事实源 + templates + docs | 技能内嵌 Validation Checklist;CLI 校验门禁;决策点路由 |
| superpowers | 14 个厚技能(64-679 行) | 无中央,规则挂技能 | description 只写触发时机;HARD-GATE;Common Rationalizations 表;REQUIRED SUB-SKILL 锁技能链 |

共同模式:SKILL.md 只做路由与触发;流程细节下沉;防跳步需要结构化机制;跨会话状态落盘;吃自己的狗粮。

## 3. 关键决策

| # | 决策 | 结论 |
|---|---|---|
| 1 | 受众范围 | 团队内部复用:中文文档、Claude Code 为主、CHANGELOG + 轻量版本 |
| 2 | 技能粒度 | 按生命周期阶段拆 10 个技能 |
| 3 | 门禁承载 | 混合:脚本管机械门禁,文档 + AI 管语义判断 |
| 4 | 维护方式 | 自举 + 轻量测试(examples 兼作测试数据) |
| 5 | 组织形态 | 方案 A:中央共享,技能薄壳(gsd-core 与 spec-superflow 双重背书) |
| 6 | 写法移植 | 薄壳 SKILL.md 吸收 Validation Checklist(spec-superflow)+ 防跳步写法(superpowers) |
| 7 | 脚本 | 扩展为机械门禁校验器;文档仍是唯一事实源,不引入 yaml 状态 |

## 4. 目标目录结构

### 4.1 仓库侧(plugin)

```text
project-kit/                          # Claude Code plugin
├── plugin.json                       # 插件清单(name、version、skills 发现)
├── README.md                         # 团队安装说明
├── AGENTS.md                         # 仓库自身开发约束(吃狗粮接入层)
├── CHANGELOG.md                      # 版本记录
├── skills/                           # 10 个技能,每个目录只放 SKILL.md(薄壳)
│   ├── init/SKILL.md
│   ├── constitution/SKILL.md
│   ├── brief/SKILL.md
│   ├── refine/SKILL.md
│   ├── plan/SKILL.md
│   ├── execute-plan/SKILL.md
│   ├── verify-plan/SKILL.md
│   ├── change/SKILL.md
│   ├── bug/SKILL.md
│   └── status/SKILL.md
├── shared/                           # 中央事实层(唯一一份)
│   ├── lifecycle.md                  # project-lifecycle.md 总纲(保留全文)
│   ├── workflows/                    # 11 个流程(流程唯一位置)
│   ├── rules/                        # 13 个规则(原 references/)
│   └── templates/                    # 16 个模板(原 assets/templates/)
├── scripts/project-docs.cjs          # 扩展机械门禁校验;模板读取路径改 shared/templates/
├── agents/openai.yaml                # 保留(轻量多平台适配)
├── examples/                         # 示例产物(真实工件兼作测试数据)
├── tests/                            # 轻量测试(脚本冒烟 + 示例产物校验)
└── docs/                             # 仓库自身文档(init 生成,吃狗粮)
```

技能引用使用相对路径 `../shared/workflows/plan.md`、`../shared/rules/…`(plugin 安装后结构不变,引用不破)。

### 4.2 目标项目侧(init 技能产物)

`project-lifecycle.md` 第 13 节已定义的目录,不变:

```text
<project>/
├── AGENTS.md
└── docs/
    ├── README.md  STATE.md  system-design.md  roadmap.md  requirements.md
    ├── briefs/  changes/  milestones/  specs/  plans/  fix/  research/  reference/
```

## 5. 技能 SKILL.md 写法规范(薄壳模板)

统一骨架:

```markdown
---
name: <skill-name>
description: <触发时机 + 路由;只写触发条件,不写流程;Use when…>
---

# <技能名>

## 目的
<1-2 句>

## HARD-GATE
> <全大写不可违反的门禁,每技能一条>

## 必读
- `shared/workflows/<name>.md`          ← 完整流程(唯一位置)
- `shared/rules/<相关规则>.md`
- 目标仓库:<Constitution、STATE、Blueprint、Spec、ADR>

## 流程要点
<压缩为 5-8 步;细节在 workflow>

## Validation Checklist(交付前逐项核对)
<内嵌紧凑产物检查清单 + 脚本 validate 通过>

## 停止条件
<列表>

## Common Rationalizations(防跳步)
| 借口 | 现实 |
| --- | --- |
| <4-6 条> | |

## REQUIRED SUB-SKILL
<本技能完成后唯一后继技能>
```

写法要点:

1. description 只写触发时机 + 前置条件不满足时路由回上游技能(spec-superflow 式)。
2. HARD-GATE:全大写不可违反,每技能一条(plan=无已批准 Spec 不计划;execute=无批准 Plan 不执行;verify=无新鲜证据不宣称完成)。
3. Validation Checklist:内嵌紧凑产物检查清单,与脚本 `validate` 联动。
4. Common Rationalizations 表:逐条反驳跳步借口,每技能 4-6 条。
5. REQUIRED SUB-SKILL:锁死技能链后继,形成流水线(plan→execute-plan→verify-plan)。
6. 流程细节仍在 `shared/workflows/`,SKILL.md 不复制流程。

## 6. shared/ 迁移细节

| 来源 | 迁往 | 引用更新 |
|---|---|---|
| `workflows/*.md`(11) | `shared/workflows/` | `../references/x.md` → `../rules/x.md` |
| `references/*.md`(13) | `shared/rules/` | 相互引用改 `../rules/` |
| `assets/templates/*.md`(16) | `shared/templates/` | 无内部引用 |
| `project-lifecycle.md` | `shared/lifecycle.md` | 无仓库内引用 |
| `agents/openai.yaml` | 原地保留 | — |
| 根 `SKILL.md` | 删除,内容分布到 10 技能 + README | 模式路由表 → 各技能 description |
| `scripts/project-docs.cjs` | 原地 | 模板路径改 `shared/templates/` |

## 7. 脚本混合门禁

### 机械可判定(脚本强制,扩展 validate)

- 状态迁移合法性(已有 `transition`)。
- ID 唯一性/格式、frontmatter 必填字段(扩展 `validate`,按 document-schema 规则)。
- REQ↔Feature 覆盖(已有 `coverage`)。
- Feature 依赖环(扩展 `validate`)。
- 文档链接有效性(扩展 `validate`)——多技能拆分后刚需,断链直接失效。
- Spec 验收标准 ↔ Plan 任务映射(扩展 `validate`)。

### 语义判断(文档 + AI 技能门禁)

- 验收标准是否真实满足;范围是否扩大;用户决策点。

### 技能 ↔ 脚本调用映射

| 技能 | 脚本调用 |
|---|---|
| init | `init` |
| brief | `new`、`validate` |
| refine | `validate` |
| plan | `context plan`、`validate`(含 Plan↔Spec 映射) |
| execute-plan | `context execute`、`transition` |
| verify-plan | `transition`、`validate` |
| change | `new`、`coverage`、`validate` |
| bug | `validate` |
| status | `status`、`coverage`、`next` |

边界纪律:脚本只读文档、校验文档、做确定性迁移,不把状态写进 yaml/json——文档是唯一事实源,脚本是校验器。

## 8. 吃狗粮与维护

时序:

1. 阶段 1(本次):设计 → writing-plans → 实施迁移与 10 技能。
2. 阶段 2:用 init 技能初始化仓库自身 docs/(技能的第一次真实使用)。
3. 阶段 3:自身需求走 brief → plan → execute → verify;变更走 change 技能。

测试机制:

- `examples/`:每技能 1 份真实产物示例,兼作测试数据与文档;`validate` 对示例运行通过 = 脚本不回归。
- `tests/`:脚本冒烟测试。
- 自举验证:新技能或重大行为改动 → 用示例项目走一遍自身流程,结果记入 CHANGELOG。

版本:CHANGELOG.md + 轻量 semver,`plugin.json` version 同步;技能行为变更(门禁、流程、路由)必须记录。

## 9. 明确不引入

- 不引入 GSD 的 capability.json 运行时适配器(团队 Claude Code 为主;`agents/openai.yaml` 保留作轻量适配)。
- 不把状态写进 yaml/json 事实源(文档是唯一事实源)。
- 不引入 eval 门禁、hooks 强制注入(初期靠技能链,后期按需)。
- 不复制 superpowers 的技能命名和流程内容(保留 project-kit 自己的文档模型)。

## 10. 迁移步骤(实施顺序)

1. 创建 `shared/` 三目录,迁移 assets/templates、references、workflows,更新内部相对链接。
2. 迁移 `project-lifecycle.md` → `shared/lifecycle.md`。
3. 删除根 `SKILL.md`,写 `README.md`(安装说明 + 技能导航)。
4. 写 10 个技能 `SKILL.md`(按第 5 节模板;description、HARD-GATE、必读、流程要点、Validation Checklist、停止条件、Rationalizations、REQUIRED SUB-SKILL)。
5. 扩展 `scripts/project-docs.cjs`:模板路径 + validate 新维度(链接、frontmatter、依赖环、Plan↔Spec 映射)。
6. 创建 `plugin.json`、`CHANGELOG.md`、`AGENTS.md`。
7. 创建 `examples/` 示例产物(每技能 1 份),`tests/` 冒烟测试。
8. 用 init 技能初始化仓库自身 `docs/`(吃狗粮第一役)。
9. 全量校验:validate 通过、技能引用链接有效、脚本自检通过。
