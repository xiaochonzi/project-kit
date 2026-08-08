# 需求追踪

## 原子需求

每条 Requirement 只表达一个必须满足的行为、约束或质量结果。使用稳定 ID，不因拆解或改写而复用旧 ID。

字段：

- `id`：`REQ-###`。
- `statement`：可验证的需求陈述。
- `type`：functional、constraint、quality、security 或 data。
- `priority`：must、should、could。
- `status`：proposed、accepted、blocked、deferred、rejected、delivered。
- `source`：Brief 或 Change ID。
- `milestones`：交付阶段。
- `features`：实现与验收单元。
- `acceptance_hint`：如何观察满足结果。

## 双层覆盖

每个 `accepted` Requirement 必须同时满足：

1. 映射到至少一个 Milestone，说明何时交付。
2. 映射到至少一个 Feature，说明由哪个契约实现和验收。

允许多个 Feature 共同交付一个 REQ，也允许一个 Feature 覆盖多个紧密相关 REQ。不得使用 Milestone 或 Feature 标题代替稳定 ID。

## 状态一致性

- `proposed`：尚未决定，不要求路线覆盖。
- `accepted`：必须 100% 双层覆盖。
- `blocked`：保留阻塞原因，可暂时无交付映射。
- `deferred` / `rejected`：必须记录理由，不计入当前覆盖分母。
- `delivered`：关联 Feature 必须全部 `verified`，或文档明确哪一个 Feature 独立完成该 REQ。

## 演进规则

- 新 Change 产生新 REQ，不悄悄改写旧 REQ 的语义。
- 若新需求完全替代旧需求，旧 REQ 标记 rejected/superseded 说明，新 REQ 使用新 ID。
- Bug 不创建新 REQ；它关联被违反的既有 Spec 与 REQ。

## 覆盖检查

运行：

```bash
node scripts/project-docs.cjs coverage --root <project-root>
```

结果为 100% 只证明引用完整，不证明需求质量或实现正确。
