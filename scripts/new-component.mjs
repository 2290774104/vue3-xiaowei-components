// 新增组件的脚手架：生成组件骨架，并自动插入全部注册点。
//
//   pnpm new:component XwXxx --category 表单组件 [--dir Xxx] [--desc "一句话说明"] [--examples]
//
// 设计要点：
//   1. 对所有既有文件用「区块定位 + 插入」而非整文件覆写 —— 保留原文件换行符（仓库里是 CRLF）、
//      缩进和注释，避免每次新增组件都产生一大片无关 diff。
//   2. 区块用括号配对定位，不靠"找最后一行"之类的脆弱锚点 —— 例如 components.ts 里
//      XwForm 同时出现在 export default 和 export {} 两处，按文本找会插错位置。
//   3. 目标文件已存在则跳过并提示，绝不覆盖。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const abs = (relativePath) => resolve(repoRoot, relativePath);
const has = (relativePath) => existsSync(abs(relativePath));
const readRaw = (relativePath) => readFileSync(abs(relativePath), 'utf8');

const CATEGORIES = ['数据展示', '表单组件'];

// ---------- 工具 ----------

// XwUserCard → user-card；XwTable → table
function kebab(value) {
  return value
    .replace(/^Xw/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

// 从 openIndex 处的开括号出发，返回与之配对的闭括号下标
function matchBracket(source, openIndex, open = '[', close = ']') {
  let depth = 0;
  for (let cursor = openIndex; cursor < source.length; cursor += 1) {
    const char = source[cursor];
    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return cursor;
    }
  }
  throw new Error(`括号不配对，起点下标 ${openIndex}`);
}

function parseArgs(argv) {
  const options = { name: '', category: '表单组件', dir: '', desc: '', examples: false };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--examples') {
      options.examples = true;
      continue;
    }
    if (token === '--category' || token === '--dir' || token === '--desc') {
      const value = argv[index + 1];
      if (!value) throw new Error(`${token} 缺少取值`);
      options[token.replace('--', '')] = value;
      index += 1;
      continue;
    }
    if (token.startsWith('--')) throw new Error(`未知参数：${token}`);
    positional.push(token);
  }
  options.name = positional[0] || options.name;
  return options;
}

const created = [];
const registered = [];
const skipped = [];

