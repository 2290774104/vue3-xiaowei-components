import type { DirectiveBinding } from 'vue';

export default {
  mounted: (el: HTMLElement, binding: DirectiveBinding) => {
    setHeight(el, binding);
  },
  // 高度自适应更新
  updated: (el: HTMLElement, binding: DirectiveBinding) => {
    setHeight(el, binding);
  },
};

const getHeight = (el: HTMLElement, binding: DirectiveBinding) => {
  const { height, topOffset = 0, bottomOffset = 0 } = binding.value || {};
  // 未设置高度则自适应父容器高度
  if (height === '' || height === undefined || height === null) {
    const parentHeight = el.parentElement?.clientHeight ?? 0;
    return parentHeight - topOffset - bottomOffset;
  }
  const parsed = typeof height === 'string' ? parseInt(height, 10) : height;
  // 无效高度返回 NaN，交由 setHeight 跳过，避免写出 height: NaNpx
  if (typeof parsed !== 'number' || Number.isNaN(parsed)) return NaN;
  return parsed - topOffset - bottomOffset;
};

const setHeight = (el: HTMLElement, binding: DirectiveBinding) => {
  // 指令值为 null/undefined 时（如 autoHeight 为 false），不接管高度计算，
  // 并清掉之前写入的内联高度，让 el-table 回到默认按内容撑开的布局
  if (binding.value == null) {
    el.style.height = '';
    return;
  }
  const height = getHeight(el, binding);
  // 计算不出有效高度时不动样式，避免写入 NaNpx / 负值把表格压没
  if (!Number.isFinite(height) || height < 0) return;
  el.style.height = `${height}px`;
};
