import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cliPath = path.join(packageRoot, 'scripts', 'project-docs.cjs');
const quotedCliPath = `'${cliPath.replaceAll("'", "'\"'\"'")}'`;
const commands = [
  ['brief', 'brief', '为一个模糊想法或原始需求启动 Brief 需求梳理流程'],
  ['change', 'change', '新需求入口——Quick 零文档或 Full 三件套'],
  ['execute', 'execute-plan', '执行已批准的 Full 变更实现计划'],
  ['init', 'init', '初始化 Project Kit 标准 docs 目录'],
  ['plan', 'plan', '为已批准的 Spec 制定实现计划'],
  ['status', 'status', '查看当前 Project Kit 状态与下一动作'],
  ['verify', 'verify-plan', '独立验收已完成的 Full 变更'],
];

export default function projectKit(pi) {
  pi.on('before_agent_start', (event) => {
    if (event.systemPrompt.includes('<PROJECT_KIT_PI>')) return;
    return {
      systemPrompt: `${event.systemPrompt}\n\n<PROJECT_KIT_PI>
Project Kit provides 11 project lifecycle skills. Load the matching skill before initializing docs, clarifying requirements, designing a blueprint, planning or executing changes, verifying work, fixing bugs, or checking project status.
When a skill invokes \`node scripts/project-docs.cjs\`, use the installed CLI command \`node ${quotedCliPath}\` instead.
</PROJECT_KIT_PI>`,
    };
  });

  for (const [name, skill, description] of commands) {
    pi.registerCommand(`project-kit:${name}`, {
      description,
      handler: async (args) => {
        await pi.sendUserMessage(`Load and strictly follow the Project Kit \`${skill}\` skill.

User arguments: ${args}

When the skill invokes \`node scripts/project-docs.cjs\`, use the installed CLI command \`node ${quotedCliPath}\` instead.`);
      },
    });
  }
}
