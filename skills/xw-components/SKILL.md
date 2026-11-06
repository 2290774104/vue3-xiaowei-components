---
name: xw-components
description: vue3-xiaowei-components（Vue3 + Element Plus 二次封装组件库）的开发与使用助手。两种场景都覆盖：(1) 维护组件库本身——新增组件、修改组件的 props/事件/插槽、补文档与 demo、配 VitePress 侧边栏、写更新日志发版、体检注册点遗漏；(2) 在业务项目里使用 XwTable / XwSearch / XwForm 写页面——查 API、组合用法、排查不生效或渲染异常。触发词：XwTable、XwSearch、XwForm、xw-table、xw-form、小微组件库、vue3-xiaowei-components、新增组件、组件文档、组件 demo、注册组件。
agent_created: true
---

# vue3-xiaowei-components 开发与使用

基于 Element Plus 二次封装的 Vue3 组件库。本 skill 覆盖两类截然不同的场景，**先判定当前处于哪种场景，再读对应的 references**。

## 第一步：判定场景

检查当前工作目录（或用户提到的目录）是否为组件库仓库本身：

```bash
# 判定依据：package.json 的 name，以及 packages/components.ts 是否存在
node -e "const p=require('./package.json');console.log(p.name)"
```

- `name === 'vue3-xiaowei-components'` 且存在 `packages/components.ts` → **DEV 模式**（维护组件库）
- 其他情况（业务项目里 `node_modules/vue3-xiaowei-components` 或者只是在写页面）→ **USE 模式**（使用组件）

如果用户明确说"新增组件""改组件""发版""补文档"，直接进 DEV 模式，不必再判定。

---

## DEV 模式：维护组件库

### 先读这些（按需，不要一次全读）

| 文件 | 什么时候读 |
| --- | --- |
| `references/components.md` | **动手前必读**。组件清单 + 每个组件的 props/events/slots/暴露方法，由源码生成 |
| `references/registration.md` | 新增或删除组件时读。注册点对照表 + 当前仓库各项是否齐全 |
| `references/icons.md` | 用到图标时读。Element Plus 图标名全集，★ 标注的是本仓库已在用的 |
| `references/conventions.md` | 写组件代码前读。命名、目录、props 写法、样式约定 |
| `references/doc-templates.md` | 写组件文档时读。属性/事件/插槽三张表的格式、demo 引用语法 |

> `references/components.md`、`icons.md`、`registration.md` **是脚本生成的，不要手改**。
> 源码变更后运行 `pnpm gen:skill` 重新生成，再用 `pnpm verify:skill` 校验一致性。

### 工作流 A：新增组件

最省事的方式是用脚手架，它会生成骨架**并自动插入全部注册点**：

```bash
pnpm new:component XwXxx --category 表单组件 --dir Xxx
```

- `--category`：VitePress 侧边栏分类，取值 `数据展示` / `表单组件`（不确定就选最接近的）
- `--dir`：目录名，默认是组件名去掉 `Xw` 前缀
- `--examples`：额外生成 examples 下的本地调试页并注册路由

生成后按顺序完成：

1. 读 `references/conventions.md`，按约定填 `packages/<Dir>/modules/<Dir>.vue` 的组件逻辑
2. 复杂 props 在 `packages/<Dir>/types/index.ts` 补 interface，并从 `packages/<Dir>/index.ts` 导出
3. 写 `docs/demos/<Dir>/base.vue` 至少一个**可运行**的 demo
4. 写 `docs/components/<Dir>.md`，格式严格照 `references/doc-templates.md`
5. 在 `docs/components/overview.md` 的组件数组里补一张卡片（脚手架已插入，核对描述与 tags）
6. 运行 `pnpm gen:skill && pnpm verify:skill`，必须全绿
7. 运行 `pnpm build` 确认类型与打包通过

**不要修改 `packages/index.ts`** —— 它用 `Object.keys(components)` 自动注册全部组件。

### 工作流 B：修改已有组件的 props / 事件 / 插槽

改动必须四处同步，漏一处就会出现"组件能跑但文档对不上"或"类型提示缺失"：

```
packages/<Dir>/modules/<Dir>.vue   ← 改实现（props 上方保留中文注释）
packages/<Dir>/types/index.ts      ← 若涉及 interface
docs/components/<Dir>.md           ← 改属性/事件/插槽表格
docs/demos/<Dir>/*.vue             ← 确认示例仍可运行
```

改完跑 `pnpm gen:skill && pnpm verify:skill`：脚本会重新抽取 props/events/slots 并与文档比对，`references/components.md` 会直接反映新 API。

### 工作流 C：发版

1. 改 `package.json` 的 `version`
2. 在 `docs/guide/upgrade.md` 顶部加一条，沿用该文件既有的 `### [vX.Y.Z] - YYYY-MM-DD` 格式与 `新增 / 修复 / 优化 / 兼容 / 文档` 小标题
3. 运行 `pnpm gen:skill && pnpm verify:skill`（`references` 里如果含版本号需一并刷新）
4. `pnpm build` —— 构建会自动把 `skills/` 复制进 `dist/skills/`，随 npm 包发布

> 文档站顶部的版本号从 `package.json` 读取（`docs/.vitepress/config.ts` 里 `import { version }`），**不需要手改**。

### 工作流 D：一致性体检

```bash
pnpm verify:skill
```

输出全部注册点与引用问题。典型用途：接手别人的分支、排查"文档有页面但没 demo"、"总览页搜不到组件"。

---

## USE 模式：在业务项目里使用组件

先读 `references/usage.md`（API 速查与组合用法）。核心事实：

- 组件已全局注册，模板里直接写 `<xw-table>` / `<xw-search>` / `<xw-form>`，**不需要 import**
- 使用方必须自行全局注册 Element Plus 与其样式，并按需引入本库样式：
  `import 'vue3-xiaowei-components/dist/index.css'`
- 三个组件是**页面级**组件，典型组合是 `XwSearch` 提供搜索区、`XwTable` 展示数据、`XwForm` 承载录入

排查"组件不生效/样式错乱"时优先确认：Element Plus 是否全局注册、样式是否引入、`XwTable` 的父容器是否有确定高度（高度自适应依赖父级高度）。

---

## 维护本 skill

- `references/components.md` / `icons.md` / `registration.md` 由 `scripts/gen-skill-references.mjs` 从源码生成（`pnpm gen:skill`），**不要手改**
- `scripts/verify-skill-assets.mjs` 校验生成物是否漂移、注册点是否齐全、文档引用的组件名与图标名是否真实存在（`pnpm verify:skill`）
- `SKILL.md`、`README.md`、`references/conventions.md` / `doc-templates.md` / `usage.md` 是**手写**的，源码约定变化时需手动更新

### 文件丢失时怎么恢复

生成物可由 `pnpm gen:skill` 重建（目录不存在会自动创建），但**手写文件脚本无法重建**，需从版本库恢复：

```sh
git checkout -- skills/                                  # 已提交过
cp -r dist/skills/xw-components/. skills/xw-components/  # 退化方案：用上次构建的副本
```

因此 `scripts/` 与 `skills/` 必须纳入版本控制。若这两个目录处于未跟踪状态，一旦被清理会永久丢失。
`pnpm gen:skill` 在生成后会检查手写文件是否齐全，缺失时给出警告。

### 分发

本 skill 随 npm 包发布（`dist/skills/xw-components/`），下游项目要复制或软链到 `.workbuddy/skills/` 才会生效，命令见 `README.md`。