function writeNew(relativePath, content) {
  const target = abs(relativePath);
  if (existsSync(target)) {
    skipped.push(relativePath);
    return false;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  created.push(relativePath);
  return true;
}

// 在 source 的 insertIndex 处插入 text，沿用原文件的换行符
function splice(relativePath, insertIndex, text, label) {
  const source = readRaw(relativePath);
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const normalized = text.replace(/\n/g, eol);
  writeFileSync(
    abs(relativePath),
    source.slice(0, insertIndex) + normalized + source.slice(insertIndex),
  );
  registered.push(`${relativePath}（${label}）`);
}

// 往块（数组 / 对象字面量）末尾追加一项。
// 关键是定位到"块内最后一个非空字符"之后插入并补上分隔逗号，
// 而不是插在闭括号之前 —— 否则闭括号原有的缩进会被顶到新内容前面。
function appendToBlock(relativePath, openIndex, closeIndex, itemText, label) {
  const source = readRaw(relativePath);
  const region = source.slice(openIndex + 1, closeIndex);

  let lastContent = -1;
  for (let index = region.length - 1; index >= 0; index -= 1) {
    if (!/\s/.test(region[index])) {
      lastContent = index;
      break;
    }
  }

  const hasItems = lastContent !== -1;
  const insertIndex = openIndex + 1 + (hasItems ? lastContent + 1 : 0);
  const lastChar = hasItems ? region[lastContent] : '';
  // 末项已带分隔符（, ; 或已是开括号）时不再补逗号
  const noSeparator = [',', ';', '[', '{', ''].includes(lastChar);
  const separator = hasItems && !noSeparator ? ',' : '';
  // 空块则直接换行，非空块在末项后换行
  const prefix = hasItems ? `${separator}\n` : '\n';

  splice(relativePath, insertIndex, `${prefix}${itemText}`, label);
}

// 往单行列表（如 export { A, B }）末尾追加一项，保持单行
function appendToInlineList(relativePath, openIndex, closeIndex, itemText, label) {
  const source = readRaw(relativePath);
  const region = source.slice(openIndex + 1, closeIndex);

  let lastContent = -1;
  for (let index = region.length - 1; index >= 0; index -= 1) {
    if (!/\s/.test(region[index])) {
      lastContent = index;
      break;
    }
  }
  if (lastContent === -1) {
    splice(relativePath, openIndex + 1, ` ${itemText} `, label);
    return;
  }
  const lastChar = region[lastContent];
  const separator = [',', ';', ''].includes(lastChar) ? ' ' : ', ';
  splice(relativePath, openIndex + 1 + lastContent + 1, `${separator}${itemText}`, label);
}

// ---------- 模板 ----------

const componentTemplate = (dir) => `<template>
  <div class="xw-${kebab(dir)}">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps({
  // 绑定值
  modelValue: {
    type: String,
    default: '',
  },
});

// 事件
const emit = defineEmits(['change']);

const value = ref(props.modelValue);

const handleChange = () => {
  emit('change', value.value);
};
</script>

<style lang="scss" scoped>
.xw-${kebab(dir)} {
  width: 100%;
}
</style>
`;

const entryTemplate = (name, dir) => `import ${name} from './modules/${dir}.vue';

${name}.install = function (app: any) {
  app.component('${name}', ${name});
};

export default ${name};
`;

const docTemplate = (name, dir, desc) => `# ${name} ${desc || '组件'}

${desc || '一句话说明这个组件做什么、基于 Element Plus 的什么组件封装、提供了哪些额外能力。'}

## 基础用法

通过 \`v-model\` 双向绑定值。

<demo vue="${dir}/base.vue" />

## 属性说明

| 属性名     | 说明     | 类型     | 默认值 | 是否必填 |
| ---------- | -------- | -------- | ------ | -------- |
| modelValue | 绑定值   | \`string\` | \`''\`   | 否       |

## 事件说明

| 事件名 | 说明         | 回调参数 |
| ------ | ------------ | -------- |
| change | 值变化时触发 | \`string\` |

## 插槽说明

| 插槽名  | 说明     |
| ------- | -------- |
| default | 默认内容 |
`;

const demoTemplate = (name) => `<template>
  <${kebab(name)} v-model="value" @change="handleChange" />
  <p style="color: #666">当前值：{{ value }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');

const handleChange = (val: string) => {
  console.log('值变化:', val);
};
</script>
`;

const exampleViewTemplate = (name) => `<template>
  <div>
    <h2>${name} 组件调试</h2>
    <${kebab(name)} v-model="value" @change="handleChange" />
    <p style="color: #666">当前值：{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');

const handleChange = (val: string) => {
  console.log('值变化:', val);
};
</script>
`;

// ---------- 注册点：packages/components.ts ----------

function registerComponentsTs(name, dir) {
  const path = 'packages/components.ts';
  const source = readRaw(path);

  // 1) import 行：插在最后一条 import 之后
  const imports = [...source.matchAll(/^import .*?;$/gm)];
  if (!imports.length) throw new Error(`${path} 里找不到 import 语句`);
  const lastImport = imports[imports.length - 1];
  splice(path, lastImport.index + lastImport[0].length, `\nimport ${name} from './${dir}';`, `import ${name}`);

  // 2) export default { ... } 的末项之后
  const afterFirst = readRaw(path);
  const defaultStart = afterFirst.indexOf('export default {');
  if (defaultStart === -1) throw new Error(`${path} 里找不到 export default {`);
  const defaultOpen = afterFirst.indexOf('{', defaultStart);
  const defaultClose = matchBracket(afterFirst, defaultOpen, '{', '}');
  appendToBlock(path, defaultOpen, defaultClose, `  ${name},`, `default 里的 ${name}`);

  // 3) export { ... } 的末项之后
  const afterSecond = readRaw(path);
  const exportStart = afterSecond.indexOf('export {');
  if (exportStart === -1) throw new Error(`${path} 里找不到 export {`);
  const exportClose = afterSecond.indexOf('}', exportStart);
  appendToInlineList(path, afterSecond.indexOf('{', exportStart), exportClose, name, `export 里的 ${name}`);
}

// ---------- 注册点：components.d.ts ----------

function registerDts(name, dir) {
  const path = 'components.d.ts';
  const source = readRaw(path);

  // 1) import 行
  const imports = [...source.matchAll(/^import .*?;$/gm)];
  if (!imports.length) throw new Error(`${path} 里找不到 import 语句`);
  const lastImport = imports[imports.length - 1];
  splice(path, lastImport.index + lastImport[0].length, `\nimport ${name} from './packages/${dir}';`, `import ${name}`);

  // 2) GlobalComponents 接口的末项之后
  const afterFirst = readRaw(path);
  const interfaceStart = afterFirst.indexOf('interface GlobalComponents');
  if (interfaceStart === -1) throw new Error(`${path} 里找不到 GlobalComponents 接口`);
  const interfaceOpen = afterFirst.indexOf('{', interfaceStart);
  const interfaceClose = matchBracket(afterFirst, interfaceOpen, '{', '}');
  appendToBlock(path, interfaceOpen, interfaceClose, `    ${name}: typeof ${name};`, `GlobalComponents ${name}`);
}

// ---------- 注册点：VitePress 侧边栏 ----------

function registerSidebar(name, dir, category, desc) {
  const path = 'docs/.vitepress/config.ts';
  const source = readRaw(path);

  const categoryStart = source.indexOf(`text: '${category}'`);
  if (categoryStart === -1) {
    throw new Error(
      `${path} 里找不到分类「${category}」\n        → 可用分类：${CATEGORIES.join(' / ')}`,
    );
  }
  const itemsStart = source.indexOf('items: [', categoryStart);
  if (itemsStart === -1) throw new Error(`分类「${category}」下找不到 items 数组`);
  const itemsOpen = source.indexOf('[', itemsStart);
  const itemsClose = matchBracket(source, itemsOpen);

  const text = `            {
              text: '${name} ${desc || '组件'}',
              link: '/components/${dir}',
            },`;
  appendToBlock(path, itemsOpen, itemsClose, text, `侧边栏「${category}」+ ${name}`);
}

// ---------- 注册点：总览页卡片 ----------

function registerOverview(name, dir, category, desc, version) {
  const path = 'docs/components/overview.md';
  const source = readRaw(path);

  const arrayStart = source.indexOf('const components = ref([');
  if (arrayStart === -1) throw new Error(`${path} 里找不到 const components = ref([`);
  const arrayOpen = source.indexOf('[', arrayStart);
  const arrayClose = matchBracket(source, arrayOpen);

  const card = `  {
    name: '${name}',
    version: '${version}',
    description: '${desc || '一句话描述'}',
    link: '/components/${dir}',
    icon: 'Grid',
    category: '${category === '数据展示' ? 'data' : 'form'}',
    tags: ['待补充']
  }`;
  appendToBlock(path, arrayOpen, arrayClose, card, `总览卡片 ${name}`);
}

// ---------- 注册点：examples 调试页 ----------

function registerExamples(name, dir, desc) {
  const tag = kebab(name);

  const routePath = 'examples/router/index.ts';
  const routeSource = readRaw(routePath);
  const routesStart = routeSource.indexOf('const routes = [');
  if (routesStart === -1) throw new Error(`${routePath} 里找不到 const routes = [`);
  const routesOpen = routeSource.indexOf('[', routesStart);
  const routesClose = matchBracket(routeSource, routesOpen);
  appendToBlock(
    routePath,
    routesOpen,
    routesClose,
    `  { path: '/${tag}', component: () => import('@/views/${dir}/index.vue') },`,
    `路由 /${tag}`,
  );

  const indexPath = 'examples/views/index.vue';
  const indexSource = readRaw(indexPath);
  // 注意：ref<IComponent[]>([...]) 里有两个 '['，第一个属于类型 IComponent[]，
  // 必须定位到 "([" 之后的那个数组字面量起点。
  const anchor = indexSource.search(/=\s*ref<[^>]*>\(\[/);
  if (anchor === -1) throw new Error(`${indexPath} 里找不到组件入口数组`);
  const listOpen = indexSource.indexOf('([', anchor) + 1;
  const listClose = matchBracket(indexSource, listOpen);
  appendToBlock(
    indexPath,
    listOpen,
    listClose,
    `  { name: '${name} ${desc || '组件'}', path: '/${tag}' },`,
    `首页入口 ${name}`,
  );
}

// ---------- 主流程 ----------

function main() {
  const options = parseArgs(process.argv.slice(2));
  const { name, examples, desc } = options;

  if (!name) throw new Error('必须指定组件名，如：pnpm new:component XwXxx');
  if (!/^Xw[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(`组件名必须是 Xw 开头的大驼峰，如 XwUserCard，当前：${name}`);
  }
  const dir = options.dir || name.replace(/^Xw/, '');
  if (!/^[A-Z][A-Za-z0-9]*$/.test(dir)) {
    throw new Error(`目录名必须是大驼峰且不含 Xw 前缀，如 UserCard，当前：${dir}`);
  }
  if (!CATEGORIES.includes(options.category)) {
    throw new Error(`--category 只能是 ${CATEGORIES.join(' / ')}，当前：${options.category}`);
  }
  if (has(`packages/${dir}/index.ts`)) {
    throw new Error(`packages/${dir}/ 已存在，请换目录名或直接编辑现有组件`);
  }

  // 组件登记处里是否已有同名
  if (readRaw('packages/components.ts').includes(name)) {
    throw new Error(`packages/components.ts 里已存在 ${name}，请换组件名`);
  }

  console.log(`\n新增组件 ${name}（目录 packages/${dir}/，分类「${options.category}」）\n`);

  // 1. 组件本体、入口、文档、demo
  writeNew(`packages/${dir}/modules/${dir}.vue`, componentTemplate(dir));
  writeNew(`packages/${dir}/index.ts`, entryTemplate(name, dir));
  writeNew(`docs/components/${dir}.md`, docTemplate(name, dir, desc));
  writeNew(`docs/demos/${dir}/base.vue`, demoTemplate(name));

  // 2. 注册点
  registerComponentsTs(name, dir);
  registerDts(name, dir);
  registerSidebar(name, dir, options.category, desc);
  const version = JSON.parse(readRaw('package.json')).version;
  registerOverview(name, dir, options.category, desc, version);

  // 3. 可选：examples 调试页
  if (examples) {
    writeNew(`examples/views/${dir}/index.vue`, exampleViewTemplate(name));
    registerExamples(name, dir, desc);
  }

  if (created.length) {
    console.log('已创建：');
    created.forEach((path) => console.log(`  + ${path}`));
  }
  if (registered.length) {
    console.log('\n已登记：');
    registered.forEach((path) => console.log(`  ~ ${path}`));
  }
  if (skipped.length) {
    console.log('\n已跳过（原本就存在，未覆盖）：');
    skipped.forEach((path) => console.log(`  = ${path}`));
  }

  console.log(`
下一步：
  1. 填 packages/${dir}/modules/${dir}.vue 的组件逻辑（约定见 references/conventions.md）
  2. 补 docs/components/${dir}.md 的属性 / 事件 / 插槽表格
  3. 调整 docs/components/overview.md 里那张卡片的 description 与 tags
  4. 运行 pnpm gen:skill && pnpm verify:skill，必须全绿
  5. 运行 pnpm build 确认类型与打包通过
`);
}

try {
  main();
} catch (error) {
  console.error(`\n✗ ${error.message}\n`);
  process.exit(1);
}
