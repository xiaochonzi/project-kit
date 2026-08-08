---
version: 0.1
status: draft
updated_at: 2026-08-09
---

# Project Constitution

## 产品原则

- 优先保证核心闭环(添加→列出→完成)可用,再做增强。
- CLI 输出必须简洁、可读、可被脚本解析(每行一个稳定格式)。

## 架构原则

- 单文件 CLI 入口 + 独立数据模块,不引入第三方运行时依赖。
- 数据层与命令层分离,便于测试。

## 模块与进程边界

- `todo.js` 命令层:解析参数、调用数据层、输出结果。
- `todo-store.js` 数据层:读写 `todo.json`,负责持久化与校验。

## 数据权威与一致性

- `todo.json` 是唯一数据源,单进程读写。
- 写入采用"读-改-写全量"策略,启动时校验格式,损坏时拒绝启动并提示。

## 类型与接口原则

- 待办对象固定字段: id, title, priority(high|medium|low), tags[], done, created_at。
- 数据层接口: load(), save(todos), add(todo), list(), markDone(id)。

## 安全与隐私原则

- 不收集任何用户数据,不联网。

## 测试与验证原则

- 使用 `node:test` 编写单元测试,覆盖数据层全部接口。
- 每次变更必须运行: `node --test` 与 `node --check <file>`。
- 修复 bug 必须先有复现测试。

## 文档与追踪原则

- 每个功能对应 Feature Spec 与验收标准,实现必须逐条映射。
- 状态变更通过 `node scripts/project-docs.cjs transition` 完成。

## 依赖管理原则

- 不引入运行时依赖;开发期仅使用 Node 内置能力。

## 禁止事项

- 禁止在测试外输出调试信息。
- 禁止静默修改 todo.json 结构而不迁移。

## 准则变更流程

- 准则变更需通过 Change Request 记录并获用户批准。

## 修订记录

- 2026-08-09: 初版。
