---
layout: page
---

# 组件总览

Vue3 小微组件库是基于 Element Plus 二次封装的基础组件库，提供更便捷的开发体验和统一的交互规范。

<div class="component-overview">
  <!-- 搜索区域 -->
  <div class="search-section">
    <el-input
      v-model="searchText"
      placeholder="搜索组件..."
      clearable
      :prefix-icon="Search"
      class="search-input"
    />
    <div class="component-count">
      共 {{ filteredComponents.length }} 个组件
    </div>
  </div>

  <!-- 组件分类 -->
  <div class="category-section">
    <el-radio-group v-model="activeCategory" class="category-tabs">
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="data">数据展示</el-radio-button>
      <el-radio-button label="form">表单组件</el-radio-button>
    </el-radio-group>
  </div>

  <!-- 组件卡片网格 -->
  <div class="component-grid">
    <div 
      v-for="component in filteredComponents" 
      :key="component.name"
      class="component-card"
      @click="goToComponent(component.link)"
    >
      <div class="card-header">
        <div class="component-icon">
          <el-icon><component :is="component.icon" /></el-icon>
        </div>
        <div class="component-info">
          <h3 class="component-name">{{ component.name }}</h3>
          <p class="component-version">{{ component.version }}</p>
        </div>
      </div>
      <p class="component-description">{{ component.description }}</p>
      <div class="card-footer">
        <el-tag 
          v-for="tag in component.tags" 
          :key="tag"
          :type="getTagType(tag)"
          size="small"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</div>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vitepress'
import { Search, Grid, Search as SearchIcon } from '@element-plus/icons-vue'

const router = useRouter()
const searchText = ref('')
const activeCategory = ref('all')

// 组件数据
const components = ref([
  {
    name: 'XwTable',
    version: '0.1.4',
    description: '功能强大的表格组件，支持分页、搜索、自定义列渲染等',
    link: '/components/Table',
    icon: 'Grid',
    category: 'data',
    tags: ['表格', '分页', '搜索', '自定义列']
  },
  {
    name: 'XwSearch',
    version: '0.1.4',
    description: '搜索表单组件，提供统一的搜索和操作区域布局',
    link: '/components/Search',
    icon: 'Search',
    category: 'form',
    tags: ['搜索', '表单', '布局']
  }
])

// 过滤组件
const filteredComponents = computed(() => {
  let filtered = components.value
  
  // 搜索过滤
  if (searchText.value) {
    filtered = filtered.filter(component => 
      component.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      component.description.toLowerCase().includes(searchText.value.toLowerCase()) ||
      component.tags.some(tag => tag.toLowerCase().includes(searchText.value.toLowerCase()))
    )
  }
  
  // 分类过滤
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(component => component.category === activeCategory.value)
  }
  
  return filtered
})

// 标签类型
const getTagType = (tag) => {
  const typeMap = {
    '表格': 'primary',
    '分页': 'success',
    '搜索': 'warning',
    '自定义列': 'info',
    '表单': 'danger',
    '布局': ''
  }
  return typeMap[tag] || ''
}

// 跳转到组件详情
const goToComponent = (link) => {
  router.go('/vue3-xiaowei-components' + link)
}
</script>

<style scoped>
.component-overview {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 20px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.component-count {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.category-section {
  margin-bottom: 32px;
}

.category-tabs {
  width: 100%;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.component-card {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--vp-c-bg);
}

.component-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.component-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--vp-c-brand-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.component-icon .el-icon {
  font-size: 24px;
  color: var(--vp-c-brand);
}

.component-info {
  flex: 1;
}

.component-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.component-version {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.component-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-footer .el-tag {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .component-overview {
    padding: 0 16px;
  }
  
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    max-width: none;
  }
  
  .component-grid {
    grid-template-columns: 1fr;
  }
  
  .category-tabs .el-radio-button {
    flex: none;
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--vp-c-text-3);
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>

<!-- 空状态模板 -->
<template v-if="filteredComponents.length === 0">
  <div class="empty-state">
    <el-icon><Search /></el-icon>
    <p>没有找到匹配的组件</p>
    <p class="empty-tip">尝试使用不同的关键词或选择其他分类</p>
  </div>
</template>
