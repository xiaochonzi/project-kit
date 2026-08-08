---
id: BUG-001
title: list 显示短 id 但 done 无法用短 id 完成待办
status: resolved
created_at: 2026-08-09
related_specs: []
---

# list 显示短 id 但 done 无法用短 id 完成待办

## 现象与期望

现象: `node todo.js list` 显示 `[ ] 67fb76fe 买牛奶 (high) #home`(短 id,前 8 位)。用户复制 `67fb76fe` 执行 `node todo.js done 67fb76fe`,得到"待办不存在"。
期望: 按列表显示的短 id 即可完成待办。

对应 Spec: F-M1-02 验收标准 AC1(done 后 list 显示 [x]),用户流程隐含"从列表取 id 完成"。

## 复现方式

1. `node todo.js add "测试项"`
2. `node todo.js list` → 显示短 id(前 8 位)
3. `node todo.js done <短id>` → 待办不存在

## 根因证据

- `todo.js` list 分支输出 `t.id.slice(0, 8)`(短 id)
- `todo-store.js` markDone 使用 `t.id === id` 精确匹配完整 UUID
- 两者 id 形式不一致,短 id 永远匹配失败

## 修复内容

`todo-store.js` markDone 改为前缀匹配:精确匹配或 `t.id.startsWith(id)`;多匹配时提示使用完整 id(避免歧义)。

## 新鲜验证结果

- 新增回归测试 `markDone 支持短 id 前缀匹配`,修复前失败(RED),修复后通过
- `node --test test/todo-store.test.js` → 10/10 通过
- CLI 复现: `node todo.js done 35fea1e5` → "已完成: 写周报"
