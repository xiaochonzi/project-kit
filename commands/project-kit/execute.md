---
description: 执行已批准的实现计划（Full 变更）——TDD 逐任务实施并勾选记录
argument-hint: "<change-id>"
---

`$ARGUMENTS` 必须提供 Change ID（如 CR-001）。

**第一步:确认 Plan 已 approved**

```bash
node scripts/project-docs.cjs context execute-plan --target <CR-###> --root <项目根>
```

如果 Plan 不是 approved → 停止，告知用户先走 `/project-kit/plan` 完成计划批准。

**第二步:批判性检查 Plan**

- Plan 里每个 `files` 指向的文件真实存在（新建文件除外）
- `read_first` 引用的符号存在
- 每个 `verify` 命令可运行
- Plan 只覆盖本 Spec 范围

任何一项不满足 → 停止，回 plan 修订，不边执行边改。

**第三步:逐任务执行(TDD)**

对 Plan 中每个 Task:

1. 读 `read_first` 指定文件
2. 只修改 `files` 范围内的文件
3. RED:写失败测试,运行确认 FAIL
4. GREEN:写最小实现,运行确认 PASS
5. CHECK:对照 acceptance,可观察结果满足?
6. 在 plan.md 勾选 `- [x] Task N`,把命令+输出追加到「最终验证」区
7. 小步提交

**禁止**:在测试通过前写实现、跳过 RED、注释掉失败测试、顺手改范围外文件。

**第四步:整体验证与状态收口**

```bash
node scripts/project-docs.cjs validate --root <项目根>
git diff --stat
node scripts/project-docs.cjs transition CR-### --to completed --kind plan --root <项目根>
```

脚本要求:plan 全部任务已勾选（无 `- [ ]` 残留）。

**第五步:更新 STATE**

`docs/STATE.md` 记录完成内容、验证结果、下一动作:`verify-plan CR-###`。

报告:完成的任务数、验证结果、下一技能(verify-plan 独立验收)。
