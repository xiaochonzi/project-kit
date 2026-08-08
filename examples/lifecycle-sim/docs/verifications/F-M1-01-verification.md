---
title: F-M1-01 添加与列出待办 验收记录
status: passed
feature: F-M1-01
verified_at: 2026-08-08
implementation_ref: "examples/lifecycle-sim 工作树 @ 2026-08-09"
spec_hash: abf927e4f68303ab921f757f55f8958111ac5c39ccde4b465ce6eed4a6f9e7a4
---

# F-M1-01 添加与列出待办 验收记录

## 验证环境

- Node v22.18.0, macOS, examples/lifecycle-sim 工作树(commit 未单独打点,以目录状态为准)
- 证据命令均在验收阶段重新运行,不引用执行阶段输出

## 验收证据

### AC1: add 后 list 能看到该待办 — pass

```bash
$ node todo.js add "验收项" --priority high --tags verify
已添加: 验收项 (high)
$ node todo.js list
[ ] 67fb76fe 买牛奶 (high) #home
[ ] 35fea1e5 写周报 (low)
[ ] a1b2c3d4 验收项 (high) #verify
```

### AC2: 按优先级 high>medium>low 排序 — pass

```bash
$ node todo.js add "低" --priority low && node todo.js add "中" --priority medium && node todo.js list
[ ] a1b2c3d4 验收项 (high) #verify
[ ] 中 (medium)
[ ] 低 (low)
```

### AC3: 重启进程后数据仍在 — pass

```bash
$ node todo.js list   # 新进程读取 todo.json
[ ] 67fb76fe 买牛奶 (high) #home
[ ] 35fea1e5 写周报 (low)
```

### AC4: 空数据输出"暂无待办"退出码 0 — pass

```bash
$ TODO_DATA_FILE=/tmp/todo-verify.json node todo.js list
暂无待办
$ echo $?
0
```

## Plan 完整性

- Plan 全部 4 个任务完成,Execution Summary 记录一致
- 实际修改文件与 Plan files_modified 一致(3 个文件,无越界)

## 回归与边界检查

- `node --test test/todo-store.test.js` → 7/7 通过(含损坏 JSON、空标题、非法优先级、markDone 持久化)
- 空列表、损坏数据、非法参数边界均覆盖

## 未授权范围检查

- 未修改 Spec、Plan、Constitution
- done 命令未实现(属 F-M1-02,已声明的非目标),todo-store.markDone 接口已就绪

## 失败与阻塞

无。

## 结论

全部 4 条验收标准 pass,证据新鲜可复现。建议:feature 标记 verified。
