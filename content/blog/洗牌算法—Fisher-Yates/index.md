---
title: 洗牌算法 | Fisher-Yates
date: 2025-04-02T11:16:22+08:00
lastmod: 2025-04-02T11:16:22+08:00
author: Yu Yantao
draft: false
weight:
slug: 2025-04-02
tags: [ Algorithm ]
summary: 介绍一种随机算法（Fisher-Yates）及其原理。
description: 介绍一种随机算法（Fisher-Yates）及其原理。
---

> 如果文章中有不准确的地方，欢迎留言指正。

## 1.前言

一副牌除去大小王后共 52 张（假设初始为有序排列），经过洗牌后，如何确保**每张牌**出现在**任意位置的概率均相等**？

这个问题，是我大学时，C++ 课程的课设，不过，当时没这么复杂只是要求随机打乱一副牌，当时的做法是：每次生成一个 0 到 51
的随机数，然后交换当前位置和随机位置的牌，即可打乱顺序。

今天又刷到了相同的问题，加上了随机性要求，简单思考了一下，采用之前的思路理论是可行的，**每次生成的数字是0 到 51
之间的随机数，那么，每次交换的概率是 1/52，那么，经过 52 次交换，每张牌出现的概率是 1/52，即概率相等。**

**但是！！！这么分析是错的。**

上述方案我们可以等价一下：从 52 张牌中，抽 52 次，每次都是**放回后**再随机抽牌（第一次抽的 i 位置的牌，等价于和位置的牌交换位置）。

此时，问题就出现了，52 张牌，如果做**放回抽样**，抽取52次，每次抽取时，每张牌被抽的概率都是相同的，但是在结果序列中，每张牌出现的概率是不同的，一张牌可能不出现，也可能出现多次。

那怎么才能确保每张牌出现的概率均相等呢？

## 2.不放回抽样

还是上述问题，假设我们有 3 张牌（ABC），抽 3 次。如果要保证每张牌出现在任意位置的概率均相等，那我们需要的结果是 ABC
的全排列中的一种，也就是不包含重复元素。

所以，我们需要的是**不放回抽样**，来看一下不放回抽样的计算方法。假设我们需要 BCA 这个序列。

1. 抽到 B 的概率， 1/3
2. 抽到 C 的概率， 1/2
3. 抽到 A 的概率， 1/1

整体的概率是 1/3 *1/2* 1/1 = 1/6，其他任意序列的概率也是 1/6。

## 3.Fisher-Yates 算法

该算法是由 John Fisher 和 Thomas Yates 在 1938 年提出的，实现的代码如下：

```java
import java.util.Arrays;
import java.util.Random;

public class ShuffleCards {
    public static void main(String[] args) {
        // 初始化牌组（0-51代表52张牌）
        int[] cards = new int[52];
        for (int i = 0; i < cards.length; i++) {
            cards[i] = i;
        }

        // Fisher-Yates 洗牌算法
        shuffle(cards);

        // 打印洗牌结果
        System.out.println("洗牌结果: " + Arrays.toString(cards));
    }

    /**
     * 时间复杂度 O(n), 空间复杂度 O(1) 的原地洗牌算法
     * @param array 待洗牌的数组
     */
    public static void shuffle(int[] array) {
        Random random = new Random();
        
        // 从最后一个元素向前处理
        for (int i = array.length - 1; i > 0; i--) {
            // 生成 [0, i] 范围内的随机索引
            int j = random.nextInt(i + 1);
            
            // 交换当前位置与随机位置
            swap(array, i, j);
        }
    }

    // 交换数组元素
    private static void swap(int[] array, int i, int j) {
        int temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
```

> Collections.shuffle() 方法也是基于 Fisher-Yates 算法的一种实现。
