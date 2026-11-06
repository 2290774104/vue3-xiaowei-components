import type { FormItemRule } from 'element-plus';

// 表单控件类型
export type FormItemType =
  | 'input'
  | 'textarea'
  | 'password'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'daterange'
  | 'time'
  | 'slider'
  | 'rate'
  | 'cascader'
  | 'upload';

// 下拉、单选、复选、级联的选项配置
export declare interface IFormOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  children?: IFormOption[];
}

// 表单项配置
export declare interface IFormItem {
  // 控件类型，默认 input
  type?: FormItemType;
  // 表单项标题
  label?: string;
  // 字段名，绑定 model 中的 key
  prop: string;
  // 栅格占位（24 分栏），默认 24，即整行
  span?: number;
  // 是否必填，为 true 时自动生成必填校验规则
  required?: boolean;
  // 自定义校验规则，与 Element Plus FormItemRule 一致
  rules?: FormItemRule[];
  // 占位提示
  placeholder?: string;
  // 是否禁用
  disabled?: boolean;
  // 是否可清空（input/select/date 等控件）
  clearable?: boolean;
  // 选项数据（select/radio/checkbox/cascader）
  options?: IFormOption[];
  // 透传给底层 Element Plus 控件的其它属性
  props?: Record<string, any>;
}

// 表单项默认值（用于 designer 导出）
export declare interface IFormConfig {
  // 表单整体配置
  labelWidth?: string | number;
  labelPosition?: 'left' | 'right' | 'top';
  size?: 'large' | 'default' | 'small';
  inline?: boolean;
  gutter?: number;
  // 表单项列表
  items: IFormItem[];
  // 初始数据
  model: Record<string, any>;
  // 顶层校验规则（与 items 中的 rules 合并）
  rules?: Record<string, FormItemRule[]>;
}
