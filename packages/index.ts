import { App } from 'vue';
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
