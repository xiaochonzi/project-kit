# Init Workflow

## 目的

为尚未采用 Project Kit 的项目建立最小、稳定的文档骨架。只初始化，不推断需求。

## 必需上下文

- 项目根目录。
- 目标仓库适用的规则文件。
- 现有 `docs/` 目录，确认不会覆盖用户文档。

## 流程

1. 确认项目根目录，而不是 monorepo 中错误的子目录。
2. 说明将创建的目录和根文档，取得批准。
3. 运行：

   ```bash
   node <skill-root>/scripts/project-docs.cjs init --root <project-root>
   ```

4. 检查命令输出中的 `创建` 与 `跳过`。
5. 运行 `validate`，确认骨架结构有效。
6. 告知用户：`init` 只创建空模板；下一步通常是 `constitution` 或 `brief`。

## 产物

- `docs/constitution.md`
- `docs/requirements.md`
- `docs/blueprint.md`
- `docs/roadmap.md`
- `docs/STATE.md`
- 各类文档目录。

## 停止条件

- 目标根目录不明确。
- 已存在同名文件但其用途冲突。
- 仓库规则要求不同目录结构。

## 成功标准

- 不覆盖已有文件。
- `validate` 无结构错误。
- 未虚构项目内容或状态。
