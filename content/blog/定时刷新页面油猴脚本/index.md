---
title: 定时刷新页面油猴脚本
date: 2024-12-26T17:10:34+08:00
lastmod: 2024-12-26T17:10:34+08:00
author: Yu Yantao
draft: false
weight:
slug: 2024-12-26
tags: [ Tampermonkey ]
summary: 用一个简单的油猴脚本解决页面长时间不操作后自动退出的问题，并说明脚本里哪些时间参数可以按需调整。
description: 用一个简单的油猴脚本解决页面长时间不操作后自动退出的问题，并说明脚本里哪些时间参数可以按需调整。
---

> 如果文章中有不准确的地方，欢迎留言指正。

有些内部平台在长时间不操作后会自动退出登录。如果中途去处理别的事情，再回来继续操作时，页面已经失效，体验其实很差。

这个脚本的目标很简单：在页面接近超时时自动提醒，并在无人干预时刷新页面，尽量减少“回来发现已经掉线”的情况。

## 适用场景

这个脚本更适合下面这类场景：

- 页面长期打开，但中间可能有较长时间不操作
- 页面刷新不会丢失未保存数据
- 只是为了维持会话，不是为了刷接口或抢任务

如果页面上有未提交表单、编辑器内容或临时状态，就不建议直接使用自动刷新。

## 脚本

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
    const refreshInterval = 1000 * 60 * 5;

    // 设置提示时间，单位为毫秒
    const countdownDuration = 1000 * 10;

    const refreshCountElement = document.createElement('div');

    // 从 localStorage 获取刷新次数，如果没有则初始化为 0
    let refreshCount = parseInt(localStorage.getItem('refreshCount')) || 0;

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

    // 更新刷新次数
    function updateRefreshCount() {
        refreshCount++;
        localStorage.setItem('refreshCount', refreshCount);
        refreshCountElement.textContent = `刷新次数: ${refreshCount}`;
    }

    // 显示刷新次数的函数
    function showRefreshCount() {
        refreshCountElement.style.position = 'fixed';
        refreshCountElement.style.top = '0';
        refreshCountElement.style.left = '0';
        refreshCountElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        refreshCountElement.style.color = 'white';
        refreshCountElement.style.padding = '10px';
        refreshCountElement.style.borderRadius = '0 0 5px 0';
        refreshCountElement.style.zIndex = '10001';
        refreshCountElement.style.textAlign = 'left';

        document.body.appendChild(refreshCountElement);

        // 初始更新刷新次数
        updateRefreshCount();

        // 监听页面加载事件以更新刷新次数
        window.addEventListener('load', updateRefreshCount);
    }

    // 启动刷新周期的函数
    // refreshInterval - countdownDuration，到这个时间点，显示刷新提示
    function startRefreshCycle() {
        setTimeout(showCountdown, refreshInterval - countdownDuration);
    }

    // 在页面加载后启动刷新周期和显示刷新次数
    window.addEventListener('load', function () {
        startRefreshCycle();
        showRefreshCount();
    });
})();
```

## 可以按需调整的地方

如果后面要复用这段脚本，通常只需要改两个参数：

- `refreshInterval`：页面多久刷新一次
- `countdownDuration`：刷新前提醒用户的倒计时持续多久

另外，`@match` 一定要改成目标页面地址，避免脚本误作用到不相关页面。

## 使用注意

这类脚本虽然简单，但最好只用在你明确知道页面行为的场景里。  
如果页面刷新会触发重复提交、状态丢失或者额外副作用，就应该换成更稳妥的保活方案，而不是直接自动刷新。

## 总结

这个脚本本质上是用最少代码解决一个很具体的使用痛点：页面长时间不操作后自动失效。  
它不复杂，但只要把提醒、取消刷新和刷新次数这些细节补上，日常使用体验会好很多。
