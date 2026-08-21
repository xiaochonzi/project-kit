import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const commandsDir = path.join(packageRoot, 'commands', 'project-kit');
const cliPath = path.join(packageRoot, 'scripts', 'project-docs.cjs');
const quotedCliPath = `'${cliPath.replaceAll("'", "'\"'\"'")}'`;
const commandNames = ['brief', 'change', 'execute', 'init', 'plan', 'status', 'verify'];

export default function projectKit(pi) {
  pi.on('before_agent_start', (event) => {
    if (event.systemPrompt.includes('<PROJECT_KIT_PI>')) return;
    return {
      systemPrompt: `${event.systemPrompt}\n\n<PROJECT_KIT_PI>
Project Kit provides 11 project lifecycle skills. Load the matching skill before initializing docs, clarifying requirements, designing a blueprint, planning or executing changes, verifying work, fixing bugs, or checking project status.
The skills reference \`node scripts/project-docs.cjs\`; in Pi, use the installed CLI command \`node ${quotedCliPath}\` instead of resolving that path from the current project.
</PROJECT_KIT_PI>`,
    };
  });

  for (const name of commandNames) {
    const source = fs.readFileSync(path.join(commandsDir, `${name}.md`), 'utf8');
    const description = source.match(/^description:\s*(.+)$/m)?.[1];
    const template = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

    pi.registerCommand(`project-kit:${name}`, {
      description,
      handler: async (args, ctx) => {
        const prompt = template
          .replaceAll('/project-kit/', '/project-kit:')
          .replace(/\$ARGUMENTS|node scripts\/project-docs\.cjs/g, (token) => (
            token === '$ARGUMENTS' ? args : `node ${quotedCliPath}`
          ));
        await ctx.sendUserMessage(prompt);
      },
    });
  }
}
