# XwSearch 搜索组件

用于提供搜索表单和操作按钮的统一布局容器，支持折叠展开功能。

## 基础用法

XwSearch 组件通常与 XwTable 组件配合使用，提供搜索区域的统一布局。

```vue
<template>
  <xw-search :search-fold="true" @refresh="handleRefresh">
    <template #default>
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="searchForm.age" :min="0" :max="100" />
        </el-form-item>
      </el-form>
    </template>
    
    <template #leftOperate>
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
    </template>
  </xw-search>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const searchForm = reactive({
  name: '',
  age: null
})

const handleRefresh = () => {
  console.log('刷新数据')
}

const handleAdd = () => {
  console.log('新增操作')
}

const handleBatchDelete = () => {
  console.log('批量删除')
}
</script>
```

## 属性说明

| 属性名 | 说明 | 类型 | 默认值 | 是否必填 |
|--------|------|------|--------|----------|
| searchFold | 是否显示折叠/展开按钮 | `boolean` | `false` | 否 |

## 事件说明

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| refresh | 点击刷新按钮时触发 | - |

## 插槽说明

| 插槽名 | 说明 |
|--------|------|
| default | 搜索表单内容区域 |
| leftOperate | 左侧操作按钮区域 |

## 与XwTable配合使用

XwSearch 组件通常作为 XwTable 的子组件使用，提供统一的搜索和操作区域。

```vue
<template>
  <xw-table :data="tableData" :columns="columns">
    <template #search>
      <xw-search :search-fold="true" @refresh="handleRefresh">
        <template #default>
          <el-form :model="searchForm" inline>
            <el-form-item label="关键词">
              <el-input v-model="searchForm.keyword" placeholder="请输入关键词" />
            </el-form-item>
          </el-form>
        </template>
        
        <template #leftOperate>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </xw-search>
    </template>
  </xw-table>
</template>
```

## 样式说明

组件采用 flex 布局，左侧操作区域自适应宽度，右侧按钮区域固定宽度。

- `.xw-search`: 外层容器
- `.xw-search-btn`: 按钮区域容器
- `.xw-search-btn-left`: 左侧操作区域
- `.xw-search-btn-right`: 右侧按钮区域