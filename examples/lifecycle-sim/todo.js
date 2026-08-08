#!/usr/bin/env node
const store = require('./todo-store');

const [, , command, ...rest] = process.argv;

function parseArgs(args) {
  const result = { positional: [], priority: null, tags: [] };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--priority') {
      result.priority = args[i + 1];
      i += 1;
    } else if (arg === '--tags') {
      result.tags = (args[i + 1] || '').split(',').filter(Boolean);
      i += 1;
    } else {
      result.positional.push(arg);
    }
  }
  return result;
}

function main() {
  try {
    if (command === 'add') {
      const parsed = parseArgs(rest);
      const todo = store.add({ title: parsed.positional.join(' '), priority: parsed.priority, tags: parsed.tags });
      console.log(`已添加: ${todo.title} (${todo.priority})`);
    } else if (command === 'list') {
      const todos = store.list();
      if (todos.length === 0) {
        console.log('暂无待办');
      } else {
        for (const t of todos) {
          const mark = t.done ? '[x]' : '[ ]';
          const tags = t.tags.length ? ' #' + t.tags.join(' #') : '';
          console.log(`${mark} ${t.id.slice(0, 8)} ${t.title} (${t.priority})${tags}`);
        }
      }
    } else if (command === 'done') {
      const id = rest[0];
      if (!id) throw new Error('done 需要待办 id');
      const todo = store.markDone(id);
      console.log(`已完成: ${todo.title}`);
    } else {
      console.log('用法: node todo.js add <标题> [--priority high|medium|low] [--tags a,b] | list | done <id>');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
