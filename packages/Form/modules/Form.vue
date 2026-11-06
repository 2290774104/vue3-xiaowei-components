<template>
  <el-form
    ref="formRef"
    class="xw-form"
    :model="model"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :size="size"
    :inline="inline"
    :disabled="disabled"
    :rules="mergedRules"
  >
    <el-row :gutter="gutter">
      <el-col
        v-for="item in visibleItems"
        :key="item.prop"
        :span="item.span ?? defaultSpan"
      >
        <el-form-item
          :label="item.label"
          :prop="item.prop"
          :rules="getItemRules(item)"
        >
          <slot
            v-if="item.props?.customSlot"
            :name="item.props.customSlot"
            v-bind="{ item, model }"
          ></slot>
          <form-field
            v-else
            v-model="model[item.prop]"
            :item="item"
            @change="(val: any) => emitChange(item, val)"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item v-if="$slots.actions">
      <slot name="actions"></slot>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { FormItemRule } from 'element-plus';
import type { PropType } from 'vue';
import type { IFormItem } from '../types';
import FormField from './FormField.vue';

const props = defineProps({
  // 表单数据对象
  model: {
    type: Object as PropType<Record<string, any>>,
    required: true,
  },
  // 表单项配置
  items: {
    type: Array as PropType<IFormItem[]>,
    required: true,
  },
  // 标签宽度
  labelWidth: {
    type: [String, Number] as PropType<string | number>,
    default: '80px',
  },
  // 标签对齐方式
  labelPosition: {
    type: String as PropType<'left' | 'right' | 'top'>,
    default: 'right',
  },
  // 控件尺寸
  size: {
    type: String as PropType<'large' | 'default' | 'small'>,
    default: 'default',
  },
  // 是否行内表单
  inline: {
    type: Boolean,
    default: false,
  },
  // 是否禁用所有控件
  disabled: {
    type: Boolean,
    default: false,
  },
  // 栅格间距
  gutter: {
    type: Number,
    default: 0,
  },
  // 默认栅格占位
  defaultSpan: {
    type: Number,
    default: 24,
  },
  // 顶层校验规则，与 items 内 rules 合并
  rules: {
    type: Object as PropType<Record<string, FormItemRule[]>>,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (e: 'change', payload: { item: IFormItem; value: any }): void;
  (e: 'submit', model: Record<string, any>): void;
}>();

const formRef = ref();

// 过滤隐藏项
const visibleItems = computed(() => props.items.filter((i) => !i.props?.hidden));

// 必填自动生成规则
const getItemRules = (item: IFormItem): FormItemRule[] => {
  const rules: FormItemRule[] = [...(item.rules || [])];
  if (item.required) {
    const trigger: string = ['select', 'radio', 'checkbox', 'date', 'datetime', 'daterange', 'time', 'cascader', 'switch', 'rate', 'slider', 'number'].includes(
      item.type || 'input',
    )
      ? 'change'
      : 'blur';
    rules.unshift({
      required: true,
      message: `${item.label || item.prop}不能为空`,
      trigger,
    });
  }
  return rules;
};

// 合并顶层 rules
const mergedRules = computed(() => props.rules);

const emitChange = (item: IFormItem, value: any) => {
  emit('change', { item, value });
};

// 校验
const validate = () => formRef.value?.validate();
const validateField = (propsName: string | string[]) =>
  formRef.value?.validateField(propsName);
const resetFields = () => formRef.value?.resetFields();
const clearValidate = (propsName?: string | string[]) =>
  formRef.value?.clearValidate(propsName);
const scrollToField = (prop: string) => formRef.value?.scrollToField(prop);

// 提交（校验通过后触发 submit 事件）
const submit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      emit('submit', props.model);
    }
  });
};

defineExpose({
  formRef,
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
  submit,
});
</script>

<style lang="scss" scoped>
.xw-form {
  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
