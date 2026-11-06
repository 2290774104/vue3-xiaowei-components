<template>
  <div class="form-demo">
    <h2>XwForm 动态表单</h2>
    <p class="desc">
      通过 <code>items</code> 配置项动态生成表单，支持栅格排版（<code>span</code>/<code>gutter</code>）与必填校验（<code>required</code>）。
    </p>

    <xw-form
      ref="formRef"
      :model="model"
      :items="items"
      :label-width="'100px'"
      :gutter="20"
      @submit="handleSubmit"
      @change="handleChange"
    >
      <template #actions>
        <el-button type="primary" @click="formRef?.submit()">提交</el-button>
        <el-button @click="formRef?.resetFields()">重置</el-button>
        <el-button @click="handleValidate">校验表单</el-button>
      </template>
    </xw-form>

    <el-divider />
    <p>当前数据：</p>
    <pre class="json">{{ JSON.stringify(model, null, 2) }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import XwForm from 'component/Form';
import type { IFormItem } from 'component/Form/types';

const formRef = ref();

const model = reactive<Record<string, any>>({
  name: '',
  age: undefined,
  gender: '',
  hobbies: [],
  city: '',
  birthday: '',
  open: true,
  intro: '',
  rate: 0,
  level: '',
});

const items: IFormItem[] = [
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
  {
    type: 'checkbox',
    label: '爱好',
    prop: 'hobbies',
    span: 12,
    options: [
      { label: '阅读', value: 'read' },
      { label: '运动', value: 'sport' },
      { label: '音乐', value: 'music' },
    ],
  },
  {
    type: 'select',
    label: '城市',
    prop: 'city',
    span: 12,
    clearable: true,
    options: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
    ],
  },
  {
    type: 'date',
    label: '生日',
    prop: 'birthday',
    span: 12,
    props: { valueFormat: 'YYYY-MM-DD' },
  },
  { type: 'switch', label: '启用', prop: 'open', span: 12 },
  { type: 'rate', label: '评分', prop: 'rate', span: 12 },
  {
    type: 'textarea',
    label: '简介',
    prop: 'intro',
    span: 24,
    props: { rows: 3, maxlength: 100, showWordLimit: true },
  },
  {
    type: 'cascader',
    label: '级别',
    prop: 'level',
    span: 12,
    options: [
      {
        label: '一级',
        value: '1',
        children: [
          { label: '二级', value: '1-1' },
          { label: '二级2', value: '1-2' },
        ],
      },
      { label: '一级2', value: '2' },
    ],
  },
];

const handleSubmit = (data: Record<string, any>) => {
  console.log('提交数据', data);
  window.alert('提交成功：' + JSON.stringify(data));
};

const handleChange = (payload: { item: IFormItem; value: any }) => {
  console.log('字段变化', payload.item.prop, payload.value);
};

const handleValidate = async () => {
  try {
    await formRef.value?.validate();
    window.alert('校验通过');
  } catch (e) {
    console.log('校验失败', e);
  }
};
</script>

<style lang="scss" scoped>
.form-demo {
  padding: 20px;
  max-width: 900px;

  .desc {
    color: #666;
    margin-bottom: 20px;

    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .json {
    background: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow: auto;
    max-height: 300px;
  }
}
</style>
