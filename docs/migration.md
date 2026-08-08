# 迁移说明

本仓库从单一 `SKILL.md` 路由迁移到多 skill 插件,采用分阶段重构:

1. 锁定命名与迁移基线
2. 建立 `shared/` 中央事实层
3. 创建 10 个薄壳 skills
4. 扩展 `project-docs.cjs` 校验器
5. 补插件根文件、示例与测试
6. 清理旧路径依赖

迁移期间以 `docs/blueprint.md` 与 `docs/fixes/` 为目标项目权威命名。
