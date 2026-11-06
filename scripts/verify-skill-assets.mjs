// skill 资源漂移守卫。
//
// 三件事，任一不通过就以非 0 退出码失败（可直接挂进 CI / prepublishOnly）：
//   1. references/ 里的生成物与源码一致 —— 不一致说明改完源码忘了跑 gen:skill
//   2. 每个组件在全部注册点齐全，且文档里出现的组件名 / 图标名真实存在
//   3. SKILL.md 里引用到的文件都存在 —— 防止文档指向已删除的文件
//
//   node scripts/verify-skill-assets.mjs          # 校验
//   node scripts/verify-skill-assets.mjs --fix    # 校验并顺带重新生成（等价于先跑 gen:skill）
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  repoRoot,
  buildComponentIndex,
  buildIconIndex,
  buildRegistrationIndex,
  componentIndexPath,
  iconIndexPath,
  registrationIndexPath,
  listComponents,
  listComponentDirs,
  readRegisterNameOf,
  listElementPlusIcons,
} from './gen-skill-references.mjs';

const fixMode = process.argv.includes('--fix');
const abs = (relativePath) => resolve(repoRoot, relativePath);
// 归一化 CRLF：仓库里部分文件是 CRLF，若按原样比对，
// 编辑器改一下换行符就会被误判成漂移。
const read = (relativePath) => readFileSync(abs(relativePath), 'utf8').replace(/\r\n/g, '\n');
const has = (relativePath) => existsSync(abs(relativePath));

const problems = [];
const fail = (message) => problems.push(message);

// 写生成物：目录可能不存在（skills/ 被清理过或首次生成），先补建再写
function writeGenerated(relativePath, content) {
  mkdirSync(dirname(abs(relativePath)), { recursive: true });
  writeFileSync(abs(relativePath), content);
  console.log(`fixed     ${relativePath}`);
}

// ---------- 1. 生成物是否与源码一致 ----------

function verifyGeneratedFile(relativePath, expected, label) {
  if (!has(relativePath)) {
    if (fixMode) {
      writeGenerated(relativePath, expected);
      return;
    }
    fail(`${label} 不存在：${relativePath}（运行 pnpm gen:skill 生成）`);
    return;
  }
  const actual = read(relativePath);
  if (actual === expected) return;

  if (fixMode) {
    writeGenerated(relativePath, expected);
    return;
  }
  fail(
    `${label} 与源码不一致：${relativePath}\n` +
      `          → 源码已改动但索引未更新，运行 pnpm gen:skill 重新生成`,
  );
}

// ---------- 2. 注册点齐全性 ----------

function verifyRegistrationPoints() {
  // 以文件系统为准遍历，这样"忘了在 components.ts 登记"也能被发现
  listComponentDirs().forEach((dir) => {
    const name = readRegisterNameOf(dir) || `Xw${dir}`;
    const checks = [
      { point: '组件实现', path: `packages/${dir}/modules/${dir}.vue`, required: true },
      { point: 'install 注册', path: `packages/${dir}/index.ts`, required: true },
    ];

    checks.forEach((item) => {
      if (!has(item.path)) {
        if (item.required) fail(`${name} 缺少「${item.point}」：${item.path}`);
      }
    });

    // demo 目录：仅当文档实际引用了 <demo vue="..." /> 时才必须存在，
    // 否则组件文档用内联代码块演示也是合法的。
    const docPath = `docs/components/${dir}.md`;
    const demoDir = `docs/demos/${dir}`;
    const usesDemo = has(docPath) && /<demo\s/.test(read(docPath));
    if (usesDemo && !has(demoDir)) {
      fail(`${name} 文档引用了 <demo> 但缺少示例目录：${demoDir}/（页面上的示例会渲染失败）`);
    }
  });

  // packages/index.ts 必须保持"自动注册"，一旦被改成逐个列出就提示
  const entrySource = read('packages/index.ts');
  if (!entrySource.includes('Object.keys(components)')) {
    fail('packages/index.ts 不再是 Object.keys(components) 自动注册，请确认新增组件是否需要手动补注册');
  }
}

// 双向核对：目录建了但没登记（漏注册）、登记了但目录没了（悬空引用）。
// 必须查文件系统，否则"整条登记被删掉"会从两边的清单里同时消失而无人察觉。
function verifyRegistrationCoverage() {
  const registered = new Set(listComponents().map((item) => item.name));
  const onDisk = listComponentDirs().map((dir) => ({
    dir,
    name: readRegisterNameOf(dir) || `Xw${dir}`,
  }));

  // 目录存在但 components.ts 没登记
  onDisk.forEach(({ dir, name }) => {
    if (!registered.has(name)) {
      fail(
        `packages/${dir}/ 已存在但未登记到 packages/components.ts` +
          `（全局组件 ${name} 不会被注册，运行时找不到）`,
      );
      return;
    }
    // 已登记，再逐项核对其它注册点
    const name_ = name;
    const checks = [
      { point: '全局类型声明', path: 'components.d.ts', mustContain: name_ },
      { point: '组件文档', path: `docs/components/${dir}.md` },
      {
        point: '文档侧边栏',
        path: 'docs/.vitepress/config.ts',
        mustContain: `/components/${dir}`,
      },
      { point: '组件总览卡片', path: 'docs/components/overview.md', mustContain: name_ },
    ];
    checks.forEach((item) => {
      if (!has(item.path)) {
        fail(`${name_} 缺少「${item.point}」：${item.path}`);
        return;
      }
      if (item.mustContain && !read(item.path).includes(item.mustContain)) {
        fail(`${name_} 的「${item.point}」未登记：${item.path} 里找不到 "${item.mustContain}"`);
      }
    });
  });

  // components.ts 登记了但目录不存在
  listComponents().forEach(({ name, dir }) => {
    if (!has(`packages/${dir}/index.ts`)) {
      fail(`packages/components.ts 登记了 ${name}（来自 ./${dir}），但 packages/${dir}/ 不存在`);
    }
  });
}

