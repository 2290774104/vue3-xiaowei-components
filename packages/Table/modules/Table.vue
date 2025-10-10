<template>
  <div class="xw-table">
    <el-table>

    </el-table>
  </div>
</template>

<script lang="ts" setup>
import type { IData } from '../types';
import { PropType } from 'vue';

const props = defineProps({
  // 数据相关
  data: {
    type: Array as PropType<IData[]>,
    required: true,
  },
  // 表格每列配置项
  columns: {
    type: Array as PropType<IData[]>,
    required: true,
  },
  // 分页配置
  pagination: {
    type: Boolean as PropType<boolean> | Object as PropType<IData>,
    required: false,
    default: false,
  },
  total: {
    type: Number,
    default: 0,
  },
});
</script>

<style lang="scss" scoped></style>
