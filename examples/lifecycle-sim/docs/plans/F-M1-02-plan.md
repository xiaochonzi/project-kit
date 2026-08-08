---
title: F-M1-02 标记完成与持久化 实现计划
status: completed
feature: F-M1-02
wave: 1
depends_on: []
files_modified:
  - examples/lifecycle-sim/todo.js
  - examples/lifecycle-sim/test/todo-store.test.js
requirements:
  - REQ-003
---

# F-M1-02 标记完成与持久化 实现计划

## 实现策略

复用 F-M1-01 已交付的 todo-store.markDone 接口与 CLI done 分支,补充 done 命令的错误路径与幂等测试。不引入新依赖。

## Must-haves

### Truths

- markDone 接口已在 F-M1-01 交付并测试(done 状态持久化)
- CLI done 分支已实现(精确 id 匹配)

### Artifacts

- examples/lifecycle-sim/todo.js(done 分支)
- examples/lifecycle-sim/test/todo-store.test.js(done 相关测试)

### Key Links

- Spec: docs/specs/M1/F-M1-02-标记完成与持久化.md
- 依赖: F-M1-01(已 verified)

## 影响与风险

- 无新文件;改动集中在 todo.js 与测试
- 风险: done 对不存在 id 报错且不修改数据

## 数据与调用流

done <id> → markDone(id) → 更新 done=true → save(todo.json)

## Tasks

### Task 1: 补 done 幂等与错误路径测试

- files: examples/lifecycle-sim/test/todo-store.test.js
- read_first: F-M1-01 的测试文件
- action: 增加测试:重复 markDone 幂等不报错;markDone 不存在 id 抛错
- verify: node --test test/todo-store.test.js
- acceptance: 新测试通过,全部测试保持全绿
- done: 测试通过

### Task 2: CLI done 命令验证

- files: examples/lifecycle-sim/todo.js
- read_first: 无
- action: 确认 done 分支解析 id 并调用 markDone,输出"已完成: <title>"
- verify: node todo.js done <id> && node todo.js list
- acceptance: list 中该项显示 [x];重启后保持
- done: CLI 验证通过

## 验收标准映射

| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| AC1: done 后 list 显示 [x] | Task 2 | node todo.js done <id> && node todo.js list |
| AC2: 重启后完成状态保持 | Task 2 | 新进程 list 仍显示 [x] |
| AC3: 不存在 id 报错且数据不变 | Task 1 | markDone 测试 |

## 最终验证

- node --test test/todo-store.test.js
- node todo.js done <id> && node todo.js list
- 新进程 node todo.js list

## 非目标

- 撤销完成、完成统计
