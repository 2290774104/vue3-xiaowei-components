# 简介

::: tip 提示

@wocwin/t-ui-plus 基于 vue3 + ts + Element-plus 再次封装的基础组件

:::

## 组件列表

| 组件名称 | 说明                                                                              |
| :------- | :-------------------------------------------------------------------------------- |
| TTable   | [表格组件](https://wocwin.github.io/t-ui-plus/components/TTable/base.html?_blank) |

## docs 文档结构目录

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
