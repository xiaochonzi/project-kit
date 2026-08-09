---
description: 为已批准的 Feature Spec 制定可逐步执行的实现计划
argument-hint: "<feature-id>"
---

`$ARGUMENTS` 必须提供 Feature ID(如 F-M1-01)。

**第一步:确认 Spec 已 approved**

```bash
node scripts/project-docs.cjs context plan --target <F-M#-##> --root <项目根>
```

如果 Spec 不是 approved → 停止,告知用户先走 refine 批准 Spec。

**第二步:创建 Plan 骨架**

```bash
node scripts/project-docs.cjs new plan --feature <F-M#-##> --root <项目根>
```

**第三步:填写 Plan**

读取 Spec 验收标准,按以下标准编写 `docs/plans/F-M#-##-plan.md`:

- 每个任务含 files/read_first/action/verify/acceptance/done 六字段
- 每个任务是 2-5 分钟可完成的单一动作(写失败测试→运行确认 RED→最小实现→运行确认 GREEN)
- **禁止**:TBD、TODO、"适当处理错误"、"类似 Task N"、"验证同上"
- 每条 Spec 验收标准映射到至少一个任务和最终验证

**第四步:自审**

扫描 Plan 全文:无 TBD/占位符?每个 `verify` 命令可执行?`read_first` 引用的文件存在?前后任务的函数名一致?

**第五步:提交批准**

展示 Plan 给用户。批准后:

```bash
node scripts/project-docs.cjs transition F-M#-## --to approved --kind plan --root <项目根>
node scripts/project-docs.cjs transition F-M#-## --to ready --root <项目根>
```

报告:Plan 路径、任务数、验收映射覆盖率、下一技能(execute-plan)。
