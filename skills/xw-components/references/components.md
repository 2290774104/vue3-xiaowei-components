# 组件清单

> 本文件由 `scripts/gen-skill-references.mjs` 从源码生成，**请勿手改**。改完源码后运行 `pnpm gen:skill` 重新生成。

共 3 个组件。组件名统一以 `Xw` 开头，模板中可直接使用（已全局注册）。

**清单里没有的组件名就是不存在**，不要凭印象拼名字。需要更细的用法示例时：

- `docs/components/<Name>.md` 是完整文档（属性 / 事件 / 插槽 / 示例）
- `docs/demos/<Name>/*.vue` 是可运行示例，`<demo vue="<Name>/base.vue" />` 引用
- `packages/<Dir>/types/index.ts` 是自定义 interface（如 `IColumn`、`IFormItem`）

---

## XwForm

通过 `items` 配置项动态生成表单，支持栅格排版、必填校验、多种控件类型以及 Element Plus 表单属性透传，无需在模板中手写 `<el-form-item>`。

- 目录：`packages/Form/`
- 实现：`packages/Form/modules/Form.vue`

**Props**

| 属性 | 说明 | 类型 | 默认值 | 必填 |
| --- | --- | --- | --- | --- |
| `model` | 表单数据对象 | `Record<string, any>` | `-` | 是 |
| `items` | 表单项配置 | `IFormItem[]` | `-` | 是 |
| `labelWidth` | 标签宽度 | `string \| number` | `'80px'` | 否 |
| `labelPosition` | 标签对齐方式 | `'left' \| 'right' \| 'top'` | `'right'` | 否 |
| `size` | 控件尺寸 | `'large' \| 'default' \| 'small'` | `'default'` | 否 |
| `inline` | 是否行内表单 | `Boolean` | `false` | 否 |
| `disabled` | 是否禁用所有控件 | `Boolean` | `false` | 否 |
| `gutter` | 栅格间距 | `Number` | `0` | 否 |
| `defaultSpan` | 默认栅格占位 | `Number` | `24` | 否 |
| `rules` | 顶层校验规则，与 items 内 rules 合并 | `Record<string, FormItemRule[]>` | `() => ({})` | 否 |

**Events**：`change`、`submit`

**Slots**：`（动态插槽，名字由配置项决定）`、`actions`

**暴露方法（通过 ref 调用）**：`formRef`、`validate`、`validateField`、`resetFields`、`clearValidate`、`scrollToField`、`submit`

---

## XwSearch

用于提供搜索表单和操作按钮的统一布局容器，支持折叠展开功能。

- 目录：`packages/Search/`
- 实现：`packages/Search/modules/Search.vue`

**Props**

| 属性 | 说明 | 类型 | 默认值 | 必填 |
| --- | --- | --- | --- | --- |
| `searchFold` | 是否折叠搜索框 | `Boolean` | `false` | 否 |

**Events**：`refresh`

**Slots**：`default`、`leftOperate`

---

## XwTable

用于展示多条结构类似的数据，可对数据进行排序、筛选、对比或其他自定义操作。基于 Element Plus 的 Table 组件进行二次封装，提供了更便捷的列配置方式、内置分页、搜索区域、图片预览和高度自适应等功能。

- 目录：`packages/Table/`
- 实现：`packages/Table/modules/Table.vue`

**Props**

| 属性 | 说明 | 类型 | 默认值 | 必填 |
| --- | --- | --- | --- | --- |
| `data` | 数据相关 | `IData[]` | `-` | 是 |
| `columns` | 表格每列配置项 | `IColumn[]` | `-` | 是 |
| `pagination` | 分页配置：传 true 用默认配置，传对象自定义，传 false 不显示 | `boolean \| IPagination` | `false` | 否 |
| `total` | 数据总数 | `Number` | `0` | 否 |
| `height` | 组件高度，默认占满父级容器 | `[Number, String]` | `''` | 否 |
| `autoToTop` | 是否在数据重渲染后自动滚动到顶部 | `Boolean` | `true` | 否 |
| `autoDoLayout` | 是否在数据更新后重新布局el-table，可能能解决一些异常 | `Boolean` | `true` | 否 |
| `searchFold` | 是否折叠搜索框 | `Boolean` | `false` | 否 |
| `autoHeight` | 是否自动计算高度，默认不计算 | `Boolean` | `false` | 否 |
| `previewImage` | 是否启用图片预览功能 | `Boolean` | `true` | 否 |

**Events**：`page-change`

**Slots**：`search`、`leftOperate`、`（动态插槽，名字由配置项决定）`

**暴露方法（通过 ref 调用）**：`tableRef`、`searchRef`、`doLayout`、`clearSelection`、`setScrollTop`
