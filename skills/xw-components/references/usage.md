# 组件 API 速查与用法

> 手写规范，面向**在业务项目里使用**本组件库的场景。
> 组件清单与完整 props 以 `references/components.md` 为准（由源码生成，永远最新）。

## 安装与接入

```bash
pnpm install vue3-xiaowei-components -S
```

组件库**依赖 Element Plus**，使用方必须自己全局注册 Element Plus 与其样式：

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import locale from 'element-plus/es/locale/lang/zh-cn';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import XwComponents from 'vue3-xiaowei-components';
import 'vue3-xiaowei-components/dist/index.css';

const app = createApp(App);

// 注册所有图标（组件库内部用到图标，缺失会导致图标不显示）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus, { locale });
app.use(XwComponents);
app.mount('#app');
```

**按需引入**：

```ts
import 'vue3-xiaowei-components/dist/index.css';
import { XwTable } from 'vue3-xiaowei-components';
```

模板中标签为 kebab-case：`<xw-table>`、`<xw-search>`、`<xw-form>`。

### Volar 类型提示

`tsconfig.json` 里加上，可获得全局组件类型补全：

```json
{
  "compilerOptions": {
    "types": ["vue3-xiaowei-components/dist/components.d.ts"]
  }
}
```

## XwTable 表格

`data` + `columns` 配置化渲染，内置分页、搜索区、图片列、高度自适应。

```vue
<template>
  <xw-table
    :data="tableData"
    :columns="columns"
    :pagination="pagination"
    :total="total"
    border
    @page-change="handlePageChange"
  >
    <template #search>
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
      </el-form>
    </template>
    <template #leftOperate>
      <el-button type="primary">新增</el-button>
    </template>
  </xw-table>
</template>
```

关键 props：`data`（必填）、`columns`（必填）、`pagination`、`total`、`height`、`searchFold`、`autoHeight`、`previewImage`、`autoToTop`、`autoDoLayout`。
事件：`page-change`，回调 `{ pageSize, currentPage }`。
插槽：`search`、`leftOperate`、以及列配置里 `customRender` 指定的自定义插槽。

**属性透传**：未声明的 props 全部透传给内部 `el-table`，可直接用 `border`、`stripe`、`row-key`、`highlight-current-row` 等原生属性。

### 列配置 IColumn

| 关键字段 | 用途 |
| --- | --- |
| `type` | `'selection'` 多选 / `'index'` 序号 / `'expand'` 展开 / `'image'` 图片 |
| `prop` / `label` / `width` / `minWidth` | 基本列定义 |
| `hidden` | 为 `true` 时该列不渲染（可用于权限控制） |
| `fixed` | 固定列，`true` / `'left'` / `'right'` |
| `formatter` | 格式化函数，参数 `{ row, column, cellValue, index }` |
| `customRender` | 指定插槽名，用同名插槽自定义内容，作用域 `{ row, column, $index }` |
| `showOverflowTooltip` | 超长显示省略号 |
| `selectable` / `reserveSelection` | 多选列专用 |

### 常见组合

```ts
// 图片列 + 关闭预览
const columns = [
  { prop: 'avatar', label: '头像', type: 'image', width: 80 },
  { prop: 'name', label: '姓名' },
  { prop: 'status', label: '状态', customRender: 'status' },
  { prop: 'price', label: '价格', formatter: ({ cellValue }) => `¥${cellValue.toFixed(2)}` },
];
```

### 注意事项

- **高度自适应依赖父容器高度**：启用 `autoHeight` 时，组件用 `el.parentElement.clientHeight` 减搜索区与分页区高度算表格高度。父容器必须有确定高度，否则表格高度为 0。若父容器没有高度，请显式传 `height`。
- **分页状态归属组件实例**，多表格场景各自独立，不会互相干扰。
- 通过 ref 可调用内部实例：`tableRef`（内部 `el-table`）、`searchRef`（内部 `xw-search`），以及快捷方法 `doLayout()`、`clearSelection()`、`setScrollTop(top)`。例如 `tableRef.value.clearSelection()`。
- 属性（未声明的）会透传给内部 `el-table`，可直接用 `border`、`stripe`、`row-key` 等原生属性；`class` 与 `style` 仍作用于外层容器。

## XwSearch 搜索区

提供搜索表单与操作按钮的统一布局容器，通常与 `XwTable` 搭配，也可单独使用。

```vue
<xw-search :search-fold="true" @refresh="handleRefresh">
  <template #default>
    <el-form :model="searchForm" inline>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" />
      </el-form-item>
    </el-form>
  </template>
  <template #leftOperate>
    <el-button type="primary">新增</el-button>
    <el-button type="danger">批量删除</el-button>
  </template>
