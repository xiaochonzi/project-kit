#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const SKILL_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_ROOT = path.join(SKILL_ROOT, 'assets', 'templates');
const MANAGED_DIRECTORIES = [
  'briefs',
  'capabilities',
  'milestones',
  'specs',
  'plans',
  'changes',
  'fixes',
  'decisions',
  'research'
];
const INITIAL_FILES = {
  'constitution.md': 'constitution.md',
  'blueprint.md': 'blueprint.md',
  'roadmap.md': 'roadmap.md'
};
const DOCUMENT_TYPES = {
  brief: { directory: 'briefs', prefix: 'BRIEF', template: 'brief.md' },
  capability: { directory: 'capabilities', prefix: 'C', template: 'capability.md' },
  milestone: { directory: 'milestones', prefix: 'M', template: 'milestone.md' },
  feature: { directory: 'specs', prefix: 'F', template: 'feature-spec.md' },
  plan: { directory: 'plans', template: 'implementation-plan.md' },
  change: { directory: 'changes', prefix: 'CR', template: 'change-request.md' },
  fix: { directory: 'fixes', prefix: 'BUG', template: 'bug-resolution.md' },
  adr: { directory: 'decisions', prefix: 'ADR', template: 'adr.md' }
};
const ALLOWED_STATUSES = {
  brief: new Set(['captured']),
  capability: new Set(['proposed', 'active', 'completed', 'deferred', 'cancelled']),
  milestone: new Set(['planned', 'active', 'completed', 'blocked', 'deferred', 'cancelled']),
  feature: new Set([
    'idea',
    'draft',
    'reviewed',
    'approved',
    'ready',
    'in-progress',
    'implemented',
    'verified',
    'blocked',
    'deferred',
    'cancelled',
    'superseded'
  ]),
  plan: new Set(['draft', 'approved', 'in-progress', 'completed', 'blocked']),
  change: new Set(['proposed', 'accepted', 'deferred', 'rejected', 'completed']),
  fix: new Set(['resolved', 'blocked']),
  adr: new Set(['proposed', 'accepted', 'superseded', 'rejected'])
};
const REFERENCE_FIELDS = [
  'source',
  'milestone',
  'capability',
  'feature',
  'depends_on',
  'extends',
  'supersedes',
  'superseded_by',
  'related_specs',
  'affects'
];
const REFERENCE_ID_PATTERN = /^(?:BRIEF|CR|C|M|F-M\d+|BUG|ADR)-?\d+(?:-\d+)?$/;

function parseArguments(argv) {
  const positional = [];
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) {
      positional.push(value);
      continue;
    }

    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    index += 1;
  }

  return { positional, options };
}

function requireProjectRoot(rootOption) {
  const root = path.resolve(typeof rootOption === 'string' ? rootOption : process.cwd());
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`项目根目录不存在: ${root}`);
  }
  return root;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function renderTemplate(templateName, values) {
  let content = fs.readFileSync(path.join(TEMPLATE_ROOT, templateName), 'utf8');
  for (const [key, value] of Object.entries(values)) {
    content = content.split(`{{${key}}}`).join(String(value));
  }
  return content;
}

function writeNewFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, { encoding: 'utf8', flag: 'wx' });
}

function slugify(title) {
  const slug = title
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'document';
}

function listMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listMarkdownFiles(entryPath));
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath);
  }
  return files;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === '[]') return [];
  if (trimmed === 'null') return null;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};

  const metadata = {};
  let activeList = null;
  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && activeList) {
      metadata[activeList].push(parseScalar(listItem[1]));
      continue;
    }

    const field = line.match(/^([a-z_]+):(?:\s*(.*))?$/);
    if (!field) continue;
    const [, key, rawValue = ''] = field;
    if (rawValue === '') {
      metadata[key] = [];
      activeList = key;
    } else {
      metadata[key] = parseScalar(rawValue);
      activeList = null;
    }
  }
  return metadata;
}

function documentKind(relativePath, metadata) {
  const firstDirectory = relativePath.split(path.sep)[0];
  const directoryKinds = {
    briefs: 'brief',
    capabilities: 'capability',
    milestones: 'milestone',
    specs: 'feature',
    plans: 'plan',
    changes: 'change',
    fixes: 'fix',
    decisions: 'adr'
  };
  if (directoryKinds[firstDirectory]) return directoryKinds[firstDirectory];
  if (typeof metadata.feature === 'string') return 'plan';
  return null;
}

