import type { App } from 'vue';
import components from './components';
import { version } from '../package.json';

const install = (app: App): void => {
  Object.keys(components).forEach((key) => {
    const component = (components as any)[key];
    app.use(component);
  });
};

export default {
  version,
  install,
  ...components,
};

// 命名导出：支持 `import { XwTable } from 'vue3-xiaowei-components'` 按需引入。
// 缺少这段时具名导入会拿到 undefined，只有默认导出的 app.use 可用。
export * from './components';
export { version };
