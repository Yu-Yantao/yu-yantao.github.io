---
title: MacOS下Docker挂载目录失败的问题
date: 2024-07-26T18:46:57+08:00
lastmod: 2024-07-26T18:46:57+08:00
author: Yu Yantao
draft: false
weight:
slug: macos-docker-mount
tags: [ macOS, Docker ]
summary: 记录一次 macOS 下 Docker 目录挂载不生效的排查过程，说明为什么 chmod 和 privileged 都没解决问题，以及最终的处理方式。
description: 记录一次 macOS 下 Docker 目录挂载不生效的排查过程，说明为什么 chmod 和 privileged 都没解决问题，以及最终的处理方式。
---

> 如果文章中有不准确的地方，欢迎留言指正。

在 Linux 上习惯了 `docker run -v` 直接挂载目录后，很容易默认 macOS 也一样工作。但我在本地拉起 MySQL
时，容器明明启动成功，数据目录却没有按预期同步到宿主机，排查时也走了一些弯路，这里把过程整理一下。

## 问题现象

```shell
docker run --restart=unless-stopped -d --name mysql -v /opt/local/Docker/mysql/data/:/var/lib/mysql -p 3307:3306 -e MYSQL_ROOT_PASSWORD=xxxx mysql
```

使用上述命令，安装 MySQL 后，查看挂载的目录，数据未进行同步。

## 排查过程

最先想到的是 Docker 没有权限操作主机目录，所以先对挂载目录执行了 `chmod 777`，结果依旧没有解决问题。

随后又尝试给容器增加 **`privileged`** 参数，希望通过更高权限解决宿主机目录访问问题，结果也没有变化。

这时才意识到，问题可能并不在 Unix 文件权限本身，而是在 macOS 的系统隐私权限上。macOS
对部分目录访问有更严格的限制，应用即使在命令层面看起来有权限，也可能因为系统层面的授权不足而无法正常读写。

## 原因定位

这类问题的本质不是 `-v` 参数失效，而是 Docker Desktop 对目标目录缺少足够的系统访问权限。  
也就是说：

- `chmod` 解决的是传统文件权限问题
- `privileged` 解决的是容器权限问题
- 但 macOS 上还存在应用级的隐私与磁盘访问控制

如果这里没有授权，挂载目录就可能表现为“命令正常执行，但目录不生效”。

## 解决方案

1. 安装 Docker desktop，可以用来管理 Docker 镜像和容器
2. 找到系统设置 → 隐私与安全性 → 完全磁盘访问权限
3. 对 Docker desktop 授权

> 特别注意：在授权之前，先正常退出 Docker Desktop，再去调整权限，避免它在授权过程中出现异常。

## 总结

在 macOS 上遇到 Docker 挂载目录不生效时，不要只盯着 `chmod`、`chown` 或 `privileged`。  
如果命令本身没有问题，更值得优先检查的是 Docker Desktop 是否拿到了目标目录对应的系统访问权限。
