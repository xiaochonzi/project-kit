---
change: CR-001
title: 支持按标签筛选待办
status: completed
created_at: 2026-08-12
---

# 支持按标签筛选待办 实现计划

## 实施目标

实现 REQ-01 和 BR-01～BR-03，使查询函数与 CLI 同时支持可选标签 ID，并用 AC-01～AC-03 证明原行为不回归。

## 实现策略

先在纯列表函数中增加可选 `tagId` 并完成单元测试，再把 CLI 的 `--tag` 原样传入。采用现有同步数组过滤，不新增查询层或标签服务；后者会扩大本 Change 范围。

## 技术设计

### 当前技术现状

#### 系统入口与调用链

`todo list` → `parseArgs`（解析命令）→ `listTodos(todos)`（返回完整数组）→ `renderTodos`（渲染结果）。当前链路没有标签输入，筛选应放在列表函数而不是渲染层。

#### 关键文件与符号

| 文件 | Symbol | 当前职责 | 本 Change 使用原因 |
| --- | --- | --- | --- |
| `src/list.js` | `listTodos` | 返回待办列表 | 业务筛选的唯一落点，便于 CLI 和其他调用方复用 |
| `src/cli.js` | `parseArgs`、list 分支 | 解析参数并调用列表函数 | 暴露 `--tag` 并传入稳定标签 ID |
| `test/list.test.js` | list tests | 验证列表行为 | 直接覆盖 BR-01～BR-03 |
| `test/cli.test.js` | CLI list tests | 验证命令参数与输出 | 证明入口到列表函数的接口接线正确 |

#### Current Behavior

`listTodos(todos)` 不接受筛选参数，CLI list 分支也不读取 `--tag`，因此所有调用都得到完整数组。

### 目标技术设计

目标调用链为 `todo list --tag <id>` → `parseArgs` 得到可选 `tagId` → `listTodos(todos, { tagId })` 执行精确包含判断 → `renderTodos` 沿用现有渲染。空值不筛选，未知 ID 得到空数组。

#### Current → Target 对照

| Current | Target |
| --- | --- |
| `listTodos(todos)` 始终返回全部 | 可选 `tagId`；有值精确筛选，无值保持全部 |
| CLI list 没有标签参数 | `--tag` 原样传给列表函数 |
| 未知标签无法表达 | 返回空数组并正常渲染空态 |

## 全局不变量

- 未筛选列表的内容和顺序保持不变。
- 标签比较只使用稳定 ID 精确匹配。
- 渲染层不承担筛选业务逻辑。
- 不改变待办或标签数据结构。

## 条件技术设计

| 类别 | 是否适用 | 原因 | 对应设计或 Task |
| --- | --- | --- | --- |
| 状态机 | 否 | 查询不创建或迁移状态 | 无 |
| 错误策略 | 是 | 空值和未知 ID 必须有确定结果 | Task 1 |
| 并发与幂等 | 否 | 纯同步只读数组查询 | 无 |
| 数据与事务 | 否 | 不写数据且不改变模型 | 无 |
| API / 事件 | 是 | CLI `--tag` 是用户输入契约 | Task 2 |
| 配置 | 否 | 不新增配置项 | 无 |
| 兼容与迁移 | 是 | 省略参数必须保持原行为 | Task 1、Task 2 |
| 权限与安全 | 否 | 不改变可见范围或权限检查 | 无 |
| 可观测性 | 否 | 不新增后台任务或运行指标 | 无 |
| 参考实现 | 是 | 沿用现有 `listTodos` 纯函数和 CLI 参数解析模式 | Task 1、Task 2 |

## Tasks

### Task 1: 实现列表函数的可选标签筛选

- files: `src/list.js`, `test/list.test.js`
- symbols: `listTodos`；list unit tests
- read_first: `src/list.js` 的 `listTodos`；`test/list.test.js` 的完整列表与顺序测试
- depends_on: 无
- interfaces: Consumes `todos` 和可选 `{ tagId }`；Produces 保序待办数组
- current_behavior: `listTodos` 只接收待办数组并原样返回完整结果
- target_behavior: 非空 `tagId` 精确筛选；省略或空值返回完整有序列表；未知 ID 返回空数组
- implementation: 先增加 AC-01～AC-03 的失败测试，再给 `listTodos` 增加可选参数并使用 `tagIds.includes(tagId)` 过滤
- invariants: 不修改输入数组；不改变未筛选顺序；没有 `tagIds` 的待办视为不匹配
- verify: `node --test test/list.test.js`
- acceptance: REQ-01、BR-01、BR-02、BR-03、AC-01、AC-02、AC-03 全部通过
- done: list tests 0 failures，三种输入得到 Spec 定义的唯一结果

- [x] Task 1

### Task 2: 把 CLI 标签参数接入列表函数

- files: `src/cli.js`, `test/cli.test.js`
- symbols: `parseArgs`；list command branch；CLI list tests
- read_first: `src/cli.js` 的参数解析和 list 分支；Task 1 完成后的 `listTodos` 接口；`test/cli.test.js`
- depends_on: Task 1
- interfaces: Consumes CLI 可选 `--tag <tag-id>`；Produces `listTodos(todos, { tagId })` 调用和现有渲染输出
- current_behavior: list 分支不读取标签参数，始终调用未筛选列表
- target_behavior: `--tag` 值原样传入；省略参数时保持原调用结果；未知 ID 正常显示空态
- implementation: 增加 CLI 三种输入的失败测试，扩展参数解析并把 `tagId` 传给 `listTodos`
- invariants: 不改变其他命令或列表渲染；不在 CLI 重复实现筛选
- verify: `node --test test/cli.test.js test/list.test.js`
- acceptance: REQ-01、BR-01、BR-02、BR-03、AC-01、AC-02、AC-03 从 CLI 入口全部可观察
- done: CLI 与 list tests 0 failures，调用参数和输出符合接口契约

- [x] Task 2

## 验收标准映射

| Spec 契约（REQ/BR/AC） | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| REQ-01；BR-01；AC-01 | Task 1、Task 2 | list + CLI 精确筛选测试 |
| BR-02；AC-02 | Task 1、Task 2 | 未传和空标签回归测试 |
| BR-03；AC-03 | Task 1、Task 2 | 未知标签空结果测试 |

## Constitution 规范映射清单

| 规则来源 | 适用文件/任务 | 验证方式 | 最终验收 |
| --- | --- | --- | --- |
| `docs/constitution.md` 测试原则 | Task 1、Task 2 | 先 RED，再运行对应 Node tests | 两组测试 0 failures |
| `docs/constitution.md` 最小改动原则 | 所有实现文件 | diff 仅覆盖列表函数、CLI 接线和测试 | 文件范围检查通过 |

## 最终验证

- [x] `node --test test/list.test.js` → 0 failures。
- [x] `node --test test/cli.test.js test/list.test.js` → 0 failures。
- [x] AC-01～AC-03 的标签匹配、未筛选和未知标签结果均与 Spec 一致。
- [x] 实际修改仅覆盖 Plan 声明的四个文件。

## 非目标

不实现标签管理、名称匹配、数据迁移、权限变化、后台任务或新配置。

## 未决问题

无
