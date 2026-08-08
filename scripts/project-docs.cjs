#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const SKILL_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_ROOT = fs.existsSync(path.join(SKILL_ROOT, 'shared', 'templates'))
  ? path.join(SKILL_ROOT, 'shared', 'templates')
  : path.join(SKILL_ROOT, 'assets', 'templates');
const PLUGIN_SKILLS = [
  'init',
  'constitution',
  'brief',
  'refine',
  'plan',
  'execute-plan',
  'verify-plan',
  'change',
  'bug',
  'status'
];
const FORBIDDEN_PLUGIN_PATHS = ['capability.json', 'hooks', 'eval', '.claude-plugin', '.codex-plugin'];
const REQUIRED_PLUGIN_FILES = ['plugin.json', 'README.md', 'CHANGELOG.md', 'AGENTS.md'];
const SHARED_DIRS = {
  workflows: 'shared/workflows',
  rules: 'shared/rules',
  templates: 'shared/templates'
};
const SHARED_EXPECTED_COUNTS = {
  workflows: 10,
  rules: 11,
  templates: 16
};
const DOC_LINK_PATTERN = /\[[^\]]+\]\(([^)]+)\)/g;
const MANAGED_DIRECTORIES = [
  'briefs',
  'capabilities',
  'milestones',
  'specs',
  'plans',
  'executions',
  'verifications',
  'changes',
  'fixes',
  'decisions',
  'research'
];
const INITIAL_FILES = {
  'constitution.md': 'constitution.md',
  'requirements.md': 'requirements.md',
  'blueprint.md': 'blueprint.md',
  'roadmap.md': 'roadmap.md',
  'STATE.md': 'state.md'
};
const DOCUMENT_TYPES = {
  brief: { directory: 'briefs', prefix: 'BRIEF', template: 'brief.md' },
  capability: { directory: 'capabilities', prefix: 'C', template: 'capability.md' },
  milestone: { directory: 'milestones', prefix: 'M', template: 'milestone.md' },
  context: { directory: 'milestones', template: 'context.md' },
  feature: { directory: 'specs', prefix: 'F', template: 'feature-spec.md' },
  plan: { directory: 'plans', template: 'implementation-plan.md' },
  execution: { directory: 'executions', template: 'execution-summary.md' },
  verification: { directory: 'verifications', template: 'verification.md' },
  change: { directory: 'changes', prefix: 'CR', template: 'change-request.md' },
  fix: { directory: 'fixes', prefix: 'BUG', template: 'bug-resolution.md' },
  adr: { directory: 'decisions', prefix: 'ADR', template: 'adr.md' }
};
const ALLOWED_STATUSES = {
  brief: new Set(['captured']),
  capability: new Set(['proposed', 'active', 'completed', 'deferred', 'cancelled']),
  milestone: new Set(['planned', 'active', 'completed', 'blocked', 'deferred', 'cancelled']),
  feature: new Set([
    'idea', 'draft', 'reviewed', 'approved', 'ready', 'in-progress', 'implemented', 'verified',
    'blocked', 'deferred', 'cancelled', 'superseded'
  ]),
  plan: new Set(['draft', 'approved', 'in-progress', 'completed', 'blocked']),
  execution: new Set(['in-progress', 'completed', 'blocked']),
  verification: new Set(['pending', 'passed', 'failed', 'blocked']),
  change: new Set(['proposed', 'accepted', 'deferred', 'rejected', 'completed']),
  fix: new Set(['resolved', 'blocked']),
  adr: new Set(['proposed', 'accepted', 'superseded', 'rejected'])
};
const TRANSITIONS = {
  feature: {
    idea: ['draft', 'deferred', 'cancelled'],
    draft: ['reviewed', 'blocked', 'deferred', 'cancelled'],
    reviewed: ['draft', 'approved', 'blocked', 'deferred', 'cancelled'],
    approved: ['reviewed', 'ready', 'blocked', 'deferred', 'cancelled'],
    ready: ['approved', 'in-progress', 'blocked', 'deferred', 'cancelled'],
    'in-progress': ['implemented', 'blocked', 'cancelled'],
    implemented: ['verified', 'blocked'],
    blocked: ['draft', 'reviewed', 'approved', 'ready', 'in-progress', 'implemented', 'deferred', 'cancelled'],
    deferred: ['draft', 'reviewed', 'approved', 'cancelled'],
    verified: ['superseded'],
    cancelled: [],
    superseded: []
  },
  milestone: {
    planned: ['active', 'blocked', 'deferred', 'cancelled'],
    active: ['completed', 'blocked', 'deferred', 'cancelled'],
    blocked: ['planned', 'active', 'deferred', 'cancelled'],
    deferred: ['planned', 'cancelled'],
    completed: [],
    cancelled: []
  },
  capability: {
    proposed: ['active', 'deferred', 'cancelled'],
    active: ['completed', 'deferred', 'cancelled'],
    deferred: ['proposed', 'cancelled'],
    completed: [],
    cancelled: []
  },
  plan: {
    draft: ['approved', 'blocked'],
    approved: ['in-progress', 'blocked'],
    'in-progress': ['completed', 'blocked'],
    blocked: ['draft', 'approved', 'in-progress'],
    completed: []
  },
  execution: {
    'in-progress': ['completed', 'blocked'],
    blocked: ['in-progress'],
    completed: []
  },
  verification: {
    pending: ['passed', 'failed', 'blocked'],
    failed: ['pending'],
    blocked: ['pending'],
    passed: []
  },
  change: {
    proposed: ['accepted', 'deferred', 'rejected'],
    accepted: ['completed', 'deferred'],
    deferred: ['accepted', 'rejected'],
    completed: [],
    rejected: []
  },
  adr: {
    proposed: ['accepted', 'rejected'],
    accepted: ['superseded'],
    superseded: [],
    rejected: []
  }
};
const REFERENCE_FIELDS = [
  'source', 'requirements', 'milestone', 'capability', 'feature', 'depends_on', 'extends',
  'supersedes', 'superseded_by', 'related_specs', 'affects'
];
const ID_PATTERN = /^(?:BRIEF-\d{3}|CR-\d{3}|C-\d{3}|M\d+|F-M\d+-\d{2}|BUG-\d{3}|ADR-\d{3})$/;
const REQ_PATTERN = /^REQ-\d{3}$/;
const REQUIRED_SECTIONS = {
  capability: ['最终目标', '能力边界', 'Milestones', '全局完成标准'],
  milestone: ['阶段目标', '可验证系统状态', 'Feature Map', '退出标准'],
  feature: ['问题与依据', '目标', '范围', '失败与边界情况', '验收标准', '需求追踪'],
  plan: ['实现策略', 'Must-haves', 'Tasks', '验收标准映射', '最终验证'],
  execution: ['Task Results', '实际修改文件', '验证记录', '最终结果'],
  verification: ['验证环境', '验收证据', '回归与边界检查', '结论'],
  change: ['当前问题', '期望结果', '接入方案与取舍', '决定'],
  fix: ['现象与期望', '复现方式', '根因证据', '修复内容', '新鲜验证结果'],
  adr: ['背景与约束', '决策', '理由', '影响', '验证方式']
};
const CONTENT_GATES = {
  capability: { statuses: ['active', 'completed'], sections: ['最终目标', '能力边界', '全局完成标准'] },
  milestone: { statuses: ['active', 'completed'], sections: ['阶段目标', '可验证系统状态', 'Feature Map', '退出标准'] },
  feature: {
    statuses: ['reviewed', 'approved', 'ready', 'in-progress', 'implemented', 'verified'],
    sections: ['问题与依据', '目标', '范围', '验收标准', '需求追踪']
  },
  plan: { statuses: ['approved', 'in-progress', 'completed'], sections: ['实现策略', 'Must-haves', '验收标准映射', '最终验证'] },
  execution: { statuses: ['completed'], sections: ['Task Results', '实际修改文件', '验证记录', '最终结果'] },
  verification: { statuses: ['passed'], sections: ['验证环境', '验收证据', '回归与边界检查', '结论'] },
  change: { statuses: ['accepted', 'completed'], sections: ['当前问题', '期望结果', '接入方案与取舍', '决定'] },
  fix: { statuses: ['resolved'], sections: ['现象与期望', '复现方式', '根因证据', '修复内容', '新鲜验证结果'] },
  adr: { statuses: ['accepted'], sections: ['背景与约束', '决策', '理由', '影响', '验证方式'] }
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
  const firstDirectory = relativePath.split(path.sep)[0];
  const directoryKinds = {
    briefs: 'brief', capabilities: 'capability', milestones: 'milestone', specs: 'feature',
    plans: 'plan', executions: 'execution', verifications: 'verification', changes: 'change',
    fixes: 'fix', decisions: 'adr'
  };
  if (firstDirectory === 'milestones' && relativePath.endsWith('-CONTEXT.md')) return null;
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
    return { filePath, relativePath, content, metadata, kind: documentKind(relativePath, metadata) };
  });
}

