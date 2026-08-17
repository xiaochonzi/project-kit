# Project Kit — OpenCode 安装

## 前提

- [OpenCode.ai](https://opencode.ai) 已安装

## 安装

### Plugin 模式(推荐)

在 `~/.config/opencode/opencode.json`(全局)或项目 `opencode.json` 的 `plugin` 数组中加入:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["project-kit@git+https://github.com/xiaochonzi/project-kit.git"]
}
```

opencode 启动时用 Bun 自动安装并加载,技能与 slash command 在所有项目中可用。

本地开发未推送时,可改用本地文件路径:

```json
{
  "plugin": ["/absolute/path/to/project-kit/plugin.js"]
}
```

### Manual Skills 引用

```bash
git clone <repo-url>
mkdir -p your-project/.agents
ln -s /absolute/path/to/project-kit/skills your-project/.agents/skills
```

如果 symlink 不可用:

```bash
cp -R /absolute/path/to/project-kit/skills your-project/.agents/skills
```

## 使用

```text
帮我初始化这个项目的文档结构
```

或使用 slash command:

```text
/project-kit:init
/project-kit:brief
/project-kit:status
```

## 故障排除

Skills 未发现:

1. 确认 `skills/init/SKILL.md` 存在
2. 添加或修改 skill 目录后重启 OpenCode
3. 检查日志:插件安装失败时 `~/.cache/opencode/packages/project-kit@git+.../` 为空目录
4. 如果 symlink 不生效,使用真实目录拷贝
