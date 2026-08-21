# 安装 Project Kit

## Claude Code(推荐)

### 方式一:Plugin 安装

```bash
claude plugin install <仓库路径或 URL>
```

或者从 GitHub:

```bash
claude plugin install github:xiaochonzi/project-kit
```

安装后 `/project-kit:<command>` 即可用,技能按描述自动触发。

### 方式二:克隆 + 引用

```bash
git clone <repo-url> ~/project-kit
```

在 Claude Code 项目中引用技能目录(配置 `.claude/settings.json`):

```json
{
  "skills": { "paths": ["~/project-kit/skills"] }
}
```

## Codex

### 方式一:Plugin 模式

```bash
codex plugin install <repo-path>
```

### 方式二:Skills 引用

在项目的 `.codex/config.json` 中添加:

```json
{
  "skills": { "paths": ["<repo-path>/skills"] }
}
```

## Cursor

### 方式一:Plugin 模式

在 Cursor Settings → Plugins 中添加本地插件路径(指向本仓库根目录)。

Cursor 加载 `.cursor-plugin/plugin.json`,自动发现 `skills/` 与 `hooks/hooks-cursor.json`;每次新会话通过 `hooks/session-start` 注入 Project Kit 引导上下文。

### 方式二:Skills 引用

在项目根目录的 `.cursor/skills.json` 中添加:

```json
{
  "paths": ["<repo-path>/skills"]
}
```

## OpenCode

详见 [`.opencode/INSTALL.md`](.opencode/INSTALL.md)。

## Pi

全局安装:

```bash
pi install git:github.com/xiaochonzi/project-kit
```

仅为当前项目安装:

```bash
pi install -l git:github.com/xiaochonzi/project-kit
```

安装后 Pi 自动加载共享的 `skills/` 与平台 adapter `.pi/extensions/project-kit.js`;技能可通过 `/skill:<name>` 调用,Project Kit 命令使用 `/project-kit:init`、`/project-kit:brief`、`/project-kit:change`、`/project-kit:plan`、`/project-kit:execute`、`/project-kit:verify`、`/project-kit:status`。Pi commands 是指向对应 skill 的薄路由,不读取其他平台的 command 模板。

更新或卸载:

```bash
pi update git:github.com/xiaochonzi/project-kit
pi remove git:github.com/xiaochonzi/project-kit
```

## 验证安装

安装后在任意项目中运行:

```bash
node <repo-path>/scripts/project-docs.cjs help
```

在 Claude Code / Codex / Cursor 中输入:

```text
帮我初始化这个项目的文档结构
```

如果 `init` 技能自动触发,安装成功。
