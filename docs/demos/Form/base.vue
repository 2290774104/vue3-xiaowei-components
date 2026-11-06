<template>
  <div>
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

    <p style="color: #666">当前数据：{{ model }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const formRef = ref();

const model = reactive({
  name: '',
  age: undefined,
  gender: '',
  hobbies: [],
  birthday: '',
});

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
  {
    type: 'checkbox',
    label: '爱好',
    prop: 'hobbies',
    span: 24,
    options: [
      { label: '阅读', value: 'read' },
      { label: '运动', value: 'sport' },
      { label: '音乐', value: 'music' },
    ],
  },
  { type: 'date', label: '生日', prop: 'birthday', span: 12 },
];

const handleSubmit = (data: any) => {
  console.log('提交数据', data);
};
</script>
