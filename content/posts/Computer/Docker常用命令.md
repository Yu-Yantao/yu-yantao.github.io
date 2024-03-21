---
title: Docker常用命令
date: 2024-03-09T16:51:47+0800
lastmod: 2024-03-09T16:51:47+0800
author:
  - 俞延涛
categories: 
tags:
  - Docker
description: Docker常用命令
weight: 
draft: false
cover:
  image: ""
  caption: ""
  alt: ""
  relative:
---
# 1.Docker简介
将应用和依赖环境进行封装到一个轻量级、可移植的容器中。一次封装，到处运行。

# 2.三要素

* 镜像：一个只读的模板。
* 容器：可以运行一组或一个容器，是镜像的实例。
* 仓库：集中存储镜像的地方。

# 3.安装(CentOS8)

1. 安装依赖
```bash
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```
2. 添加yum源
```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```
3. 安装
```bash
yum install docker-ce docker-ce-cli [containerd.io](http://containerd.io/) --allowerasing
```
4. 配置国内镜像
```bash 
vim /etc/docker/daemon.conf
```
复制以下内容
```text
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
```
5. 重启
```bash 
sudo systemctl restart docker
```
6. 开机自启
```bash 
sudo systemctl enable docker.service
```

# 4.帮助命令

* docker version: 查看版本
* docker info docker: 信息
* docker --help:查看docker命令

# 5.镜像命令

* docker ps --format "{{.ID}}: {{.Names}}: {{.Command}}"
* docker images [-a全部镜像] [-q只显示id] [—digest 显示摘要信息]：查看本地镜像
* docker search 镜像名称：从dockerhub上找镜像
* docker pull 镜像名称 [：版本号]：拉取镜像
* docker rmi [-f 强制删除] 镜像名称 [：版本号]：删除本地镜像，可以删除多个，通过空格分隔
* docker rmi -f $(docker images -qa)：全部删除

# 6.容器命令

* 新建并启动容器：docker run [options] images [command] [arg]
	- options
	- --name="容器名称"
	- -d：后台运行容器，并返回容器ID，
	- -i：以交互模式运行容器，配合t使用
	- -t：生成一个伪输入窗口
	- -p 主机端口:docker容器端口：指定端口映射
- 查看运行的容器：docker ps [options]
- options
	- -n 2：最近运行过的容器
- 退出容器
	- exit：停止并退出
	- Ctrl+P+Q：退出不停止
- 启动容器：docker start 容器id
- 重启容器
- 关闭容器：docker stop 容器id
- 强制关闭：docker kill 容器id
- 删除启动过的容器：docker rm 容器id
	- docker rm -f $(docker ps -qa)：删除全部的
- 启动交互式容器：docker run -d 镜像名
- 查看日志：docker logs [option]
	- option
	- -t：时间
	- -f：最新的
	- --tail 3：最后三条
- 查看容器内运行的进程：docker top 容器id
- 查看容器内部细节：docker inspect 容器id
- 重新进入交互式容器：docker attache 容器id
- 通过宿主机操作交互式容器：docker exec -t 容器id Linux命令
- 容器数据传至宿主机：docker cp 容器id:容器内路径

