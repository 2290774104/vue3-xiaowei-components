import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import copyPlugin from 'rollup-plugin-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      // 只输出组件库自身的类型声明；examples 是本地调试页，属于仓库内部，
      // 打进 npm 包只会污染 dist（原先 dist/examples 即由此产生）
      include: ['packages/**/*.ts', 'packages/**/*.vue'],
    }),
  ],
  server: {
    port: 8080,
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, './examples/') },
      { find: 'component', replacement: resolve(__dirname, './packages/') },
      { find: '@http', replacement: resolve(__dirname, './http/index.ts') },
    ],
  },
  esbuild: {
    // drop: ['console', 'debugger'],  // 生产环境去除console和debugger
  },
  build: {
    target: ['es2015'],
    assetsInlineLimit: 0,
    // 不把 public/ 下的开发用资源（如 vite.svg）复制进发布产物
    copyPublicDir: false,
    lib: {
      entry: './packages/index.ts',
      name: 'Vue3XiaoweiComponents',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'umd', 'es'],
    },
    outDir: 'dist',
    rollupOptions: {
      // 打包时移除外部依赖。
      external: ['vue', 'lodash-es', 'element-plus'],
      output: {
        // 组件库同时提供默认导出（app.use）与命名导出（按需引入），
        // 显式声明 named 避免 UMD 下要求写 .default 才能取到默认导出
        exports: 'named',
        globals: {
          vue: 'Vue',
          'lodash-es': '_',
          'element-plus': 'ElementPlus',
        },
        assetFileNames: 'index.[ext]',
      },
      plugins: [
        // copy 插件针对vite4封装，vite5中使用时会出现类型报错
        // @ts-ignore
        copyPlugin({
          verbose: true,
          hook: 'closeBundle',
          targets: [
            { src: './README.md', dest: 'dist/' },
            { src: './components.d.ts', dest: 'dist/' },
            // AI skill 随包分发：下游装包后可复制到 .workbuddy/skills/ 使用
            { src: './skills/*', dest: 'dist/skills' },
          ],
        }),
      ],
    },
  },
});
