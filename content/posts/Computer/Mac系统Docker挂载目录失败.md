---
title: Mac系统Docker挂载目录失败
date: 2024-03-26T20:46:42+0800
lastmod: 2024-03-26T20:46:42+0800
author:
  - 俞延涛
categories: 
tags:
  - Docker
description: Mac OS上使用docker run -v命令挂载目录后不生效
weight: 
draft: false
cover:
  image: ""
  caption: ""
  alt: ""
  relative:
---
# 1.问题描述
```bash
docker run --restart=unless-stopped -d --name mysql -v /opt/local/Docker/mysql/data/:/var/lib/mysql -p 3307:3306 -e MYSQL_ROOT_PASSWORD=xxxx mysql
```
使用上述命令，安装MySQL，挂载目录到本地，然后查看挂载的目录，发现数据没有同步过来。

# 2.问题原因
起初以为是docker没有权限操作主机目录，使用**chmod 777**给挂载目录增加权限后，依旧无法同步数据。
查阅资料后，修改命令，增加**privileged** 参数，可以赋予容器与主机相同的权限，尝试后依旧同步失败。
突然灵机一动，想到了之前安装PD时学到的一个东西，Mac的**系统完整性保护机制（SIP）**，SIP限制了软件的文件的操作权限（个人理解优先级高于chmod），所以导致无法创建文件。

# 3.解决方案
关闭SIP，不同的系统版本关闭方式不一样，这里提供一种安全简单的方案
1. 安装Docker desktop，可以用来管理Docker镜像和容器
2. 找到系统设置→隐私与安全性→完全磁盘访问权限
3. 对Docker desktop授权