function parseRequirements(root) {
  const filePath = path.join(root, 'docs', 'requirements.md');
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const matches = [...content.matchAll(/^###\s+(REQ-\d{3})(?:\s*:\s*(.+))?\r?\n([\s\S]*?)(?=^###\s+REQ-|(?![\s\S]))/gm)];
  return matches.map((match) => {
    const fields = {};
    for (const fieldMatch of match[3].matchAll(/^-\s+([a-z_]+):\s*(.*)$/gm)) {
      fields[fieldMatch[1]] = fieldMatch[2].trim();
    }
    const splitIds = (value, pattern) => (value || '').split(',').map((item) => item.trim()).filter((item) => pattern.test(item));
    return {
      id: match[1],
      title: (match[2] || '').trim(),
      status: fields.status || 'proposed',
      source: splitIds(fields.source, ID_PATTERN),
      milestones: splitIds(fields.milestones, /^M\d+$/),
      features: splitIds(fields.features, /^F-M\d+-\d{2}$/)
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
}

function findFeature(documents, featureId) {
  return documents.find((document) => document.kind === 'feature' && document.metadata.id === featureId);
}

function createFeatureArtifact(root, type, options, documents) {
  if (typeof options.feature !== 'string') throw new Error(`new ${type} 需要 --feature`);
  const feature = findFeature(documents, options.feature);
  if (!feature) throw new Error(`Feature 不存在: ${options.feature}`);
  const definitions = {
    plan: { suffix: 'plan', title: '实现计划' },
    execution: { suffix: 'execution', title: '执行记录' },
    verification: { suffix: 'verification', title: '验收记录' }
  };
  const definition = definitions[type];
  const outputPath = path.join(root, 'docs', DOCUMENT_TYPES[type].directory, `${options.feature}-${definition.suffix}.md`);
  const featureTitle = typeof feature.metadata.title === 'string' ? feature.metadata.title : options.feature;
  writeNewFile(outputPath, renderTemplate(DOCUMENT_TYPES[type].template, {
    TITLE: `${featureTitle} ${definition.title}`,
    FEATURE: options.feature,
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

  if (['plan', 'execution', 'verification'].includes(type)) {
    createFeatureArtifact(root, type, options, documents);
    return;
  }

  if (type === 'context') {
    if (typeof options.milestone !== 'string' || !/^M\d+$/.test(options.milestone)) {
      throw new Error('new context 需要有效的 --milestone，例如 M2');
    }
    if (!documents.some((document) => document.kind === 'milestone' && document.metadata.id === options.milestone)) {
      throw new Error(`Milestone 不存在: ${options.milestone}`);
    }
    const outputPath = path.join(docsRoot, 'milestones', `${options.milestone}-CONTEXT.md`);
    writeNewFile(outputPath, renderTemplate(definition.template, { MILESTONE: options.milestone, DATE: currentDate() }));
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
    if (!documents.some((document) => document.kind === 'milestone' && document.metadata.id === options.milestone)) {
      throw new Error(`Milestone 不存在: ${options.milestone}`);
    }
    id = nextFeatureId(documents, options.milestone);
    outputDirectory = path.join(outputDirectory, options.milestone);
    values.MILESTONE = options.milestone;
  } else {
    id = nextSequentialId(documents, definition.prefix);
  }

  if (type === 'brief' && typeof options.source !== 'string') {
    throw new Error('new brief 需要 --source <原始需求文件>');
  }
  if (type === 'brief') {
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
  const stableContent = content.replace(/^status:[^\r\n]*$/m, 'status: <lifecycle>');
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
  const activePlans = documents.filter((document) => document.kind === 'plan' && ['approved', 'in-progress'].includes(document.metadata.status));
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

function validateProject(root, jsonOutput) {
  const docsRoot = path.join(root, 'docs');
  const documents = collectDocuments(root);
  const requirements = parseRequirements(root);
  const errors = [];
  const warnings = [];
  const ids = new Map();
  const requirementIds = new Set(requirements.map((requirement) => requirement.id));

  for (const fileName of Object.keys(INITIAL_FILES)) {
    if (!fs.existsSync(path.join(docsRoot, fileName))) errors.push(`缺少根文档: docs/${fileName}`);
  }

  for (const document of documents) {
    const { id, status } = document.metadata;
    if (document.kind && !status) errors.push(`缺少 status: ${document.relativePath}`);
    if (document.kind && !['plan', 'execution', 'verification'].includes(document.kind) && typeof id !== 'string') {
      errors.push(`缺少 id: ${document.relativePath}`);
    }
    if (typeof id === 'string') {
      if (!ID_PATTERN.test(id)) errors.push(`非法 ID ${id}: ${document.relativePath}`);
      if (ids.has(id)) errors.push(`重复 ID ${id}: ${ids.get(id)} 与 ${document.relativePath}`);
      ids.set(id, document.relativePath);
      if (!path.basename(document.filePath).startsWith(`${id}-`) && path.basename(document.filePath) !== `${id}.md`) {
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
    if (document.kind === 'plan') validatePlanTasks(document, errors, warnings);
  }

  for (const requirement of requirements) {
    if (!['proposed', 'accepted', 'blocked', 'deferred', 'rejected', 'delivered'].includes(requirement.status)) {
      errors.push(`Requirement 非法状态 ${requirement.status}: ${requirement.id}`);
    }
    for (const source of requirement.source) if (!ids.has(source)) errors.push(`Requirement 来源无效 ${source}: ${requirement.id}`);
  }

  for (const document of documents) {
    for (const field of REFERENCE_FIELDS) {
      for (const reference of asArray(document.metadata[field])) {
        if (typeof reference !== 'string') continue;
        if (REQ_PATTERN.test(reference) && !requirementIds.has(reference)) {
          errors.push(`无效 Requirement 引用 ${reference}: ${document.relativePath} 字段 ${field}`);
        } else if (ID_PATTERN.test(reference) && !ids.has(reference)) {
          errors.push(`无效引用 ${reference}: ${document.relativePath} 字段 ${field}`);
        }
      }
    }
    if (document.kind === 'feature' && typeof document.metadata.milestone === 'string') {
      const expectedDirectory = path.join('specs', document.metadata.milestone);
      if (!document.relativePath.startsWith(`${expectedDirectory}${path.sep}`)) {
        errors.push(`Feature 目录与 milestone 不一致: ${document.relativePath}`);
      }
    }
    if (document.kind === 'plan') {
      const feature = findFeature(documents, document.metadata.feature);
      if (!feature) errors.push(`Plan 对应 Feature 不存在: ${document.relativePath}`);
      if (feature && document.metadata.status !== 'draft') {
        const missing = asArray(feature.metadata.requirements).filter((id) => !asArray(document.metadata.requirements).includes(id));
        if (missing.length > 0) errors.push(`Plan 缺少 Feature Requirements ${missing.join(', ')}: ${document.relativePath}`);
      }
    }
    if (document.kind === 'feature' && document.metadata.status === 'implemented') {
      warnings.push(`已实现但尚未验证: ${document.metadata.id}`);
    }
    if (document.kind === 'feature' && document.metadata.status === 'verified') {
      const verification = documents.find((item) => item.kind === 'verification' && item.metadata.feature === document.metadata.id);
      if (!verification || verification.metadata.status !== 'passed') {
        errors.push(`verified Feature 缺少 passed Verification: ${document.metadata.id}`);
      } else if (verification.metadata.spec_hash !== contentHash(document.content)) {
        errors.push(`verified Feature 在验收后发生变化: ${document.metadata.id}`);
      }
    }
    if (document.kind === 'verification' && document.metadata.status === 'passed') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(document.metadata.verified_at || '')) {
        errors.push(`passed Verification 缺少 verified_at: ${document.relativePath}`);
      }
      if (!document.metadata.spec_hash || document.metadata.spec_hash === 'null') {
        errors.push(`passed Verification 缺少 spec_hash: ${document.relativePath}`);
      }
      if (!document.metadata.implementation_ref || document.metadata.implementation_ref === 'null') {
        errors.push(`passed Verification 缺少 implementation_ref: ${document.relativePath}`);
      }
    }
  }

  detectDependencyCycles(documents, errors);
  validateFileConflicts(documents, warnings);
  const coverage = calculateCoverage(requirements, documents);
  for (const item of coverage.uncovered) errors.push(`accepted Requirement 未完整覆盖 ${item.id}: 缺少 ${item.missing.join('、')}`);

  const result = {
    valid: errors.length === 0,
    errors,
    warnings,
    documentCount: documents.length,
    requirementCount: requirements.length,
    acceptedRequirementCoverage: coverage.percentage
  };
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`文档数: ${documents.length}\nRequirements: ${requirements.length}\n`);
    process.stdout.write(`Accepted REQ 覆盖率: ${coverage.percentage}%\n错误: ${errors.length}\n`);
    for (const error of errors) process.stdout.write(`  - ${error}\n`);
    process.stdout.write(`提醒: ${warnings.length}\n`);
    for (const warning of warnings) process.stdout.write(`  - ${warning}\n`);
  }
  return result.valid;
}

function calculateCoverage(requirements, documents) {
  const byId = new Map(documents.map((document) => [document.metadata.id, document]).filter(([id]) => id));
  const accepted = requirements.filter((requirement) => requirement.status === 'accepted');
  const uncovered = [];
  for (const requirement of accepted) {
    const missing = [];
    if (
      requirement.milestones.length === 0
      || requirement.milestones.some((id) => !byId.has(id) || !asArray(byId.get(id).metadata.requirements).includes(requirement.id))
    ) missing.push('Milestone 双向映射');
    if (
      requirement.features.length === 0
      || requirement.features.some((id) => !byId.has(id) || !asArray(byId.get(id).metadata.requirements).includes(requirement.id))
    ) missing.push('Feature 双向映射');
    if (missing.length > 0) uncovered.push({ id: requirement.id, missing });
  }
  const covered = accepted.length - uncovered.length;
  const percentage = accepted.length === 0 ? 100 : Math.round((covered / accepted.length) * 100);
  return { accepted: accepted.length, covered, percentage, uncovered };
}

function reportCoverage(root, jsonOutput) {
  const result = calculateCoverage(parseRequirements(root), collectDocuments(root));
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return result.uncovered.length === 0;
  }
  process.stdout.write(`Accepted Requirements: ${result.accepted}\n`);
  process.stdout.write(`完整覆盖: ${result.covered}\n覆盖率: ${result.percentage}%\n`);
  for (const item of result.uncovered) process.stdout.write(`  - ${item.id}: 缺少 ${item.missing.join('、')}\n`);
  return result.uncovered.length === 0;
}

function findTarget(documents, target, kind) {
  const matches = documents.filter((document) => {
    if (kind && document.kind !== kind) return false;
    return document.metadata.id === target || document.metadata.feature === target;
  });
  if (matches.length === 0) throw new Error(`找不到目标文档: ${target}${kind ? ` (${kind})` : ''}`);
  const exact = matches.find((document) => document.metadata.id === target);
  if (exact && !kind) return exact;
  if (matches.length > 1) throw new Error(`目标不唯一，请使用 --kind: ${matches.map((item) => item.kind).join(', ')}`);
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

  if (document.kind === 'feature' && nextStatus === 'ready') {
    const plan = documents.find((item) => item.kind === 'plan' && item.metadata.feature === target);
    if (!plan || plan.metadata.status !== 'approved') throw new Error(`${target} 进入 ready 前需要 approved Plan`);
  }
  if (document.kind === 'feature' && ['reviewed', 'approved'].includes(nextStatus)) {
    const empty = emptySections(document, ['问题与依据', '目标', '范围', '验收标准', '需求追踪']);
    if (empty.length > 0) throw new Error(`${target} 进入 ${nextStatus} 前必须填写: ${empty.join('、')}`);
  }
  if (document.kind === 'plan' && nextStatus === 'approved') {
    const feature = findFeature(documents, document.metadata.feature);
    if (!feature || feature.metadata.status !== 'approved') throw new Error('Plan approved 前 Feature 必须为 approved');
    const taskErrors = [];
    validatePlanTasks(document, taskErrors, []);
    if (taskErrors.length > 0) throw new Error(taskErrors.join('\n'));
    const empty = emptySections(document, ['实现策略', 'Must-haves', '验收标准映射', '最终验证']);
    if (empty.length > 0) throw new Error(`Plan 批准前必须填写: ${empty.join('、')}`);
  }
  if (document.kind === 'feature' && nextStatus === 'implemented') {
    const plan = documents.find((item) => item.kind === 'plan' && item.metadata.feature === target);
    const execution = documents.find((item) => item.kind === 'execution' && item.metadata.feature === target);
    if (!plan || plan.metadata.status !== 'completed' || !execution || execution.metadata.status !== 'completed') {
      throw new Error(`${target} 进入 implemented 前需要 completed Plan 和 Execution`);
    }
  }
  if (document.kind === 'verification' && nextStatus === 'passed') {
    const feature = findFeature(documents, document.metadata.feature);
    if (!feature || feature.metadata.status !== 'implemented') throw new Error('Verification passed 前 Feature 必须为 implemented');
    const empty = emptySections(document, ['验证环境', '验收证据', '回归与边界检查', '结论']);
    if (empty.length > 0) throw new Error(`Verification passed 前必须填写: ${empty.join('、')}`);
    if (!document.metadata.implementation_ref || document.metadata.implementation_ref === 'null') {
      throw new Error('Verification passed 前必须填写 implementation_ref');
    }
  }
  if (document.kind === 'execution' && nextStatus === 'completed') {
    const feature = findFeature(documents, document.metadata.feature);
    const plan = documents.find((item) => item.kind === 'plan' && item.metadata.feature === document.metadata.feature);
    if (!feature || feature.metadata.status !== 'in-progress' || !plan || plan.metadata.status !== 'completed') {
      throw new Error('Execution completed 前 Feature 必须为 in-progress 且 Plan 必须为 completed');
    }
    const empty = emptySections(document, ['Task Results', '实际修改文件', '验证记录', '最终结果']);
    if (empty.length > 0) throw new Error(`Execution completed 前必须填写: ${empty.join('、')}`);
  }
  if (document.kind === 'milestone' && nextStatus === 'completed') {
    const unfinished = documents.filter((item) => item.kind === 'feature' && item.metadata.milestone === target && item.metadata.status !== 'verified');
    if (unfinished.length > 0) throw new Error(`Milestone completed 前仍有未验证 Feature: ${unfinished.map((item) => item.metadata.id).join(', ')}`);
  }
  if (document.kind === 'feature' && nextStatus === 'verified') {
    const verification = documents.find((item) => item.kind === 'verification' && item.metadata.feature === target);
    if (!verification || verification.metadata.status !== 'passed') throw new Error(`${target} 进入 verified 前需要 passed Verification`);
  }

  let content = replaceFrontmatterField(document.content, 'status', nextStatus);
  if (document.kind === 'execution' && nextStatus === 'completed') {
    content = replaceFrontmatterField(content, 'completed_at', currentDate());
  }
  if (document.kind === 'verification' && nextStatus === 'passed') {
    const feature = findFeature(documents, document.metadata.feature);
    content = replaceFrontmatterField(content, 'verified_at', currentDate());
    content = replaceFrontmatterField(content, 'spec_hash', contentHash(feature.content));
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
  for (const fileName of ['constitution.md', 'requirements.md', 'blueprint.md', 'roadmap.md', 'STATE.md']) add(fileName);

  if (mode === 'brief') for (const document of documents.filter((item) => item.kind === 'brief')) paths.add(document.relativePath);
  if (mode === 'change') {
    for (const document of documents.filter((item) => ['change', 'adr'].includes(item.kind))) paths.add(document.relativePath);
  }
  if (target) {
    const feature = findFeature(documents, target);
    const targetDocument = feature || documents.find((item) => item.metadata.id === target);
    if (!targetDocument) throw new Error(`找不到上下文目标: ${target}`);
    paths.add(targetDocument.relativePath);
    const references = new Set();
    for (const field of REFERENCE_FIELDS) for (const reference of asArray(targetDocument.metadata[field])) references.add(reference);
    if (targetDocument.kind === 'feature') references.add(targetDocument.metadata.milestone);
    for (const document of documents) {
      if (references.has(document.metadata.id)) paths.add(document.relativePath);
      if (document.metadata.feature === target) paths.add(document.relativePath);
    }
    const milestone = targetDocument.kind === 'milestone' ? target : targetDocument.metadata.milestone;
    if (milestone) add(path.join('milestones', `${milestone}-CONTEXT.md`));
  }
  if (mode === 'bug') for (const document of documents.filter((item) => item.kind === 'fix')) paths.add(document.relativePath);
  const result = { mode, target: target || null, files: [...paths].sort() };
  if (jsonOutput) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else for (const filePath of result.files) process.stdout.write(`${path.join(docsRoot, filePath)}\n`);
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
      for (const item of summary[kind][status]) process.stdout.write(`    - ${item.id ? `${item.id} ` : ''}${item.title}\n`);
    }
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

  const sharedCounts = {};
  for (const [key, relativePath] of Object.entries(SHARED_DIRS)) {
    const files = listMarkdownFiles(path.join(root, relativePath));
    sharedCounts[key] = files.length;
    if (files.length !== SHARED_EXPECTED_COUNTS[key]) {
      errors.push(`shared/${key} 数量错误: 期望 ${SHARED_EXPECTED_COUNTS[key]}，实际 ${files.length}`);
    }
    for (const filePath of files) validateMarkdownLinks(filePath, root, errors);
  }

  if (!fs.existsSync(path.join(root, 'shared', 'overview.md'))) {
    errors.push('缺少 shared/overview.md');
  } else {
    validateMarkdownLinks(path.join(root, 'shared', 'overview.md'), root, errors);
  }

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
    } else if (skillNames.has(metadata.name)) {
      errors.push(`重复技能名: ${metadata.name}`);
    } else {
      skillNames.add(metadata.name);
    }
    if (typeof metadata.description !== 'string' || metadata.description.trim() === '') {
      errors.push(`技能缺少 description: ${path.relative(root, entry.filePath)}`);
    }
    const skillContent = fs.readFileSync(entry.filePath, 'utf8');
    if (!skillContent.includes('shared/workflows/')) errors.push(`技能未引用 shared/workflows: ${path.relative(root, entry.filePath)}`);
    if (!skillContent.includes('shared/rules/') && entry.name !== 'status') warnings.push(`技能未显式引用 shared/rules: ${path.relative(root, entry.filePath)}`);
    if (/references\/|assets\/templates\//.test(skillContent)) errors.push(`技能仍引用旧路径: ${path.relative(root, entry.filePath)}`);
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
    sharedWorkflowCount: sharedCounts.workflows || 0,
    sharedRuleCount: sharedCounts.rules || 0,
    sharedTemplateCount: sharedCounts.templates || 0
  };
  if (jsonOutput) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else {
    process.stdout.write(`Plugin 校验\n技能数: ${result.skillCount}\nshared/workflows: ${result.sharedWorkflowCount}\nshared/rules: ${result.sharedRuleCount}\nshared/templates: ${result.sharedTemplateCount}\n错误: ${errors.length}\n`);
    for (const error of errors) process.stdout.write(`  - ${error}\n`);
    process.stdout.write(`提醒: ${warnings.length}\n`);
    for (const warning of warnings) process.stdout.write(`  - ${warning}\n`);
  }
  return result.valid;
}

function nextAction(root, jsonOutput) {
  const documents = collectDocuments(root);
  const coverage = calculateCoverage(parseRequirements(root), documents);
  let result;
  if (coverage.uncovered.length > 0) {
    result = { mode: 'brief', target: null, reason: `${coverage.uncovered.length} 个 accepted Requirement 未完整覆盖` };
  } else {
    const failed = documents.find((item) => item.kind === 'verification' && ['failed', 'blocked'].includes(item.metadata.status));
    const implemented = documents.find((item) => item.kind === 'feature' && item.metadata.status === 'implemented');
    const inProgress = documents.find((item) => item.kind === 'feature' && item.metadata.status === 'in-progress');
    const approved = documents.find((item) => item.kind === 'feature' && item.metadata.status === 'approved');
    const draft = documents.find((item) => item.kind === 'feature' && ['idea', 'draft', 'reviewed'].includes(item.metadata.status));
    const activeMilestone = documents.find((item) => item.kind === 'milestone' && item.metadata.status === 'active');
    if (failed) result = { mode: 'execute-plan', target: failed.metadata.feature, reason: 'Verification 尚未通过' };
    else if (implemented) result = { mode: 'verify-plan', target: implemented.metadata.id, reason: 'Feature 已实现但尚未独立验收' };
    else if (inProgress) result = { mode: 'execute-plan', target: inProgress.metadata.id, reason: 'Feature 正在执行' };
    else if (approved) result = { mode: 'plan', target: approved.metadata.id, reason: 'Feature 已批准但尚无可执行状态' };
    else if (draft) result = { mode: 'refine', target: draft.metadata.id, reason: 'Feature 尚未批准' };
    else if (activeMilestone) result = { mode: 'refine', target: activeMilestone.metadata.id, reason: 'Active Milestone 尚无可推进 Feature' };
    else result = { mode: 'status', target: null, reason: '没有机械可推导的待办，请检查 Roadmap 与 STATE' };
  }
  if (jsonOutput) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(`下一模式: ${result.mode}${result.target ? ` ${result.target}` : ''}\n原因: ${result.reason}\n`);
}

function printHelp() {
  process.stdout.write(`Project Kit document helper\n\nCurrent conventions: docs/blueprint.md and docs/fixes/ remain the first-round canonical names during multi-skill migration.\n\nUsage:\n`);
  process.stdout.write(`  node project-docs.cjs init --root <project>\n`);
  process.stdout.write(`  node project-docs.cjs new <brief|capability|milestone|context|feature|plan|execution|verification|change|fix|adr> [options]\n`);
  process.stdout.write(`  node project-docs.cjs context <mode> [--target <id>] --root <project> [--json]\n`);
  process.stdout.write(`  node project-docs.cjs coverage --root <project> [--json]\n`);
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
  if (command === 'coverage') {
    if (!reportCoverage(root, options.json === true)) process.exitCode = 1;
    return;
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
