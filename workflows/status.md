# Status Workflow

## 目的

只读汇总项目事实、一致性缺口和唯一下一动作，不修改文档或代码。

## 必读

- `references/state-model.md`
- `references/requirement-traceability.md`
- `docs/STATE.md`、Roadmap 和脚本报告。

## 流程

1. 运行：

   ```bash
   node <skill-root>/scripts/project-docs.cjs validate --root <project-root>
   node <skill-root>/scripts/project-docs.cjs coverage --root <project-root>
   node <skill-root>/scripts/project-docs.cjs status --root <project-root>
   node <skill-root>/scripts/project-docs.cjs next --root <project-root>
   ```

2. 区分三类信息：结构错误、交付阻塞、普通远期工作。
3. 报告 Active Milestone、当前 Feature、Plan/Execution/Verification 状态。
4. 报告 accepted REQ 覆盖缺口、无效引用、依赖环和非法状态。
5. 报告 implemented 但未 verified、accepted 但未落位的 Change、失败 Verification。
6. 对照 STATE 与实际文档；若不一致，明确指出 STATE 已陈旧。
7. 给出一个最小、明确、可执行的下一动作和对应模式。

## 输出格式

1. 当前焦点。
2. 已完成事实。
3. 阻塞与风险。
4. 一致性问题。
5. 下一动作。

## 禁止

- 不自动推进状态。
- 不把 Later 当作阻塞。
- 不根据文件存在就声称功能完成。
- 不修改 STATE 来掩盖不一致。

## 成功标准

- 报告与脚本输出和文档事实一致。
- 用户能直接据此选择下一模式。
