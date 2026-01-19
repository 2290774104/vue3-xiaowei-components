# XwTable 表格组件

用于展示多条结构类似的数据，可对数据进行排序、筛选、对比或其他自定义操作。

## 基础用法

XwTable 组件基于 Element Plus 的 Table 组件进行二次封装，提供了更便捷的配置方式和内置功能。

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
import { ref, reactive } from 'vue'

const tableData = ref([
  { id: 1, name: '张三', age: 25, address: '北京市朝阳区' },
  { id: 2, name: '李四', age: 30, address: '上海市浦东新区' },
  { id: 3, name: '王五', age: 28, address: '广州市天河区' }
])

const columns = ref([
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'age', label: '年龄', width: 100 },
  { prop: 'address', label: '地址', showOverflowTooltip: true }
])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  layout: 'prev, pager, next, sizes, total',
  background: true
})

const total = ref(3)

const handlePageChange = (pageInfo: any) => {
  console.log('分页变化:', pageInfo)
}

const searchForm = reactive({
  name: ''
})

const handleSearch = () => {
  console.log('搜索:', searchForm)
}
</script>
```

## 属性说明

### Table Props

| 属性名 | 说明 | 类型 | 默认值 | 是否必填 |
|--------|------|------|--------|----------|
| data | 表格数据 | `IData[]` | - | 是 |
| columns | 表格列配置 | `IColumn[]` | - | 是 |
| pagination | 分页配置 | `boolean \| IPagination` | `false` | 否 |
| total | 数据总数 | `number` | `0` | 否 |
| height | 表格高度 | `number \| string` | `''` | 否 |
| autoToTop | 是否在数据重渲染后自动滚动到顶部 | `boolean` | `true` | 否 |
| autoDoLayout | 是否在数据更新后重新布局表格 | `boolean` | `true` | 否 |
| searchFold | 是否折叠搜索框 | `boolean` | `false` | 否 |
| autoHeight | 是否自动计算高度 | `boolean` | `false` | 否 |

### IColumn 列配置

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| type | 列类型 | `'selection' \| 'index' \| 'expand' \| 'image'` | - |
| label | 列标题 | `string` | - |
| prop | 列对应数据字段 | `string` | - |
| width | 列宽度 | `string \| number` | - |
| minWidth | 最小宽度 | `string` | - |
| hidden | 是否隐藏 | `boolean` | `false` |
| fixed | 固定列 | `true \| 'left' \| 'right'` | - |
| resizable | 是否可调整宽度 | `boolean` | - |
| formatter | 格式化函数 | `function` | - |
| showOverflowTooltip | 是否显示省略提示 | `boolean` | - |
| align | 列对齐方式 | `'center' \| 'left' \| 'right'` | - |
| headerAlign | 表头对齐方式 | `'center' \| 'left' \| 'right'` | - |
| customRender | 自定义渲染插槽名 | `string` | - |

### IPagination 分页配置

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| currentPage | 当前页码 | `number` | `1` |
| pageSizes | 每页显示数量选项 | `number[]` | `[10, 20, 30, 50]` |
| pageSize | 每页显示数量 | `number` | `10` |
| layout | 分页布局 | `string` | `'prev, pager, next, sizes, total'` |
| background | 是否有背景色 | `boolean` | `true` |

## 事件说明

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| page-change | 分页变化时触发 | `{ pageSize: number, currentPage: number }` |

## 插槽说明

| 插槽名 | 说明 |
|--------|------|
| search | 搜索区域内容 |
| leftOperate | 左侧操作按钮区域 |
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
  { prop: 'status', label: '状态', customRender: 'status' }
])
</script>
```

### 图片列显示

```vue
<script setup lang="ts">
const columns = ref([
  { prop: 'avatar', label: '头像', type: 'image', width: 80 }
])
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