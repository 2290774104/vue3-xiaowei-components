# 注册点对照表

> 本文件由 `scripts/gen-skill-references.mjs` 从源码生成，**请勿手改**。改完源码后运行 `pnpm gen:skill` 重新生成。

新增或修改组件时，必须同步的位置。状态列是当前仓库的真实情况，由脚本核对。

> ⚠️ `packages/index.ts` **不需要改** —— 它用 `Object.keys(components)` 自动注册全部组件，
> 只改 `packages/components.ts` 即可。这是最容易多此一举的地方。

> ⚠️ `docs/.vitepress/config.ts` 里顶部版本号从 `package.json` 读取，改版本只需动 `package.json`。

---

## XwForm

| 注册点 | 文件 | 状态 |
| --- | --- | --- |
| 组件实现 | `packages/Form/modules/Form.vue` | ✅ |
| install 注册 | `packages/Form/index.ts` | ✅ |
| 组件总登记 | `packages/components.ts` | ✅ |
| 全局类型声明 | `components.d.ts` | ✅ |
| 组件文档 | `docs/components/Form.md` | ✅ |
| 示例 demo | `docs/demos/Form/base.vue` | ✅ |
| 文档侧边栏 | `docs/.vitepress/config.ts` | ✅ |
| 组件总览卡片 | `docs/components/overview.md` | ✅ |
| 本地调试页 | `examples/views/Form/index.vue` | ✅ |
| 调试页路由 | `examples/router/index.ts` | ✅ |

---

## XwSearch

| 注册点 | 文件 | 状态 |
| --- | --- | --- |
| 组件实现 | `packages/Search/modules/Search.vue` | ✅ |
| install 注册 | `packages/Search/index.ts` | ✅ |
| 组件总登记 | `packages/components.ts` | ✅ |
| 全局类型声明 | `components.d.ts` | ✅ |
| 组件文档 | `docs/components/Search.md` | ✅ |
| 示例 demo | `docs/demos/Search/base.vue` | ❌ |
| 文档侧边栏 | `docs/.vitepress/config.ts` | ✅ |
| 组件总览卡片 | `docs/components/overview.md` | ✅ |
| 本地调试页 | `examples/views/Search/index.vue` | （可选） |
| 调试页路由 | `examples/router/index.ts` | （可选） |

---

## XwTable

| 注册点 | 文件 | 状态 |
| --- | --- | --- |
| 组件实现 | `packages/Table/modules/Table.vue` | ✅ |
| install 注册 | `packages/Table/index.ts` | ✅ |
| 组件总登记 | `packages/components.ts` | ✅ |
| 全局类型声明 | `components.d.ts` | ✅ |
| 组件文档 | `docs/components/Table.md` | ✅ |
| 示例 demo | `docs/demos/Table/base.vue` | ✅ |
| 文档侧边栏 | `docs/.vitepress/config.ts` | ✅ |
| 组件总览卡片 | `docs/components/overview.md` | ✅ |
| 本地调试页 | `examples/views/Table/index.vue` | ✅ |
| 调试页路由 | `examples/router/index.ts` | ✅ |
