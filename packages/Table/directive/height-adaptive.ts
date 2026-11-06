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
  const height = getHeight(el, binding);
  // 计算不出有效高度时不动样式，避免写入 NaNpx / 负值把表格压没
  if (!Number.isFinite(height) || height < 0) return;
  el.style.height = `${height}px`;
};
