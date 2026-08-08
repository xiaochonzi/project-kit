# 工作流参考

## 目录

1. 通用规则
2. Init
3. Constitution
4. Brief
5. Refine
6. Plan
7. Execute Plan
8. Verify Plan
9. Change
10. Bug
11. Status

## 1. 通用规则

- 先读目标仓库规则，再操作文档或代码。
- 把原始意图、当前设计、交付阶段、功能边界和实现步骤分别放入对应文档。
- 已完成的 Spec 保存历史事实；新增能力创建新 Spec。
- Blueprint 描述当前全局设计，可以随已批准变更更新。
- Roadmap 是当前优先级快照，不承诺所有远期功能一定实施。
- 只为近期工作逐层细化，避免提前写远期实现计划。

## 2. Init

1. 确认目标项目根目录。
2. 运行 `node scripts/project-docs.cjs init --root <root>`。
3. 报告创建与跳过的文件。
4. 不填写项目内容。

## 3. Constitution

1. 阅读现有架构、技术栈和仓库规则。
2. 与用户确认产品、架构、模块、数据、安全、质量、测试、依赖和文档原则。
3. 区分长期规则与当前功能偏好。
4. 提交 Constitution 草案供批准。
5. 批准后写入 `docs/constitution.md`。

## 4. Brief

1. 使用 `new brief --source <file>` 保存原始输入。
2. 结构化提取目标、用户、场景、能力、规则、约束和非功能要求。
3. 列出冲突、重复、假设、缺失和未决问题；不自行补全关键需求。
4. 完成必要澄清后生成 Blueprint。
5. 按可交付系统状态生成 Roadmap 和 Milestones。
6. 为所有 Milestones 建立 Feature Map 和依赖。
7. 只为当前 Milestone 创建完整 Feature Specs。
8. 运行 `validate`，报告产物和仍未决定的问题。

## 5. Refine

1. 读取目标、父级 Milestone、Blueprint 和 Constitution。
2. 检查是否包含多个独立结果；需要时先拆分。
3. 明确范围、数据、接口、规则、失败行为和验收标准。
4. 检查依赖是否真实存在。
5. 经用户评审后更新状态。

## 6. Plan

1. 拒绝为未批准或边界含糊的 Feature 生成计划。
2. 探索现有代码和执行流。
3. 按仓库要求完成影响分析并报告风险。
4. 列出实现顺序、修改范围、数据变化和验证。
5. 让每一步可独立检查，并映射到验收标准。
6. 用户批准后将 Feature 置为 `ready`。

## 7. Execute Plan

1. 确认 Plan 获得执行授权。
2. 把 Feature 标记为 `in-progress`。
3. 按计划逐步修改，不处理无关问题。
4. 每步完成后运行最小相关验证并记录结果。
5. 发现计划错误、范围扩大或新架构决定时停止并请求方向。
6. 完成全部步骤后标记为 `implemented`。

## 8. Verify Plan

1. 读取 Constitution、Spec、Plan、变更和实现。
2. 对每条验收标准给出证据。
3. 检查计划任务、测试、构建和必要人工流程。
4. 检查是否出现未批准范围。
5. 全部通过时标记为 `verified`；否则列出差距和建议下一动作。

## 9. Change

1. 保存 Change Request，说明来源、问题、期望和影响。
2. 判断为增强、Capability、架构变化或 Bug。
3. 分析现有 Blueprint、Milestones、Specs 和交付状态。
4. 决定进入 Active、Next、Later 或 Deferred。
5. 需要多次迭代时创建 Capability，并按纵向价值拆 Milestones。
6. 更新当前 Blueprint 和 Roadmap，保留旧 Spec 内容。
7. 只细化最近的 Milestone。

## 10. Bug

1. 收集现象和复现条件。
2. 对照已有 Spec 判断 Bug 与新增需求。
3. 定位根因并执行影响分析。
4. 按仓库门禁说明修复方案并取得授权。
5. 直接修复，不创建 Plan。
6. 运行回归验证。
7. 创建 Bug Resolution，记录事实并关联原 Spec。

## 11. Status

1. 运行 `validate`。
2. 运行 `status`，需要机器读取时加 `--json`。
3. 汇总阶段、功能、Changes、修复和验证缺口。
4. 区分结构错误、阻塞事项和普通远期工作。
5. 保持只读。
