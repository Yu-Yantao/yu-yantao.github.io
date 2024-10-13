---
title: 进步的阶梯
date: 2024-08-02T15:53:14+08:00
lastmod: 2024-08-02T15:53:14+08:00
author: Yu Yantao
draft: false
weight: 1
slug: 2024-08-02
tags: [ Notes ]
summary: 记录一些让我受益匪浅的博客。
description: 记录一些让我受益匪浅的博客。
---

> 如果文章中有不准确的地方，欢迎留言指正。

## [【原创】惊！史上最全的select加锁分析(Mysql)](https://www.cnblogs.com/rjzheng/p/9950951.html)

这篇文章很详细地介绍了，在不同隔离级别下，主键索引、非主键索引、非索引字段，对select的加锁情况进行分析，尤其是在RR隔离级别下，对于间隙锁的介绍，非常详尽。