---
title: Docker安装常见应用命令汇总
date: 2024-07-25T17:02:51+08:00
lastmod: 2024-07-25T17:02:51+08:00
author: Yu Yantao
draft: false
weight:
slug: docker-install-common-app-commands-summary
tags: [ Docker,Software Installation ]
summary: 本文主要介绍Docker安装常见应用命令汇总。
description: 本文主要介绍Docker安装常见应用命令汇总。
---

> 说明: 本文的安装命令是基于 MacOS 的，我个人习惯放在 opt 目录下，因为 homebrew 的安装位置是 opt ，依个人习惯，自行选择。

## MySQL

```shell
# 1.拉取镜像
docker pull mysql:8.0.21

# 2.创建数据目录和配置文件
mkdir -p /opt/local/Docker/mysql/data

# 3.启动容器，设置mysql密码
docker run -d \
--name mysql \
-v /opt/local/Docker/mysql/data/:/var/lib/mysql \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=root \
mysql
```

配置文件

```text
[client]

#socket = /usr/mysql/mysqld.sock

default-character-set = utf8mb4

[mysqld]

#pid-file        = /var/run/mysqld/mysqld.pid

#socket          = /var/run/mysqld/mysqld.sock

#datadir         = /var/lib/mysql

#socket = /usr/mysql/mysqld.sock

#pid-file = /usr/mysql/mysqld.pid

datadir = /usr/mysql/data

character_set_server = utf8mb4

collation_server = utf8mb4_bin

secure-file-priv= NULL

# Disabling symbolic-links is recommended to prevent assorted security risks

symbolic-links=0

# Custom config should go here

!includedir /etc/mysql/conf.d/
```

> 如果是在云服务器安装，需要配置 MySQL 远程连接的权限，否则无法连接

## Redis

```shell
# 1.拉取镜像
docker pull redis

# 2.创建数据目录和配置文件
mkdir -p /opt/local/Docker/redis/data
vim /opt/local/Docker/redis/redis.conf

# 3.启动容器，设置mysql密码
docker run \
-p 6379:6379 \
--name redis \
-v /opt/local/Docker/redis/redis.conf:/etc/redis/redis.conf \
-v /opt/local/Docker/redis/data:/data \
-d redis redis-server /etc/redis/redis.conf --appendonly yes
```

配置文件

```text
# bind 127.0.0.1
daemonize no
requirepass root
appendonly yes
```

## PostgreSQL

```shell
# 1.拉取镜像
docker pull postgres

# 2.创建数据目录和配置文件
mkdir -p /opt/local/Docker/postgres/data

# 3.启动容器，设置mysql密码
docker run --name postgres \
-e POSTGRES_PASSWORD=root \
-p 5432:5432 \
-v /opt/local/Docker/postgres/data:/var/lib/postgresql/data \
-d postgres
```

## ELK
### ES
```shell
# 1.拉取镜像
docker pull elasticsearch:8.6.0

# 2.创建挂载目录
mkdir -p /opt/local/Docker/elasticsearch/
mkdir -p /opt/local/Docker/elasticsearch/config
mkdir -p /opt/local/Docker/elasticsearch/plugins
mkdir -p /opt/local/Docker/elasticsearch/data
chmod 777 /opt/local/Docker/elasticsearch/

# 3.创建网络，启动镜像的时候指定网段，在该网段下的容器能够通过容器名称进行互通
docker network create es-net

# 4.创建配置文件，该步骤非必需，如果不需要挂载配置文件，可以忽略改步骤，下方启动容器的命令中删除挂载配置文件的参数
vim /opt/local/Docker/elasticsearch/config/elasticsearch.yml
cluster.name: elasticsearch
network.host: 0.0.0.0
http.port: 9200
http.cors.enabled: true
http.cors.allow-origin: "*"
# 此处开启xpack
xpack.security.enabled: true

# 5.启动容器
docker run -d \
--name elasticsearch \
--network es-net \
-p 9200:9200 \
-p 9300:9300 \
--privileged \
-v /opt/local/Docker/elasticsearch/data:/usr/share/elasticsearch/data \
-v /opt/local/Docker/elasticsearch/plugins:/usr/share/elasticsearch/plugins \
-v /opt/local/Docker/elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
-e "discovery.type=single-node" \
-e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
elasticsearch:8.6.0

# 6.设置密码，该步骤非必须
# 进入容器，执行该脚本，不同版本可能位置不同，名称不同，在bin目录下，找名称中带有setup-passwords的脚步即可
/usr/share/elasticsearch/bin/elasticsearch-setup-passwords interactive
# 执行后依次设置密码即可（内置多个用户）
```

