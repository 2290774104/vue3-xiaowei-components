import { defineConfig } from 'vitepress';
import { mdPlugin } from './config/plugins';
import { version } from '../../package.json';

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
  base: '/vue3-xiaowei-components/',
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
  themeConfig: {
    logo: '/logo.jpg',
    siteTitle: 'Vue3 小微组件文档',
    outline: 3,
    search: {
      provider: 'local',
    },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    outlineTitle: '本页导航',
    lastUpdatedText: '上次更新时间',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/2290774104/vue3-xiaowei-components',
      },
    ],
    nav: [
      {
        text: '安装指南',
        link: '/guide/installation',
      },
      {
        text: '组件总览',
        link: '/components/overview',
      },
      {
        text: `v${version}`,
        items: [
          {
            text: '更新日志',
            link: '/guide/upgrade',
          },
          {
            text: '历史版本',
            link: 'https://github.com/2290774104/vue3-xiaowei-components/releases',
          },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '安装指南',
          items: [
            {
              text: '简介',
              link: '/guide/index',
            },
            {
              text: '安装',
              link: '/guide/installation',
            },
            {
              text: '快速开始',
              link: '/guide/quickstart',
            },
            {
              text: '更新日志',
              link: '/guide/upgrade',
            },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件总览',
          items: [
            {
              text: '组件概览',
              link: '/components/overview',
            },
          ],
        },
        {
          text: '数据展示',
          items: [
            {
              text: 'XwTable 表格组件',
              link: '/components/Table',
            },
          ],
        },
        {
          text: '表单组件',
          items: [
            {
              text: 'XwSearch 搜索组件',
              link: '/components/Search',
            },
          ],
        },
      ],
    },
  },
  markdown: {
    lineNumbers: true,
    config: (md) => {
      md.use(mdPlugin);
    },
  },
});
