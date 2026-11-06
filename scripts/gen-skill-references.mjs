// 生成 AI skill 需要的三份索引：组件清单、图标名清单、注册点对照表。
//
// 这些索引一旦与源码不一致，AI 就会写出不存在的组件名、不存在的 prop，或漏改注册点。
// 所以不手写，一律由本脚本从源码抽取生成，再由 scripts/verify-skill-assets.mjs 守住不漂移。
//
//   node scripts/gen-skill-references.mjs
//
// 抽取依据（都是本仓库里已经存在的、稳定的事实来源）：
//   - packages/components.ts            → 有哪些组件、注册名是什么
//   - packages/<Name>/index.ts          → install 里注册的全局组件名
//   - packages/<Name>/modules/*.vue     → defineProps / defineEmits / <slot>，含 props 上方的中文注释
//   - packages/<Name>/types/index.ts    → 自定义 interface（仅做汇总提示）
//   - docs/components/<Name>.md         → 组件一句话说明（标题与首个 ## 之间的段落）
//   - node_modules/@element-plus/icons-vue → 可用图标名全集
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const skillDir = 'skills/xw-components';
export const componentIndexPath = `${skillDir}/references/components.md`;
export const iconIndexPath = `${skillDir}/references/icons.md`;
export const registrationIndexPath = `${skillDir}/references/registration.md`;

const abs = (relativePath) => resolve(repoRoot, relativePath);
// 统一把 CRLF 归一成 LF 再解析：仓库里部分文件是 CRLF，若按原样比对，
// 编辑器改一下换行符就会被误判成"内容漂移"。
const read = (relativePath) => readFileSync(abs(relativePath), 'utf8').replace(/\r\n/g, '\n');
const has = (relativePath) => existsSync(abs(relativePath));

// Markdown 表格单元格转义
const cell = (value) =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\s+/g, ' ')
    .trim();

// ---------- 组件发现 ----------

