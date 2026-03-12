// ==UserScript==
// @name         华科网课助手（16倍速过视频并自动跳转）
// @namespace    https://github.com/YouDengdeng/HUST-Online-Course-Helper
// @version      1.0
// @description  16倍速 + 自动播放 + 视频结束1.5秒后点击正常下一节，
// @author       YouDengdeng
// @license      MIT
// @match        https://smartcourse.hust.edu.cn/mooc-smartcourse/mycourse/studentstudy*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 华科网课助手启动（最终版）');

    const TARGET_SPEED = 16;
    const VIDEO_IFRAME_URL_PATTERN = '/ananas/modules/video/index.html';
    const NORMAL_NEXT_BTN_ID = 'right1';
    const POPUP_NEXT_BTN_SELECTOR = 'a.bluebtn02.prebutton.nextChapter';
    const DELAY_BEFORE_NEXT = 1500;

    let userPaused = false;
    let nextClickTimer = null;
    let lastPopupClickTime = 0;
    const POPUP_CLICK_COOLDOWN = 2000;
    let videoEnded = false;

    // 检测用户点击暂停按钮
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('.vjs-play-control, [aria-label="暂停"], [title="暂停"]')) {
            userPaused = true;
            console.log('👤 用户主动暂停');
            setTimeout(() => { userPaused = false; }, 500);
        }
    }, true);

    // 查找包含视频的窗口
    function findVideoWindow() {
        function search(win) {
            try {
                if (win.location?.pathname?.includes(VIDEO_IFRAME_URL_PATTERN)) {
                    if (win.document.querySelector('video')) {
                        return win;
                    }
                }
                for (let i = 0; i < win.frames.length; i++) {
                    try {
                        const found = search(win.frames[i]);
                        if (found) return found;
                    } catch (e) {}
                }
            } catch (e) {}
            return null;
        }
        return search(window);
    }

    // 尝试播放，处理中断和静音
    function tryPlay(video, retryCount = 0) {
        if (!video || video.ended) return;
        video.play().catch(err => {
            if (err.name === 'AbortError') {
                const delay = Math.min(1000 * Math.pow(1.5, retryCount), 5000);
                console.log(`⏳ 播放被中断，${delay}ms后重试...`);
                setTimeout(() => tryPlay(video, retryCount + 1), delay);
            } else if (err.name === 'NotAllowedError') {
                console.log('🔇 自动播放被浏览器阻止，尝试静音播放');
                video.muted = true;
                video.play().catch(e => {
                    console.log('静音播放失败', e);
                }).then(() => {
                    console.log('🔇 已静音播放，如需声音请手动取消静音');
                });
            } else {
                console.log('自动播放失败', err);
            }
        });
    }

    // 劫持视频 playbackRate
    function hijackVideo(video) {
        if (video.__hijacked) return;
        video.__hijacked = true;

        videoEnded = false; // 新视频重置标志

        const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
        if (descriptor && descriptor.set) {
            Object.defineProperty(video, 'playbackRate', {
                get: function() { return this._myRate || TARGET_SPEED; },
                set: function(val) {
                    this._myRate = TARGET_SPEED;
                    descriptor.set.call(this, TARGET_SPEED);
                },
                configurable: true
            });
        }
        video.playbackRate = TARGET_SPEED;
        console.log('⚡ 视频速度已锁定为', TARGET_SPEED);

        tryPlay(video);

        video.addEventListener('pause', () => {
            if (video.ended) return;
            if (userPaused) {
                console.log('⏸️ 用户暂停，不干预');
                return;
            }
            console.log('🔄 检测到自动暂停，恢复播放');
            tryPlay(video);
        });

        video.removeEventListener('ended', onVideoEnded);
        video.addEventListener('ended', onVideoEnded);
    }

    // 视频结束处理
    function onVideoEnded(event) {
        videoEnded = true;
        console.log(`🎬 视频结束，等待 ${DELAY_BEFORE_NEXT/1000} 秒后尝试点击正常下一节...`);
        if (nextClickTimer) clearTimeout(nextClickTimer);
        nextClickTimer = setTimeout(() => {
            console.log('⏰ 延迟结束，尝试点击正常下一节');
            clickNormalNext();
            nextClickTimer = null;
        }, DELAY_BEFORE_NEXT);
    }

    // 模拟真实点击（仅用于正常下一节按钮）
    function simulateClick(element) {
        const event = new MouseEvent('click', {
            view: element.ownerDocument.defaultView,
            bubbles: true,
            cancelable: true,
            composed: true,
            clientX: 0,
            clientY: 0,
            button: 0,
            buttons: 1
        });
        element.dispatchEvent(event);
    }

    // 点击正常下一节
    function clickNormalNext() {
        if (nextClickTimer) {
            clearTimeout(nextClickTimer);
            nextClickTimer = null;
        }
        let btn = findElementInAllWindows(NORMAL_NEXT_BTN_ID, 'id');
        if (btn) {
            simulateClick(btn);
            console.log('✅ 模拟点击了正常下一节按钮');
            return true;
        } else {
            console.log('ℹ️ 未找到正常下一节按钮');
            return false;
        }
    }

    // 从onclick字符串中提取PCount.next参数并调用
    function callPCountNextFromButton(btn) {
        const onclick = btn.getAttribute('onclick');
        if (!onclick) return false;
        // 匹配 PCount.next('...', '...', ...)
        const match = onclick.match(/PCount\.next\(([^)]+)\)/);
        if (!match) return false;
        const argsStr = match[1];
        // 解析参数，处理引号、逗号和布尔值
        const args = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';
        for (let i = 0; i < argsStr.length; i++) {
            const ch = argsStr[i];
            if ((ch === "'" || ch === '"') && !inQuote) {
                inQuote = true;
                quoteChar = ch;
            } else if (ch === quoteChar && inQuote) {
                inQuote = false;
                args.push(current);
                current = '';
            } else if (ch === ',' && !inQuote) {
                if (current.trim() !== '') {
                    args.push(current.trim());
                }
                current = '';
            } else {
                current += ch;
            }
        }
        if (current.trim() !== '') {
            args.push(current.trim());
        }
        // 清理参数：去除引号，转换布尔值
        const cleanArgs = args.map(arg => {
            arg = arg.trim();
            if ((arg.startsWith("'") && arg.endsWith("'")) || (arg.startsWith('"') && arg.endsWith('"'))) {
                return arg.slice(1, -1);
            }
            if (arg === 'true') return true;
            if (arg === 'false') return false;
            return arg;
        });
        // 获取按钮所在窗口的PCount对象
        const win = btn.ownerDocument.defaultView;
        if (win && typeof win.PCount?.next === 'function') {
            try {
                win.PCount.next(...cleanArgs);
                console.log('✅ 直接调用PCount.next成功', cleanArgs);
                return true;
            } catch (e) {
                console.log('直接调用PCount.next失败', e);
            }
        } else {
            console.log('PCount.next不可用');
        }
        return false;
    }

    // 点击弹窗中的下一节（直接调用PCount.next，绕过WAY.box.hide）
    function clickPopupNext() {
        if (!videoEnded) return false; // 只有视频结束才可能点击弹窗
        if (Date.now() - lastPopupClickTime < POPUP_CLICK_COOLDOWN) return false;

        let btn = findElementInAllWindows(POPUP_NEXT_BTN_SELECTOR, 'selector');
        if (!btn) return false;

        // 清除延迟定时器，防止旧页面残留
        if (nextClickTimer) {
            clearTimeout(nextClickTimer);
            nextClickTimer = null;
            console.log('⏱️ 清除延迟点击定时器（弹窗已点击）');
        }

        // 优先直接调用PCount.next
        if (callPCountNextFromButton(btn)) {
            lastPopupClickTime = Date.now();
            return true;
        }

        // 如果直接调用失败，回退到模拟点击（但可能触发WAY.box.hide错误）
        simulateClick(btn);
        lastPopupClickTime = Date.now();
        console.log('⚠️ 模拟点击了弹窗中的下一节按钮（回退）');
        return true;
    }

    // 通用查找元素
    function findElementInAllWindows(selectorOrId, type = 'selector') {
        function search(win) {
            try {
                let el;
                if (type === 'id') {
                    el = win.document.getElementById(selectorOrId);
                } else {
                    el = win.document.querySelector(selectorOrId);
                }
                if (el) return el;
                for (let i = 0; i < win.frames.length; i++) {
                    try {
                        let found = search(win.frames[i]);
                        if (found) return found;
                    } catch (e) {}
                }
            } catch (e) {}
            return null;
        }
        return search(window);
    }

    // 监控弹窗按钮
    function observePopupButton() {
        setInterval(() => {
            clickPopupNext();
        }, 1000);
    }

    // MutationObserver 监控新视频
    function observeNewVideos() {
        function checkAndHijack(win) {
            try {
                win.document.querySelectorAll('video').forEach(video => hijackVideo(video));
            } catch (e) {}
            for (let i = 0; i < win.frames.length; i++) {
                try {
                    checkAndHijack(win.frames[i]);
                } catch (e) {}
            }
        }
        const observer = new MutationObserver(() => {
            checkAndHijack(window);
        });
        observer.observe(document, { childList: true, subtree: true });
    }

    // 主循环
    function applyToVideo() {
        const videoWin = findVideoWindow();
        if (!videoWin) return;
        const video = videoWin.document.querySelector('video');
        if (video) hijackVideo(video);
    }

    // 启动
    setInterval(applyToVideo, 1000);
    applyToVideo();
    observePopupButton();
    observeNewVideos();
})();