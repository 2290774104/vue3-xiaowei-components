<template>
  <div class="xw-table">
    <xw-search
      ref="searchRef"
      :searchFold="searchFold"
      @refresh="emitPageChange"
    >
      <template #default>
        <slot name="search"></slot>
      </template>
      <template #leftOperate>
        <slot name="leftOperate"></slot>
      </template>
    </xw-search>
    <el-table
      ref="tableRef"
      v-height-adaptive="layoutTable"
      :data="data"
      v-bind="attrs"
    >
      <template v-for="column in columns.filter((i) => !i.hidden)">
        <el-table-column v-bind="column">
          <template #default="scope">
            <!-- 自定义渲染插槽 -->
            <slot
              v-if="column.customRender"
              :name="column.customRender"
              v-bind="scope"
            ></slot>
            <!-- 图片渲染 -->
            <template v-else-if="column.type === 'image'">
              <el-image
                :src="scope.row[column.prop]"
                fit="contain"
                :preview-src-list="previewImage ? [scope.row[column.prop]] : []"
                preview-teleported
              ></el-image>
            </template>
            <!-- 普通渲染 -->
            <template v-else-if="!column.type">{{
              column.formatter
                ? column.formatter(scope)
                : scope.row[column.prop]
            }}</template>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <el-pagination
      v-if="isShowPag"
      v-bind="defPagination"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>
  </div>
</template>

<script lang="ts" setup>
import PagStore from '../store';
import vHeightAdaptive from '../directive/height-adaptive';
import type { PropType } from 'vue';
import isBoolean from 'lodash-es/isBoolean';
import isObject from 'lodash-es/isObject';
import { computed, ref, useAttrs, watch } from 'vue';
import type { IData, IColumn, IPagination } from '../types';
import xwSearch from '../../Search';

const props = defineProps({
  // 数据相关
  data: {
    type: Array as PropType<IData[]>,
    required: true,
  },
  // 表格每列配置项
  columns: {
    type: Array as PropType<IColumn[]>,
    required: true,
  },
  // 分页配置
  pagination: {
    type: Object as PropType<IPagination>,
    required: false,
    default: false,
  },
  // 数据总数
  total: {
    type: Number,
    default: 0,
  },
  // 组件高度，默认占满父级容器
  height: {
    type: [Number, String],
    default: '',
  },
  // 是否在数据重渲染后自动滚动到顶部
  autoToTop: {
    type: Boolean,
    default: true,
  },
  // 是否在数据更新后重新布局el-table，可能能解决一些异常
  autoDoLayout: {
    type: Boolean,
    default: true,
  },
  // 是否折叠搜索框
  searchFold: {
    type: Boolean,
    default: false,
  },
  // 是否自动计算高度，默认不计算
  autoHeight: {
    type: Boolean,
    default: false,
  },
  // 是否启用图片预览功能
  previewImage: {
    type: Boolean,
    default: true,
  },
});

// 事件
const emit = defineEmits(['page-change']);

// 属性透传，获取除props外的属性(如border等el-table的属性)
const attrs = useAttrs();

// 分页相关
const defPagination = ref<IPagination>({
  currentPage: 1,
  pageSizes: [10, 20, 30, 50],
  pageSize: 10,
  layout: 'prev, pager, next, sizes, total',
  background: true,
});
const isShowPag = ref(false);

watch(
  () => props.pagination,
  (newVal: boolean | IPagination) => {
    if (isBoolean(newVal)) {
      isShowPag.value = newVal;
    }
    if (isObject(newVal)) {
      isShowPag.value = true;
      defPagination.value = { ...defPagination.value, ...newVal };
      const { pageSize, currentPage } = defPagination.value;
      PagStore.setPageSize(pageSize!);
      PagStore.setCurrentPage(currentPage!);
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

const tableRef = ref();
const emitPageChange = () => {
  if (props.autoToTop) {
    // tableRef.value.setScrollTop(0);
  }
  emit('page-change', {
    pageSize: PagStore.pageSize,
    currentPage: PagStore.currentPage,
  });
};
const handleSizeChange = (val: number) => {
  defPagination.value.pageSize = val;
  console.log(1);

  PagStore.setPageSize(val);
  emitPageChange();
};
const handleCurrentChange = (val: number) => {
  defPagination.value.currentPage = val;
  PagStore.setCurrentPage(val);
  emitPageChange();
};

const searchRef = ref();

const layoutTable = computed(() => {
  // 如果不自动计算高度，返回空对象
  if (!props.autoHeight) {
    return {};
  }

  console.log(searchRef.value?.$el.offsetHeight);

  const searchHeight = searchRef.value?.$el?.offsetHeight || 0;
  return {
    height: props.height,
    topOffset: searchHeight,
    bottomOffset: isShowPag.value ? 42 : 0,
  };
});
</script>

<style lang="scss" scoped>
.xw-table {
  height: 100%;
  font-size: 16px;

  .el-pagination {
    margin-top: 10px;
    text-align: right;
    justify-content: flex-end;

    .el-pagination__total {
      margin-right: 0;
    }
  }

  .el-table__body-wrapper {
    height: calc(100% - 40px);
    overflow-y: auto;
  }

  .el-table__cell {
    padding: 12px 0;
  }
}
</style>
