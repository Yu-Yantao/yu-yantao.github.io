---
title: Java枚举值的比较
date: 2024-03-12T19:41:01+0800
lastmod: 2024-03-12T19:41:01+0800
author:
  - 俞延涛
categories: 
tags:
  - Java
description: Java中枚举值为什么可以用“==”来判断
weight: 
draft: false
cover:
  image: ""
  caption: ""
  alt: ""
  relative:
---
# 1.前置知识
在Java中，两个对象的比较，如果使用，则比较的是两个对象的**地址**，并且类如果没有重写equals方法，会调用Object中的equlas方法，而Object中的equals方法使用的就是"\=="，所以，我们在使用和equals时，会返回不同的结果。

# 2.源码分析
接下来从源码来分析一下枚举值为什么可以用\==来比较。
**枚举类源码**
```Java
public final boolean equals(Object other) {  
    return this==other;  
}
```
在枚举类源码中可以看到，枚举类的equals方法，就是使用的是\==，所以在比较枚举类时，使用\==和equals的结果是一样的。之所以这样，是因为枚举类是**单例模式** ，所以可以用\==来进行比较。