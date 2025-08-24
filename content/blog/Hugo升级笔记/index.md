---
title: Hugo升级笔记
date: 2025-08-24T22:12:45+08:00
lastmod: 2025-08-24T22:12:45+08:00
author: Yu Yantao
draft: true
weight:
slug: 2025-08-24
tags: [ ]
summary:
description: 
---

> 如果文章中有不准确的地方，欢迎留言指正。

## layouts 文件夹

### 删除头像下的标题

1. layouts/partials/home/background.html

```html
<h1 class="mb-2 text-4xl font-extrabold text-neutral-800 dark:text-neutral-200">
    {{ .Site.Params.Author.name | default .Site.Title }}
</h1>
```

### 动态 Tags 
1.layouts/_default/terms.html
```html
<!--添加 blog-tags 类-->
<section class="flex flex-wrap max-w-prose -mx-2 overflow-hidden blog-tags">
    {{ range .Data.Terms }}
    {{ partial "term-link/text.html" . }}
    {{ end }}
</section>
```
2.layouts/partials/term-link/text.html
```html
<!--添加 blog-tag 类-->
<article class="w-full px-2 my-3 overflow-hidden sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 blog-tag">
```