---
title: MySQL排序机制解析
date: 2024-07-30T13:02:34+08:00
lastmod: 2024-07-30T13:02:34+08:00
author: Yu Yantao
draft: false
weight:
slug: 2024-07-30
tags: [ MySQL ]
summary: 本文主要介绍MySQL的两种排序机制。
description: 本文主要介绍MySQL的两种排序机制。
---

> 如果文章中有不准确的地方，欢迎留言指正。

## 1.两种机制介绍

### 1.1 索引排序

索引排序顾名思义，是通过索引来排序，当执行一次**索引覆盖查询**时，MySQL会使用索引排序来对数据进行排序。

索引排序的效率很高，但是索引排序只能对索引列进行排序，不能对非索引列进行排序，当无法使用索引排序时，就会用到文件排序。

### 1.2 文件排序(File Sort)

使用 explain 分析执行计划时， extra 字段如果包含 Using filesort ，表示使用了文件排序。

根据排序位置可以划分为两种，内存排序和磁盘排序。

- 内存排序: 在 MySQL 中有一块内存区域叫做 sort_buffer ，用于进行文件排序，当数据量可以放入 sort_buffer
  时，就使用内存排序。sort_buffer 的大小，可以使用 sort_buffer_size 进行修改，默认是 256KB。
- 磁盘排序: 当无法放入 sort_buffer 时，就会使用磁盘排序，使用的是归并排序，将数据划分为多块，每块在内存中排序，最后进行合并。

根据排序方式可以划分为单路排序(Single-Pass Sort)和双路排序(Two-Pass Sort)。

- 单路排序: 当 select 列的数据小于 max_length_for_sort_data 时，将所有 select 字段加载到 sort_buffer 中，排序后返回结果集。
- 双路排序: 当 select 列的数据大于 max_length_for_sort_data 时，分为两步，第一步是将主键和排序字段加载到内存或者磁盘文件中排序；第二部是使用主键进行回表，查询其余的
  select 字段。

> 以上，是 8.0.20 之前的策略。在之后的版本中，MySQL内部会根据数据的大小和内存使用情况自动选择最优化的排序策略，而不再依赖
> max_length_for_sort_data 参数。

## 2.总结

性能比较:

索引排序 > 内存排序 > 磁盘排序

所以在进行排序时，优先考虑**索引排序**。

在一些无法使用索引排序的情况下，可以适当调整 sort_buffer_size ，尽量避免磁盘排序，磁盘排序I/O次数较多，性能很差。
