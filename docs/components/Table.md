# XwTable 表格组件

用于展示多条结构类似的数据，可对数据进行排序、筛选、对比或其他自定义操作。

## 基础用法

XwTable 组件基于 Element Plus 的 Table 组件进行二次封装，提供了更便捷的配置方式和内置功能。

<demo vue="Table/base.vue" />

## 属性说明

### Table Props

| 属性名       | 说明                             | 类型                     | 默认值  | 是否必填 |
| ------------ | -------------------------------- | ------------------------ | ------- | -------- |
| data         | 表格数据                         | `IData[]`                | -       | 是       |
| columns      | 表格列配置                       | `IColumn[]`              | -       | 是       |
| pagination   | 分页配置                         | `boolean \| IPagination` | `false` | 否       |
| total        | 数据总数                         | `number`                 | `0`     | 否       |
| height       | 表格高度                         | `number \| string`       | `''`    | 否       |
| autoToTop    | 是否在数据重渲染后自动滚动到顶部 | `boolean`                | `true`  | 否       |
| autoDoLayout | 是否在数据更新后重新布局表格     | `boolean`                | `true`  | 否       |
| searchFold   | 是否折叠搜索框                   | `boolean`                | `false` | 否       |
| autoHeight   | 是否自动计算高度                 | `boolean`                | `false` | 否       |

### IColumn 列配置

| 属性名              | 说明             | 类型                                            | 默认值  |
| ------------------- | ---------------- | ----------------------------------------------- | ------- |
| type                | 列类型           | `'selection' \| 'index' \| 'expand' \| 'image'` | -       |
| label               | 列标题           | `string`                                        | -       |
| prop                | 列对应数据字段   | `string`                                        | -       |
| width               | 列宽度           | `string \| number`                              | -       |
| minWidth            | 最小宽度         | `string`                                        | -       |
| hidden              | 是否隐藏         | `boolean`                                       | `false` |
| fixed               | 固定列           | `true \| 'left' \| 'right'`                     | -       |
| resizable           | 是否可调整宽度   | `boolean`                                       | -       |
| formatter           | 格式化函数       | `function`                                      | -       |
| showOverflowTooltip | 是否显示省略提示 | `boolean`                                       | -       |
| align               | 列对齐方式       | `'center' \| 'left' \| 'right'`                 | -       |
| headerAlign         | 表头对齐方式     | `'center' \| 'left' \| 'right'`                 | -       |
| customRender        | 自定义渲染插槽名 | `string`                                        | -       |

### IPagination 分页配置

| 属性名      | 说明             | 类型       | 默认值                              |
| ----------- | ---------------- | ---------- | ----------------------------------- |
| currentPage | 当前页码         | `number`   | `1`                                 |
| pageSizes   | 每页显示数量选项 | `number[]` | `[10, 20, 30, 50]`                  |
| pageSize    | 每页显示数量     | `number`   | `10`                                |
| layout      | 分页布局         | `string`   | `'prev, pager, next, sizes, total'` |
| background  | 是否有背景色     | `boolean`  | `true`                              |

## 事件说明

| 事件名      | 说明           | 回调参数                                    |
| ----------- | -------------- | ------------------------------------------- |
| page-change | 分页变化时触发 | `{ pageSize: number, currentPage: number }` |

## 插槽说明

| 插槽名         | 说明             |
| -------------- | ---------------- |
| search         | 搜索区域内容     |
| leftOperate    | 左侧操作按钮区域 |
| [customRender] | 自定义列渲染插槽 |

## 高级用法

### 自定义列渲染

```vue
<template>
  <xw-table :data="tableData" :columns="columns">
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </xw-table>
</template>

<script setup lang="ts">
const columns = ref([
  { prop: 'name', label: '姓名' },
  { prop: 'status', label: '状态', customRender: 'status' },
]);
</script>
```

### 图片列显示

```vue
<script setup lang="ts">
const columns = ref([
  { prop: 'avatar', label: '头像', type: 'image', width: 80 },
]);
</script>
```

### 隐藏搜索框

```vue
<template>
  <xw-table :search-fold="true" :data="tableData" :columns="columns" />
</template>
```

## 注意事项

1. 使用前需要确保已全局注册 Element Plus 组件库
2. 表格数据需要是响应式数据
3. 分页功能需要配合后端接口实现数据加载
4. 自定义渲染插槽需要在 columns 中配置 customRender 属性
