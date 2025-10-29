import { h, type DirectiveBinding } from 'vue';

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
  const { height, topOffset, bottomOffset } = binding.value;
  // 未设置高度则自适应高度
  if (height) {
    if (typeof height === 'string') {
      return parseInt(height) - topOffset - bottomOffset;
    } else {
      return height - topOffset - bottomOffset;
    }
  } else {
    return el.parentElement!.clientHeight - topOffset - bottomOffset;
  }
};

const setHeight = (el: HTMLElement, binding: DirectiveBinding) => {
  const height = getHeight(el, binding);
  console.log(height);
  
  el.style.height = `${height}px`;
};
