/**
 * Project Kit plugin for OpenCode
 *
 * Registers skills directory and injects project-kit overview
 * at session start.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../../skills');

let _bootstrapCache = undefined;

const getBootstrapContent = () => {
  if (_bootstrapCache !== undefined) return _bootstrapCache;

  const readme = path.resolve(__dirname, '../../README.md');
  if (!fs.existsSync(readme)) { _bootstrapCache = null; return null; }

  const content = fs.readFileSync(readme, 'utf8');

  _bootstrapCache = `<EXTREMELY_IMPORTANT>
You have Project Kit installed. It provides 12 lifecycle skills (init, constitution, brief, blueprint, roadmap, refine, plan, execute-plan, verify-plan, change, bug, status) that work around a unified docs/ directory convention.

When the user asks to initialize project docs, break down requirements, create a system blueprint, plan features, execute plans with TDD, verify work with fresh evidence, or check project status — use the corresponding skill.

${content.slice(0, 2000)}

**Tool Mapping for OpenCode:**
- Read files → \`read\`
- Create/edit files → \`apply_patch\`
- Run shell commands → \`bash\`
- Search files → \`grep\`, \`glob\`
</EXTREMELY_IMPORTANT>`;

  return _bootstrapCache;
};

export const ProjectKitPlugin = async (_opts) => {
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
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};
