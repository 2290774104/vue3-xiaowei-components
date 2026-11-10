# vue3-xiaowei-components

基于 Element-Plus 二次封装组件

📖 在线文档：**https://2290774104.github.io/vue3-xiaowei-components/**

## 安装

```sh
pnpm install vue3-xiaowei-components -S
```

```sh
npm install vue3-xiaowei-components -S
```

## 使用

```js
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import locale from 'element-plus/es/locale/lang/zh-cn';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import XwComponents from 'vue3-xiaowei-components';
import 'vue3-xiaowei-components/dist/index.css';

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus, { locale });
app.use(XwComponents);
app.mount('#app');
```

按需引入：

```js
import 'vue3-xiaowei-components/dist/index.css';
import { XwTable } from 'vue3-xiaowei-components';
```

详细文档见 [在线文档](https://2290774104.github.io/vue3-xiaowei-components/)，源文件位于 `docs/`（VitePress）。

## 开发

```sh
pnpm dev           # 本地调试（examples/，端口 8080）
pnpm docs:dev      # 文档站开发服务
pnpm docs:build    # 构建文档站
pnpm docs:deploy   # 构建并部署文档站到 GitHub Pages
pnpm build         # 构建组件库到 dist/
```

## 脚本

仓库内置四个开发脚本：三个配合 `skills/xw-components/` 下的 AI skill 使用，用于降低"新增组件漏改注册点""文档与源码不一致"这类问题；另一个用于部署文档站。

| 命令 | 脚本 | 用途 |
| ---- | ---- | ---- |
| `pnpm docs:deploy` | `scripts/deploy-docs.mjs` | 构建并部署文档站到 GitHub Pages |
| `pnpm gen:skill` | `scripts/gen-skill-references.mjs` | 从源码生成 skill 索引 |
| `pnpm verify:skill` | `scripts/verify-skill-assets.mjs` | 校验索引与源码是否漂移 |
| `pnpm new:component` | `scripts/new-component.mjs` | 新增组件脚手架 |

### `pnpm gen:skill` — 生成 skill 索引

从源码抽取，生成 `skills/xw-components/references/` 下的三份索引：

| 生成文件 | 内容 |
| -------- | ---- |
| `components.md` | 组件清单，含每个组件的 props / events / slots / 暴露方法 |
| `icons.md` | `@element-plus/icons-vue` 图标名全集，★ 标注仓库已在使用的 |
| `registration.md` | 注册点对照表，逐项列出每个组件的注册状态 |

抽取依据都是源码里已存在的事实：`packages/components.ts`（组件与注册名）、`packages/<Dir>/modules/*.vue`（`defineProps` / `defineEmits` / `<slot>`，含 props 上方中文注释作为属性说明）、`docs/components/<Dir>.md`（首段作为组件说明）、`node_modules/@element-plus/icons-vue`（图标全集）。

**这三份文件不要手改**，改完源码重新生成即可。

```sh
pnpm gen:skill
```

### `pnpm verify:skill` — 漂移守卫

校验三件事，任一不通过就以非 0 退出码失败：

1. **生成物与源码一致** —— 不一致说明改完源码忘了跑 `gen:skill`
2. **注册点齐全** —— 每个组件在实现、`install`、`components.ts`、`components.d.ts`、文档、demo、侧边栏、总览页等位置是否齐全；同时检测"目录建了但忘记登记"和"登记了但目录不存在"
3. **引用有效** —— `SKILL.md` 里引用的文件与组件名真实存在

```sh
pnpm verify:skill          # 校验
pnpm verify:skill --fix    # 校验并顺带重新生成索引
```

已挂进 `prepublishOnly`，`pnpm publish` 前会自动执行。

> 校验组件注册点时以**文件系统**为准遍历 `packages/`，因为只看 `components.ts` 无法发现"组件目录已建但忘了登记"——那种情况下组件不会出现在任何清单里。

### `pnpm new:component` — 新增组件脚手架

生成组件骨架，**并自动登记全部注册点**，避免漏改。

```sh
pnpm new:component XwXxx --category 表单组件 --desc "一句话说明" [--dir Xxx] [--examples]
```

| 参数 | 说明 |
| ---- | ---- |
| `<组件名>` | 必填，`Xw` 开头的大驼峰，如 `XwUserCard` |
| `--category` | VitePress 侧边栏分类，取值 `数据展示` / `表单组件`，默认 `表单组件` |
| `--dir` | 目录名，默认是组件名去掉 `Xw` 前缀 |
| `--desc` | 一句话说明，用于文档标题、总览卡片与侧边栏文案，可省略 |
| `--examples` | 额外生成 `examples/` 下的本地调试页并注册路由 |

自动创建：

```
packages/<Dir>/modules/<Dir>.vue    组件实现
packages/<Dir>/index.ts             install 注册
docs/components/<Dir>.md            组件文档
docs/demos/<Dir>/base.vue           示例 demo
```

自动登记：

```
packages/components.ts              import + export default + export {}
components.d.ts                     import + GlobalComponents 声明
docs/.vitepress/config.ts           侧边栏分类条目
docs/components/overview.md         总览页组件卡片
examples/router/index.ts            调试页路由（--examples）
examples/views/index.vue            首页入口（--examples）
```

设计要点：

- 对既有文件采用**区块定位 + 插入**而非整文件覆写，保留原文件的换行符（仓库里是 CRLF）、缩进与注释，不会产生大片无关 diff
- 区块用**括号配对**定位，不依赖"找最后一行"之类的脆弱锚点
- 目标路径已存在时**跳过并提示，绝不覆盖**

`packages/index.ts` **无需修改** —— 它用 `Object.keys(components)` 自动注册全部组件。

生成后建议按顺序收尾：

1. 填 `packages/<Dir>/modules/<Dir>.vue` 的组件逻辑
2. 补 `docs/components/<Dir>.md` 的属性 / 事件 / 插槽表格
3. 调整 `docs/components/overview.md` 卡片的 `description` 与 `tags`
4. 运行 `pnpm gen:skill && pnpm verify:skill`，应全绿
5. 运行 `pnpm build` 确认类型与打包通过

### `pnpm docs:deploy` — 部署文档站

构建文档站并部署到 GitHub Pages（`gh-pages` 分支）。

```sh
pnpm docs:deploy                        # 构建 + 部署
pnpm docs:deploy --dry-run              # 只生成提交，不推送
pnpm docs:deploy --no-build             # 跳过构建，直接部署现有产物
pnpm docs:deploy --message "docs: xxx"  # 自定义提交信息
```

| 参数 | 说明 |
| ---- | ---- |
| `--no-build` | 跳过构建，直接部署 `docs/.vitepress/dist` |
| `--dry-run` | 走到生成提交为止，不推送 |
| `--message` | 自定义提交信息，默认 `deploy: docs v<version>` |
| `--branch` | 目标分支，默认 `gh-pages` |
| `--remote` | 远程名，默认 `origin` |

脚本做的事：

1. 构建前先清空 `docs/.vitepress/dist`，确保产物不含上次构建的残留（带 hash 的旧资源）
2. 执行 `pnpm docs:build`
3. 用 `git worktree` 在临时目录 `.deploy-worktree` 中检出目标分支，**不影响当前工作区**
4. 清空分支内容后镜像构建产物，保证与 `dist` 完全一致（不留旧文件）
5. 写入 `.nojekyll`，避免 GitHub Pages 的 Jekyll 处理干扰 VitePress 资源
6. 提交并推送，最后清理临时目录

实现上只依赖 `node:fs` 与 `child_process`，**不需要安装 `gh-pages` 等额外依赖**。

> 若仓库名或 Pages 地址有变化，请确认 `docs/.vitepress/config.ts` 的 `base` 与仓库名一致 ——
> 项目站点若 `base` 不匹配，部署后页面会白屏。脚本在部署前会检查并在不匹配时给出提示。

## 配套 AI skill

`skills/xw-components/` 是一份 AI skill，覆盖组件库的**开发维护**与**业务使用**两种场景，会随 npm 包发布到 `dist/skills/`。

> 注意：随包发布 **不等于** 自动生效。下游项目需把它复制到 `.workbuddy/skills/` 才能被加载，具体命令见 `skills/xw-components/README.md`。

## 目录结构

```
packages/            组件源码（components.ts 为总登记处，index.ts 自动遍历注册）
docs/                VitePress 文档（components/*.md 组件文档，demos/ 可运行示例）
examples/            本地调试页
scripts/             开发脚本（见上文）
skills/              AI skill，随包发布到 dist/skills/
components.d.ts      使用方 Volar 的全局组件类型声明
```
