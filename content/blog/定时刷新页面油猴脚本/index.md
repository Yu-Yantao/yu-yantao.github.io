---
title: 定时刷新页面油猴脚本
date: 2024-12-26T17:10:34+08:00
lastmod: 2024-12-26T17:10:34+08:00
author: Yu Yantao
draft: false
weight:
slug: 2024-12-26
tags: [ Tampermonkey ]
summary: 定时刷新页面的油猴脚本，适用于一些需要定时刷新页面的场景。
description: 定时刷新页面的油猴脚本，适用于一些需要定时刷新页面的场景。
---

> 如果文章中有不准确的地方，欢迎留言指正。

## 1.背景&简介

公司某个平台在超过两小时不刷新页面时会自动登出，如果中途处理其他事情，再回来使用时可能会自动退出，使用起来非常不便。

所以写了一个油猴脚本，定时刷新页面。

## 2.脚本

> 将@match修改为需要刷新的页面地址

```js
// ==UserScript==
// @name         自动刷新页面
// @namespace    http://tampermonkey.net/
// @version      2024-12-26
// @description  自动刷新页面
// @author       Yu Yantao
// @match        http://localhost:8080/
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 设置刷新间隔时间，单位为毫秒
    const refreshInterval = 1000 * 60 * 90;

    // 设置提示时间，单位为毫秒
    const countdownDuration = 1000 * 10;

    // 显示倒计时的函数
    function showCountdown() {
        const countdownElement = document.createElement('div');
        countdownElement.style.position = 'fixed';
        countdownElement.style.top = '50%';
        countdownElement.style.left = '50%';
        countdownElement.style.transform = 'translate(-50%, -50%)';
        countdownElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        countdownElement.style.color = 'white';
        countdownElement.style.padding = '20px';
        countdownElement.style.borderRadius = '5px';
        countdownElement.style.zIndex = '10000';
        countdownElement.style.textAlign = 'center';

        document.body.appendChild(countdownElement);

        // 倒计时逻辑
        let countdown = countdownDuration / 1000;
        countdownElement.textContent = `页面将在 ${countdown} 秒后刷新。点击此处取消刷新。`;

        // 倒计时结束，刷新页面 
        const refreshTimer = setTimeout(function () {
            countdownElement.remove();
            window.location.reload();
        }, countdownDuration);

        // 刷新提示
        const countdownInterval = setInterval(function () {
            countdown--;
            countdownElement.textContent = `页面将在 ${countdown} 秒后刷新。点击此处取消刷新。`;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        // 添加点击事件以取消刷新
        countdownElement.addEventListener('click', function () {
            clearTimeout(refreshTimer);
            clearInterval(countdownInterval);
            countdownElement.remove();
            // 重新开始倒计时
            setTimeout(startRefreshCycle, refreshInterval - countdownDuration);
        });
    }

    // 启动刷新周期的函数
    // refreshInterval - countdownDuration，到这个时间点，显示刷新提示
    function startRefreshCycle() {
        setTimeout(showCountdown, refreshInterval - countdownDuration);
    }

    // 在页面加载后启动刷新周期
    window.addEventListener('load', startRefreshCycle);
})();
```