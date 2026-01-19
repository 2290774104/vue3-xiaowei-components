# 简介

::: tip 提示
vue3-xiaowei-components 基于 vue3 + ts + Element-plus 再次封装的基础组件库
:::

## 组件列表

| 组件名称 | 说明 | 文档链接 |
| :------- | :-------------------------------------------------------------------------------- | :-------- |
| XwTable | 表格组件，支持分页、搜索、自定义列渲染等功能 | [Table文档](/components/Table) |
| XwSearch | 搜索组件，提供搜索表单和操作按钮的统一布局 | [Search文档](/components/Search) |

## 特性

- 🎯 **开箱即用**: 基于 Element Plus 二次封装，提供更便捷的配置方式
- 📦 **类型安全**: 完整的 TypeScript 类型定义
- 🔧 **高度可定制**: 支持自定义列渲染、插槽扩展等功能
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 🎨 **统一风格**: 保持与 Element Plus 一致的视觉风格

## 快速开始

### 安装

```bash
# 使用 npm
npm install vue3-xiaowei-components

# 使用 yarn
yarn add vue3-xiaowei-components

# 使用 pnpm
pnpm install vue3-xiaowei-components
```

### 使用

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import XwComponents from 'vue3-xiaowei-components'
import 'vue3-xiaowei-components/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(XwComponents)
app.mount('#app')
```

## 文档结构