<template>
  <div class="xw-search">
    <div v-if="!isFold">
      <slot></slot>
    </div>
    <div class="xw-search-btn">
      <div class="xw-search-btn-left">
        <slot name="leftOperate"></slot>
      </div>
      <div v-if="searchFold" class="xw-search-btn-right">
        <el-tooltip
          class="item"
          effect="dark"
          :content="isFold ? '显示搜索' : '隐藏搜索'"
          placement="top"
        >
          <el-button size="mini" circle :icon="Search" @click="handleToggle" />
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="刷新" placement="top">
          <el-button
            size="mini"
            circle
            :icon="Refresh"
            @click="handleRefresh"
          />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';

const props = defineProps({
  // 是否折叠搜索框
  searchFold: {
    type: Boolean,
    default: false,
  },
});

// 事件
const emit = defineEmits(['refresh']);

const isFold = ref(false);

// 切换搜索框折叠状态
const handleToggle = () => {
  isFold.value = !isFold.value;
};

// 刷新搜索
const handleRefresh = () => {
  emit('refresh');
};
</script>

<style lang="scss" scoped>
.xw-search {
  .xw-search-btn {
    display: flex;

    .xw-search-btn-left {
      width: 100%;
    }

    .xw-search-btn-right {
      flex-shrink: 0;
    }
  }
}
</style>
