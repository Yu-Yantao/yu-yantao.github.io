# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 项目概览

这是一个基于 Hugo 的个人博客站点，根配置位于 `config/_default/`，主题使用 Git submodule 引入的 Blowfish（`themes/blowfish`）。站点内容主要放在 `content/`，并通过仓库根目录下的 `layouts/` 与 `assets/` 对主题进行覆盖和定制。

## 常用命令

### 本地预览站点
在仓库根目录运行：

```bash
hugo server
```

如需包含草稿或未来文章，可按需使用 Hugo 标准参数：

```bash
hugo server -D -F
```

### 生产构建
在仓库根目录运行：

```bash
hugo --gc --minify
```

构建结果输出到 `public/`。GitHub Pages workflow 使用的也是这一构建方式，见 `.github/workflows/hugo.yaml`。

### 主题前端资源开发
如果修改了 `themes/blowfish` 内的 Tailwind/CSS 资源，在主题目录运行：

```bash
npm install
npm run dev
```

生成生产版主题资源：

```bash
npm run build
```

路径：`themes/blowfish/package.json`

### 主题示例站点
如果需要验证 Blowfish 主题本身而不是当前博客内容，在主题目录运行：

```bash
npm run example
```

### Firebase views 数据脚本
仓库内保留了 Blowfish 主题自带的 Firebase seed 脚本，位于 `themes/blowfish/scripts/`：

```bash
npm install
npm run seed-views:dry
```

仅在确实需要处理主题 views 数据时再进入这个目录。

## 代码结构

### 站点配置
- `config/_default/hugo.yaml`：站点级 Hugo 配置，包括 `baseURL`、分页、taxonomy、输出格式。
- `config/_default/params.yaml`：Blowfish 主题参数覆盖，控制首页布局、文章页行为、搜索、评论、TOC、页脚等。
- `config/_default/languages.en.yaml`：英文站点标题、作者、描述等语言级配置。
- `config/_default/menus.en.yaml`：顶部导航与页脚菜单。
- `config/_default/module.yaml`：Hugo module 相关最低版本配置。

当前站点使用：
- `theme: blowfish`
- 单语言 `en`
- 首页布局 `homepage.layout: background`
- 搜索启用，并由 `layouts/_default/index.json` 生成搜索索引 JSON

### 内容组织
- `content/blog/`：博客文章，通常每篇文章一个目录，正文在 `index.md`，图片放在同目录。
- `content/about/index.md`：About 页面。
- `content/tags/_index.md`、`content/blog/_index.md`：列表页内容入口。

这是标准 Hugo content bundle 组织方式；文章资源通常与文章放在同一目录下。

### 自定义模板覆盖
仓库根目录的 `layouts/` 会覆盖主题同名模板，是理解站点定制行为的关键位置：

- `layouts/index.html`：首页入口，根据 `site.Params.homepage.layout` 动态选择 `partials/home/<layout>.html`。
- `layouts/_default/baseof.html`：全站骨架，负责 header/footer/search 等全局结构。
- `layouts/_default/single.html`：文章页主体，控制 hero、作者信息、TOC、分页、分享、comments、views/likes 脚本注入。
- `layouts/_default/index.json`：搜索索引生成逻辑，会遍历站点页面并输出 Fuse.js 可用 JSON。
- `layouts/partials/analytics/*`：分析脚本接入点。
- `layouts/shortcodes/` 与 `layouts/_default/_markup/`：Markdown 渲染和 shortcode 覆盖。

如果页面行为与主题默认不一致，优先检查根目录 `layouts/`，再看 `themes/blowfish/layouts/`。

### 样式与静态资源
- `assets/css/custom.css`：当前站点的主要样式覆盖，包括导航字号、标签云样式、全局字体、正文宽度等。
- `assets/img/`：站点级图片资源。
- `static/fonts/`：自定义字体资源，当前 `custom.css` 引用了 `static/fonts/NotoSansSC-VariableFont_wght.woff2`。
- `static/js/tags.js`：站点级前端脚本。
- `static/` 下的 favicon、manifest 等会原样发布。

### 主题来源
- `themes/blowfish` 是 Git submodule，配置见 `.gitmodules`。
- 这个目录既是上游主题源码，也是当前仓库的一个已跟踪子模块；若要修改主题本体，需要注意这是独立仓库状态。
- 当前仓库已经通过根目录 `layouts/`、`assets/`、`config/_default/params.yaml` 对主题做了站点级覆盖，优先采用这些覆盖点，而不是直接改主题源码，除非确实需要改主题本体。

## 部署与运行时行为

- 部署目标是 GitHub Pages，workflow 位于 `.github/workflows/hugo.yaml`。
- CI 使用 Hugo `0.154.5`，并执行：

```bash
hugo --gc --minify --baseURL "${{ steps.pages.outputs.base_url }}/"
```

- workflow 会 checkout submodules，因此本地或 CI 若遇到主题缺失，先检查 submodule 状态。

## 维护时的注意点

- 这个仓库根目录没有自己的 `package.json`；Node 相关命令主要在 `themes/blowfish/` 或其 `scripts/` 子目录执行。
- 搜索功能依赖 `enableSearch: true` 和 `layouts/_default/index.json`；修改搜索相关行为时，这两个位置要一起看。
- 文章页 views/likes 脚本注入逻辑在 `layouts/_default/single.html`，如果要调整文章页交互，先确认是否影响这里的数据属性和前端脚本加载。
- `params.yaml` 中启用了 `showComments: true`，但 comments 具体实现取决于是否存在 `partials/comments.html`；排查评论区问题时同时检查主题侧 partial。