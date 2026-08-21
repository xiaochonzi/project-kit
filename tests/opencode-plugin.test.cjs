const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
function runPlugin(home, source) {
  return execFileSync('node', ['--input-type=module', '--eval', source], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, HOME: home },
  });
}

test('OpenCode commands use the plugin CLI outside the target project', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-opencode-'));
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-project-'));
  const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pk install-$VALUE-'));
  const pluginPath = path.join(installRoot, 'plugin.js');
  try {
    fs.copyFileSync(path.join(root, 'plugin.js'), pluginPath);
    fs.copyFileSync(path.join(root, 'README.md'), path.join(installRoot, 'README.md'));
    fs.cpSync(path.join(root, 'commands'), path.join(installRoot, 'commands'), { recursive: true });
    fs.cpSync(path.join(root, 'scripts'), path.join(installRoot, 'scripts'), { recursive: true });

    runPlugin(home, `
      const { ProjectKitPlugin } = await import(${JSON.stringify(pathToFileURL(pluginPath).href)});
      await ProjectKitPlugin({});
    `);

    const command = fs.readFileSync(
      path.join(home, '.config', 'opencode', 'commands', 'project-kit', 'status.md'),
      'utf8',
    );
    assert.doesNotMatch(command, /node scripts\/project-docs\.cjs/);
    const commandLine = command.match(/^node .+ status --root <项目根>$/m)[0]
      .replace('<项目根>', `'${project}'`);
    const output = execFileSync('/bin/sh', ['-c', commandLine], {
      cwd: project,
      encoding: 'utf8',
    });
    assert.match(output, /Project Kit Status/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
    fs.rmSync(project, { recursive: true, force: true });
    fs.rmSync(installRoot, { recursive: true, force: true });
  }
});

test('Project Kit bootstrap coexists with other EXTREMELY_IMPORTANT prompts', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-opencode-'));
  try {
    const output = runPlugin(home, `
      const { ProjectKitPlugin } = await import(${JSON.stringify(pathToFileURL(path.join(root, 'plugin.js')).href)});
      const plugin = await ProjectKitPlugin({});
      const messages = [{
        info: { role: 'user' },
        parts: [{ type: 'text', text: '<EXTREMELY_IMPORTANT>Superpowers</EXTREMELY_IMPORTANT>' }],
      }];
      await plugin['experimental.chat.messages.transform']({}, { messages });
      await plugin['experimental.chat.messages.transform']({}, { messages });
      process.stdout.write(JSON.stringify(messages));
    `);
    const messages = JSON.parse(output);
    const text = messages[0].parts.map((part) => part.text).join('\n');
    assert.equal(text.match(/You have Project Kit installed\./g)?.length, 1);
    assert.doesNotMatch(messages[0].parts[0].text, /<EXTREMELY_IMPORTANT>/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
