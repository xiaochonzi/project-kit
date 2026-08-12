---
description: 独立验收（Full 变更）——用新鲜证据重跑 spec 验收标准并收口状态
argument-hint: "<change-id>"
---

`$ARGUMENTS` 必须提供 Change ID（如 CR-001）。

**第一步:确认 Plan 已 completed**

```bash
node scripts/project-docs.cjs context verify-plan --target <CR-###> --root <项目根>
```

如果 Plan 不是 completed → 停止，告知用户先走 `/project-kit/execute` 完成执行。

**第二步:逐条核对验收标准**

对 Spec 的**每条**验收标准:

1. 选择直接证据(自动测试/CLI 命令/静态检查/数据断言)
2. **重新运行证据命令**——不引用 execute 阶段的旧输出
3. 判定:pass / fail / blocked
4. 检查 Plan 任务是否全部勾选、实际文件是否越界

**禁止**:引用 execute 阶段旧输出、"看起来正确"、修改验收标准掩盖失败、顺手修范围外问题。

**第三步:回归与边界检查**

- 运行受影响模块的回归测试
- 检查 Constitution 约束(编码门禁/测试要求)
- 检查关键失败路径(空输入/损坏数据/权限边界)

**第四步:记录验收证据**

把每条验收标准的命令+输出+结论追加到 plan.md 的「最终验证」区,更新「验收标准映射」表的最终验证列。

**第五步:判定与状态收口**

全部 pass:

```bash
node scripts/project-docs.cjs transition CR-### --to verified --kind spec --root <项目根>
node scripts/project-docs.cjs transition CR-### --to completed --root <项目根>
```

脚本要求:spec verified 前 spec_hash 与 Spec 内容一致(防静默修改契约)、Plan 必须 completed;change completed 前 spec verified 且 plan completed。

任一必需标准 fail → 不标记完成,给出最小下一动作(回 execute 修复或走 bug)。

**第六步:更新 STATE 与 roadmap**

`docs/STATE.md` 记录验收结论与下一动作;`docs/roadmap.md` 更新阶段状态。

报告:每条验收标准的判定结果、是否完成、下一动作。
