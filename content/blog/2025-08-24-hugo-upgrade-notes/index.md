---
title: Hugo升级笔记
date: 2025-08-24T22:12:45+08:00
lastmod: 2025-08-24T22:12:45+08:00
author: Yu Yantao
draft: true
weight:
slug: hugo-upgrade-notes
tags: [ ]
summary: 记录博客升级和主题调整时用到的关键改动点，方便后续回看和继续定制。
description: 记录博客升级和主题调整时用到的关键改动点，方便后续回看和继续定制。
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
    {{ $tagsVersion := readFile "static/js/tags.js" | md5 }}
    <script src="{{ "/js/tags.js" | relURL }}?v={{ $tagsVersion }}"></script>
    <section class="blog-tags blog-tags-cloud">
        {{ range .Data.Terms }}
        {{ partial "term-link/text.html" . }}
        {{ end }}
    </section>
    ```

2. 修改文件 layouts/partials/term-link/text.html

    ```html
    <article class="blog-tag">
        <h2 class="flex items-start whitespace-nowrap">
            <a
                    class="text-xl font-medium decoration-primary-500 hover:underline hover:underline-offset-2"
                    href="{{ .Page.RelPermalink }}"
            >{{ .Page.Title }}</a
            >
            {{ if site.Params.taxonomy.showTermCount | default true }}
            <sup class="blog-tag-count text-neutral-400">
                {{ .Count }}
            </sup>
            {{ end }}
        </h2>
    </article>
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
