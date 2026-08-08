---
title: F-M1-02 标记完成与持久化 验收记录
status: passed
feature: F-M1-02
verified_at: 2026-08-08
implementation_ref: "examples/lifecycle-sim 工作树 @ 2026-08-09"
spec_hash: cf210b1edae15a652ba4c1f039fd99a0fbd898fde66f31f550bdebcfaae10630
---

# F-M1-02 标记完成与持久化 验收记录

## 验证环境

Node v22.18.0, examples/lifecycle-sim 工作树 @ 2026-08-09。

## 验收证据

### AC1: done 后 list 显示 [x] — pass

```bash
$ node todo.js done 67fb76fe-abdf-48da-962f-ddb44a3f8464
已完成: 买牛奶
$ node todo.js list
[x] 67fb76fe 买牛奶 (high) #home
```

### AC2: 重启后完成状态保持 — pass

```bash
$ node todo.js list   # 新进程
[x] 67fb76fe 买牛奶 (high) #home
```

### AC3: 不存在 id 报错且数据不变 — pass

```bash
$ node todo.js done no-such-id
待办不存在: no-such-id   # 退出码 1
```

## Plan 完整性

计划 2 个任务完成;实际修改与计划一致。

## 回归与边界检查

`node --test test/todo-store.test.js` → 9/9 通过。

## 未授权范围检查

无越界修改。

## 失败与阻塞

遗留缺陷(短 id 无法 done)不在本 Spec 验收范围内,已记录,将转 BUG 处理。

## 结论

AC1/AC2/AC3 全部 pass。遗留缺陷单独走 bug 流程。
