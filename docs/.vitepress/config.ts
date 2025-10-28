import { defineConfig } from 'vitepress';
import { mdPlugin } from './config/plugins';

const content = [
  ,
  'vue xiaowei-components',
  'xiaowei-components vue',
  'vue3-xiaowei-components',
  'xiaowei-components',
  'element-plus',
  'Page level components',
  'component library',
  'ui framework',
  'ui',
  '基础组件',
  '二次封装',
  'vue',
].toString();
export default defineConfig({
  title: 'Vue3 小微组件库',
  description: content,
  lang: 'zh-CN',
  head: [
    ['meta', { name: 'author', content: 'wocwin' }],
    [
      'meta',
      {
        name: 'viewport',
        content:
          'width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no',
      },
    ],
    [
      'meta',
      {
        name: 'description',
        content,
      },
    ],
    ['meta', { name: 'keywords', content }],
    ['link', { rel: 'icon', href: './favicon.ico' }],
  ],
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
    config: (md) => {
      md.use(mdPlugin);
    },
  },
});
