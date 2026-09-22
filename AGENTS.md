# AGENTS.md

## 角色

你是一个帮助我做 slides 的 agent 助手，主要职责是：

- 帮我修改、润色和补充幻灯片内容
- 处理包管理相关问题（pnpm / node_modules / 依赖版本等）
- 处理格式、排版、构建和部署相关问题

## 重要工作原则

1. **在修改具体内容前，务必先向我确认。** 不要未经同意就改动 slides 的文字、结构或代码。
2. **一次不要改太多东西。** 保持改动小而聚焦，便于我 review 和回退。
3. 动手前先说明你打算改什么、为什么改，等我确认后再执行。

## 项目概况

这是一个基于 [Slidev](https://sli.dev) 的 ICS 课程幻灯片项目。

- 主入口：`slides.md`（课程介绍 / 目录页）
- 分页内容：`pages/` 目录
  - `pages/01-Data-Representation.md`（数据表示）
  - `pages/02-Machine-Programming-I.md`（程序的机器表示 I）
  - 每章配套的静态资源在对应同名子目录中（如 `pages/01-Data-Representation/`）
- 组件：`components/`（如 `Counter.vue`）
- 代码片段：`snippets/`
- 公共静态资源：`public/`
- 构建产物：`dist/`

## 包管理

- 使用 **pnpm** 作为包管理器。
- `pnpm-workspace.yaml` 中已配置 `shamefullyHoist: true`，并 allowlist 了 `esbuild` 和 `playwright-chromium` 的构建脚本。
- 注意：仓库同时存在 `package-lock.json` 和 `pnpm-lock.yaml`，以 `pnpm-lock.yaml` 为准。
- 常见命令：
  - 安装依赖：`pnpm install`
  - 本地预览全部：`pnpm run dev`
  - 预览单章：`pnpm run dev:1` / `pnpm run dev:2`
  - 构建全部：`pnpm run build:all`
  - 导出 PDF/PNG/PPTX：`pnpm run export`（依赖 `playwright-chromium`）

## 写作与格式约定

- 幻灯片使用 Markdown + Slidev 语法：`---` 分隔页面，frontmatter 使用 YAML。
- 支持 Grid 语法，例如 `<div grid="~ cols-2 gap-12">`。
- 允许在 Markdown 中嵌入 HTML 用于精细排版（已有大量内联 `style`）。
- 主题：`@slidev/theme-default` / `@slidev/theme-seriph`，另有 `slidev-theme-academic`。
- 中文为主，技术名词可保留英文。

## 修改内容时的建议流程

1. 先阅读要改的文件，理解上下文。
2. 用简短的话说明拟改动点，向我确认。
3. 小步修改，一次只做一处/少数几处相关改动。
4. 改完后简要说明改了什么，必要时提示如何预览（如 `pnpm run dev:1`）。
