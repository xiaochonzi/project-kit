# 文档结构与状态

## 目录

1. ID 规则
2. 状态规则
3. 公共字段
4. 文档关系
5. 文件位置

## 1. ID 规则

| 文档 | ID |
|---|---|
| Brief | `BRIEF-001` |
| Change Request | `CR-001` |
| Capability | `C-001` |
| Milestone | `M1` |
| Feature | `F-M1-01` |
| Plan | 使用 Feature ID，通过 `feature` 关联 |
| Bug Resolution | `BUG-001` |
| ADR | `ADR-001` |

ID 创建后保持稳定，不因标题或文件名变化而改变。

## 2. 状态规则

Feature：

```text
idea → draft → reviewed → approved → ready → in-progress → implemented → verified
```

旁路状态：`blocked`、`deferred`、`cancelled`、`superseded`。

Milestone：`planned`、`active`、`completed`、`blocked`、`deferred`、`cancelled`。

Change：`proposed`、`accepted`、`deferred`、`rejected`、`completed`。

Capability：`proposed`、`active`、`completed`、`deferred`、`cancelled`。

Plan：`draft`、`approved`、`in-progress`、`completed`、`blocked`。

Bug Resolution：`resolved`、`blocked`。

ADR：`proposed`、`accepted`、`superseded`、`rejected`。

## 3. 公共字段

模板使用简单 YAML frontmatter。常用字段：

```yaml
---
id: F-M1-01
title: 示例功能
status: draft
milestone: M1
depends_on:
  - F-M0-01
source:
  - CR-001
---
```

数组字段使用逐行列表，便于无依赖脚本解析。

## 4. 文档关系

- `source`：需求来源，如 Brief 或 Change。
- `milestone`：Feature 所属 Milestone。
- `capability`：跨阶段能力。
- `feature`：Plan 对应 Feature。
- `depends_on`：交付前置条件。
- `extends`：在保留旧行为的前提下扩展能力。
- `supersedes`：新文档取代旧文档。
- `superseded_by`：旧文档指向替代者。
- `related_specs`：Bug Resolution 关联的验收依据。

已 `verified` 的 Spec 不因新增需求重写；使用新 Spec 和关系字段描述演进。

## 5. 文件位置

```text
docs/constitution.md
docs/blueprint.md
docs/roadmap.md
docs/briefs/BRIEF-*.md
docs/capabilities/C-*.md
docs/milestones/M*.md
docs/specs/M*/F-M*-*.md
docs/plans/F-*-plan.md
docs/changes/CR-*.md
docs/fixes/BUG-*.md
docs/decisions/ADR-*.md
```
