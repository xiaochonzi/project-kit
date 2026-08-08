---
title: F-M1-01 添加与列出待办 实现计划
status: completed
feature: F-M1-01
wave: 1
depends_on: []
files_modified:
  - examples/lifecycle-sim/todo.js
  - examples/lifecycle-sim/todo-store.js
  - examples/lifecycle-sim/test/todo-store.test.js
requirements:
  - REQ-001
  - REQ-002
  - REQ-004
  - REQ-005
---

# F-M1-01 添加与列出待办 实现计划

## 实现策略

单文件 CLI 入口(todo.js) + 独立数据模块(todo-store.js),数据存 todo.json。测试用 node:test 覆盖数据层。不引入第三方依赖。不采用:数据库方案(单用户本地场景过重)、yaml 存储(解析器依赖)。

## Must-haves

### Truths

- todo.json 是唯一数据源
- 数据层接口: load / save / add / list
- 待办字段: id, title, priority, tags, done, created_at

### Artifacts

- examples/lifecycle-sim/todo.js(CLI 入口)
- examples/lifecycle-sim/todo-store.js(数据层)
- examples/lifecycle-sim/test/todo-store.test.js(单元测试)

### Key Links

- Spec: docs/specs/M1/F-M1-01-添加与列出待办.md
- 准则: docs/constitution.md

## 影响与风险

- 无既有代码,全新文件
- 风险: todo.json 损坏处理,用 try/catch 拒绝启动

## 数据与调用流

add → todo-store.add → save(todo.json);list → todo-store.list → 排序输出

## Tasks

### Task 1: 数据层 load/save

- files: examples/lifecycle-sim/todo-store.js, examples/lifecycle-sim/test/todo-store.test.js
- read_first: docs/constitution.md(测试与验证原则)
- action: 实现 load()(文件不存在返回 [];JSON 损坏抛错)与 save(todos)(原子写:先写临时文件再 rename)
- verify: node --test test/todo-store.test.js
- acceptance: 测试通过;load 对损坏 JSON 抛错
- done: 数据层测试全绿

### Task 2: 数据层 add/list

- files: examples/lifecycle-sim/todo-store.js, examples/lifecycle-sim/test/todo-store.test.js
- read_first: Task 1 产物 todo-store.js
- action: 实现 add({title, priority, tags})(生成 id/created_at,done=false)与 list()(按 priority high>medium>low 排序,同优先级按 created_at)
- verify: node --test test/todo-store.test.js
- acceptance: add 后 list 返回含新项且排序正确;空数据返回 []
- done: 数据层测试全绿

### Task 3: CLI add/list 命令

- files: examples/lifecycle-sim/todo.js
- read_first: todo-store.js 接口, docs/specs/M1/F-M1-01-添加与列出待办.md 验收标准
- action: 解析 argv(add <title> --priority --tags;list),调用数据层,格式化输出;空列表输出"暂无待办";标题为空或 priority 非法报错退出码 1
- verify: node --check todo.js && node todo.js add "买牛奶" --priority high --tags home && node todo.js list
- acceptance: add 输出确认;list 显示排序后的待办;空数据 list 输出"暂无待办"退出码 0
- done: CLI 冒烟通过

### Task 4: 持久化与重启验证

- files: examples/lifecycle-sim/test/todo-store.test.js
- read_first: 无
- action: 增加测试:add 后重新 load,数据仍在
- verify: node --test test/todo-store.test.js
- acceptance: 持久化测试通过
- done: 全部测试通过

## 验收标准映射

| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| AC1: add 后 list 能看到该待办 | Task 2, 3 | node todo.js add "买牛奶" && node todo.js list |
| AC2: 按优先级 high>medium>low 排序 | Task 2, 3 | 添加 3 条不同优先级后 list 输出顺序 |
| AC3: 重启进程后数据仍在 | Task 4 | add 后重新 node todo.js list 数据仍在 |
| AC4: 空数据输出"暂无待办"退出码 0 | Task 3 | 清空 todo.json 后 list |

## 最终验证

- node --test test/todo-store.test.js
- node --check todo.js
- node todo.js add "买牛奶" --priority high --tags home && node todo.js list
- node todo.js list(空数据) → "暂无待办",退出码 0
- 手动重启进程验证持久化

## 非目标

- done 命令(属 F-M1-02)
- 标签筛选
