# 状态与流转

## STATE.md 的职责

`docs/STATE.md` 是恢复工作所需的当前快照，不是完整历史。只保留：

- 当前 Active Milestone 与 Feature；
- 当前模式与状态；
- 最近已验证结果；
- 已批准关键决定；
- 活跃阻塞；
- 唯一下一动作。

历史事实留在 Spec、Execution、Verification、Change、Bug Resolution 和 ADR 中。

## 合法主路径

```text
Feature:
idea → draft → reviewed → approved → ready → in-progress → implemented → verified

Plan:
draft → approved → in-progress → completed

Execution:
in-progress → completed

Verification:
pending → passed | failed | blocked

Milestone:
planned → active → completed

Change:
proposed → accepted → completed
         ↘ deferred | rejected
```

## 旁路与恢复

- Feature 可从非终态进入 `blocked` 或 `deferred`；恢复时回到阻塞前的语义状态，需人工指定目标。
- `cancelled` 与 `superseded` 为终态，不恢复；需要继续时创建新文档。
- failed Verification 不把 Feature 退回 draft；Feature 保持 implemented，下一动作是修复并重新验证。
- completed Milestone 只有在所有必需 Feature verified 且退出标准满足时成立。

## 状态含义

- `approved`：用户批准 Spec 边界与验收。
- `ready`：存在已批准且通过质量门禁的 Plan。
- `implemented`：计划实施和直接验证完成，但尚未独立验收。
- `verified`：同一轮新鲜证据证明所有验收标准通过。

## 更新顺序

先更新产生事实的文档，再更新 STATE 快照。禁止只改 STATE 来制造进度。

使用脚本迁移：

```bash
node scripts/project-docs.cjs transition <id> --to <status> --root <project-root>
```

脚本只检查机械合法性；用户批准、代码完成和验证证据仍由 workflow 判断。
