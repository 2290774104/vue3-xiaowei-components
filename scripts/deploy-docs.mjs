// 构建文档站并部署到 GitHub Pages（gh-pages 分支）。
//
//   pnpm docs:deploy                       # 构建 + 部署
//   pnpm docs:deploy --no-build            # 跳过构建，直接部署现有产物
//   pnpm docs:deploy --message "xxx"       # 自定义提交信息
//   pnpm docs:deploy --dry-run             # 走到提交为止，不推送
//   pnpm docs:deploy --branch gh-pages     # 指定分支（默认 gh-pages）
//
// 原理：把 docs/.vitepress/dist 的内容镜像到目标分支（先清空再复制，保证不留旧文件）。
// 用 git worktree 在一个临时目录里操作，**不影响当前工作区，也不需要额外依赖**
// （无需 gh-pages npm 包）。
//
// 之所以要先清空：VitePress 产物里带 hash 的文件名每次构建都会变，
// 若只做增量复制，旧资源会越积越多，最终把分支撑大。
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = resolve(repoRoot, 'docs/.vitepress/dist');
const WORKTREE_DIR = resolve(repoRoot, '.deploy-worktree');

// ---------- 参数 ----------

function parseArgs(argv) {
  const options = {
    build: true,
    dryRun: false,
    branch: 'gh-pages',
    remote: 'origin',
    message: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--no-build') {
      options.build = false;
    } else if (token === '--dry-run') {
      options.dryRun = true;
    } else if (token === '--branch' || token === '--remote' || token === '--message') {
      const value = argv[index + 1];
      if (!value) throw new Error(`${token} 缺少取值`);
      options[token.replace('--', '')] = value;
      index += 1;
    } else {
      throw new Error(`未知参数：${token}`);
    }
  }
  return options;
}

// ---------- 命令执行 ----------

function run(command, args, { cwd = repoRoot, capture = false, allowFailure = false, shell = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    shell,
  });
  if (!allowFailure && result.status !== 0) {
    const detail = capture ? `\n${(result.stderr || result.stdout || '').trim()}` : '';
    throw new Error(`${command} ${args.join(' ')} 失败（退出码 ${result.status}）${detail}`);
  }
  return capture ? (result.stdout || '').trim() : '';
}

// git 是真正的可执行文件，**不能走 shell** ——
// Windows 上 shell 会丢掉参数里的引号，把 `-m "deploy: docs v0.2.0"`
// 拆成 `-m deploy:` + `docs` + `v0.2.0`，导致提交报 pathspec 错误。
const git = (args, options) => run('git', args, options);

// pnpm 是 .cmd / shell 包装脚本，Windows 上必须经 shell 才能找到
const pnpm = (args, options) =>
  run('pnpm', args, { ...options, shell: process.platform === 'win32' });

// 检查某个 ref 是否存在（--quiet 下不存在会返回非 0，无需当成错误）
function refExists(ref) {
  return spawnSync('git', ['rev-parse', '--verify', '--quiet', ref], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  }).status === 0;
}

// ---------- 主流程 ----------

