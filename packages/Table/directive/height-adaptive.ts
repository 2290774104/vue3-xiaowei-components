import { DirectiveBinding } from 'vue';

export default {
  mounted: (el: HTMLElement, binding: DirectiveBinding) => {
    setHeight(el, binding);
  },
};

const getHeight = (binding: DirectiveBinding) => {
  const { height, topOffset, bottomOffset } = binding.value;
  // 未设置高度则自适应高度
  if (height) {
    if (typeof height === 'string') {
      return parseInt(height) - topOffset - bottomOffset;
    } else {
      return height - topOffset - bottomOffset;
    }
  }
};

const setHeight = (el: HTMLElement, binding: DirectiveBinding) => {
  console.log(binding);
  
  const height = getHeight(binding);
  el.style.height = `${height}px`;
};
