# Project Kit — OpenCode 安装

## 前提

- [OpenCode.ai](https://opencode.ai) 已安装

## 安装

### Plugin 模式(推荐)

```bash
git clone <repo-url> ~/project-kit
```

在 OpenCode 项目中引用插件文件(`.opencode/config.json` 或 UI):

```text
~/project-kit/.opencode/plugins/project-kit.js
```

不要只复制 `project-kit.js` 到其他项目——插件读取 `../../skills` 和 `../../README.md` 相对路径。

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
3. 如果 symlink 不生效,使用真实目录拷贝
