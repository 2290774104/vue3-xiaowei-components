# 快速开始

## 全局使用

> ### 前提条件：使用项目必须全局注册 Element-plus 组件库

```js
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import locale from 'element-plus/es/locale/lang/zh-cn';
// element-plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import XwComponents from 'vue3-xiaowei-components';
import 'vue3-xiaowei-components/dist/index.css';
const app = createApp(App);
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
// 注册ElementPlus
app.use(ElementPlus, {
  locale, // 语言设置
  // size: Cookies.get('size') || 'medium' // 尺寸设置
});
app.use(XwComponents);
app.mount('#app');
```

## 按需引入

```js
// 在main.js中按下引入
import 'vue3-xiaowei-components/dist/index.css';
// 单个.vue文件引入
<script setup lang="ts">
  import {XwTable} from "vue3-xiaowei-components"
</script>;
```

### Vue - Official （Volar）支持

如果您使用 Vue - Official （Volar），请在 tsconfig.json 中通过 compilerOptions.type 指定全局组件类型。

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["vue3-xiaowei-components/dist/components.d.ts"]
  }
}
```
