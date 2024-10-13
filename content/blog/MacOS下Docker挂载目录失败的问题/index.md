---
title: MacOS下Docker挂载目录失败的问题
date: 2024-07-26T18:46:57+08:00
lastmod: 2024-07-26T18:46:57+08:00
author: Yu Yantao
draft: false
weight:
slug: 2024-07-26
tags: [ MacOS, Docker ]
summary: 本文主要介绍MacOS下使用"docker run -v"命令挂载目录后不生效的原因及解决方案。
description: 本文主要介绍MacOS下使用"docker run -v"命令挂载目录后不生效的原因及解决方案。
---

> 如果文章中有不准确的地方，欢迎留言指正。

## 1.问题描述

```shell
docker run --restart=unless-stopped -d --name mysql -v /opt/local/Docker/mysql/data/:/var/lib/mysql -p 3307:3306 -e MYSQL_ROOT_PASSWORD=xxxx mysql
```

使用上述命令，安装 MySQL 后，查看挂载的目录，数据未进行同步。

## 2.原因分析

最先想到的是 docker 没有权限操作主机目录，使用`chmod 777`给挂载目录增加权限后，依旧无法同步数据。

查阅资料后，修改命令，增加**`privileged`** 参数，可以赋予容器与主机相同的权限，尝试后依旧同步失败。

突然想到之前研究 ParallelsDesktop 时，了解到 MacOS 的**系统完整性保护机制（SIP）**，SIP 限制了软件对文件的操作权限（级别高于
chmod），所以导致无法创建文件。

## 3.解决方案

关闭 SIP，不同的系统版本关闭方式不一样，这里提供一种安全简单的方案。

1. 安装 Docker desktop，可以用来管理 Docker 镜像和容器
2. 找到系统设置 → 隐私与安全性 → 完全磁盘访问权限
3. 对 Docker desktop 授权

> 特别注意：在授权之前，先正常关闭退出Docker desktop，否则可能导致它异常关闭，之前的镜像和容器都会被删除！