function collectDocuments(root) {
  const docsRoot = path.join(root, 'docs');
  return listMarkdownFiles(docsRoot).map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = parseFrontmatter(content);
    const relativePath = path.relative(docsRoot, filePath);
    return {
      filePath,
      relativePath,
      metadata,
      kind: documentKind(relativePath, metadata)
    };
  });
}

function nextSequentialId(documents, prefix, width = 3) {
  const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`);
  const numbers = documents
    .map((document) => document.metadata.id)
    .filter((id) => typeof id === 'string')
    .map((id) => id.match(pattern))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  const next = numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
  return `${prefix}-${String(next).padStart(width, '0')}`;
}

function nextMilestoneId(documents) {
  const numbers = documents
    .map((document) => document.metadata.id)
    .filter((id) => typeof id === 'string' && /^M\d+$/.test(id))
    .map((id) => Number(id.slice(1)));
  return `M${numbers.length === 0 ? 1 : Math.max(...numbers) + 1}`;
}

function nextFeatureId(documents, milestone) {
  const pattern = new RegExp(`^F-${milestone}-(\\d+)$`);
  const numbers = documents
    .map((document) => document.metadata.id)
    .filter((id) => typeof id === 'string')
    .map((id) => id.match(pattern))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  const next = numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
  return `F-${milestone}-${String(next).padStart(2, '0')}`;
}

function initializeProject(root) {
  const docsRoot = path.join(root, 'docs');
  fs.mkdirSync(docsRoot, { recursive: true });
  for (const directory of MANAGED_DIRECTORIES) {
    fs.mkdirSync(path.join(docsRoot, directory), { recursive: true });
  }

  for (const [outputName, templateName] of Object.entries(INITIAL_FILES)) {
    const outputPath = path.join(docsRoot, outputName);
    if (fs.existsSync(outputPath)) {
      process.stdout.write(`跳过已有文件: ${path.relative(root, outputPath)}\n`);
      continue;
    }
    writeNewFile(outputPath, renderTemplate(templateName, { DATE: currentDate() }));
    process.stdout.write(`创建: ${path.relative(root, outputPath)}\n`);
  }
}

function createDocument(root, type, options) {
  const definition = DOCUMENT_TYPES[type];
  if (!definition) throw new Error(`不支持的文档类型: ${type}`);

  const docsRoot = path.join(root, 'docs');
  if (!fs.existsSync(docsRoot)) {
    throw new Error('尚未初始化 docs 目录，请先运行 init');
  }
  const documents = collectDocuments(root);

  if (type === 'plan') {
    if (typeof options.feature !== 'string') throw new Error('new plan 需要 --feature');
    const feature = documents.find((document) => document.metadata.id === options.feature && document.kind === 'feature');
    if (!feature) throw new Error(`Feature 不存在: ${options.feature}`);
    const outputPath = path.join(docsRoot, 'plans', `${options.feature}-plan.md`);
    const featureTitle = typeof feature.metadata.title === 'string' ? feature.metadata.title : options.feature;
    writeNewFile(outputPath, renderTemplate(definition.template, {
      TITLE: `${featureTitle} 实现计划`,
      FEATURE: options.feature
    }));
    process.stdout.write(`${outputPath}\n`);
    return;
  }

  if (typeof options.title !== 'string' || options.title.trim() === '') {
    throw new Error(`new ${type} 需要 --title`);
  }

  let id;
  let outputDirectory = path.join(docsRoot, definition.directory);
  const values = { TITLE: options.title.trim(), DATE: currentDate(), SOURCE_CONTENT: '' };

  if (type === 'milestone') {
    id = nextMilestoneId(documents);
  } else if (type === 'feature') {
    if (typeof options.milestone !== 'string' || !/^M\d+$/.test(options.milestone)) {
      throw new Error('new feature 需要有效的 --milestone，例如 M2');
    }
    const milestoneExists = documents.some(
      (document) => document.kind === 'milestone' && document.metadata.id === options.milestone
    );
    if (!milestoneExists) throw new Error(`Milestone 不存在: ${options.milestone}`);
    id = nextFeatureId(documents, options.milestone);
    outputDirectory = path.join(outputDirectory, options.milestone);
    values.MILESTONE = options.milestone;
  } else {
    id = nextSequentialId(documents, definition.prefix);
  }

  if (type === 'brief' && typeof options.source === 'string') {
    const sourcePath = path.resolve(options.source);
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
      throw new Error(`原始需求文件不存在: ${sourcePath}`);
    }
    values.SOURCE_CONTENT = fs.readFileSync(sourcePath, 'utf8').trim();
  }

  values.ID = id;
  const outputPath = path.join(outputDirectory, `${id}-${slugify(options.title)}.md`);
  writeNewFile(outputPath, renderTemplate(definition.template, values));
  process.stdout.write(`${outputPath}\n`);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function validateProject(root, jsonOutput) {
  const documents = collectDocuments(root);
  const errors = [];
  const warnings = [];
  const ids = new Map();

  for (const document of documents) {
    const { id, status } = document.metadata;
    if (typeof id === 'string') {
      if (ids.has(id)) errors.push(`重复 ID ${id}: ${ids.get(id)} 与 ${document.relativePath}`);
      ids.set(id, document.relativePath);
      if (!path.basename(document.filePath).startsWith(`${id}-`) && path.basename(document.filePath) !== `${id}.md`) {
        errors.push(`文件名与 ID 不一致: ${document.relativePath} (${id})`);
      }
    }

    const allowed = document.kind ? ALLOWED_STATUSES[document.kind] : null;
    if (allowed && typeof status === 'string' && !allowed.has(status)) {
      errors.push(`非法状态 ${status}: ${document.relativePath}`);
    }
  }

  for (const document of documents) {
    for (const field of REFERENCE_FIELDS) {
      for (const reference of asArray(document.metadata[field])) {
        if (typeof reference !== 'string' || !REFERENCE_ID_PATTERN.test(reference)) continue;
        if (!ids.has(reference)) errors.push(`无效引用 ${reference}: ${document.relativePath} 字段 ${field}`);
      }
    }

    if (document.kind === 'feature' && typeof document.metadata.milestone === 'string') {
      const expectedDirectory = path.join('specs', document.metadata.milestone);
      if (!document.relativePath.startsWith(`${expectedDirectory}${path.sep}`)) {
        errors.push(`Feature 目录与 milestone 不一致: ${document.relativePath}`);
      }
    }
    if (document.kind === 'feature' && document.metadata.status === 'implemented') {
      warnings.push(`已实现但尚未验证: ${document.metadata.id}`);
    }
  }

  const result = { valid: errors.length === 0, errors, warnings, documentCount: documents.length };
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`文档数: ${documents.length}\n`);
    process.stdout.write(`错误: ${errors.length}\n`);
    for (const error of errors) process.stdout.write(`  - ${error}\n`);
    process.stdout.write(`提醒: ${warnings.length}\n`);
    for (const warning of warnings) process.stdout.write(`  - ${warning}\n`);
  }
  return result.valid;
}

function projectStatus(root, jsonOutput) {
  const documents = collectDocuments(root);
  const summary = {};
  for (const document of documents) {
    if (!document.kind || typeof document.metadata.status !== 'string') continue;
    summary[document.kind] ??= {};
    summary[document.kind][document.metadata.status] ??= [];
    summary[document.kind][document.metadata.status].push({
      id: document.metadata.id ?? document.metadata.feature ?? null,
      title: document.metadata.title ?? path.basename(document.filePath),
      path: document.relativePath
    });
  }

  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    return;
  }

  process.stdout.write('Project Kit Status\n');
  for (const kind of Object.keys(summary).sort()) {
    process.stdout.write(`\n${kind}\n`);
    for (const status of Object.keys(summary[kind]).sort()) {
      process.stdout.write(`  ${status}: ${summary[kind][status].length}\n`);
      for (const item of summary[kind][status]) {
        process.stdout.write(`    - ${item.id ? `${item.id} ` : ''}${item.title}\n`);
      }
    }
  }
}

function printHelp() {
  process.stdout.write(`Project Kit document helper\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  node project-docs.cjs init --root <project>\n`);
  process.stdout.write(`  node project-docs.cjs new <brief|capability|milestone|feature|plan|change|fix|adr> [options]\n`);
  process.stdout.write(`  node project-docs.cjs validate --root <project> [--json]\n`);
  process.stdout.write(`  node project-docs.cjs status --root <project> [--json]\n`);
}

function main() {
  const { positional, options } = parseArguments(process.argv.slice(2));
  const command = positional[0];
  if (!command || command === 'help' || options.help) {
    printHelp();
    return;
  }

  const root = requireProjectRoot(options.root);
  if (command === 'init') {
    initializeProject(root);
    return;
  }
  if (command === 'new') {
    if (!positional[1]) throw new Error('new 需要文档类型');
    createDocument(root, positional[1], options);
    return;
  }
  if (command === 'validate') {
    if (!validateProject(root, options.json === true)) process.exitCode = 1;
    return;
  }
  if (command === 'status') {
    projectStatus(root, options.json === true);
    return;
  }
  throw new Error(`不支持的命令: ${command}`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
