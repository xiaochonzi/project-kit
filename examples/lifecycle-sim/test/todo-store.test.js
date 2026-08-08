const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
process.env.TODO_DATA_FILE = path.join(tmpDir, 'todo.json');

const store = require('../todo-store');

test('load 返回空数组当文件不存在', () => {
  assert.deepEqual(store.load(), []);
});

test('add 后 list 包含新项且字段完整', () => {
  const todo = store.add({ title: '买牛奶', priority: 'high', tags: ['home'] });
  assert.ok(todo.id);
  assert.equal(todo.title, '买牛奶');
  assert.equal(todo.priority, 'high');
  assert.deepEqual(todo.tags, ['home']);
  assert.equal(todo.done, false);
  const todos = store.list();
  assert.equal(todos.length, 1);
  assert.equal(todos[0].title, '买牛奶');
});

test('list 按优先级 high>medium>low 排序', () => {
  store.add({ title: '低优先级', priority: 'low' });
  store.add({ title: '中优先级', priority: 'medium' });
  store.add({ title: '高优先级', priority: 'high' });
  const titles = store.list().map((t) => t.title);
  assert.deepEqual(titles, ['买牛奶', '高优先级', '中优先级', '低优先级']);
});

test('标题为空抛错', () => {
  assert.throws(() => store.add({ title: '  ' }), /标题不能为空/);
});

test('非法优先级抛错', () => {
  assert.throws(() => store.add({ title: 'x', priority: 'urgent' }), /非法优先级/);
});

test('损坏的 JSON 抛错拒绝启动', () => {
  fs.writeFileSync(process.env.TODO_DATA_FILE, '{broken');
  assert.throws(() => store.load(), /损坏/);
  fs.rmSync(process.env.TODO_DATA_FILE);
});

test('markDone 后 done 为 true 且持久化', () => {
  const todo = store.add({ title: '完成我' });
  store.markDone(todo.id);
  assert.equal(store.load().find((t) => t.id === todo.id).done, true);
});

test('markDone 幂等,重复调用不报错', () => {
  const todo = store.add({ title: '幂等项' });
  store.markDone(todo.id);
  store.markDone(todo.id);
  assert.equal(store.load().find((t) => t.id === todo.id).done, true);
});

test('markDone 不存在 id 抛错且数据不变', () => {
  const before = store.load().length;
  assert.throws(() => store.markDone('no-such-id'), /不存在/);
  assert.equal(store.load().length, before);
});

test('markDone 支持短 id 前缀匹配(复现 BUG-001)', () => {
  const todo = store.add({ title: '短id匹配' });
  store.markDone(todo.id.slice(0, 8));
  assert.equal(store.load().find((t) => t.id === todo.id).done, true);
});
