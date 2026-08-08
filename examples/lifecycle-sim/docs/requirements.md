---
version: 0.1
status: draft
updated_at: 2026-08-09
---

# Requirements

## 状态说明

accepted = 已确认并进入交付;deferred = 明确暂缓。

## 需求清单

### REQ-001: 用户可以添加待办事项

- statement: 用户可以通过 CLI 添加待办,包含标题、优先级和标签
- type: functional
- priority: must
- status: accepted
- source: BRIEF-001
- milestones: M1
- features: F-M1-01
- acceptance_hint: 运行 add 后,该待办出现在列表输出中

### REQ-002: 用户可以列出待办并按优先级排序

- statement: 列表按优先级 high > medium > low 排序,显示完成状态
- type: functional
- priority: must
- status: accepted
- source: BRIEF-001
- milestones: M1
- features: F-M1-01
- acceptance_hint: 添加不同优先级待办后,list 输出按优先级排序

### REQ-003: 用户可以标记待办完成

- statement: 完成状态持久化,重启后仍为已完成
- type: functional
- priority: must
- status: accepted
- source: BRIEF-001
- milestones: M1
- features: F-M1-02
- acceptance_hint: done 命令后,list 显示 [x]

### REQ-004: 待办数据持久化到本地文件

- statement: 所有待办保存到 todo.json,重启不丢失
- type: functional
- priority: must
- status: accepted
- source: BRIEF-001
- milestones: M1
- features: F-M1-01
- acceptance_hint: 重启进程后 list 仍显示之前添加的待办

### REQ-005: 空列表时给出友好提示

- statement: 没有待办时 list 输出"暂无待办",不抛异常
- type: functional
- priority: must
- status: accepted
- source: BRIEF-001
- milestones: M1
- features: F-M1-01
- acceptance_hint: 空数据时 list 退出码为 0 且输出提示

### REQ-006: 用户可以按标签筛选待办

- statement: list 命令支持 --tag 参数,只显示包含指定标签的待办
- type: functional
- priority: should
- status: accepted
- source: CR-001
- milestones: M2
- features: F-M2-01
- acceptance_hint: list --tag home 只显示 home 标签的待办

## 覆盖摘要

全部 accepted REQ 映射到 M1 的 F-M1-01 / F-M1-02。

## Deferred

- 提醒功能(REQ 未创建,来自 BRIEF 未决问题)。

## Rejected

无。

## 修订记录

- 2026-08-09: 初版。
