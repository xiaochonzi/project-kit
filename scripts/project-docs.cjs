#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const SKILL_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_ROOT = path.join(SKILL_ROOT, 'assets', 'templates');
const PLUGIN_SKILLS = [
  'init',
  'constitution',
  'brief',
  'blueprint',
  'roadmap',
  'plan',
  'execute-plan',
  'verify-plan',
  'change',
  'bug',
  'status'
];
const FORBIDDEN_PLUGIN_PATHS = ['capability.json', 'eval'];
const REQUIRED_PLUGIN_FILES = ['plugin.json', 'README.md', 'CHANGELOG.md', 'AGENTS.md'];
const TEMPLATE_EXPECTED_COUNT = 9;
const DOC_LINK_PATTERN = /\[[^\]]+\]\(([^)]+)\)/g;
const MANAGED_DIRECTORIES = [
  'briefs',
  'changes',
  'research',
  'capabilities'
];
const INITIAL_FILES = {
  'constitution.md': 'constitution.md',
  'blueprint.md': 'blueprint.md',
  'roadmap.md': 'roadmap.md'
};
const DOCUMENT_TYPES = {
  brief: { directory: 'briefs', prefix: 'BRIEF', template: 'brief.md' },
  change: { directory: 'changes', prefix: 'CR', template: 'proposal.md' },
  proposal: { directory: null, template: 'proposal.md' },
  spec: { directory: null, template: 'spec.md' },
  plan: { directory: null, template: 'plan.md' },
  diagrams: { directory: null, template: 'diagrams.md' }
};
const ALLOWED_STATUSES = {
  brief: new Set(['captured']),
  proposal: new Set(['proposed', 'accepted', 'completed', 'deferred', 'rejected']),
  spec: new Set(['draft', 'approved', 'verified']),
  plan: new Set(['draft', 'approved', 'completed', 'blocked'])
};
const TRANSITIONS = {
  proposal: {
    proposed: ['accepted', 'deferred', 'rejected'],
    accepted: ['completed', 'deferred'],
    deferred: ['accepted', 'rejected'],
    completed: [],
    rejected: []
  },
  spec: {
    draft: ['approved'],
    approved: ['verified'],
    verified: []
  },
  plan: {
    draft: ['approved', 'blocked'],
    approved: ['completed', 'blocked'],
    blocked: ['draft', 'approved'],
    completed: []
  }
};
const REFERENCE_FIELDS = [
  'source', 'depends_on', 'extends', 'supersedes', 'superseded_by', 'affects'
];
const ID_PATTERN = /^(?:BRIEF-\d{3}|CR-\d{3})$/;
const REQUIRED_SECTIONS = {
  proposal: ['背景与问题', '期望结果', '包含', '不包含', '影响范围'],
  spec: ['问题与依据', '目标', '用户流程', '范围', '输入与输出', '业务规则', '失败与边界情况', '验收标准'],
  plan: ['实现策略', 'Tasks', '验收标准映射', '最终验证'],
  change: ['背景与问题', '期望结果', '决定'],
  brief: ['背景', '想解决的问题', '目标用户与场景']
};
const CONTENT_GATES = {
  spec: { statuses: ['approved', 'verified'], sections: ['问题与依据', '目标', '范围', '验收标准'] },
  plan: { statuses: ['approved', 'completed'], sections: ['实现策略', 'Tasks', '验收标准映射', '最终验证'] },
  proposal: { statuses: ['accepted', 'completed'], sections: ['背景与问题', '期望结果', '决定'] }
};

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
    } else {
      options[key] = next;
      index += 1;
    }
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
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
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

