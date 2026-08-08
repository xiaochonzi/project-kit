# 文档契约

## 1. 文件位置

```text
docs/
├── constitution.md
├── requirements.md
├── blueprint.md
├── roadmap.md
├── STATE.md
├── briefs/BRIEF-*.md
├── capabilities/C-*.md
├── milestones/M*.md
├── specs/M*/F-M*-*.md
├── plans/F-*-plan.md
├── executions/F-*-execution.md
├── verifications/F-*-verification.md
├── changes/CR-*.md
├── fixes/BUG-*.md
├── decisions/ADR-*.md
└── research/

说明: 当前第一轮迁移仍以 `blueprint.md` 与 `fixes/` 为权威命名; `system-design.md`、`fix/` 与 `reference/` 若未来引入,需同步更新脚本与模板。
```

## 2. 稳定 ID

| 对象 | 格式 | 示例 |
|---|---|---|
| Requirement | `REQ-###` | `REQ-017` |
| Brief | `BRIEF-###` | `BRIEF-001` |
| Change | `CR-###` | `CR-004` |
| Capability | `C-###` | `C-002` |
| Milestone | `M#` | `M3` |
| Feature | `F-M#-##` | `F-M3-02` |
| Bug Resolution | `BUG-###` | `BUG-009` |
| ADR | `ADR-###` | `ADR-003` |

ID 创建后永不因标题、文件名、路线排序或状态变化而改变。

## 3. Frontmatter 规则

- 使用简单 YAML scalar 和逐行数组，便于无依赖 CJS 解析。
- 所有生命周期文档必须有 `status`。
- 有 ID 的文档文件名必须以 ID 开头。
- 日期使用 `YYYY-MM-DD`。
- 引用只写稳定 ID，不写标题。

常用关系：

- `requirements`：该文档交付的 REQ。
- `source`：产生该文档的 Brief 或 Change。
- `milestone`、`capability`、`feature`：父级或目标。
- `depends_on`：交付前置。
- `extends`：保留旧行为并扩展。
- `supersedes` / `superseded_by`：替代关系。
- `related_specs`：Bug 的验收依据。

## 4. 状态集合

```text
Requirement: proposed | accepted | blocked | deferred | rejected | delivered
Feature: idea → draft → reviewed → approved → ready → in-progress → implemented → verified
Feature side: blocked | deferred | cancelled | superseded
Milestone: planned | active | completed | blocked | deferred | cancelled
Capability: proposed | active | completed | deferred | cancelled
Plan: draft | approved | in-progress | completed | blocked
Execution: in-progress | completed | blocked
Verification: pending | passed | failed | blocked
Change: proposed | accepted | deferred | rejected | completed
Bug Resolution: resolved | blocked
ADR: proposed | accepted | superseded | rejected
Brief: captured
```

具体合法迁移见 [state-model.md](state-model.md)。

## 5. 必需章节

脚本对不同文档检查最小必需章节。章节正文不能保留模板占位符或完全为空。语义要求：

- Feature 必须有目标、范围、失败行为、验收标准和需求追踪。
- Plan 必须有 must-haves、任务、验收映射和最终验证。
- Verification 必须逐条记录验收证据与结论。
- Bug Resolution 必须有复现、根因、修复和验证事实。

## 6. 不可变历史

- Brief 原始正文不可改写。
- verified Feature Spec 不再扩写新行为。
- passed Verification 与 resolved Bug Resolution 保存当时证据。
- 当前 Blueprint、Roadmap、Requirements 和 STATE 可随已批准 Change 更新，但必须保留修订记录或来源关系。
