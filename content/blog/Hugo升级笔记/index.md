---
title: Hugo升级笔记
date: 2025-08-24T22:12:45+08:00
lastmod: 2025-08-24T22:12:45+08:00
author: Yu Yantao
draft: true
weight:
slug: 2025-08-24
tags: [ Hugo ]
summary:
description: 
---

> 如果文章中有不准确的地方，欢迎留言指正。

## 删除头像下的标题

1. layouts/partials/home/background.html

    ```html
    <h1 class="mb-2 text-4xl font-extrabold text-neutral-800 dark:text-neutral-200">
        {{ .Site.Params.Author.name | default .Site.Title }}
    </h1>
    ```

## 打字机效果

1. layouts/partials/home/background.html
   ```html
   <h2 class="mt-0 mb-0 text-xl text-neutral-800 dark:text-neutral-300">
                   <em>{{ . | markdownify }}
                       <span class="blinking">__</span></em>
               </h2>
   ```

## 动态 Tags

1. 修改文件 layouts/_default/terms.html

    ```html
    <!--添加 blog-tags 类-->
    <section class="flex flex-wrap max-w-prose -mx-2 overflow-hidden blog-tags">
        {{ range .Data.Terms }}
        {{ partial "term-link/text.html" . }}
        {{ end }}
    </section>
    ```

2. 修改文件 layouts/partials/term-link/text.html

    ```html
    <!--添加 blog-tag 类-->
    <article class="w-full px-2 my-3 overflow-hidden sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 blog-tag">
    ```

## 开启评论

1. 新建文件 layouts/partials/comments.html

    ```html
    <script src="https://giscus.app/client.js"
            data-repo="Yu-Yantao/yu-yantao.github.io"
            data-repo-id="R_kgDOLZm48A"
            data-category="Announcements"
            data-category-id="DIC_kwDOLZm48M4ChE6f"
            data-mapping="pathname"
            data-strict="0"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="top"
            data-theme="light"
            data-lang="en"
            data-loading="lazy"
            crossorigin="anonymous"
            async>
    </script>
    ```
