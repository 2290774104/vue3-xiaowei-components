# XwForm 动态表单组件

通过 `items` 配置项动态生成表单，支持栅格排版、必填校验、多种控件类型以及 Element Plus 表单属性透传，无需在模板中手写 `<el-form-item>`。

## 基础用法

传入 `model`（表单数据）和 `items`（表单项配置）即可渲染表单。通过 `span` 控制栅格占位（24 分栏），`required` 自动生成必填校验规则，`gutter` 设置栅格间距。

<demo vue="Form/base.vue" />

## 属性说明

### Form Props

| 属性名       | 说明                                                              | 类型                              | 默认值    | 是否必填 |
| ------------ | ----------------------------------------------------------------- | --------------------------------- | --------- | -------- |
| model        | 表单数据对象                                                      | `Record<string, any>`             | -         | 是       |
| items        | 表单项配置                                                        | `IFormItem[]`                     | -         | 是       |
| labelWidth   | 标签宽度                                                          | `string \| number`                | `'80px'`  | 否       |
| labelPosition| 标签对齐方式                                                      | `'left' \| 'right' \| 'top'`      | `'right'` | 否       |
| size         | 控件尺寸                                                          | `'large' \| 'default' \| 'small'` | `'default'` | 否     |
| inline       | 是否行内表单                                                      | `boolean`                         | `false`   | 否       |
| disabled     | 是否禁用所有控件                                                  | `boolean`                         | `false`   | 否       |
| gutter       | 栅格间距                                                          | `number`                          | `0`       | 否       |
| defaultSpan  | 表单项默认栅格占位（未设置 `span` 时生效）                        | `number`                          | `24`      | 否       |
| rules        | 顶层校验规则，与 `items` 内 `rules` 合并                          | `Record<string, FormItemRule[]>`  | `{}`      | 否       |

### IFormItem 表单项配置

| 属性名      | 说明                                                              | 类型                                    | 默认值    |
| ----------- | ----------------------------------------------------------------- | --------------------------------------- | --------- |
| type        | 控件类型                                                          | `'input' \| 'textarea' \| 'password' \| 'number' \| 'select' \| 'radio' \| 'checkbox' \| 'switch' \| 'date' \| 'datetime' \| 'daterange' \| 'time' \| 'slider' \| 'rate' \| 'cascader' \| 'upload'` | `'input'` |
| label       | 表单项标题                                                        | `string`                                | -         |
| prop        | 字段名，绑定 `model` 中的 key                                     | `string`                                | -         |
| span        | 栅格占位（24 分栏）                                               | `number`                                | `24`      |
| required    | 是否必填，为 `true` 时自动生成必填校验规则                        | `boolean`                               | -         |
| rules       | 自定义校验规则，与 Element Plus `FormItemRule` 一致               | `FormItemRule[]`                        | -         |
| placeholder | 占位提示                                                          | `string`                                | -         |
| disabled    | 是否禁用                                                          | `boolean`                               | -         |
| clearable   | 是否可清空（input/select/date 等控件）                            | `boolean`                               | `true`    |
| options     | 选项数据（select/radio/checkbox/cascader）                        | `IFormOption[]`                         | -         |
| props       | 透传给底层 Element Plus 控件的其它属性                            | `Record<string, any>`                   | -         |

### IFormOption 选项配置

| 属性名   | 说明               | 类型                          |
| -------- | ------------------ | ----------------------------- |
| label    | 选项显示文本       | `string`                      |
| value    | 选项值             | `string \| number \| boolean` |
| disabled | 是否禁用该选项     | `boolean`                     |
| children | 子选项（cascader） | `IFormOption[]`               |

### IFormConfig 表单配置（用于表单设计器导出）

| 属性名        | 说明                           | 类型                                   |
| ------------- | ------------------------------ | -------------------------------------- |
| labelWidth    | 标签宽度                       | `string \| number`                     |
| labelPosition | 标签对齐方式                   | `'left' \| 'right' \| 'top'`           |
| size          | 控件尺寸                       | `'large' \| 'default' \| 'small'`      |
| inline        | 是否行内表单                   | `boolean`                              |
| gutter        | 栅格间距                       | `number`                               |
| items         | 表单项列表                     | `IFormItem[]`                          |
| model         | 初始数据                       | `Record<string, any>`                  |
| rules         | 顶层校验规则                   | `Record<string, FormItemRule[]>`       |

## 事件说明

| 事件名 | 说明                                     | 回调参数                                  |
| ------ | ---------------------------------------- | ----------------------------------------- |
| change | 任意表单项值变化时触发                   | `{ item: IFormItem; value: any }`         |
| submit | 调用 `submit()` 且校验通过后触发         | `model`（当前表单数据）                   |

## 方法说明

组件通过 `ref` 暴露以下方法：

| 方法名          | 说明                                   | 参数                          |
| --------------- | -------------------------------------- | ----------------------------- |
| validate        | 校验整个表单                           | -                             |
| validateField   | 校验指定字段                           | `string \| string[]`          |
| resetFields     | 重置表单                               | -                             |
| clearValidate   | 清除校验状态                           | `string \| string[]`（可选）  |
| scrollToField   | 滚动到指定字段                         | `string`                      |
| submit          | 提交（校验通过后触发 `submit` 事件）   | -                             |
| formRef         | 内部 `el-form` 实例引用                | -                             |

## 排版与校验

- **栅格排版**：每个表单项通过 `span` 指定在 24 分栏中的占位，组件自动使用 `el-row`/`el-col` 布局，配合 `gutter` 设置间距。
- **必填校验**：设置 `required: true` 时，组件自动生成必填规则（`{ required: true, message: 'xxx不能为空' }`），触发方式根据控件类型智能选择（input 为 `blur`，select/date 等为 `change`）。
- **自定义校验**：通过 `rules` 传入自定义规则，与必填规则合并。

## 高级用法

### 自定义校验规则

```vue
<template>
  <xw-form :model="model" :items="items" />
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const model = reactive({ email: '' });

const items = [
  {
    type: 'input',
    label: '邮箱',
    prop: 'email',
    rules: [
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
    ],
  },
];
</script>
```

### 透传底层控件属性

通过 `props` 将任意属性透传到 Element Plus 控件，如文本域行数、字数限制等。

```vue
<script setup lang="ts">
const items = [
  {
    type: 'textarea',
    label: '简介',
    prop: 'intro',
    props: { rows: 3, maxlength: 100, showWordLimit: true },
  },
];
</script>
```

### 自定义插槽

配置 `props.customSlot` 指定插槽名，在模板中使用同名插槽完全自定义表单项内容。

```vue
<template>
  <xw-form :model="model" :items="items">
    <template #captcha="{ item, model }">
      <el-input v-model="model[item.prop]" placeholder="请输入验证码">
        <template #append>
          <el-button>获取验证码</el-button>
        </template>
      </el-input>
    </template>
  </xw-form>
</template>

<script setup lang="ts">
const items = [
  { label: '验证码', prop: 'captcha', props: { customSlot: 'captcha' } },
];
</script>
```

## 注意事项

1. 使用前需要确保已全局注册 Element Plus 组件库
2. `model` 需要是响应式对象（使用 `ref` 或 `reactive` 包装）
3. 必填校验需要 `prop` 与 `model` 中的 key 对应
4. `rules` 顶层配置与 `items` 内的 `rules` 使用同一校验字段，`items` 内的优先
