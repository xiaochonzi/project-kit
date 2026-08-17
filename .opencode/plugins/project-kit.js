/**
 * Project Kit plugin for OpenCode (项目级自动发现入口)
 *
 * 逻辑以仓库根 plugin.js 为唯一实现,此处仅 re-export。
 * 路径解析由根 plugin.js 基于 import.meta.url 完成,相对仓库根,
 * 对本目录生效。
 */
export { ProjectKitPlugin } from '../../plugin.js';
