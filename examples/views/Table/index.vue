<template>
  <div>
    <xw-table
      searchFold
      :data="data"
      :columns="columns"
      :total="50"
      height="400"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
    >
      <template #search>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true">
          <el-form-item label="标题" prop="title">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入标题"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #leftOperate>
        <el-button type="primary">新增</el-button>
      </template>
      <template #expand="scope">
        <div style="margin: 10px; color: #409eff">
          {{ scope.row.title }} 的扩展内容
        </div>
      </template>
      <template #slot="{ row }">
        <el-button type="primary" @click="handleClick(row)">按钮</el-button>
      </template>
    </xw-table>
  </div>
</template>

<script lang="ts" setup>
import XwTable from 'component/Table';
import type { IColumn } from 'component/Table/types';
import { ref } from 'vue';

const searchForm = ref({
  title: '',
});

const handleSearch = () => {
  console.log('searchForm', searchForm.value);
};

const data = ref([
  {
    title: '数据1',
    date: '20250722',
    image:
      'https://pss.bdstatic.com/static/superman/img/logo/bd_logo1-66368c33f8.png',
  },
  {
    title: '数据2',
    date: '20250723',
    image:
      'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
  },
]);

const columns = ref<IColumn[]>([
  { label: '', prop: 'selection', type: 'selection' },
  // { label: '', prop: 'expand', type: 'expand', customRender: 'expand' },
  { label: '序号', prop: 'index', type: 'index' },
  { label: '标题', prop: 'title' },
  {
    label: '日期',
    prop: 'date',
    formatter: () => {
      return '2025-07-22';
    },
  },
  { label: '图片', prop: 'image', type: 'image' },
  { label: '插槽', prop: 'slot', customRender: 'slot' },
]);

const pagination = ref({
  pageSize: 5,
  currentPage: 1,
});

const handleSelectionChange = (val: any[]) => {
  console.log('val', val);
};

const handleClick = (row: any) => {
  console.log('row', row);
};
</script>

<style lang="scss" scoped></style>
