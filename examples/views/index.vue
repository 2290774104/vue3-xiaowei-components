<template>
  <div>
    <el-button
      v-for="item in components"
      :key="item.name"
      @click="handleClick(item)"
    >
      {{ item.name }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import router from '@/router';

interface IComponent {
  name: string;
  path: string;
}

const components = ref<IComponent[]>([{ name: 'Table 表格', path: '/table' }]);

const handleClick = (item: IComponent) => {
  router.push({
    path: item.path,
  });
};
</script>

<style lang="scss" scoped>
.el-button {
  margin: 0 10px 10px 0;
}
</style>