// packages/components.ts 是组件总登记处。
// 注意：import XwTable from './Table' —— 变量名是 XwTable，但目录名是 Table，两者不能混用。
// 返回 [{ name: 'XwTable', dir: 'Table' }]
export function listComponents() {
  const source = read('packages/components.ts');
  const components = [...source.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]\.\/([^'"]+)['"]/g)].map(
    (matched) => ({ name: matched[1], dir: matched[2] }),
  );
  if (components.length) return components.sort((a, b) => a.name.localeCompare(b.name));

  // 兜底：没有 import 时退回解析 export default 的键名
  const matched = source.match(/export default\s*\{([\s\S]*?)\}/);
  if (!matched) return [];
  return matched[1]
    .split('\n')
    .map((line) => line.trim().replace(/,$/, ''))
    .filter((line) => /^[A-Za-z_$][\w$]*$/.test(line))
    .sort()
    .map((name) => ({ name, dir: name.replace(/^Xw/, '') }));
}

export function listComponentNames() {
  return listComponents().map((item) => item.name);
}

// 文件系统层面的"组件是否存在"：packages/ 下带 index.ts 的目录。
// 这是漏注册检测的真相来源 —— 光看 components.ts 无法发现"目录建了但忘了登记"。
export function listComponentDirs() {
  const packagesDir = 'packages';
  if (!has(packagesDir)) return [];
  return readdirSync(abs(packagesDir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((dir) => has(`packages/${dir}/index.ts`))
    .sort();
}

// 读取 index.ts 里 app.component('XwXxx', ...) 的注册名，用于反查
export function readRegisterNameOf(dir) {
  return readRegisterName(dir);
}

// packages/<Dir>/index.ts 里 app.component('XwXxx', ...) 就是最终全局组件名。
function readRegisterName(dir) {
  const entry = `packages/${dir}/index.ts`;
  if (!has(entry)) return '';
  const matched = read(entry).match(/app\.component\(\s*['"]([^'"]+)['"]/);
  return matched ? matched[1] : '';
}

// 组件实现文件：优先 modules/<Dir>.vue，其次同名目录下第一个 .vue
function readMainVuePath(dir, componentName) {
  const candidates = [
    `packages/${dir}/modules/${dir}.vue`,
    `packages/${dir}/modules/${componentName}.vue`,
    `packages/${dir}/${dir}.vue`,
  ];
  for (const candidate of candidates) {
    if (has(candidate)) return candidate;
  }
  const modulesDir = `packages/${dir}/modules`;
  if (has(modulesDir)) {
    const found = readdirSync(abs(modulesDir)).find((name) => name.endsWith('.vue'));
    if (found) return `${modulesDir}/${found}`;
  }
  return '';
}

// 组件内部还会用到子组件（如 Form 依赖 FormField），一并列出方便定位。
// 排除主实现文件本身。
function listSubVuePaths(dir, mainVuePath) {
  const modulesDir = `packages/${dir}/modules`;
  if (!has(modulesDir)) return [];
  return readdirSync(abs(modulesDir))
    .filter((name) => name.endsWith('.vue'))
    .map((name) => `${modulesDir}/${name}`)
    .filter((path) => path !== mainVuePath)
    .sort();
}

// ---------- .vue 解析 ----------

// 从 defineProps({...}) 里取每个顶层 prop：名称、类型、默认值、必填，以及上方紧邻的中文注释
function parseProps(source) {
  const start = source.indexOf('defineProps');
  if (start === -1) return [];
  const openBrace = source.indexOf('{', start);
  if (openBrace === -1) return [];

  // 花括号配对，找到 defineProps 块的结尾
  let depth = 0;
  let end = openBrace;
  for (let cursor = openBrace; cursor < source.length; cursor += 1) {
    const char = source[cursor];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end = cursor;
        break;
      }
    }
  }

  const body = source.slice(openBrace + 1, end);
  const lines = body.split('\n');

  const props = [];
  let pendingComment = '';
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // 形如 "// 是否折叠搜索框" 的说明注释
    if (line.startsWith('//')) {
      pendingComment = line.replace(/^\/\/\s*/, '').trim();
      continue;
    }

    // 顶层 prop：缩进后是 "key: {" 形式（内部字段缩进更深）
    const keyMatched = line.match(/^([A-Za-z_$][\w$]*)\s*:\s*\{/);
    if (keyMatched && rawLine.length - rawLine.trimStart().length <= 2) {
      if (current) props.push(current);
      current = { name: keyMatched[1], desc: pendingComment, type: '', default: '', required: '' };
      pendingComment = '';
      continue;
    }

    if (!current) continue;

    const typeMatched = line.match(/^type:\s*(.+?),?$/);
    if (typeMatched && !current.type) {
      const raw = typeMatched[1].replace(/,$/, '').trim();
      // Array as PropType<IData[]> → IData[]
      const propType = raw.match(/PropType<([\s\S]+)>/);
      current.type = (propType ? propType[1] : raw).replace(/\s*as\s+\w+/, '').trim();
      continue;
    }

    const defaultMatched = line.match(/^default:\s*(.+?),?$/);
    if (defaultMatched && !current.default) {
      current.default = defaultMatched[1].replace(/,$/, '').trim();
      continue;
    }

    if (/^required:\s*true/.test(line)) current.required = '是';
  }
  if (current) props.push(current);

  return props.map((item) => ({ ...item, required: item.required || '否' }));
}

// emit：兼容数组式 defineEmits(['a','b']) 与泛型式 defineEmits<{ (e:'a', ...): void }>()
function parseEmits(source) {
  const start = source.indexOf('defineEmits');
  if (start === -1) return [];

  const arrayForm = source.slice(start).match(/defineEmits(?:<[^>]*>)?\s*\(\s*\[([\s\S]*?)\]\s*\)/);
  if (arrayForm) {
    return [...arrayForm[1].matchAll(/['"]([^'"]+)['"]/g)].map((matched) => matched[1]);
  }

  const rest = source.slice(start);
  const genericStart = rest.indexOf('<');
  const genericEnd = rest.indexOf('>()');
  if (genericStart === -1 || genericEnd === -1) return [];
  const generic = rest.slice(genericStart, genericEnd);
  const names = [...generic.matchAll(/\(\s*e:\s*['"]([^'"]+)['"]/g)].map((matched) => matched[1]);
  return [...new Set(names)];
}

// 插槽：<slot> 是 default，<slot name="x"> 是具名，:name="xxx" 是动态插槽（名字由配置项决定）
function parseSlots(source) {
  const slots = [];
  for (const matched of source.matchAll(/<slot([^>]*)>/g)) {
    const attrs = matched[1];
    // :name="..." / v-bind:name="..." 属于动态插槽
    if (/(?::|v-bind:)name\s*=/.test(attrs)) {
      slots.push('（动态插槽，名字由配置项决定）');
      continue;
    }
    const nameMatched = attrs.match(/\bname\s*=\s*['"]([^'"]+)['"]/);
    if (nameMatched) {
      slots.push(nameMatched[1]);
    } else {
      slots.push('default');
    }
  }
  return [...new Set(slots)];
}

// defineExpose 暴露的方法
function parseExposed(source) {
  const matched = source.match(/defineExpose\s*\(\s*\{([\s\S]*?)\}\s*\)/);
  if (!matched) return [];
  return matched[1]
    .split(',')
    .map((part) => part.split(':')[0].trim())
    .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
}

// 取 docs/components/<Name>.md 里标题与首个 ## 之间的段落，作为组件说明
function readDocDescription(componentName) {
  const docPath = `docs/components/${componentName}.md`;
  if (!has(docPath)) return '';
  const lines = read(docPath).split('\n');
  const collected = [];
  let started = false;
  for (const line of lines) {
    if (/^#\s/.test(line)) {
      started = true;
      continue;
    }
    if (!started) continue;
    if (/^##\s/.test(line)) break;
    if (line.trim()) collected.push(line.trim());
  }
  return collected.join(' ').replace(/\s+/g, ' ').trim();
}

// ---------- 图标 ----------

// Element Plus 图标全集来自其类型声明，键名即 <el-icon><Name /></el-icon> 里的 Name
export function listElementPlusIcons() {
  const indexPath = 'node_modules/@element-plus/icons-vue/dist/types/components/index.d.ts';
  if (!has(indexPath)) return [];
  const names = [...read(indexPath).matchAll(/export \{ default as ([A-Za-z0-9_]+) \}/g)].map(
    (matched) => matched[1],
  );
  return [...new Set(names)].sort();
}

// 反查本仓库源码里真正用到的图标，供 AI 参考"哪些是已经在用的"
function listUsedIcons() {
  const roots = ['packages', 'examples', 'docs/.vitepress'];
  const used = new Set();
  const walk = (relativeDir) => {
    const absoluteDir = abs(relativeDir);
    if (!has(absoluteDir)) return;
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      if (entry.name === 'cache' || entry.name === 'dist' || entry.name === 'node_modules') continue;
      const next = `${relativeDir}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(next);
        continue;
      }
      if (!/\.(vue|ts)$/.test(entry.name)) continue;
      const source = read(next);
      // 只认从图标包导入的名字
      for (const imported of source.matchAll(
        /import\s*\{([^}]+)\}\s*from\s*['"]@element-plus\/icons-vue['"]/g,
      )) {
        for (const name of imported[1].split(',')) {
          const trimmed = name.trim();
          if (/^[A-Za-z0-9_$]+$/.test(trimmed)) used.add(trimmed);
        }
      }
    }
  };
  roots.forEach(walk);
  return [...used].sort();
}

// ---------- 生成 ----------

const HEADER = (generator) =>
  `> 本文件由 \`scripts/${generator}\` 从源码生成，**请勿手改**。改完源码后运行 \`pnpm gen:skill\` 重新生成。`;

export function buildComponentIndex() {
  const components = listComponents();
  const sections = components.map(({ name: registerName, dir }) => {
    const vuePath = readMainVuePath(dir, registerName);
    const description = readDocDescription(dir);
    const subVues = listSubVuePaths(dir, vuePath);

    const lines = [`## ${registerName}`, ''];
    if (description) lines.push(description, '');
    lines.push(`- 目录：\`packages/${dir}/\``);
    lines.push(`- 实现：${vuePath ? `\`${vuePath}\`` : '（未找到 .vue）'}`);
    if (subVues.length > 1) {
      lines.push(`- 子组件：${subVues.map((name) => `\`${name}\``).join('、')}`);
    }

    if (vuePath && has(vuePath)) {
      const source = read(vuePath);
      const props = parseProps(source);
      const emits = parseEmits(source);
      const slots = parseSlots(source);
      const exposed = parseExposed(source);

      if (props.length) {
        lines.push('', '**Props**', '', '| 属性 | 说明 | 类型 | 默认值 | 必填 |', '| --- | --- | --- | --- | --- |');
        props.forEach((item) => {
          lines.push(
            `| \`${item.name}\` | ${cell(item.desc) || '-'} | \`${cell(item.type) || '-'}\` | \`${cell(item.default) || '-'}\` | ${item.required} |`,
          );
        });
      }

      if (emits.length) {
        lines.push('', `**Events**：${emits.map((name) => `\`${name}\``).join('、')}`);
      }

      if (slots.length) {
        lines.push('', `**Slots**：${slots.map((name) => (name === 'default' ? '`default`' : `\`${name}\``)).join('、')}`);
      }

      if (exposed.length) {
        lines.push('', `**暴露方法（通过 ref 调用）**：${exposed.map((name) => `\`${name}\``).join('、')}`);
      }
    }

    return lines.join('\n');
  });

  return [
    '# 组件清单',
    '',
    HEADER('gen-skill-references.mjs'),
    '',
    `共 ${components.length} 个组件。组件名统一以 \`Xw\` 开头，模板中可直接使用（已全局注册）。`,
    '',
    '**清单里没有的组件名就是不存在**，不要凭印象拼名字。需要更细的用法示例时：',
    '',
    '- `docs/components/<Name>.md` 是完整文档（属性 / 事件 / 插槽 / 示例）',
    '- `docs/demos/<Name>/*.vue` 是可运行示例，`<demo vue="<Name>/base.vue" />` 引用',
    '- `packages/<Dir>/types/index.ts` 是自定义 interface（如 `IColumn`、`IFormItem`）',
    '',
    '---',
    '',
    sections.join('\n\n---\n\n'),
    '',
  ].join('\n');
}

export function buildIconIndex() {
  const icons = listElementPlusIcons();
  const used = listUsedIcons();

  if (!icons.length) {
    return [
      '# 图标名清单',
      '',
      HEADER('gen-skill-references.mjs'),
      '',
      '> 未找到 `node_modules/@element-plus/icons-vue`，请先执行 `pnpm install` 后重新生成。',
      '',
    ].join('\n');
  }

  const usedSet = new Set(used);
  return [
    '# 图标名清单',
    '',
    HEADER('gen-skill-references.mjs'),
    '',
    `图标来自 \`@element-plus/icons-vue\`，共 ${icons.length} 个。`,
    '',
    '用法（组件库中已全局注册全部图标，模板里可直接写组件名）：',
    '',
    '```vue',
    'import { Search, Refresh } from \'@element-plus/icons-vue\';',
    '```',
    '',
    '```vue',
    '<el-button circle :icon="Search" />',
    '<el-icon><Refresh /></el-icon>',
    '```',
    '',
    '**名字写错不会报错，只是图标不渲染**，务必从下面清单里挑。',
    '',
    `标注 ★ 的是本仓库已在使用的图标（共 ${used.length} 个），新增组件时优先复用。`,
    '',
    '## 全集',
    '',
    ...icons.map((name) => `- ${usedSet.has(name) ? '★ ' : ''}\`${name}\``),
    '',
  ].join('\n');
}

// 注册点对照表：新增或修改组件时必须同步的位置，逐项给出存在与否
export function buildRegistrationIndex() {
  const components = listComponents();

  // 每项：point 名称、对应文件模板、是否必需、以及"文件里是否真的提到该组件"的校验函数
  const buildChecks = (componentName, dir) => [
    {
      point: '组件实现',
      path: `packages/${dir}/modules/${dir}.vue`,
      required: true,
    },
    {
      point: 'install 注册',
      path: `packages/${dir}/index.ts`,
      required: true,
    },
    {
      point: '组件总登记',
      path: 'packages/components.ts',
      required: true,
      verify: (source) => source.includes(componentName),
    },
    {
      point: '全局类型声明',
      path: 'components.d.ts',
      required: true,
      verify: (source) => source.includes(componentName),
    },
    {
      point: '组件文档',
      path: `docs/components/${dir}.md`,
      required: true,
    },
    {
      point: '示例 demo',
      path: `docs/demos/${dir}/base.vue`,
      required: true,
    },
    {
      point: '文档侧边栏',
      path: 'docs/.vitepress/config.ts',
      required: true,
      verify: (source) => source.includes(`/components/${dir}`),
    },
    {
      point: '组件总览卡片',
      path: 'docs/components/overview.md',
      required: true,
      verify: (source) => source.includes(componentName),
    },
    {
      point: '本地调试页',
      path: `examples/views/${dir}/index.vue`,
      required: false,
    },
    {
      point: '调试页路由',
      path: 'examples/router/index.ts',
      required: false,
      verify: (source) => source.toLowerCase().includes(dir.toLowerCase()),
    },
  ];

  const tables = components.map(({ name: componentName, dir }) => {
    const rows = buildChecks(componentName, dir).map((item) => {
      let exists = has(item.path);
      if (exists && item.verify) exists = item.verify(read(item.path));
      const status = item.required ? (exists ? '✅' : '❌') : exists ? '✅' : '（可选）';
      return `| ${item.point} | \`${item.path}\` | ${status} |`;
    });
    return [
      `## ${componentName}`,
      '',
      '| 注册点 | 文件 | 状态 |',
      '| --- | --- | --- |',
      ...rows,
    ].join('\n');
  });

  return [
    '# 注册点对照表',
    '',
    HEADER('gen-skill-references.mjs'),
    '',
    '新增或修改组件时，必须同步的位置。状态列是当前仓库的真实情况，由脚本核对。',
    '',
    '> ⚠️ `packages/index.ts` **不需要改** —— 它用 `Object.keys(components)` 自动注册全部组件，',
    '> 只改 `packages/components.ts` 即可。这是最容易多此一举的地方。',
    '',
    '> ⚠️ `docs/.vitepress/config.ts` 里顶部版本号从 `package.json` 读取，改版本只需动 `package.json`。',
    '',
    '---',
    '',
    tables.join('\n\n---\n\n'),
    '',
  ].join('\n');
}

function writeIfChanged(relativePath, content) {
  const absolutePath = abs(relativePath);
  const previous = has(relativePath) ? read(relativePath) : '';
  if (previous === content) {
    console.log(`unchanged ${relativePath}`);
    return;
  }
  // 目录可能不存在（例如 skills/ 被清理过、或首次生成），先补建再写，
  // 否则 writeFileSync 会抛 ENOENT。
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
  console.log(`written   ${relativePath}`);
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === resolve(repoRoot, 'scripts/gen-skill-references.mjs');

// 手写文件（不参与生成、丢失后无法由脚本重建）。生成前先看一眼是否齐全，
// 缺了就明确报警 —— 否则"目录被清空后 gen:skill 照样成功"会掩盖真实的文件丢失。
const HANDWRITTEN_FILES = [
  'skills/xw-components/SKILL.md',
  'skills/xw-components/README.md',
  'skills/xw-components/references/conventions.md',
  'skills/xw-components/references/doc-templates.md',
  'skills/xw-components/references/usage.md',
];

if (isMain) {
  const missing = HANDWRITTEN_FILES.filter((relativePath) => !has(relativePath));

  writeIfChanged(componentIndexPath, buildComponentIndex());
  writeIfChanged(iconIndexPath, buildIconIndex());
  writeIfChanged(registrationIndexPath, buildRegistrationIndex());

  if (missing.length) {
    console.warn(
      `\n⚠️  以下手写文件缺失，本脚本无法重建，请从版本库或 dist/skills/ 恢复：\n` +
        missing.map((relativePath) => `   - ${relativePath}`).join('\n') +
        `\n   恢复后运行 pnpm verify:skill 复核。\n`,
    );
  }
}
