# 项目拆解规则

## 目录

1. 文档层级
2. Milestone 规则
3. Feature 规则
4. 多迭代 Capability
5. 依赖与顺序
6. 细化深度

## 1. 文档层级

```text
Brief → Blueprint → Roadmap → Milestone → Feature Spec → Implementation Plan
                          ↘ Capability（仅用于跨多个 Milestone 的能力）
Change Request → Feature / Capability / ADR
Bug → Fix → Bug Resolution
```

- Brief 保存原始讨论，不承担当前权威设计。
- Blueprint 说明系统目标、能力和边界。
- Roadmap 说明交付顺序。
- Milestone 定义一个可验证的系统状态。
- Feature Spec 定义一个独立能力的边界。
- Plan 说明如何实现一个已批准 Feature。

## 2. Milestone 规则

使用纵向价值切片，不按数据库、后端、前端、测试等技术层分阶段。每个 Milestone 必须：

- 产生可运行、可演示或可验证的结果；
- 明确包含和不包含；
- 列出前置依赖；
- 包含 Feature Map；
- 定义退出标准。

## 3. Feature 规则

一个 Feature 应有单一主要目标、明确输入输出、清晰系统边界、独立验收方式。出现以下情况时继续拆分：

- 包含多个不同用户结果；
- 存在两个可以独立验收的流程；
- 横跨无关业务域；
- 具有明显不同的失败条件；
- 必须分多次交付才能安全完成。

按钮、单个 IPC、数据库表或类型通常是 Plan 任务，不是 Feature。

## 4. 多迭代 Capability

只有需求确实跨多个 Milestones 时创建 Capability。按逐步增加的可用能力拆分，例如：

```text
M10：用户可以手动创建并运行一个子 Agent
M11：主 Agent 可以并行委派并汇总任务
M12：用户可以观察、中断和恢复执行
```

不要用“后端阶段、前端阶段、测试阶段”。每个阶段都应形成闭环，并允许项目在该阶段暂停。

## 5. 依赖与顺序

- 只记录真实的交付依赖，不把偏好写成依赖。
- 优先处理高风险假设和基础闭环，但基础设施必须服务于明确用户结果。
- 避免循环依赖；发现循环时重新划分边界。
- 新 Spec 通过 `depends_on`、`extends` 或 `supersedes` 关联旧能力。

## 6. 细化深度

- 整个项目：维护 Blueprint。
- 所有阶段：维护粗粒度 Roadmap。
- 下一个阶段：维护完整 Milestone。
- 当前阶段：维护详细 Feature Specs。
- 即将开发的 Feature：维护 Implementation Plan。

远期功能只保留目标、边界、依赖和退出标准，不预测文件名或代码步骤。
