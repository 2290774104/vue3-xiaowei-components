# xw-components skill

`vue3-xiaowei-components` 的开发与使用助手 skill，随 npm 包一起分发。

## 包含内容

```
skills/xw-components/
├── SKILL.md                       # 主入口：DEV / USE 双场景路由
├── README.md                      # 本文件
└── references/
    ├── components.md              # 【生成】组件清单 + props/events/slots/暴露方法
    ├── icons.md                   # 【生成】Element Plus 图标名全集，★ 标注已用
    ├── registration.md            # 【生成】注册点对照表 + 当前齐全性
    ├── conventions.md             # 【手写】代码与目录约定
    ├── doc-templates.md           # 【手写】文档与 demo 模板
    └── usage.md                   # 【手写】组件 API 速查与用法（USE 场景）
```

标【生成】的三份由 `scripts/gen-skill-references.mjs` 从源码抽取，**不要手改**；
标【手写】的三份是人工维护的规范。

## 安装到本地 skill 目录

⚠️ **随 npm 包发布 ≠ 自动生效**。skill 装进 `node_modules` 后只是一份规范源，
WorkBuddy 不会自动加载它。需要复制或软链到 skill 目录：

**项目级**（推荐，团队共享）：

```bash
mkdir -p .workbuddy/skills
cp -r node_modules/vue3-xiaowei-components/dist/skills/xw-components .workbuddy/skills/
```

**用户级**（只对自己生效，跨项目可用）：

```bash
cp -r node_modules/vue3-xiaowei-components/dist/skills/xw-components ~/.workbuddy/skills/
```

Windows（PowerShell）：

```powershell
Copy-Item -Recurse -Force "node_modules\vue3-xiaowei-components\dist\skills\xw-components" ".workbuddy\skills\"
```

在组件库仓库自身开发时，skill 就在 `skills/xw-components/`，可直接软链：

```bash
mkdir -p .workbuddy/skills
ln -s ../../skills/xw-components .workbuddy/skills/xw-components   # macOS / Linux
# Windows: mklink /D .workbuddy\skills\xw-components ..\..\skills\xw-components
```

## 维护

```bash
pnpm gen:skill      # 源码变更后重新生成三份索引
pnpm verify:skill   # 校验索引是否漂移、注册点是否齐全、引用是否有效
```

`verify:skill` 会以非 0 退出码失败，适合挂进 CI 或 `prepublishOnly`。