### Kibana
```shell
# 1.拉取镜像
docker pull kibana:8.6.0

# 2.创建挂载目录
mkdir -p /opt/local/Docker/kibana/config
vim /opt/local/Docker/kibana/config/kibana.yml

# 3.启动kibana
docker run -d \
--name kibana \
--network es-net \
--privileged=true \
-v /opt/local/Docker/kibana/config/kibana.yml:/usr/share/kibana/config/kibana.yml \
-p:5601:5601 \
kibana:8.6.0
```
配置文件
```text
server.name: kibana
server.host: "0.0.0.0"
# elasticsearch的服务器地址(这里是指容器名)
# 这里的ip是私有ip，端口号时原始端口号
elasticsearch.hosts: ["http://172.18.0.x:9200"]
elasticsearch.username: kibana
elasticsearch.password: yyt0609
monitoring.ui.container.elasticsearch.enabled: true
# 汉化操作界面
i18n.locale: zh-CN
```

### Logstash
```shell
# 1.拉取镜像
docker pull logstash:8.6.0

# 2.创建配置文件
mkdir -p /opt/local/Docker/logstash/config
vim /opt/local/Docker/logstash/config/logstash.yml
# 输入端
input {
  # 控制台输入  
  stdin { } 
  # 外部应用输入
  # 5044端口预留给filebeat输入logstah，此处开放5043端口，程序直接输入
  tcp {
      mode => "server"
      host => "0.0.0.0"
      #从5043端口取日志
      port => 5043
      #需要安装logstash-codec-json_lines插件
      codec => json_lines
  }
}

#输出端
output {
  stdout {
    codec => rubydebug
  }
  elasticsearch {
    # hosts中的地址应该写同一网络下的容器名称
    hosts => ["http://172.18.0.2:9200"]
    # 输出至elasticsearch中的自定义index名称
    index => "flow-%{+YYYY.MM.dd}"
    user => "elastic"
    password => "yyt0609"
  }
}

# 3.启动容器
docker run -d --name logstash \
-p 5043:5043 -p 5044:5044 \
--network es-net \
--privileged=true \
-v /opt/local/Docker/logstash/config:/usr/share/logstash/pipeline/ \
logstash:8.6.0

# 4.待容器启动完成，进入容器中
docker exec -it logstash /bin/bash

# 5.为logstash安装json_lines插件
/usr/share/logstash/bin/logstash-plugin install logstash-codec-json_lines

# 6. 成功安装插件之后，退出容器
exit

# 7.重启容器
docker restart logstash
```

## MongoDB
```shell
# 1.拉取镜像
docker pull mongo

# 2.创建挂载目录
mkdir -p /opt/local/Docker/mongo/data

# 3.启动容器
docker run -d -p 27017:27017 --name mongo -v /opt/local/Docker/mongo/data/db:/data/db mongo

# 4.设置密码
# 进入容器
# 设置密码
docker exec -it mongo mongosh
use admin 
db.createUser( {user: "root",pwd: "yyt0609",roles: [ { role: "root", db: "admin" } ]})
```

## RabbitMQ
```shell
# 1.拉取镜像
docker pull rabbitmq:management

# 2.启动容器
docker run --name rabbitmq -d -p 15672:15672 -p 5672:5672 rabbitmq:management
# 15672：控制台端口，5672：MQ端口
```

## Nginx
```shell
# 1.拉取镜像
docker pull nginx

# 2.创建挂载目录
mkdir -p /opt/local/Docker/nginx/html /opt/local/Docker/nginx/logs /opt/local/Docker/nginx/conf

# 3.启动一个临时容器
docker run --name nginx-test -p 80:80 -d nginx

# 4.取出配置文件
docker cp nginx-test:/etc/nginx/nginx.conf /opt/local/Docker/nginx/conf/nginx.conf 

# 5.删除临时容器
docker stop nginx-test
docker rmi nginx-test

# 6.启动容器
docker run -d \
-p 80:80 \
--name nginx \
-v /opt/local/Docker/nginx/html:/usr/share/nginx/html \
-v /opt/local/Docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf \
-v /opt/local/Docker/nginx/logs:/var/log/nginx nginx
```