function replaceFrontmatterField(content, field, value) {
  const pattern = new RegExp(`^(${field}:)[^\\r\\n]*`, 'm');
  if (!pattern.test(content)) throw new Error(`文档缺少 frontmatter 字段: ${field}`);
  return content.replace(pattern, `$1 ${value}`);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function documentKind(relativePath, metadata) {
  const segments = relativePath.split(path.sep);
  const firstDirectory = segments[0];
  const directoryKinds = { briefs: 'brief', changes: 'change' };
  if (firstDirectory === 'changes' && segments.length === 3) {
    if (segments[2] === 'proposal.md') return 'proposal';
    if (segments[2] === 'spec.md') return 'spec';
    if (segments[2] === 'plan.md') return 'plan';
    return null;
  }
  if (directoryKinds[firstDirectory]) return directoryKinds[firstDirectory];
  return null;
}

function collectDocuments(root) {
  const docsRoot = path.join(root, 'docs');
  return listMarkdownFiles(docsRoot).map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = parseFrontmatter(content);
    const relativePath = path.relative(docsRoot, filePath);
    return { filePath, relativePath, content, metadata, kind: documentKind(relativePath, metadata) };
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

function initializeProject(root) {
  const docsRoot = path.join(root, 'docs');
  fs.mkdirSync(docsRoot, { recursive: true });
  for (const directory of MANAGED_DIRECTORIES) fs.mkdirSync(path.join(docsRoot, directory), { recursive: true });
  for (const [outputName, templateName] of Object.entries(INITIAL_FILES)) {
    const outputPath = path.join(docsRoot, outputName);
    if (fs.existsSync(outputPath)) {
      process.stdout.write(`跳过已有文件: ${path.relative(root, outputPath)}\n`);
      continue;
    }
    writeNewFile(outputPath, renderTemplate(templateName, { DATE: currentDate() }));
    process.stdout.write(`创建: ${path.relative(root, outputPath)}\n`);
  }
  // 本地私有状态目录（gitignored，不提交）
  const privateKitDir = path.join(root, '.project-kit');
  fs.mkdirSync(privateKitDir, { recursive: true });
  const privateStatePath = path.join(privateKitDir, 'state.md');
  if (!fs.existsSync(privateStatePath)) {
    writeNewFile(privateStatePath, renderTemplate('state.md', { DATE: currentDate() }));
    process.stdout.write(`创建: ${path.relative(root, privateStatePath)}\n`);
  }
  // 仓库根 .gitignore 追加 .project-kit/
  const gitignorePath = path.join(root, '.gitignore');
  let gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  if (!gitignoreContent.split('\n').some((line) => line.trim() === '.project-kit/')) {
    gitignoreContent = gitignoreContent.replace(/\s*$/, '\n') + '.project-kit/\n';
    fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
  }
}

function createChangeArtifact(root, type, options, documents) {
  if (typeof options.change !== 'string' || !/^CR-\d{3}$/.test(options.change)) {
    throw new Error(`new ${type} 需要 --change <CR-###>`);
  }
  const proposal = documents.find(
    (document) => document.kind === 'proposal' && document.metadata.id === options.change
  );
  if (!proposal) throw new Error(`Change 不存在: ${options.change}`);
  const outputPath = path.join(path.dirname(proposal.filePath), `${type}.md`);
  const proposalTitle = typeof proposal.metadata.title === 'string' ? proposal.metadata.title : options.change;
  writeNewFile(outputPath, renderTemplate(`${type}.md`, {
    CHANGE: options.change,
    TITLE: typeof options.title === 'string' && options.title.trim() !== '' ? options.title.trim() : proposalTitle,
    DATE: currentDate()
  }));
  process.stdout.write(`${outputPath}\n`);
}

function createDocument(root, type, options) {
  const definition = DOCUMENT_TYPES[type];
  if (!definition) throw new Error(`不支持的文档类型: ${type}`);
  const docsRoot = path.join(root, 'docs');
  if (!fs.existsSync(docsRoot)) throw new Error('尚未初始化 docs 目录，请先运行 init');
  const documents = collectDocuments(root);

  if (['proposal', 'spec', 'plan', 'diagrams'].includes(type)) {
    createChangeArtifact(root, type, options, documents);
    return;
  }

  if (type === 'change') {
    if (typeof options.title !== 'string' || options.title.trim() === '') {
      throw new Error('new change 需要 --title');
    }
    const id = nextSequentialId(documents, 'CR');
    const directory = path.join(docsRoot, 'changes', `${id}-${slugify(options.title.trim())}`);
    fs.mkdirSync(directory, { recursive: true });
    const outputPath = path.join(directory, 'proposal.md');
    writeNewFile(outputPath, renderTemplate('proposal.md', { ID: id, TITLE: options.title.trim(), DATE: currentDate() }));
    process.stdout.write(`${outputPath}\n`);
    return;
  }

  if (typeof options.title !== 'string' || options.title.trim() === '') {
    throw new Error(`new ${type} 需要 --title`);
  }

  const outputDirectory = path.join(docsRoot, definition.directory);
  const values = { TITLE: options.title.trim(), DATE: currentDate(), SOURCE_CONTENT: '' };
  if (type === 'brief') {
    if (typeof options.source !== 'string') {
      throw new Error('new brief 需要 --source <原始需求文件>');
    }
    const sourcePath = path.resolve(options.source);
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
      throw new Error(`原始需求文件不存在: ${sourcePath}`);
    }
    values.SOURCE_CONTENT = fs.readFileSync(sourcePath, 'utf8').trim();
  }
  values.ID = nextSequentialId(documents, definition.prefix);
  const outputPath = path.join(outputDirectory, `${values.ID}-${slugify(options.title)}.md`);
  writeNewFile(outputPath, renderTemplate(definition.template, values));
  process.stdout.write(`${outputPath}\n`);
}

function sectionExists(content, title) {
  return new RegExp(`^#{2,3}\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(content);
}

function sectionBody(content, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`^##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, 'm'));
  if (!match) return '';
  return match[1].replace(/^###\s+.*$/gm, '').trim();
}

function emptySections(document, sections) {
  return sections.filter((section) => sectionBody(document.content, section) === '');
}

function contentHash(content) {
  const stableContent = content
    .replace(/^status:[^\r\n]*$/m, 'status: <lifecycle>')
    .replace(/^spec_hash:[^\r\n]*$/m, 'spec_hash: <hash>');
  return crypto.createHash('sha256').update(stableContent).digest('hex');
}

function detectDependencyCycles(documents, errors) {
  const graph = new Map();
  for (const document of documents) {
    if (typeof document.metadata.id !== 'string') continue;
    graph.set(document.metadata.id, asArray(document.metadata.depends_on).filter((id) => typeof id === 'string' && ID_PATTERN.test(id)));
  }
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  function visit(id) {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      errors.push(`依赖环: ${[...stack.slice(start), id].join(' -> ')}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    stack.push(id);
    for (const dependency of graph.get(id) || []) if (graph.has(dependency)) visit(dependency);
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of graph.keys()) visit(id);
}

function validatePlanTasks(document, errors, warnings) {
  const tasks = [...document.content.matchAll(/^###\s+Task\s+\d+:[^\r\n]*\r?\n([\s\S]*?)(?=^###\s+Task\s+\d+:|^##\s+|(?![\s\S]))/gm)];
  const target = document.metadata.status === 'draft' ? warnings : errors;
  if (tasks.length === 0) {
    target.push(`Plan 没有任务: ${document.relativePath}`);
    return;
  }
  const requiredFields = ['files', 'read_first', 'action', 'verify', 'acceptance', 'done'];
  for (const [index, task] of tasks.entries()) {
    for (const field of requiredFields) {
      const match = task[1].match(new RegExp(`^-\\s+${field}:[ \\t]*(.*)$`, 'm'));
      if (!match || match[1].trim() === '') target.push(`Plan Task ${index + 1} 缺少 ${field}: ${document.relativePath}`);
    }
  }
}

function validateFileConflicts(documents, warnings) {
  const activePlans = documents.filter((document) => document.kind === 'plan' && document.metadata.status === 'approved');
  for (let left = 0; left < activePlans.length; left += 1) {
    for (let right = left + 1; right < activePlans.length; right += 1) {
      if (activePlans[left].metadata.wave !== activePlans[right].metadata.wave) continue;
      const leftFiles = new Set(asArray(activePlans[left].metadata.files_modified));
      const conflicts = asArray(activePlans[right].metadata.files_modified).filter((file) => leftFiles.has(file));
      if (conflicts.length > 0) {
        warnings.push(`同 wave Plan 文件冲突: ${activePlans[left].relativePath} 与 ${activePlans[right].relativePath}: ${conflicts.join(', ')}`);
      }
    }
  }
}

function validateChangeDirectories(root, errors) {
  const changesRoot = path.join(root, 'docs', 'changes');
  if (!fs.existsSync(changesRoot)) return;
  for (const entry of fs.readdirSync(changesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^CR-\d{3}-.+/.test(entry.name)) continue;
    for (const required of ['proposal.md', 'spec.md', 'plan.md']) {
      if (!fs.existsSync(path.join(changesRoot, entry.name, required))) {
        errors.push(`Full 变更缺少 ${required}: docs/changes/${entry.name}/`);
      }
    }
  }
}

function validateProject(root, jsonOutput) {
  const docsRoot = path.join(root, 'docs');
  const documents = collectDocuments(root);
  const errors = [];
  const warnings = [];
  const ids = new Map();

  for (const fileName of Object.keys(INITIAL_FILES)) {
    if (!fs.existsSync(path.join(docsRoot, fileName))) errors.push(`缺少根文档: docs/${fileName}`);
  }

  validateChangeDirectories(root, errors);

  for (const document of documents) {
    const { id, status } = document.metadata;
    if (document.kind && !status) errors.push(`缺少 status: ${document.relativePath}`);
    if (document.kind && !['spec', 'plan'].includes(document.kind) && typeof id !== 'string') {
      errors.push(`缺少 id: ${document.relativePath}`);
    }
    if (typeof id === 'string') {
      if (!ID_PATTERN.test(id)) errors.push(`非法 ID ${id}: ${document.relativePath}`);
      if (ids.has(id)) errors.push(`重复 ID ${id}: ${ids.get(id)} 与 ${document.relativePath}`);
      ids.set(id, document.relativePath);
      if (!['proposal', 'spec', 'plan'].includes(document.kind)
        && !path.basename(document.filePath).startsWith(`${id}-`)
        && path.basename(document.filePath) !== `${id}.md`) {
        errors.push(`文件名与 ID 不一致: ${document.relativePath} (${id})`);
      }
    }
    const allowed = document.kind ? ALLOWED_STATUSES[document.kind] : null;
    if (allowed && typeof status === 'string' && !allowed.has(status)) errors.push(`非法状态 ${status}: ${document.relativePath}`);
    if (document.kind !== 'brief' && /\{\{[A-Z_]+\}\}/.test(document.content)) {
      errors.push(`未替换模板变量: ${document.relativePath}`);
    }
    for (const section of REQUIRED_SECTIONS[document.kind] || []) {
      if (!sectionExists(document.content, section)) errors.push(`缺少章节「${section}」: ${document.relativePath}`);
    }
    const gate = CONTENT_GATES[document.kind];
    if (gate && gate.statuses.includes(status)) {
      const empty = emptySections(document, gate.sections);
      if (empty.length > 0) errors.push(`状态 ${status} 仍有空章节 ${empty.join('、')}: ${document.relativePath}`);
    }
    if (document.kind === 'plan') {
      validatePlanTasks(document, errors, warnings);
      if (document.metadata.status === 'completed' && /^- \[ \] /m.test(document.content)) {
        errors.push(`completed Plan 仍有未勾选任务: ${document.relativePath}`);
      }
    }
  }

  for (const document of documents) {
    for (const field of REFERENCE_FIELDS) {
      for (const reference of asArray(document.metadata[field])) {
        if (typeof reference !== 'string') continue;
        if (ID_PATTERN.test(reference) && !ids.has(reference)) {
          errors.push(`无效引用 ${reference}: ${document.relativePath} 字段 ${field}`);
        }
      }
    }
    if (document.kind === 'spec' && document.metadata.status === 'verified') {
      const hash = document.metadata.spec_hash;
      if (!hash || hash === 'null' || hash !== contentHash(document.content)) {
        errors.push(`verified Spec 缺少或已偏离 spec_hash: ${document.relativePath}`);
      }
    }
  }

  detectDependencyCycles(documents, errors);
  validateFileConflicts(documents, warnings);

  const result = {
    valid: errors.length === 0,
    errors,
    warnings,
    documentCount: documents.length,
    changeCount: documents.filter((document) => document.kind === 'proposal').length
  };
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`文档数: ${documents.length}\nChanges: ${result.changeCount}\n错误: ${errors.length}\n`);
    for (const error of errors) process.stdout.write(`  - ${error}\n`);
    process.stdout.write(`提醒: ${warnings.length}\n`);
    for (const warning of warnings) process.stdout.write(`  - ${warning}\n`);
  }
  return result.valid;
}

function findTarget(documents, target, kind) {
  if (kind && !['proposal', 'spec', 'plan'].includes(kind)) throw new Error(`不支持的 kind: ${kind}`);
  const matches = documents.filter((document) => {
    if (kind) return document.kind === kind && document.metadata.change === target;
    return document.kind === 'proposal' && document.metadata.id === target;
  });
  if (matches.length === 0) throw new Error(`找不到目标文档: ${target}${kind ? ` (${kind})` : ''}`);
  return matches[0];
}

function transitionDocument(root, target, nextStatus, kind) {
  if (!target || !nextStatus) throw new Error('transition 需要目标 ID 和 --to <status>');
  const documents = collectDocuments(root);
  const document = findTarget(documents, target, kind);
  if (!document.kind || !TRANSITIONS[document.kind]) throw new Error(`文档不支持状态迁移: ${document.relativePath}`);
  const currentStatus = document.metadata.status;
  if (!(TRANSITIONS[document.kind][currentStatus] || []).includes(nextStatus)) {
    throw new Error(`非法迁移 ${document.kind}: ${currentStatus} -> ${nextStatus}`);
  }

  if (document.kind === 'proposal' && nextStatus === 'accepted') {
    const empty = emptySections(document, ['背景与问题', '期望结果', '决定']);
    if (empty.length > 0) throw new Error(`${target} 进入 accepted 前必须填写: ${empty.join('、')}`);
  }
  if (document.kind === 'proposal' && nextStatus === 'completed') {
    const spec = documents.find((item) => item.kind === 'spec' && item.metadata.change === target);
    const plan = documents.find((item) => item.kind === 'plan' && item.metadata.change === target);
    if (!spec || spec.metadata.status !== 'verified') throw new Error(`${target} 进入 completed 前 Spec 必须为 verified`);
    if (!plan || plan.metadata.status !== 'completed') throw new Error(`${target} 进入 completed 前 Plan 必须为 completed`);
  }
  if (document.kind === 'spec' && nextStatus === 'approved') {
    const proposal = documents.find((item) => item.kind === 'proposal' && item.metadata.id === document.metadata.change);
    if (!proposal || proposal.metadata.status !== 'accepted') throw new Error('Spec approved 前 Change 必须为 accepted');
    const empty = emptySections(document, ['问题与依据', '目标', '范围', '验收标准']);
    if (empty.length > 0) throw new Error(`Spec 批准前必须填写: ${empty.join('、')}`);
  }
  if (document.kind === 'spec' && nextStatus === 'verified') {
    const hash = document.metadata.spec_hash;
    if (!hash || hash === 'null' || hash !== contentHash(document.content)) {
      throw new Error('Spec verified 前 spec_hash 缺失或 Spec 内容已变化，请重新批准');
    }
    const plan = documents.find((item) => item.kind === 'plan' && item.metadata.change === document.metadata.change);
    if (!plan || plan.metadata.status !== 'completed') throw new Error('Spec verified 前 Plan 必须为 completed');
  }
  if (document.kind === 'plan' && nextStatus === 'approved') {
    const spec = documents.find((item) => item.kind === 'spec' && item.metadata.change === document.metadata.change);
    if (!spec || spec.metadata.status !== 'approved') throw new Error('Plan approved 前 Spec 必须为 approved');
    const taskErrors = [];
    validatePlanTasks(document, taskErrors, []);
    if (taskErrors.length > 0) throw new Error(taskErrors.join('\n'));
    const empty = emptySections(document, ['实现策略', 'Tasks', '验收标准映射', '最终验证']);
    if (empty.length > 0) throw new Error(`Plan 批准前必须填写: ${empty.join('、')}`);
  }
  if (document.kind === 'plan' && nextStatus === 'completed') {
    if (/^- \[ \] /m.test(document.content)) throw new Error('Plan completed 前必须勾选全部任务');
  }

  let content = replaceFrontmatterField(document.content, 'status', nextStatus);
  if (document.kind === 'spec' && nextStatus === 'approved') {
    content = replaceFrontmatterField(content, 'spec_hash', contentHash(content));
  }
  if (document.kind === 'spec' && !['approved', 'verified'].includes(nextStatus)) {
    content = replaceFrontmatterField(content, 'spec_hash', 'null');
  }
  fs.writeFileSync(document.filePath, content, 'utf8');
  process.stdout.write(`${document.relativePath}: ${currentStatus} -> ${nextStatus}\n`);
}

function contextForMode(root, mode, target, jsonOutput) {
  const docsRoot = path.join(root, 'docs');
  const documents = collectDocuments(root);
  const paths = new Set();
  const add = (relativePath) => {
    if (fs.existsSync(path.join(docsRoot, relativePath))) paths.add(relativePath);
  };
  for (const fileName of ['constitution.md', 'blueprint.md', 'roadmap.md']) add(fileName);

  if (mode === 'brief') for (const document of documents.filter((item) => item.kind === 'brief')) paths.add(document.relativePath);
  if (mode === 'change' || mode === 'plan' || mode === 'execute-plan' || mode === 'verify-plan') {
    if (target) {
      const changeDir = documents
        .filter((item) => item.kind === 'proposal' && item.metadata.id === target)
        .map((item) => path.dirname(item.relativePath));
      if (changeDir.length === 0) throw new Error(`找不到 Change: ${target}`);
      for (const fileName of ['proposal.md', 'spec.md', 'plan.md']) {
        add(path.join(changeDir[0], fileName));
      }
    } else {
      for (const document of documents.filter((item) => item.kind === 'proposal')) paths.add(document.relativePath);
    }
  }
  const result = { mode, target: target || null, files: [...paths].sort() };
  if (jsonOutput) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else for (const filePath of result.files) process.stdout.write(`${path.join(docsRoot, filePath)}\n`);
}

function projectStatus(root, jsonOutput) {
  const documents = collectDocuments(root);
  const statePath = path.join(root, '.project-kit', 'state.md');
  let state = {};
  if (fs.existsSync(statePath)) state = parseFrontmatter(fs.readFileSync(statePath, 'utf8'));
  const changes = documents
    .filter((item) => item.kind === 'proposal')
    .map((item) => ({
      id: item.metadata.id,
      status: item.metadata.status,
      title: item.metadata.title ?? path.basename(path.dirname(item.relativePath)),
      path: item.relativePath
    }));
  const result = {
    active_change: state.active_change ?? null,
    next_action: state.next_action ?? null,
    last_completed: state.last_completed ?? null,
    changes
  };
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  process.stdout.write('Project Kit Status\n');
  process.stdout.write(`当前焦点: ${result.active_change ?? '无'}\n`);
  process.stdout.write(`下一动作: ${result.next_action ?? '无'}\n`);
  process.stdout.write(`最近完成: ${result.last_completed ?? '无'}\n`);
  process.stdout.write(`\nChanges (${changes.length})\n`);
  for (const change of changes) {
    process.stdout.write(`  - ${change.id} [${change.status}] ${change.title}\n`);
  }
}

function listFiles(directory) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

function collectSkillFiles(root) {
  const skillsRoot = path.join(root, 'skills');
  if (!fs.existsSync(skillsRoot)) return [];
  return fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      filePath: path.join(skillsRoot, entry.name, 'SKILL.md')
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function validateMarkdownLinks(filePath, root, errors) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const match of content.matchAll(DOC_LINK_PATTERN)) {
    const target = match[1].trim();
    if (!target || target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#') || target.startsWith('mailto:')) continue;
    const cleanTarget = target.split('#')[0];
    if (!cleanTarget) continue;
    const resolved = path.resolve(path.dirname(filePath), cleanTarget);
    if (!fs.existsSync(resolved)) {
      errors.push(`失效链接 ${target}: ${path.relative(root, filePath)}`);
    }
  }
}

function validatePlugin(root, jsonOutput) {
  const errors = [];
  const warnings = [];

  for (const relativePath of REQUIRED_PLUGIN_FILES) {
    if (!fs.existsSync(path.join(root, relativePath))) errors.push(`缺少插件根文件: ${relativePath}`);
  }

  for (const relativePath of FORBIDDEN_PLUGIN_PATHS) {
    if (fs.existsSync(path.join(root, relativePath))) errors.push(`存在禁止的插件路径: ${relativePath}`);
  }

  const templateFiles = listMarkdownFiles(path.join(root, 'assets', 'templates'));
  if (templateFiles.length !== TEMPLATE_EXPECTED_COUNT) {
    errors.push(`assets/templates 数量错误: 期望 ${TEMPLATE_EXPECTED_COUNT}，实际 ${templateFiles.length}`);
  }
  for (const filePath of templateFiles) validateMarkdownLinks(filePath, root, errors);

  const skillEntries = collectSkillFiles(root);
  const skillNames = new Set();
  const actualSkillDirs = skillEntries.map((entry) => entry.name);
  if (actualSkillDirs.length !== PLUGIN_SKILLS.length) {
    errors.push(`skills 数量错误: 期望 ${PLUGIN_SKILLS.length}，实际 ${actualSkillDirs.length}`);
  }
  for (const skillName of PLUGIN_SKILLS) {
    if (!actualSkillDirs.includes(skillName)) errors.push(`缺少 skill 目录: skills/${skillName}`);
  }
  for (const entry of skillEntries) {
    if (!fs.existsSync(entry.filePath)) {
      errors.push(`缺少技能文件: ${path.relative(root, entry.filePath)}`);
      continue;
    }
    validateMarkdownLinks(entry.filePath, root, errors);
    const metadata = parseFrontmatter(fs.readFileSync(entry.filePath, 'utf8'));
    if (typeof metadata.name !== 'string' || metadata.name.trim() === '') {
      errors.push(`技能缺少 name: ${path.relative(root, entry.filePath)}`);
    } else if (metadata.name !== entry.name) {
      errors.push(`技能名与目录名不一致: ${metadata.name} vs ${entry.name}`);
    } else if (skillNames.has(metadata.name)) {
      errors.push(`重复技能名: ${metadata.name}`);
    } else {
      skillNames.add(metadata.name);
    }
    if (typeof metadata.description !== 'string' || metadata.description.trim() === '') {
      errors.push(`技能缺少 description: ${path.relative(root, entry.filePath)}`);
    }
    const skillContent = fs.readFileSync(entry.filePath, 'utf8');
    if (/shared\/|references\/|workflows\//.test(skillContent)) {
      errors.push(`技能仍引用共享/旧路径: ${path.relative(root, entry.filePath)}`);
    }
    if (!skillContent.includes('docs/')) {
      errors.push(`技能未围绕 docs/ 约定: ${path.relative(root, entry.filePath)}`);
    }
  }

  const pluginPath = path.join(root, 'plugin.json');
  if (fs.existsSync(pluginPath)) {
    try {
      JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    } catch (error) {
      errors.push(`plugin.json 不是合法 JSON: ${error.message}`);
    }
  }

  for (const docPath of ['README.md', 'CHANGELOG.md', 'AGENTS.md']) {
    const fullPath = path.join(root, docPath);
    if (fs.existsSync(fullPath)) validateMarkdownLinks(fullPath, root, errors);
  }

  const result = {
    valid: errors.length === 0,
    errors,
    warnings,
    skillCount: actualSkillDirs.length,
    templateCount: templateFiles.length
  };
  if (jsonOutput) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else {
    process.stdout.write(`Plugin 校验\n技能数: ${result.skillCount}\n模板数: ${result.templateCount}\n错误: ${errors.length}\n`);
    for (const error of errors) process.stdout.write(`  - ${error}\n`);
    process.stdout.write(`提醒: ${warnings.length}\n`);
    for (const warning of warnings) process.stdout.write(`  - ${warning}\n`);
  }
  return result.valid;
}

function nextAction(root, jsonOutput) {
  const documents = collectDocuments(root);
  const statePath = path.join(root, '.project-kit', 'state.md');
  let nextActionField = null;
  if (fs.existsSync(statePath)) {
    const stateMetadata = parseFrontmatter(fs.readFileSync(statePath, 'utf8'));
    nextActionField = typeof stateMetadata.next_action === 'string' && stateMetadata.next_action !== '' && stateMetadata.next_action !== 'null'
      ? stateMetadata.next_action
      : null;
  }
  let result;
  if (nextActionField) {
    result = { mode: 'next', target: nextActionField, reason: '本地 state 记录的下一动作' };
  } else {
    const draftProposal = documents.find((item) => item.kind === 'proposal' && item.metadata.status === 'proposed');
    const acceptedProposal = documents.find((item) => item.kind === 'proposal' && item.metadata.status === 'accepted');
    const specDraft = documents.find((item) => item.kind === 'spec' && item.metadata.status === 'draft');
    const planDraft = documents.find((item) => item.kind === 'plan' && item.metadata.status === 'draft');
    if (draftProposal) result = { mode: 'change', target: draftProposal.metadata.id, reason: 'Proposal 待用户确认范围' };
    else if (specDraft) result = { mode: 'change', target: specDraft.metadata.change, reason: 'Spec 待填写契约与验收标准' };
    else if (acceptedProposal) result = { mode: 'change', target: acceptedProposal.metadata.id, reason: 'Change 已接受，待创建 Spec' };
    else if (planDraft) result = { mode: 'plan', target: planDraft.metadata.change, reason: 'Plan 待编写或批准' };
    else result = { mode: 'status', target: null, reason: '没有机械可推导的待办，请检查 Roadmap 与本地 state' };
  }
  if (jsonOutput) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(`下一模式: ${result.mode}${result.target ? ` ${result.target}` : ''}\n原因: ${result.reason}\n`);
}

function printHelp() {
  process.stdout.write(`Project Kit document helper\n\nUsage:\n`);
  process.stdout.write(`  node project-docs.cjs init --root <project>\n`);
  process.stdout.write(`  node project-docs.cjs new <change|proposal|spec|plan|brief> [options]\n`);
  process.stdout.write(`  node project-docs.cjs context <mode> [--target <id>] --root <project> [--json]\n`);
  process.stdout.write(`  node project-docs.cjs transition <id> --to <status> [--kind <kind>] --root <project>\n`);
  process.stdout.write(`  node project-docs.cjs next --root <project> [--json]\n`);
  process.stdout.write(`  node project-docs.cjs validate --root <project> [--json]\n`);
  process.stdout.write(`  node project-docs.cjs validate-plugin --root <plugin> [--json]\n`);
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
  if (command === 'init') return initializeProject(root);
  if (command === 'new') {
    if (!positional[1]) throw new Error('new 需要文档类型');
    return createDocument(root, positional[1], options);
  }
  if (command === 'context') {
    if (!positional[1]) throw new Error('context 需要模式');
    return contextForMode(root, positional[1], typeof options.target === 'string' ? options.target : null, options.json === true);
  }
  if (command === 'transition') return transitionDocument(root, positional[1], options.to, options.kind);
  if (command === 'next') return nextAction(root, options.json === true);
  if (command === 'validate') {
    if (!validateProject(root, options.json === true)) process.exitCode = 1;
    return;
  }
  if (command === 'validate-plugin') {
    if (!validatePlugin(root, options.json === true)) process.exitCode = 1;
    return;
  }
  if (command === 'status') return projectStatus(root, options.json === true);
  throw new Error(`不支持的命令: ${command}`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