function main() {
  const options = parseArgs(process.argv.slice(2));
  const version = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8')).version;
  const remoteUrl = git(['remote', 'get-url', options.remote], { capture: true });
  const repoName = remoteUrl.replace(/\.git$/, '').split('/').pop();

  console.log(`\n部署文档站到 GitHub Pages\n`);

  // 1. 前置检查：base 必须与仓库名一致，否则 GitHub Pages 上会白屏
  const configPath = resolve(repoRoot, 'docs/.vitepress/config.ts');
  const baseMatched = readFileSync(configPath, 'utf8').match(/base:\s*['"]([^'"]+)['"]/);
  const expectedBase = `/${repoName}/`;
  if (baseMatched && baseMatched[1] !== expectedBase) {
    console.warn(
      `⚠️  docs/.vitepress/config.ts 的 base 是 "${baseMatched[1]}"，` +
        `但仓库名对应的应为 "${expectedBase}"。\n` +
        `   GitHub Pages 项目站点若不匹配会导致页面白屏，请先修正。\n`,
    );
  }

  // 2. 构建
  if (options.build) {
    // 先自行清空产物目录。VitePress 内部也会清，但由它一次性删除大批文件
    // 在某些环境（如带批量删除保护的安全策略）会被拦截，这里先清空更稳妥，
    // 同时确保产物不含上一次构建的残留（带 hash 的旧资源）。
    // 清不掉时不致命：VitePress 构建时会自行覆盖，只是可能残留少量旧资源。
    if (existsSync(DIST_DIR)) {
      try {
        rmSync(DIST_DIR, { recursive: true, force: true });
      } catch (error) {
        console.warn(`⚠️  未能清空旧产物目录（${error.code || '未知原因'}），继续构建。`);
      }
    }
    console.log('构建文档站…');
    pnpm(['docs:build']);
  } else {
    console.log('跳过构建（--no-build）');
  }

  // 3. 校验产物
  if (!existsSync(resolve(DIST_DIR, 'index.html'))) {
    throw new Error(
      `未找到构建产物：${resolve(DIST_DIR, 'index.html')}\n` +
        `        → 请先运行 pnpm docs:build，或去掉 --no-build 参数`,
    );
  }

  // 4. 准备 worktree（先清理可能残留的）
  if (existsSync(WORKTREE_DIR)) {
    git(['worktree', 'remove', '--force', WORKTREE_DIR], { allowFailure: true });
  }
  git(['worktree', 'prune'], { allowFailure: true });

  const remoteRef = `${options.remote}/${options.branch}`;
  git(['fetch', options.remote, options.branch], { allowFailure: true });

  if (refExists(remoteRef)) {
    // 基于远程分支，保留历史、在其之上累加提交
    git(['worktree', 'add', '--detach', WORKTREE_DIR, remoteRef]);
    console.log(`基于已有分支 ${remoteRef}（保留历史）`);
  } else {
    // 远程还没有该分支：建一个全新的空分支
    git(['worktree', 'add', '--detach', WORKTREE_DIR]);
    git(['checkout', '--orphan', options.branch], { cwd: WORKTREE_DIR });
    console.log(`远程无 ${options.branch}，将新建该分支`);
  }

  // 5. 清空分支内容，保证与 dist 完全一致（不残留历史构建的旧资源）
  //    用 git rm 而非 fs 删除，既精确作用于已跟踪文件，也避免误删 .git
  git(['rm', '-r', '--quiet', '--ignore-unmatch', '.'], { cwd: WORKTREE_DIR });

  // 6. 复制构建产物
  cpSync(DIST_DIR, WORKTREE_DIR, { recursive: true });

  // 7. 补 .nojekyll：GitHub Pages 默认用 Jekyll 处理站点，
  //    它会忽略下划线开头的文件、并可能改写含 {{ }} 的资源，加此文件可整体关闭该处理
  writeFileSync(resolve(WORKTREE_DIR, '.nojekyll'), '');

  // 8. 提交
  git(['add', '-A'], { cwd: WORKTREE_DIR });
  const message = options.message || `deploy: docs v${version}`;
  const changed = git(['status', '--porcelain'], { cwd: WORKTREE_DIR, capture: true });
  if (!changed) {
    console.log('\n产物与目标分支内容一致，无需部署。\n');
    git(['worktree', 'remove', '--force', WORKTREE_DIR], { allowFailure: true });
    return;
  }
  git(['commit', '-m', message], { cwd: WORKTREE_DIR });
  const commit = git(['rev-parse', '--short', 'HEAD'], { cwd: WORKTREE_DIR, capture: true });

  // 9. 推送
  if (options.dryRun) {
    console.log(`\n[dry-run] 已生成提交 ${commit}，跳过推送。`);
    console.log(`          推送命令为：git push ${options.remote} HEAD:${options.branch}\n`);
  } else {
    console.log(`\n推送到 ${options.remote}/${options.branch}…`);
    git(['push', options.remote, `HEAD:refs/heads/${options.branch}`], { cwd: WORKTREE_DIR });
  }

  // 10. 清理 worktree
  git(['worktree', 'remove', '--force', WORKTREE_DIR], { allowFailure: true });
  git(['worktree', 'prune'], { allowFailure: true });

  if (!options.dryRun) {
    // 从远程 URL 推导 Pages 地址：https://github.com/<owner>/<repo>.git
    const owner = (remoteUrl.match(/github\.com[/:]([^/]+)\//) || [])[1] || '<owner>';
    console.log(
      `\n✓ 部署完成（${message}，提交 ${commit}）\n` +
        `  访问地址：https://${owner}.github.io/${repoName}/\n` +
        `  ⏱  Pages 生效通常需要 1 分钟左右\n`,
    );
  }
}

try {
  main();
} catch (error) {
  // 失败时也尽量清掉 worktree，避免下次运行被脏目录挡住
  if (existsSync(WORKTREE_DIR)) {
    git(['worktree', 'remove', '--force', WORKTREE_DIR], { allowFailure: true });
  }
  console.error(`\n✗ ${error.message}\n`);
  process.exit(1);
}
