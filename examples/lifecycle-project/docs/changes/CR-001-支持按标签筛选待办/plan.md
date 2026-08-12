---
change: CR-001
title: 支持按标签筛选待办
status: completed
created_at: 2026-08-12
---

# 支持按标签筛选待办 实现计划

## 实现策略

在待办列表模块增加标签筛选参数，命令行入口增加 `--tag` 选项。

## Tasks

### Task 1: 添加标签筛选逻辑

- files: src/list.js, test/list.test.js
- read_first: src/list.js
- action: 增加 tag 参数过滤待办列表
- verify: node --test test/list.test.js
- acceptance: 按标签过滤返回正确列表
- done: 测试通过

- [x] Task 1

## 验收标准映射
| Spec 验收标准 | 覆盖任务 | 最终验证 |
| --- | --- | --- |
| 选择标签后只显示该标签待办 | Task 1 | node --test 通过 |
| 清除标签后恢复完整列表 | Task 1 | node --test 通过 |
| 无匹配标签显示空列表 | Task 1 | node --test 通过 |

## 最终验证

- [x] node --test test/list.test.js → 0 failures
- [x] 空标签不筛选 → 全量列表

## 非目标

标签管理。
