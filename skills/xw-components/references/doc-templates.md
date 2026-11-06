# 组件文档与 demo 模板

> 手写规范。写 `docs/components/<Dir>.md` 与 `docs/demos/<Dir>/*.vue` 时严格照此格式。

## 文档文件位置

| 内容 | 路径 |
| --- | --- |
| 组件文档 | `docs/components/<Dir>.md`（如 `docs/components/Table.md`） |
| 可运行示例 | `docs/demos/<Dir>/base.vue`（可再拆 `advanced.vue` 等） |
| 侧边栏配置 | `docs/.vitepress/config.ts` 的 `themeConfig.sidebar['/components/']` |
| 总览卡片 | `docs/components/overview.md` 的 `components` 数组 |

## 文档骨架

````markdown
# XwXxx 某某组件

一句话说明这个组件做什么、基于 Element Plus 的什么组件封装、提供了哪些额外能力。

## 基础用法

简要说明 + 引用 demo：

<demo vue="Xxx/base.vue" />

## 属性说明

### Xxx Props

| 属性名 | 说明 | 类型 | 默认值 | 是否必填 |
| ------ | ---- | ---- | ------ | -------- |
| data   | 数据 | `IData[]` | - | 是 |

> **属性透传**：组件使用 `v-bind="attrs"` 透传了除上述 props 之外的所有属性到内部 `<el-xxx>`，因此你可以直接使用 Element Plus 的原生属性，如 `border`、`stripe` 等。

### IXxx 某某配置

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| prop   | xxx  | `string` | - |

## 事件说明

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| change | 值变化时触发 | `{ item, value }` |

## 插槽说明

| 插槽名 | 说明 |
| ------ | ---- |
| default | 默认内容 |
| actions | 底部操作区 |

## 与 XwYyy 配合使用

（可选）说明组件间的组合方式，配一段完整示例代码。
````

## 硬性要求

1. **标题**为 `# XwXxx 中文名组件`，与注册名一致
2. 标题下方第一段是组件说明 —— **生成脚本会抽取这段作为 `references/components.md` 里的描述**，所以必须写，且用一句话讲清能力
3. `<demo vue="Xxx/base.vue" />` 的路径相对 `docs/demos/`，**不含 `docs/demos/` 前缀**
4. 属性 / 事件 / 插槽三张表的表头用上面的原文，保持全库一致（`是否必填` 列不要漏）
5. 有属性透传的组件必须补那段 `> **属性透传**` 引用块
6. 类型列用反引号包代码类型（`boolean`、`IData[]`），联合类型用 ` \| ` 转义

## demo 文件格式

`docs/demos/<Dir>/base.vue` 是一个**完整可运行的单文件组件**，不需要 import 本库组件（VitePress 主题已全局注册）：

```vue
<template>
  <xw-table
    :data="tableData"
    :columns="columns"
    :pagination="pagination"
    :total="total"
    @page-change="handlePageChange"
  >
    <template #search>
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </template>
  </xw-table>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

// 用真实、简洁的示例数据，不要 lorem ipsum
const tableData = ref([{ id: 1, name: '张三', age: 25 }]);

const columns = ref([
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '姓名', width: 120 },
]);

// 事件处理用 console.log 占位即可，与现有 demo 一致
const handlePageChange = (pageInfo: any) => {
  console.log('分页变化:', pageInfo);
};
</script>
```

demo 要求：

- 用 `<script setup lang="ts">`
- 示例数据用中文真实数据（张三 / 李四 / 北京市朝阳区），与现有 demo 风格一致
- 事件处理用 `console.log` 占位，不写业务逻辑
- 每演示一个独立能力就单独开一个文件（`base.vue` / `image.vue` / `height.vue`），文档里各配一个 `<demo>`

## 侧边栏登记

`docs/.vitepress/config.ts` 里按分类加条目：

```ts
sidebar: {
  '/components/': [
    { text: '组件总览', items: [{ text: '组件概览', link: '/components/overview' }] },
    {
      text: '数据展示',
      items: [{ text: 'XwTable 表格组件', link: '/components/Table' }],
    },
    {
      text: '表单组件',
      items: [
        { text: 'XwSearch 搜索组件', link: '/components/Search' },
        { text: 'XwForm 动态表单', link: '/components/Form' },
      ],
    },
  ],
}
```

`text` 格式为 `XwXxx 中文名组件`，`link` 为 `/components/<Dir>`。

## 总览页登记

`docs/components/overview.md` 的 `components` 数组加一项，并给新 tag 补 `getTagType` 映射：

```js
{
  name: 'XwXxx',
  version: '0.2.0',          // 与 package.json 版本一致
  description: '一句话描述',
  link: '/components/Xxx',
  icon: 'Grid',              // Element Plus 图标名，见 references/icons.md
  category: 'data',          // data | form，对应总览页的分类 Tab
  tags: ['表格', '分页'],
}
```

`category` 只有 `data`（数据展示）与 `form`（表单组件）两种，新增分类需同步改总览页的 `el-radio-button` 列表。
