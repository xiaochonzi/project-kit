/**
 * Project Kit plugin for OpenCode (npm 发布入口)
 *
 * Registers skills directory and injects project-kit overview
 * at session start.
 *
 * 路径解析相对包根 (node_modules/project-kit/),与 .opencode/plugins/ 下的
 * 项目级副本不同,不可互换。
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.join(__dirname, 'skills');
const commandsDir = path.join(__dirname, 'commands', 'project-kit');
const cliPath = path.join(__dirname, 'scripts', 'project-docs.cjs');
const quotedCliPath = `'${cliPath.replaceAll("'", "'\"'\"'")}'`;
const globalCommandsDir = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.config', 'opencode', 'commands', 'project-kit'
);

let _bootstrapCache = undefined;

const getBootstrapContent = () => {
  if (_bootstrapCache !== undefined) return _bootstrapCache;

  const readme = path.join(__dirname, 'README.md');
  if (!fs.existsSync(readme)) { _bootstrapCache = null; return null; }

  const content = fs.readFileSync(readme, 'utf8');
  _bootstrapCache = `<PROJECT_KIT_BOOTSTRAP>
You have Project Kit installed. It provides 12 lifecycle skills (init, constitution, brief, blueprint, roadmap, refine, plan, execute-plan, verify-plan, change, bug, status) that work around a unified docs/ directory convention.

When the user asks to initialize project docs, break down requirements, create a system blueprint, plan features, execute plans with TDD, verify work with fresh evidence, or check project status — use the corresponding skill.

${content.slice(0, 2000)}

**Project Kit CLI:** the skills and slash commands reference the CLI as \`node scripts/project-docs.cjs\`. This is a relative path; when executing it, replace \`scripts/project-docs.cjs\` with the installed CLI command \`node ${quotedCliPath}\`. Do not run \`node scripts/project-docs.cjs\` from the current working directory unless you are inside the project-kit repository.

**Tool Mapping for OpenCode:**
- Read files → \`read\`
- Create/edit files → \`apply_patch\`
- Run shell commands → \`bash\`
- Search files → \`grep\`, \`glob\`
</PROJECT_KIT_BOOTSTRAP>`;

  return _bootstrapCache;
};

const syncCommands = async () => {
  try {
    if (!fs.existsSync(commandsDir)) return;
    fs.mkdirSync(globalCommandsDir, { recursive: true });
    for (const entry of fs.readdirSync(commandsDir)) {
      if (!entry.endsWith('.md')) continue;
      const src = fs.readFileSync(path.join(commandsDir, entry), 'utf8');
      const stripped = src
        .replace(/(\n|^)argument-hint: *[^\n]*/g, '')
        .replaceAll('node scripts/project-docs.cjs', `node ${quotedCliPath}`);
      const target = path.join(globalCommandsDir, entry);
      if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === stripped) continue;
      fs.writeFileSync(target, stripped);
    }
  } catch (error) {
    console.warn(`[project-kit] 命令同步失败(可忽略): ${error.message}`);
  }
};

export const ProjectKitPlugin = async (_opts) => {
  await syncCommands();

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('<PROJECT_KIT_BOOTSTRAP>'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};
