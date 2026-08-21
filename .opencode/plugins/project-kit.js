import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const skillsDir = path.join(packageRoot, 'skills');
const cliPath = path.join(packageRoot, 'scripts', 'project-docs.cjs');
const quotedCliPath = `'${cliPath.replaceAll("'", "'\"'\"'")}'`;
const configDir = process.env.OPENCODE_CONFIG_DIR || path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.config', 'opencode'
);
const globalCommandsDir = path.join(configDir, 'commands', 'project-kit');
const commands = [
  ['brief', 'brief', '为一个模糊想法或原始需求启动 Brief 需求梳理流程'],
  ['change', 'change', '新需求入口——Quick 零文档或 Full 三件套'],
  ['execute', 'execute-plan', '执行已批准的 Full 变更实现计划'],
  ['init', 'init', '初始化 Project Kit 标准 docs 目录'],
  ['plan', 'plan', '为已批准的 Spec 制定实现计划'],
  ['status', 'status', '查看当前 Project Kit 状态与下一动作'],
  ['verify', 'verify-plan', '独立验收已完成的 Full 变更'],
];

const renderCommand = (skill, description) => ({
  description,
  template: `Load and strictly follow the Project Kit \`${skill}\` skill.

User arguments: $ARGUMENTS

When the skill invokes \`node scripts/project-docs.cjs\`, use the installed CLI command \`node ${quotedCliPath}\` instead.`,
});

const syncCommands = () => {
  try {
    fs.mkdirSync(globalCommandsDir, { recursive: true });
    for (const [name, skill, description] of commands) {
      const command = renderCommand(skill, description);
      const content = `---
description: ${description}
---

${command.template}
`;
      const target = path.join(globalCommandsDir, `${name}.md`);
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
        fs.writeFileSync(target, content);
      }
    }
  } catch (error) {
    console.warn(`[project-kit] OpenCode command persistence failed: ${error.message}`);
  }
};

const bootstrap = `<PROJECT_KIT_BOOTSTRAP>
Project Kit provides 11 project lifecycle skills. Load the matching skill before initializing docs, clarifying requirements, designing a blueprint, planning or executing changes, verifying work, fixing bugs, or checking project status.
When a skill invokes \`node scripts/project-docs.cjs\`, use the installed CLI command \`node ${quotedCliPath}\` instead.

OpenCode tool mapping: read files with \`read\`, edit with \`apply_patch\`, run commands with \`bash\`, and search with \`grep\` or \`glob\`.
</PROJECT_KIT_BOOTSTRAP>`;

export const ProjectKitPlugin = async () => {
  syncCommands();

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) config.skills.paths.push(skillsDir);
      config.command = config.command || {};
      for (const [name, skill, description] of commands) {
        config.command[`project-kit/${name}`] = renderCommand(skill, description);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      if (!output.messages.length) return;
      const firstUser = output.messages.find((message) => message.info.role === 'user');
      if (!firstUser?.parts.length) return;
      if (firstUser.parts.some((part) => part.type === 'text' && part.text.includes('<PROJECT_KIT_BOOTSTRAP>'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};
