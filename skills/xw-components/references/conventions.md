# 代码与目录约定

> 手写规范，从现有 XwTable / XwSearch / XwForm 反推。新增组件必须遵循，否则与既有风格割裂。

## 目录结构

```
packages/
├── components.ts              # 组件总登记（新增组件必改，不要改 index.ts）
├── index.ts                   # 自动遍历 components 注册，不要手改
└── <Dir>/                     # 目录名不含 Xw 前缀，如 Table / Search / Form
    ├── index.ts               # install + app.component('Xw<Name>', ...)
    ├── modules/
    │   ├── <Dir>.vue          # 主实现
    │   └── <Sub>.vue          # 子组件（可选），如 Form 的 FormField
    ├── types/index.ts         # interface 定义（可选，props 复杂时加）
    └── directive/xxx.ts       # 自定义指令（可选），如 Table 的 height-adaptive
```

> 组件内部状态尽量放在组件自身（`ref` / `reactive`），不要用模块级单例 —— 单例会让同页面多个同类组件共享状态、互相干扰。`Table` 曾用模块级 `PagStore` 保存分页，已改为组件内部状态。

组件名与目录名的对应关系：`packages/Table/` → 注册名 `XwTable` → 模板里 `<xw-table>`。
**`components.ts` 里是 `import XwTable from './Table'`，变量名与目录名不一致是正常的，不要"纠正"。**

## 命名

| 对象 | 约定 | 示例 |
| --- | --- | --- |
| 组件注册名 | `Xw` + 大驼峰 | `XwTable`、`XwSearch`、`XwForm` |
| 模板标签 | kebab-case | `<xw-table>`、`<xw-form>` |
| 根容器类名 | `.xw-` + kebab-case，与组件同名 | `.xw-table`、`.xw-search`、`.xw-form` |
| 内部元素类名 | 以根类为前缀 | `.xw-search-btn`、`.xw-search-btn-left` |
| 文件名 | 与目录同名的大驼峰 | `Table.vue`、`FormField.vue` |
| 事件名 | kebab-case | `page-change` |
| 布尔 prop | 肯定式命名 | `autoHeight`、`previewImage` |

## 组件实现写法

统一使用 `<script lang="ts" setup>`，风格与 `packages/Table/modules/Table.vue` 保持一致：

```vue
<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { PropType } from 'vue';
import type { IMyType } from '../types';

const props = defineProps({
  // 这里写这个属性的中文说明（生成脚本会抽取这行注释作为属性说明）
  data: {
    type: Array as PropType<IMyType[]>,
    required: true,
  },
  // 是否启用某某功能
  enabled: {
    type: Boolean,
    default: true,
  },
});

// 事件
const emit = defineEmits(['change']);

// 需要暴露给父组件的方法
defineExpose({ someMethod });
</script>
```

关键点：

- **`defineProps` 用对象式**，不要用类型声明式 —— 现有组件全是对象式，且脚本依赖"每个属性上方一行 `//` 注释"来抽取属性说明。
- **每个 prop 上方必须有一行中文注释**，这行注释会进入 `references/components.md` 成为属性说明。
- 复杂类型用 `PropType<T>` 包裹，泛型参数会被脚本抽取为类型列。
- `defineEmits` 数组式 `['a-b']` 或泛型式均可，脚本都支持。
- `<style lang="scss" scoped>`，根类名与组件同名。
- 样式尽量复用 Element Plus 的 CSS 变量，不要硬编码颜色。

## 属性透传

组件要把未声明的属性透传给底层 Element Plus 组件，让使用者能直接用原生属性：

```vue
<script lang="ts" setup>
import { useAttrs } from 'vue';
const attrs = useAttrs();
</script>

<template>
  <!-- v-bind="attrs" 之外的 props 都会透传到 el-table -->
  <el-table ref="tableRef" :data="data" v-bind="attrs">...</el-table>
</template>
```

`XwTable` 即用此方式支持 `border`、`stripe`、`row-key` 等原生属性。文档里必须明确写出这一点，否则使用者会以为不支持。

## 入口文件写法

`packages/<Dir>/index.ts`：

```ts
import XwXxx from './modules/Xxx.vue';

XwXxx.install = function (app: any) {
  app.component('XwXxx', XwXxx);
};

export default XwXxx;

// 若有 types，一并导出
export * from './types';
```

`packages/components.ts`（唯一需要手改的登记处）：

```ts
import XwTable from './Table';
import XwXxx from './Xxx';

export default {
  XwTable,
  XwXxx,
};

export { XwTable, XwXxx };
```

## 需要注意的坑

- **不要改 `packages/index.ts` 的自动注册逻辑**：它用 `Object.keys(components).forEach(...)` 遍历注册，手动加一遍会导致重复注册。命名导出由 `export * from './components'` 统一提供，新增组件同样不必手改。
- **新增第三方依赖**要同步改 `vite.config.ts` 的 `rollupOptions.external` 与 `output.globals`，**包名必须与 import 一致**（例如代码里写 `lodash-es`，external 就必须写 `'lodash-es'`，写 `'lodash'` 等于没排除，会被打进产物）。简单工具函数优先自己实现，不必为此引入 lodash。
- **`components.d.ts`** 是给使用方 Volar 提供全局组件类型提示的，新增组件必须补，且**构建时会复制进 dist**。
- **路径别名**：`@` → `examples/`，`component` → `packages/`，两处分别定义在 `vite.config.ts` 和 `tsconfig.app.json`，改一处要同步另一处。
- **组件要对外暴露方法时记得 `defineExpose`**：否则文档里承诺的 ref 调用（如 `tableRef`）在构建后会失效 —— 曾经踩过这个坑。
- **`class` / `style` 与属性透传**：若组件用 `v-bind="attrs"` 透传到内部组件，建议同时 `defineOptions({ inheritAttrs: false })`，否则未声明的属性会同时落到根元素和内部组件上，造成重复绑定。
