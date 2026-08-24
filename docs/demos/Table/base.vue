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
import { ref, reactive } from 'vue';

const tableData = ref([
  { id: 1, name: '张三', age: 25, address: '北京市朝阳区' },
  { id: 2, name: '李四', age: 30, address: '上海市浦东新区' },
  { id: 3, name: '王五', age: 28, address: '广州市天河区' },
]);

const columns = ref([
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'age', label: '年龄', width: 100 },
  { prop: 'address', label: '地址', showOverflowTooltip: true },
]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  layout: 'prev, pager, next, sizes, total',
  background: true,
});

const total = ref(3);

const handlePageChange = (pageInfo: any) => {
  console.log('分页变化:', pageInfo);
};

const searchForm = reactive({
  name: '',
});

const handleSearch = () => {
  console.log('搜索:', searchForm);
};
</script>