</xw-search>
```

- props：`searchFold`（是否显示折叠/刷新按钮，默认 `false`）
- 事件：`refresh`（点刷新按钮触发）
- 插槽：`default`（表单区）、`leftOperate`（左侧按钮区）
- 折叠时 `default` 插槽内容整体隐藏，`leftOperate` 始终显示

## XwForm 动态表单

用 `items` 配置生成表单，免手写 `<el-form-item>`。与 `XwTable` 是**页面级三件套**的第三块：搜索、列表、录入。

```vue
<template>
  <xw-form
    ref="formRef"
    :model="model"
    :items="items"
    :label-width="'100px'"
    :gutter="20"
    @submit="handleSubmit"
  >
    <template #actions>
      <el-button type="primary" @click="formRef.submit()">提交</el-button>
      <el-button @click="formRef.resetFields()">重置</el-button>
    </template>
  </xw-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const formRef = ref();

const model = reactive({ name: '', age: undefined, gender: '' });

const items = [
  { type: 'input', label: '姓名', prop: 'name', span: 12, required: true },
  { type: 'number', label: '年龄', prop: 'age', span: 12, required: true },
  {
    type: 'select',
    label: '性别',
    prop: 'gender',
    span: 12,
    required: true,
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
  },
];

const handleSubmit = (data: any) => {
  console.log('提交数据', data);
};
</script>
```

`type` 支持：`input` / `textarea` / `password` / `number` / `select` / `radio` / `checkbox` / `switch` / `date` / `datetime` / `daterange` / `time` / `slider` / `rate` / `cascader` / `upload`。

- `span`：24 分栏占位，配合 `gutter` 实现栅格排版
- `required: true`：自动生成必填规则，触发方式按控件类型智能选择
- `options`：`select` / `radio` / `checkbox` / `cascader` 的选项
- `rules`：自定义校验，与必填规则合并
- `props`：透传给底层 Element Plus 控件；`props.customSlot` 可指定插槽名代替默认控件

**通过 ref 调用**（已 `defineExpose`）：`validate()`、`validateField(prop)`、`resetFields()`、`clearValidate(prop?)`、`scrollToField(prop)`、`submit()`。
事件：`change`（`{ item, value }`）、`submit`（校验通过后返回 `model`）。
插槽：`actions`（底部按钮区）。

### 注意事项

- **`model` 与 `items` 都是必填**，且 `model` 的 key 必须与 item 的 `prop` 对应，否则双向绑定失效。
- `submit` 事件只在**校验通过**后触发，因此表单校验失败时不会有反应 —— 需要错误反馈时监听 `el-form` 的失败回调得自行扩展，或直接用 `validate()`。
- 表单校验规则来自 `items[].rules` 与顶层 `rules` 的合并，同名 prop 时以底层合并结果为准。

## 排查清单

组件"不生效 / 渲染异常"时，按顺序检查：

1. **Element Plus 是否全局注册**（`app.use(ElementPlus)`）—— 组件内部大量使用 `el-*`，未注册会整片报错或空白
2. **两套样式是否引入**：`element-plus/dist/index.css` 与 `vue3-xiaowei-components/dist/index.css`
3. **图标是否注册** —— 组件内部用 `@element-plus/icons-vue`，未注册图标不显示（不报错）
4. **`XwTable` 父容器有无确定高度** —— `autoHeight` 依赖父级 `clientHeight`
5. **组件名大小写** —— 模板用 kebab-case（`<xw-table>`），`components.md` 里是 PascalCase 注册名
6. 需要查某个 prop 的准确默认值，读 `references/components.md` 或直接看源码 `packages/<Dir>/modules/<Dir>.vue`
