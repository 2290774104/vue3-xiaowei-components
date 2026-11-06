<template>
  <div class="xw-table" :class="rootClass" :style="rootStyle">
    <xw-search
      ref="searchRef"
      :search-fold="searchFold"
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
      v-bind="tableAttrs"
    >
      <template
        v-for="column in columns.filter((i) => !i.hidden)"
        :key="column.columnKey || column.prop"
      >
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
import vHeightAdaptive from '../directive/height-adaptive';
import type { PropType, StyleValue } from 'vue';
import { computed, nextTick, ref, useAttrs, watch } from 'vue';
import type { IData, IColumn, IPagination } from '../types';
import xwSearch from '../../Search';

// 仅需判断布尔与对象，避免为此引入 lodash-es（否则会被打进产物）
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isPlainObject = (value: unknown): value is IPagination =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// 关闭自动继承：否则未声明的属性（如 border、stripe）会同时落到根 div 与内部
// el-table 上造成重复绑定。class / style 单独转回根元素，便于外部定制外层容器。
defineOptions({ inheritAttrs: false });

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
  // 分页配置：传 true 用默认配置，传对象自定义，传 false 不显示
  pagination: {
    type: [Boolean, Object] as PropType<boolean | IPagination>,
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

// class / style 归外层容器，其余透传给内部 el-table
const rootClass = computed(() => attrs.class as any);
const rootStyle = computed(() => attrs.style as StyleValue);
const tableAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

// 分页相关：分页状态归属组件实例，避免同一页面多个表格共享状态互相干扰
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
    if (isPlainObject(newVal)) {
      isShowPag.value = true;
      defPagination.value = { ...defPagination.value, ...newVal };
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

const tableRef = ref();
const searchRef = ref();

// 高度重算触发器：搜索区折叠/分页显隐后，DOM 尺寸要等下一帧才更新，
// 自增这个值可让 layoutTable 重新求值，重新读取 offsetHeight。
const layoutTick = ref(0);

const emitPageChange = () => {
  if (props.autoToTop) {
    tableRef.value?.setScrollTop?.(0);
  }
  emit('page-change', {
    pageSize: defPagination.value.pageSize,
    currentPage: defPagination.value.currentPage,
  });
};

const handleSizeChange = (val: number) => {
  defPagination.value.pageSize = val;
  emitPageChange();
};

const handleCurrentChange = (val: number) => {
  defPagination.value.currentPage = val;
  emitPageChange();
};

// 搜索区折叠状态变化后重新计算高度
watch(
  () => props.searchFold,
  async () => {
    await nextTick();
    layoutTick.value += 1;
  },
);

// 数据变化后重新布局表格
watch(
  () => props.data,
  async () => {
    if (!props.autoDoLayout) return;
    await nextTick();
    tableRef.value?.doLayout?.();
  },
);

// 分页显隐变化同样影响表格可用高度
watch(isShowPag, () => {
  layoutTick.value += 1;
});

const layoutTable = computed(() => {
  // 记一次依赖，使折叠/分页变化时能重新求值
  void layoutTick.value;

  // 如果不自动计算高度，返回空对象
  if (!props.autoHeight) {
    return {};
  }

  const searchHeight = searchRef.value?.$el?.offsetHeight || 0;
  return {
    height: props.height,
    topOffset: searchHeight,
    bottomOffset: isShowPag.value ? 42 : 0,
  };
});

// 暴露内部实例，方便调用 Element Plus Table 的原生方法
// （如 clearSelection / toggleRowSelection / sort / doLayout）
defineExpose({
  tableRef,
  searchRef,
  doLayout: () => tableRef.value?.doLayout?.(),
  clearSelection: () => tableRef.value?.clearSelection?.(),
  setScrollTop: (top = 0) => tableRef.value?.setScrollTop?.(top),
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
