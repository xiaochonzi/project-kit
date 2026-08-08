---
title: F-M1-02 标记完成与持久化 执行记录
status: completed
feature: F-M1-02
plan: F-M1-02
started_at: 2026-08-09
completed_at: 2026-08-08
---

# F-M1-02 标记完成与持久化 执行记录

## 执行范围

按 F-M1-02-plan 补 done 命令测试并验证 CLI done 命令。

## Task Results

- Task 1(幂等与错误路径测试):完成。新增 2 个测试(markDone 幂等、不存在 id 抛错且数据不变),9/9 通过。
- Task 2(CLI done 验证):部分完成。完整 UUID 可完成待办并持久化;发现遗留缺陷:list 显示短 id(前 8 位),但 done 需完整 UUID,短 id 无法完成(见遗留问题,转 BUG 处理)。

## 实际修改文件

- examples/lifecycle-sim/test/todo-store.test.js(新增 2 测试)

## 验证记录

- `node --test test/todo-store.test.js` → 9/9 通过
- `node todo.js done <完整UUID>` → 已完成: 买牛奶
- `node todo.js list` → [x] 标记正确;新进程保持

## 与计划的偏差

- CLI done 短 id 匹配缺陷未在本次修复(列入遗留,由 bug 环节处理)。

## 遗留问题

- list 显示短 id,但 done 命令精确匹配完整 UUID:用户复制短 id 无法完成待办。→ BUG 待创建。

## 最终结果

验收标准 AC1/AC2 可用完整 id 满足;AC3(不存在 id 报错)满足。短 id 匹配缺陷记录为遗留,待 bug 修复。
