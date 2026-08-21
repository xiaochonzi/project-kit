const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const adapter = path.join(root, '.opencode', 'plugins', 'project-kit.js');
function runPlugin(home, source) {
  return execFileSync('node', ['--input-type=module', '--eval', source], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, HOME: home },
  });
}

test('package uses the platform-specific OpenCode adapter', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  assert.equal(pkg.main, '.opencode/plugins/project-kit.js');
  assert.ok(pkg.files.includes('.opencode'));
  assert.ok(fs.existsSync(adapter));
  assert.equal(fs.existsSync(path.join(root, 'plugin.js')), false);
});

test('OpenCode commands route to skills without shared command files', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-opencode-'));
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-project-'));
  const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pk install-$VALUE-'));
  const pluginPath = path.join(installRoot, '.opencode', 'plugins', 'project-kit.js');
  try {
    fs.mkdirSync(path.dirname(pluginPath), { recursive: true });
    fs.copyFileSync(adapter, pluginPath);
    fs.cpSync(path.join(root, 'scripts'), path.join(installRoot, 'scripts'), { recursive: true });

    runPlugin(home, `
      const { ProjectKitPlugin } = await import(${JSON.stringify(pathToFileURL(pluginPath).href)});
      const plugin = await ProjectKitPlugin({});
      const config = {};
      await plugin.config(config);
      const names = Object.keys(config.command || {}).sort();
      if (names.length !== 7 || !names.includes('project-kit/status')) process.exit(2);
    `);

    const command = fs.readFileSync(
      path.join(home, '.config', 'opencode', 'commands', 'project-kit', 'status.md'),
      'utf8',
    );
    assert.match(command, /`status` skill/);
    assert.match(command, /\$ARGUMENTS/);
    const cliCommand = command.match(/node '[^\n`]+project-docs\.cjs'/)[0];
    const output = execFileSync('/bin/sh', ['-c', `${cliCommand} status --root '${project}'`], {
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

test('OpenCode still registers skills when command persistence fails', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-opencode-'));
  try {
    fs.mkdirSync(path.join(home, '.config'), { recursive: true });
    fs.writeFileSync(path.join(home, '.config', 'opencode'), 'not a directory');
    const output = runPlugin(home, `
      console.warn = () => {};
      const { ProjectKitPlugin } = await import(${JSON.stringify(pathToFileURL(adapter).href)});
      const plugin = await ProjectKitPlugin({});
      const config = {};
      await plugin.config(config);
      process.stdout.write(String(config.skills.paths.length));
    `);
    assert.equal(output, '1');
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('Project Kit bootstrap coexists with other EXTREMELY_IMPORTANT prompts', () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-opencode-'));
  try {
    const output = runPlugin(home, `
      const { ProjectKitPlugin } = await import(${JSON.stringify(pathToFileURL(adapter).href)});
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
    assert.equal(text.match(/<PROJECT_KIT_BOOTSTRAP>/g)?.length, 1);
    assert.doesNotMatch(messages[0].parts[0].text, /<EXTREMELY_IMPORTANT>/);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});
