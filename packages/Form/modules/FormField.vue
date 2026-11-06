<template>
  <component
    :is="component"
    v-model="value"
    v-bind="fieldProps"
    @change="handleChange"
  >
    <template v-if="item.type === 'select'">
      <el-option
        v-for="opt in item.options"
        :key="String(opt.value)"
        :label="opt.label"
        :value="opt.value"
        :disabled="opt.disabled"
      />
    </template>
    <template v-else-if="item.type === 'radio'">
      <el-radio
        v-for="opt in item.options"
        :key="String(opt.value)"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </el-radio>
    </template>
    <template v-else-if="item.type === 'checkbox'">
      <el-checkbox
        v-for="opt in item.options"
        :key="String(opt.value)"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </el-checkbox>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { IFormItem } from '../types';

const props = defineProps<{
  item: IFormItem;
  modelValue: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'change', value: any): void;
}>();

const componentMap: Record<string, string> = {
  input: 'el-input',
  textarea: 'el-input',
  password: 'el-input',
  number: 'el-input-number',
  select: 'el-select',
  radio: 'el-radio-group',
  checkbox: 'el-checkbox-group',
  switch: 'el-switch',
  date: 'el-date-picker',
  datetime: 'el-date-picker',
  daterange: 'el-date-picker',
  time: 'el-time-picker',
  slider: 'el-slider',
  rate: 'el-rate',
  cascader: 'el-cascader',
  upload: 'el-upload',
};

const component = computed(
  () => componentMap[props.item.type || 'input'] || 'el-input',
);

const value = computed({
  get: () => props.modelValue,
  set: (val: any) => emit('update:modelValue', val),
});

// 支持 placeholder 的控件
const hasPlaceholder = (type: string) =>
  [
    'input',
    'textarea',
    'password',
    'number',
    'select',
    'date',
    'datetime',
    'daterange',
    'time',
    'cascader',
  ].includes(type);

// 支持 clearable 的控件
const hasClearable = (type: string) =>
  [
    'input',
    'textarea',
    'select',
    'date',
    'datetime',
    'daterange',
    'time',
    'cascader',
  ].includes(type);

const fieldProps = computed(() => {
  const type = props.item.type || 'input';
  const base: Record<string, any> = { ...(props.item.props || {}) };

  // 类型相关属性
  if (type === 'textarea') base.type = 'textarea';
  if (type === 'password') {
    base.type = 'password';
    base.showPassword = true;
  }
  if (type === 'date') base.type = 'date';
  if (type === 'datetime') base.type = 'datetime';
  if (type === 'daterange') base.type = 'daterange';
  if (type === 'cascader' && props.item.options) base.options = props.item.options;

  // 占位提示
  if (hasPlaceholder(type)) {
    base.placeholder =
      props.item.placeholder ||
      (['select', 'date', 'datetime', 'daterange', 'time', 'cascader'].includes(type)
        ? `请选择${props.item.label || ''}`
        : `请输入${props.item.label || ''}`);
  }

  // 是否可清空
  if (hasClearable(type)) {
    base.clearable = props.item.clearable !== undefined ? props.item.clearable : true;
  }

  // 禁用
  if (props.item.disabled !== undefined) {
    base.disabled = props.item.disabled;
  }

  return base;
});

const handleChange = (val: any) => {
  emit('change', val);
};
</script>
