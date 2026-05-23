---
title: 洗牌算法 | Fisher-Yates
date: 2025-04-02T11:16:22+08:00
lastmod: 2025-04-02T11:16:22+08:00
author: Yu Yantao
draft: false
weight:
slug: fisher-yates-shuffle
tags: [ Algorithm ]
summary: 从概率角度解释为什么“随机交换很多次”不等于均匀洗牌，并给出 Fisher-Yates 的正确实现。
description: 从概率角度解释为什么“随机交换很多次”不等于均匀洗牌，并给出 Fisher-Yates 的正确实现。
---

> 如果文章中有不准确的地方，欢迎留言指正。

## 问题背景

一副牌除去大小王后共 52 张（假设初始为有序排列），经过洗牌后，如何确保**每张牌**出现在**任意位置的概率均相等**？

这个问题让我想起大学时做过的 C++ 课设。当时的要求只是“随机打乱一副牌”，所以我用的思路也很直接：每次生成一个 `0 ~ 51` 的随机数，然后交换当前位置和随机位置的牌。

后来再次看到这个问题时，要求变成了“不仅要打乱，而且要保证每个位置的概率均匀”。这时原先那种“随机交换很多次”的直觉就不够了。

## 为什么“随机交换很多次”不够

一开始我也以为这个思路理论上可行：

> 每次都在 `0 ~ 51` 之间随机选一个位置交换，重复 52 次，好像每次都很随机，最终应该也均匀。

但这个分析其实是错的。

把这个过程换个角度理解，就会更清楚：它等价于从 52 张牌中进行 52 次**放回抽样**。  
每次抽的时候看起来是均匀的，但整个结果序列并不保证每张牌恰好出现一次，一张牌可能被“抽中”多次，也可能一次都没被抽中。

此时，问题就出现了，52 张牌，如果做**放回抽样**，抽取52次，每次抽取时，每张牌被抽的概率都是相同的，但是在结果序列中，每张牌出现的概率是不同的，一张牌可能不出现，也可能出现多次。

那怎么才能确保每张牌出现的概率均相等呢？

## 把问题转成不放回抽样

还是上述问题，假设我们有 3 张牌（ABC），抽 3 次。如果要保证每张牌出现在任意位置的概率均相等，那我们需要的结果是 ABC
的全排列中的一种，也就是不包含重复元素。

所以，我们需要的是**不放回抽样**，来看一下不放回抽样的计算方法。假设我们需要 BCA 这个序列。

1. 抽到 B 的概率， 1/3
2. 抽到 C 的概率， 1/2
3. 抽到 A 的概率， 1/1

整体的概率是 1/3 *1/2* 1/1 = 1/6，其他任意序列的概率也是 1/6。

## Fisher-Yates 算法

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

## 总结

Fisher-Yates 真正重要的地方，不是“随机交换”这几个字，而是它每一轮都只在**尚未确定的位置范围内**做等概率选择。  
也正因为如此，它才能把“洗牌”这件事严格对应到“不放回抽样”的概率模型上。

如果只是想把数组打乱，很多写法都能做到；但如果要求**均匀随机**，Fisher-Yates 才是更稳妥、也更值得记住的做法。
