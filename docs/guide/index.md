# 简介

::: tip 提示
vue3-xiaowei-components 基于 vue3 + ts + Element-plus 再次封装的基础组件库
:::

## 组件列表

| 组件名称 | 说明                                         | 文档链接                         |
| :------- | :------------------------------------------- | :------------------------------- |
| XwTable  | 表格组件，支持分页、搜索、自定义列渲染等功能 | [Table文档](/components/Table)   |
| XwSearch | 搜索组件，提供搜索表单和操作按钮的统一布局   | [Search文档](/components/Search) |

## 特性

- 🎯 **开箱即用**: 基于 Element Plus 二次封装，提供更便捷的配置方式
- 📦 **类型安全**: 完整的 TypeScript 类型定义
- 🔧 **高度可定制**: 支持自定义列渲染、插槽扩展等功能
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 🎨 **统一风格**: 保持与 Element Plus 一致的视觉风格

## 文档结构

```
├─ examples               # VPDemo组件自动解析此文件夹下的所有.vue文件
├─ components             # .md文件
├─ guide                  # 安装指南
├─ public                 # 静态资源文件
├─ .vitepress
│  ├─ plugins             # 插件配置
|  │  └─ mdPlugin.ts      # 自定义.md文件渲染
│  ├─ theme               # 主题配置
|  │  ├─ components       # demo组件
|  │  └─ directives       # copy指令
|  │  └─ styles           # 样式
│  ├─ utils               # 公共方法
│  └─ config.ts           # vitepress配置文件
└─ index.md               # 文档home页面
```

## Git 提交规范（PR 提交规范）

- `ci`: ci 配置文件和脚本的变动;
- `chore`: 构建系统或辅助工具的变动;
- `fix`: 代码 BUG 修复;
- `feat`: 新功能;
- `perf`: 性能优化和提升;
- `refactor`: 仅仅是代码变动，既不是修复 BUG 也不是引入新功能;
- `style`: 代码格式调整，可能是空格、分号、缩进等等;
- `docs`: 文档变动;
- `test`: 补充缺失的测试用例或者修正现有的测试用例;
- `revert`: 回滚操作;
