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
    lib: {
      entry: './packages/index.ts',
      name: 'Vue3XiaoweiComponents',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'umd', 'es'],
    },
    outDir: 'dist',
    rollupOptions: {
      // 打包时移除外部依赖
      external: ['vue', 'lodash', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          lodash: '_',
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
          ],
        }),
      ],
    },
  },
});
