---
title: {{ replace .Name "-" " " | title }}
date: {{ .Date }}
lastmod: {{ .Date }}
author: Yu Yantao
draft: false
weight:
slug: {{ time.Now.Format "2006-01-02" }}
tags: []
summary: 
description: 
---

> 如果文章中有不准确的地方，欢迎留言指正。