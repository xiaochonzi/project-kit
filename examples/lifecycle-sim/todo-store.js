const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DATA_FILE = process.env.TODO_DATA_FILE || path.join(__dirname, 'todo.json');
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function load() {
  if (!fs.existsSync(DATA_FILE)) return [];
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    throw new Error('todo.json 损坏,拒绝启动');
  }
  if (!Array.isArray(raw)) throw new Error('todo.json 格式错误');
  return raw;
}

function save(todos) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(todos, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function add({ title, priority = 'medium', tags = [] }) {
  if (!title || title.trim() === '') throw new Error('标题不能为空');
  if (!(priority in PRIORITY_ORDER)) throw new Error('非法优先级');
  const todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    priority,
    tags,
    done: false,
    created_at: new Date().toISOString()
  };
  const todos = load();
  todos.push(todo);
  save(todos);
  return todo;
}

function list() {
  return load().sort((a, b) =>
    PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    || a.created_at.localeCompare(b.created_at)
  );
}

function markDone(id) {
  const todos = load();
  const matches = todos.filter((t) => t.id === id || t.id.startsWith(id));
  if (matches.length === 0) throw new Error('待办不存在: ' + id);
  if (matches.length > 1) throw new Error('id 不唯一,请使用完整 id: ' + id);
  matches[0].done = true;
  save(todos);
  return matches[0];
}

module.exports = { load, save, add, list, markDone, DATA_FILE };
