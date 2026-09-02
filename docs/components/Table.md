# XwTable 表格组件

用于展示多条结构类似的数据，可对数据进行排序、筛选、对比或其他自定义操作。基于 Element Plus 的 Table 组件进行二次封装，提供了更便捷的列配置方式、内置分页、搜索区域、图片预览和高度自适应等功能。

## 基础用法

通过 `data` 和 `columns` 属性即可快速渲染一个表格，`columns` 采用配置化方式定义每一列，无需在模板中手写 `<el-table-column>`。

<demo vue="Table/base.vue" />

## 属性说明

### Table Props

| 属性名       | 说明                                                                 | 类型                     | 默认值  | 是否必填 |
| ------------ | -------------------------------------------------------------------- | ------------------------ | ------- | -------- |
| data         | 表格数据                                                             | `IData[]`                | -       | 是       |
| columns      | 表格列配置                                                           | `IColumn[]`              | -       | 是       |
| pagination   | 分页配置，传入 `IPagination` 对象自定义分页                          | `boolean \| IPagination` | `false` | 否       |
| total        | 数据总数（分页时使用）                                               | `number`                 | `0`     | 否       |
| height       | 表格高度，未设置时默认占满父级容器                                   | `number \| string`       | `''`    | 否       |
| autoToTop    | 是否在数据重渲染后自动滚动到顶部                                     | `boolean`                | `true`  | 否       |
| autoDoLayout | 是否在数据更新后重新布局表格                                         | `boolean`                | `true`  | 否       |
| searchFold   | 是否折叠搜索框                                                       | `boolean`                | `false` | 否       |
| autoHeight   | 是否自动计算高度，启用后会根据搜索区域和分页区域动态计算表格可用高度 | `boolean`                | `false` | 否       |
| previewImage | 图片类型列是否启用预览功能                                           | `boolean`                | `true`  | 否       |

> **属性透传**：组件使用 `v-bind="attrs"` 透传了除上述 props 之外的所有属性到内部 `<el-table>`，因此你可以直接使用 Element Plus Table 的原生属性，如 `border`、`stripe`、`row-key`、`highlight-current-row` 等。

### IColumn 列配置

| 属性名              | 说明                                                                              | 类型                                                                                 | 默认值  |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------- |
| type                | 列类型，`selection` 为多选框，`index` 为序号，`expand` 为展开行，`image` 为图片列 | `'selection' \| 'index' \| 'expand' \| 'image'`                                      | -       |
| index               | 序号列的起始索引或索引计算函数（仅 `type='index'` 时生效）                        | `number \| ((index: number) => any)`                                                 | -       |
| columnKey           | 列的 key 值，用于优化渲染                                                         | `string`                                                                             | -       |
| label               | 列标题                                                                            | `string`                                                                             | -       |
| prop                | 列对应数据字段                                                                    | `string`                                                                             | -       |
| width               | 列宽度                                                                            | `string \| number`                                                                   | -       |
| minWidth            | 最小宽度                                                                          | `string`                                                                             | -       |
| hidden              | 是否隐藏该列                                                                      | `boolean`                                                                            | `false` |
| fixed               | 固定列                                                                            | `true \| 'left' \| 'right'`                                                          | -       |
| resizable           | 是否可调整宽度                                                                    | `boolean`                                                                            | -       |
| formatter           | 格式化函数，接收 `{ row, column, cellValue, index }` 作为参数                     | `(scope: { row: any; column: IColumn; cellValue: string; index: number }) => string` | -       |
| showOverflowTooltip | 内容超长时是否显示省略号 Tooltip                                                  | `boolean`                                                                            | -       |
| align               | 列内容对齐方式                                                                    | `'center' \| 'left' \| 'right'`                                                      | -       |
| headerAlign         | 表头对齐方式                                                                      | `'center' \| 'left' \| 'right'`                                                      | -       |
| className           | 列内容的自定义类名                                                                | `string`                                                                             | -       |
| labelClassName      | 列标题的自定义类名                                                                | `string`                                                                             | -       |
| selectable          | 控制多选框是否可选（仅 `type='selection'` 时生效）                                | `(row: any, index: number) => boolean`                                               | -       |
| reserveSelection    | 数据更新后是否保留之前选中的数据（仅 `type='selection'` 时生效）                  | `boolean`                                                                            | -       |
| customRender        | 自定义渲染插槽名，配置后可在模板中使用同名插槽自定义列内容                        | `string`                                                                             | -       |
| scopedSlots         | 插槽配置（旧版兼容），推荐使用 `customRender`                                     | `{ customRender?: string }`                                                          | -       |

### IPagination 分页配置

| 属性名      | 说明             | 类型       | 默认值                              |
| ----------- | ---------------- | ---------- | ----------------------------------- |
| currentPage | 当前页码         | `number`   | `1`                                 |
| pageSizes   | 每页显示数量选项 | `number[]` | `[10, 20, 30, 50]`                  |
| pageSize    | 每页显示数量     | `number`   | `10`                                |
| layout      | 分页布局         | `string`   | `'prev, pager, next, sizes, total'` |
| background  | 是否有背景色     | `boolean`  | `true`                              |

### IData 数据项

```ts
interface IData {
  [key: string]: any;
}
```

数据项为任意键值对对象，无固定结构约束。

## 事件说明