// ---------- 3. 文档中引用的组件名 / 图标名是否真实存在 ----------

function verifyReferencesInDocs() {
  const componentNames = new Set(listComponents().map((item) => item.name));
  const iconNames = new Set(listElementPlusIcons());

  // 3a. 文档与 skill 正文里出现的 <xw-xxx> / <XwXxx> 标签必须在组件清单里
  const skillFiles = [
    'skills/xw-components/SKILL.md',
    componentIndexPath,
    registrationIndexPath,
  ].filter(has);

  const kebabToPascal = (value) =>
    value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

  skillFiles.forEach((file) => {
    const source = read(file);
    // 排除 el- / el-xxx 等 Element Plus 原生组件
    for (const matched of source.matchAll(/<xw-([a-z][a-z0-9-]*)/g)) {
      const pascal = `Xw${kebabToPascal(matched[1])}`;
      if (!componentNames.has(pascal)) {
        fail(`${file} 引用了不存在的组件 <xw-${matched[1]}>（对应 ${pascal}）`);
      }
    }
  });

  // 3b. 图标清单里的名字必须全部来自 element-plus 图标包
  const iconIndexSource = has(iconIndexPath) ? read(iconIndexPath) : '';
  for (const matched of iconIndexSource.matchAll(/^- (?:★ )?`([A-Za-z0-9]+)`$/gm)) {
    if (!iconNames.has(matched[1])) {
      fail(`${iconIndexPath} 里的图标 \`${matched[1]}\` 在 @element-plus/icons-vue 中不存在`);
    }
  }
}

// ---------- 4. SKILL.md 引用的文件是否存在 ----------

function verifySkillDocLinks() {
  const skillPath = 'skills/xw-components/SKILL.md';
  if (!has(skillPath)) {
    fail(`缺少 SKILL.md：${skillPath}`);
    return;
  }
  const source = read(skillPath);

  // 抓 markdown 里的相对链接，以及正文反引号里的 references/ 与 scripts/ 路径。
  // 注意：references/ 在 skill 目录内，scripts/ 在仓库根。
  const candidates = new Set();
  for (const matched of source.matchAll(/\]\((\.?\/?[^)\s]+)\)/g)) {
    const target = matched[1];
    if (/^(https?:|#|mailto:)/.test(target)) continue;
    candidates.add(resolve(repoRoot, 'skills/xw-components', target.replace(/^\.\//, '')));
  }
  for (const matched of source.matchAll(/`(references\/[\w./-]+)`/g)) {
    candidates.add(resolve(repoRoot, 'skills/xw-components', matched[1]));
  }
  for (const matched of source.matchAll(/`(scripts\/[\w./-]+)`/g)) {
    candidates.add(resolve(repoRoot, matched[1]));
  }

  candidates.forEach((target) => {
    if (!existsSync(target)) {
      fail(`SKILL.md 引用了不存在的文件：${target.replace(repoRoot, '').replace(/\\/g, '/')}`);
    }
  });
}

// 手写文件必须存在。这些文件不参与生成，一旦丢失只能从版本库或构建产物找回，
// 因此单独显式校验，而不是仅依赖"被 SKILL.md 引用"这条间接防线
// （例如 conventions.md / doc-templates.md 若没被正文链接引用就会漏检）。
const HANDWRITTEN_FILES = [
  'SKILL.md',
  'README.md',
  'references/conventions.md',
  'references/doc-templates.md',
  'references/usage.md',
];

function verifyHandwrittenFiles() {
  HANDWRITTEN_FILES.forEach((relativePath) => {
    const full = `skills/xw-components/${relativePath}`;
    if (!has(full)) {
      fail(
        `缺少手写文件：${full}\n` +
          `          → 该文件由人工维护、不参与生成，无法用 gen:skill 重建，请从版本库恢复`,
      );
    }
  });
}

// ---------- 执行 ----------

console.log('校验 skill 资源…\n');

verifyGeneratedFile(componentIndexPath, buildComponentIndex(), '组件清单');
verifyGeneratedFile(iconIndexPath, buildIconIndex(), '图标清单');
verifyGeneratedFile(registrationIndexPath, buildRegistrationIndex(), '注册点对照表');

verifyRegistrationPoints();
verifyRegistrationCoverage();
verifyReferencesInDocs();
verifySkillDocLinks();
verifyHandwrittenFiles();

if (problems.length) {
  console.error(`\n✗ 发现 ${problems.length} 个问题：\n`);
  problems.forEach((message, index) => console.error(`  ${index + 1}. ${message}`));
  console.error(
    '\n提示：改完源码后运行 `pnpm gen:skill` 重新生成索引，本脚本再跑一次应当全绿。\n',
  );
  process.exit(1);
}

console.log('\n✓ 全部通过：生成物与源码一致，注册点齐全，引用有效。\n');
