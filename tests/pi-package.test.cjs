const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');

async function loadExtension(extensionPath) {
  const commands = new Map();
  const handlers = new Map();
  const pi = {
    registerCommand(name, options) {
      commands.set(name, options);
    },
    on(event, handler) {
      handlers.set(event, handler);
    },
  };
  const extension = await import(`${pathToFileURL(extensionPath).href}?test=${Date.now()}`);
  extension.default(pi);
  return { commands, handlers };
}

test('package exposes Project Kit skills and extension to Pi', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  assert.ok(pkg.keywords.includes('pi-package'));
  assert.deepEqual(pkg.pi, {
    extensions: ['./pi/project-kit.js'],
    skills: ['./skills'],
  });
  assert.ok(pkg.files.includes('pi'));
  assert.ok(fs.existsSync(path.join(root, 'pi', 'project-kit.js')));
});

test('platform manifests reference only existing resources', () => {
  for (const manifestPath of ['plugin.json', '.claude-plugin/plugin.json']) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'));
    for (const skill of manifest.skills) {
      assert.ok(fs.existsSync(path.join(root, skill)), `${manifestPath}: ${skill}`);
    }
    for (const command of manifest.commands ?? []) {
      assert.ok(fs.existsSync(path.join(root, command)), `${manifestPath}: ${command}`);
    }
  }
});

test('Pi extension registers all Project Kit commands', async () => {
  const { commands } = await loadExtension(path.join(root, 'pi', 'project-kit.js'));

  assert.deepEqual([...commands.keys()].sort(), [
    'project-kit:brief',
    'project-kit:change',
    'project-kit:execute',
    'project-kit:init',
    'project-kit:plan',
    'project-kit:status',
    'project-kit:verify',
  ]);
});

test('Pi commands preserve replacement tokens and reference registered command names', async () => {
  const { commands } = await loadExtension(path.join(root, 'pi', 'project-kit.js'));
  const argument = "/tmp/project-kit/node scripts/project-docs.cjs-$&-$'-$$-tail";

  for (const command of commands.values()) {
    let prompt;
    await command.handler(argument, {
      async sendUserMessage(message) {
        prompt = message;
      },
    });
    assert.ok(prompt.includes(argument));
    assert.doesNotMatch(prompt, /`\/project-kit\//);
  }
});

test('Pi command executes the packaged CLI path from another project', async () => {
  const installParent = fs.mkdtempSync(path.join(os.tmpdir(), 'pi install-$ARGUMENTS-$&-'));
  const installRoot = path.join(installParent, 'project-kit');
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-project-$&-'));
  try {
    fs.mkdirSync(installRoot);
    fs.mkdirSync(path.join(installRoot, 'pi'));
    fs.copyFileSync(path.join(root, 'pi', 'project-kit.js'), path.join(installRoot, 'pi', 'project-kit.js'));
    fs.cpSync(path.join(root, 'commands'), path.join(installRoot, 'commands'), { recursive: true });
    fs.cpSync(path.join(root, 'scripts'), path.join(installRoot, 'scripts'), { recursive: true });

    const { commands } = await loadExtension(path.join(installRoot, 'pi', 'project-kit.js'));
    let prompt;
    await commands.get('project-kit:status').handler(project, {
      async sendUserMessage(message) {
        prompt = message;
      },
    });

    assert.match(prompt, new RegExp(project.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.doesNotMatch(prompt, /node scripts\/project-docs\.cjs/);
    const commandLine = prompt.match(/^node .+ status --root <项目根>$/m)[0]
      .replace('<项目根>', () => `'${project}'`);
    const output = execFileSync('/bin/sh', ['-c', commandLine], {
      cwd: project,
      encoding: 'utf8',
    });
    assert.match(output, /Project Kit Status/);
  } finally {
    fs.rmSync(installParent, { recursive: true, force: true });
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test('Pi bootstrap coexists with other extensions and stays idempotent', async () => {
  const { handlers } = await loadExtension(path.join(root, 'pi', 'project-kit.js'));
  const beforeAgentStart = handlers.get('before_agent_start');

  assert.equal(typeof beforeAgentStart, 'function');
  const first = await beforeAgentStart({
    systemPrompt: '<EXTREMELY_IMPORTANT>Superpowers</EXTREMELY_IMPORTANT>',
  });
  const second = await beforeAgentStart({ systemPrompt: first.systemPrompt });
  const systemPrompt = second?.systemPrompt ?? first.systemPrompt;
  assert.equal(systemPrompt.match(/<PROJECT_KIT_PI>/g)?.length, 1);
  assert.match(systemPrompt, /installed CLI command/);
});