| 事件名      | 说明                                       | 回调参数                                    |
| ----------- | ------------------------------------------ | ------------------------------------------- |
| page-change | 分页变化时触发（页码或每页条数变化均触发） | `{ pageSize: number, currentPage: number }` |

## 插槽说明

| 插槽名         | 说明                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| search         | 搜索区域内容，放置在表格上方的搜索表单                                                             |
| leftOperate    | 搜索区域左侧的操作按钮区域，常用于放置「新增」「导出」等按钮                                       |
| [customRender] | 自定义列渲染插槽，插槽名与列配置中 `customRender` 的值对应，插槽作用域为 `{ row, column, $index }` |

## 方法说明

组件内部通过 `ref` 暴露了以下 Element Plus Table 实例方法：

| 方法名   | 说明                                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| tableRef | 内部 `el-table` 实例引用，可通过它调用 Element Plus Table 的所有方法，如 `clearSelection()`、`toggleRowSelection()`、`sort()`、`doLayout()` 等 |

> **使用示例**：`tableRef.value.tableRef.clearSelection()`

## 高级用法

### 自定义列渲染

通过 `customRender` 指定插槽名，在模板中使用同名插槽自定义列内容。插槽作用域提供 `row`（行数据）、`column`（列配置）、`$index`（行索引）。

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
import { ref } from 'vue';

const columns = ref([
  { prop: 'name', label: '姓名' },
  { prop: 'status', label: '状态', customRender: 'status' },
]);

const tableData = ref([
  { name: '张三', status: 1 },
  { name: '李四', status: 0 },
]);
</script>
```

### 图片列显示

将列的 `type` 设置为 `'image'`，组件会自动使用 `el-image` 渲染图片。默认开启图片预览功能，可通过 `previewImage` 属性关闭。

```vue
<template>
  <xw-table :data="tableData" :columns="columns" :preview-image="false" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const columns = ref([
  { prop: 'avatar', label: '头像', type: 'image', width: 80 },
  { prop: 'name', label: '姓名' },
]);

const tableData = ref([{ avatar: 'https://example.com/1.jpg', name: '张三' }]);
</script>
```

### 多选与序号列

```vue
<template>
  <xw-table :data="tableData" :columns="columns" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const columns = ref([
  { type: 'selection', selectable: (row) => row.status === 1 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '姓名' },
]);

const tableData = ref([
  { name: '张三', status: 1 },
  { name: '李四', status: 0 },
]);
</script>
```

### 格式化列内容

通过 `formatter` 函数对列内容进行格式化处理。

```vue
<template>
  <xw-table :data="tableData" :columns="columns" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const columns = ref([
  { prop: 'name', label: '姓名' },
  {
    prop: 'price',
    label: '价格',
    formatter: ({ cellValue }) => `¥${cellValue.toFixed(2)}`,
  },
]);

const tableData = ref([
  { name: '商品A', price: 99.5 },
  { name: '商品B', price: 128 },
]);
</script>
```

### 隐藏列

通过 `hidden` 属性动态控制列的显示与隐藏，适用于权限控制或用户自定义列等场景。

```vue
<template>
  <xw-table :data="tableData" :columns="columns" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showAge = ref(false);

const columns = ref([
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄', hidden: showAge },
  { prop: 'address', label: '地址' },
]);
</script>
```

### 折叠搜索框

通过 `searchFold` 属性控制搜索区域的折叠状态。

```vue
<template>
  <xw-table :search-fold="true" :data="tableData" :columns="columns">
    <template #search>
      <el-form inline>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
      </el-form>
    </template>
  </xw-table>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const searchForm = reactive({ name: '' });
</script>
```

### 高度自适应

设置 `autoHeight` 为 `true` 后，组件会根据搜索区域和分页区域的实际高度自动计算表格可用高度，适用于页面布局需要表格占满剩余空间的场景。

```vue
<template>
  <xw-table
    auto-height
    :data="tableData"
    :columns="columns"
    :pagination="true"
    :total="100"
  />
</template>
```

也可配合 `height` 属性指定固定总高度，组件会自动减去搜索和分页区域的高度。

```vue
<template>
  <xw-table
    auto-height
    :height="500"
    :data="tableData"
    :columns="columns"
    :pagination="true"
    :total="100"
  >
    <template #search>
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="keyword" placeholder="请输入" />
        </el-form-item>
      </el-form>
    </template>
  </xw-table>
</template>
```

### 透传 Element Plus Table 属性

由于组件使用了属性透传（`v-bind="attrs"`），你可以直接在 `<xw-table>` 上使用 Element Plus Table 的原生属性。

```vue
<template>
  <xw-table
    border
    stripe
    highlight-current-row
    :data="tableData"
    :columns="columns"
  />
</template>
```

## 注意事项

1. 使用前需要确保已全局注册 Element Plus 组件库
2. 表格数据需要是响应式数据（使用 `ref` 或 `reactive` 包装）
3. 分页功能需要配合后端接口实现数据加载，监听 `page-change` 事件重新请求数据
4. 自定义渲染插槽需要在 `columns` 中配置 `customRender` 属性，插槽名须与 `customRender` 值一致
5. `pagination` 传入 `true` 时使用默认分页配置，传入对象时可自定义分页参数
6. `autoHeight` 依赖 `v-height-adaptive` 指令计算高度，确保表格父容器有明确的高度
7. 图片列（`type: 'image'`）使用 `el-image` 渲染，默认开启预览功能，可通过 `previewImage` 属性关闭
