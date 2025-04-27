// ==UserScript==
// @name         网站访问确认脚本
// @namespace    https://github.com/liucong2013/userscript-site-access-check
// @version      1.3
// @description  限制指定主域名及其所有子域名的访问，显示确认页面，支持30分钟、今日内和本次会话不再提示，受限列表存储在 GM_Value 中，已确认页面显示倒计时，支持通过菜单添加当前域名到限制列表
// @author       lc cong
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @run-at       document_start
// @noframes
// @supportURL   https://raw.githubusercontent.com/liucong2013/userscript-site-access-check/refs/heads/main/README.md
// ==/UserScript==

(function() {
    'use strict';

    if (window.top !== window.self) {
        console.log("脚本在 iframe 中运行，退出或执行 iframe 特定逻辑");
        return;
          console.log("=======");
    }

    // --- 配置区 ---
    // GM_Value Key for the restricted domains list
    const RESTRICTED_DOMAINS_KEY = 'my_restricted_domains';

    // GM_Value Key Prefix for localStorage (长期和今日有效)
    const LOCAL_CONFIRM_KEY_PREFIX = 'confirmed_access_';
    // SessionStorage Key Prefix (本次会话有效) - 不再用于主要确认逻辑
    // const SESSION_CONFIRM_KEY_PREFIX = 'session_confirmed_access_';




    // --- 函数区 ---

    // 从 GM_Value 中读取受限域名列表
    function getRestrictedBaseDomains() {
        const domainsJson = GM_getValue(RESTRICTED_DOMAINS_KEY, '[]'); // 默认返回一个空数组的JSON字符串
        try {
            const domains = JSON.parse(domainsJson);
            // 确保读取的是数组
            if (!Array.isArray(domains)) {
                console.error("从 GM_Value 读取的受限域名列表不是数组，已重置。");
                GM_deleteValue(RESTRICTED_DOMAINS_KEY);
                return [];
            }
            return domains;
        } catch (e) {
            console.error("解析受限域名列表失败:", e);
            // 如果解析失败，返回一个空数组并清除可能损坏的存储值
            GM_deleteValue(RESTRICTED_DOMAINS_KEY);
            return [];
        }
    }

    // 将受限域名列表保存到 GM_Value 中
    function setRestrictedBaseDomains(domainsArray) {
        try {
            GM_setValue(RESTRICTED_DOMAINS_KEY, JSON.stringify(domainsArray));
        } catch (e) {
            console.error("保存受限域名列表失败:", e);
        }
    }

    // 检查当前域名是否在限制列表中的某个主域名或其子域名下
    function isRestricted(hostname) {
        const restrictedBaseDomains = getRestrictedBaseDomains(); // 从 GM_Value 读取列表
        return restrictedBaseDomains.some(baseDomain => {
            if (hostname === baseDomain) {
                return true;
            }
            // 检查是否以 '.' + 主域名 结尾，即是子域名
            // 同时确保 hostname 比 baseDomain 长，避免意外匹配 (例如 'com' 匹配 'example.com')
            if (hostname.endsWith('.' + baseDomain) && hostname.length > baseDomain.length + 1) {
                return true;
            }
            return false;
        });
    }


    // 获取今天结束时的 Unix 时间戳 (毫秒)
    function getEndOfTodayTimestamp() {
        const now = new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return endOfToday.getTime();
    }

    // 检查当前网站是否已被用户通过 localStorage 确认且未过期
    function isLocalConfirmedAndNotExpired(hostname) {
        const storedData = GM_getValue(LOCAL_CONFIRM_KEY_PREFIX + hostname, null);
        if (!storedData) {
            return false;
        }

        try {
            const confirmInfo = JSON.parse(storedData);
            const now = Date.now();

            if (confirmInfo.expiryType === '30min') {
                const expiryTime = confirmInfo.timestamp + 30 * 60 * 1000;
                return now < expiryTime;
            } else if (confirmInfo.expiryType === '5min') {
                const expiryTime = confirmInfo.timestamp + 5 * 60 * 1000;
                return now < expiryTime;
            } else if (confirmInfo.expiryType === 'today') {
                const endOfToday = getEndOfTodayTimestamp();
                // 检查确认时间戳是否是今天（防止跨天后 today 确认仍然有效）
                const confirmDate = new Date(confirmInfo.timestamp);
                const nowDate = new Date(now); // 从时间戳创建 Date 对象
                const todayStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()); // 获取今天开始的时间
                if (confirmDate < todayStart) {
                    // 确认时间是昨天或更早，已过期
                    return false;
                }
                return now < endOfToday;
            }

            return false;
        } catch (e) {
            console.error("解析 localStorage 确认状态失败:", e);
            GM_deleteValue(LOCAL_CONFIRM_KEY_PREFIX + hostname);
            return false;
        }
    }

    // 检查当前网站是否已被用户通过 sessionStorage 确认 (不再用于主要确认逻辑)
    /*
    function isSessionConfirmed(hostname) {
        try {
            return sessionStorage.getItem(SESSION_CONFIRM_KEY_PREFIX + hostname) === 'true';
        } catch (e) {
            console.error("访问 sessionStorage 失败:", e);
            return false;
        }
    }
    */


    // 标记当前网站已被用户通过 localStorage 确认，并设置过期时间
    function setLocalConfirmed(hostname, expiryType) {
        const confirmInfo = {
            timestamp: Date.now(),
            expiryType: expiryType
        };
        GM_setValue(LOCAL_CONFIRM_KEY_PREFIX + hostname, JSON.stringify(confirmInfo));
    }

    // 标记当前网站已被用户通过 sessionStorage 确认 (不再用于主要确认逻辑)
    /*
    function setSessionConfirmed(hostname) {
        try {
            sessionStorage.setItem(SESSION_CONFIRM_KEY_PREFIX + hostname, 'true');
        } catch (e) {
            console.error("写入 sessionStorage 失败:", e);
        }
    }
    */


    // 显示限制页面
    function showRestrictionPage(hostname) {
        // 确保在页面加载早期清空内容
        if (document.documentElement) document.documentElement.innerHTML = '';
        if (document.head) document.head.innerHTML = '';

        GM_addStyle(`
            body {
                font-family: sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f0f0f0;
                margin: 0;
            }
            .restriction-container {
                background-color: #fff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 500px;
            }
            h1 {
                color: #d9534f;
                margin-bottom: 20px;
            }
            p {
                color: #555;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            .button-container button {
                background-color: #5cb85c;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 15px;
                margin: 5px 5px;
                transition: background-color 0.3s ease;
            }
            .button-container button:hover {
                background-color: #4cae4c;
            }
             .button-container {
                margin-top: 20px;
            }
        `);

        const restrictionHTML = `
            <div class="restriction-container">
                <h1>⚠️ 访问受限</h1>
                <p>您正尝试访问的网站 <strong>${hostname}</strong> 已被标记为受限。请确认您希望继续访问，并选择本次确认的有效时长。</p>
                <div class="button-container">
                    <button id="confirm-30min">在接下来的 30 分钟内不再提示</button>
                    <button id="confirm-today">今天剩余时间内不再提示</button>
                    <button id="confirm-5min">允许访问 5 分钟</button>
                </div>
            </div>
        `;

        // 确保 body 存在后再添加内容
        if (!document.body) {
            const body = document.createElement('body');
            document.documentElement.appendChild(body);
        }
        document.body.innerHTML = restrictionHTML;

        document.getElementById('confirm-30min').addEventListener('click', () => {
            setLocalConfirmed(hostname, '30min');
            window.location.reload();
        });

        document.getElementById('confirm-today').addEventListener('click', () => {
            setLocalConfirmed(hostname, 'today');
            window.location.reload();
        });

        document.getElementById('confirm-5min').addEventListener('click', () => {
            setLocalConfirmed(hostname, '5min');
            window.location.reload();
        });
    }

    // 在页面右上角显示倒计时
    function showCountdown(hostname, expiryType, timestamp) {
        // 确保 body 存在才能添加元素
        if (!document.body) {
            console.warn("页面body未加载，无法显示倒计时。");
            return;
        }

        GM_addStyle(`
            #restriction-countdown {
                position: fixed;
                top: 70px;
                right: 10px;
                background-color: rgba(255, 255, 255, 0.9);
                border: 1px solid #ccc;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 9999; /* 确保显示在最上层 */
                box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                 color: black;
                 cursor: pointer; /* 添加 cursor: pointer 提示用户可以交互 */
            }
        `);

        const countdownDiv = document.createElement('div');
        countdownDiv.id = 'restriction-countdown';
        document.body.appendChild(countdownDiv);

        // --- 添加双击事件监听器 ---
        countdownDiv.addEventListener('dblclick', () => {
            if (countdownDiv.parentNode) { // 确保元素还在页面中
                countdownDiv.parentNode.removeChild(countdownDiv);
                // 可选：清除倒计时 interval，避免内存泄漏（如果存在的话）
                // clearInterval(intervalId); // 你可能需要将 intervalId 定义在更广的范围才能在这里访问
            }
        });
        // --- 双击事件监听器结束 ---


        function updateCountdown() {
            const now = Date.now();
            let remainingTime = 0;
            let expiryLabel = '';
            let isExpired = false;

            if (expiryType === '30min') {
                const expiryTime = timestamp + 30 * 60 * 1000;
                remainingTime = expiryTime - now;
                expiryLabel = '剩余时间';
                if (remainingTime <= 0) isExpired = true;
            } else if (expiryType === 'today') {
                const endOfToday = getEndOfTodayTimestamp();
                remainingTime = endOfToday - now;
                expiryLabel = '今天剩余';
                // 额外检查确认时间是否是今天
                const confirmDate = new Date(timestamp);
                const today = new Date(now);
                if (confirmDate.getFullYear() !== today.getFullYear() || confirmDate.getMonth() !== today.getMonth() || confirmDate.getDate() !== today.getDate()) {
                    isExpired = true; // 确认时间不是今天，已过期
                } else if (remainingTime <= 0) {
                    isExpired = true; // 今天时间已过
                }

            } else if (expiryType === '5min') {
                const expiryTime = timestamp + 5 * 60 * 1000;
                remainingTime = expiryTime - now;
                expiryLabel = '剩余时间 (5分钟)';
                if (remainingTime <= 0) isExpired = true;
            }


            if (isExpired) {
                countdownDiv.textContent = `❌ 确认已过期`;
                // 可选：如果确认过期，可以考虑重新触发限制逻辑
                // 注意：直接 window.location.reload() 可能导致无限循环
                // 更好的做法是清除确认状态，然后让脚本在下一次页面加载时重新判断
                // GM_deleteValue(LOCAL_CONFIRM_KEY_PREFIX + hostname);
                // 当过期时也清除 interval
                if (intervalId) {
                    clearInterval(intervalId);
                }
                return;
            }

            const seconds = Math.floor((remainingTime / 1000) % 60);
            const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
            const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

            let timeString = '';
            if (days > 0) {
                timeString += `${days}天`;
            }
            if (hours > 0 || days > 0) { // 如果有天或小时，显示小时
                timeString += `${hours}小时`;
            }
            if (minutes > 0 || hours > 0 || days > 0) { // 如果有小时、天或分钟，显示分钟
                timeString += `${minutes}分钟`;
            }
            // 总是显示秒，除非时间很长
            if (days === 0 && hours === 0 && minutes < 5) { // 剩余时间较短时显示秒
                timeString += `${seconds}秒`;
            } else if (timeString === '') { // 如果时间非常短，只显示秒
                timeString = `${seconds}秒`;
            }


            countdownDiv.textContent = `⏳ ${expiryLabel}: ${timeString}`;
        }

        // 立即更新一次
        updateCountdown();
        // 每秒更新，直到过期
        // 将 intervalId 定义在 showCountdown 作用域内，以便在 dblclick 和过期时清除
        const intervalId = setInterval(updateCountdown, 1000);

        // 当页面卸载时尝试清除 interval（可选，但有助于清理）
        window.addEventListener('beforeunload', () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        });
    }



    // --- 菜单命令函数 ---

    function addCurrentDomainToRestrictedList() {
        const currentHostname = window.location.hostname;
        if (!currentHostname) {
            alert("无法获取当前域名。");
            return;
        }

        const restrictedDomains = getRestrictedBaseDomains();

        // 检查域名是否已在列表中
        if (restrictedDomains.includes(currentHostname)) {
            alert(`域名 "${currentHostname}" 已在限制列表中。`);
            return;
        }

        // 添加域名到列表
        restrictedDomains.push(currentHostname);
        setRestrictedBaseDomains(restrictedDomains);

        alert(`域名 "${currentHostname}" 已添加到限制列表。`);

        // 可选：添加后立即刷新页面应用限制（如果当前页面不是受限页面）
        // if (!isRestricted(currentHostname)) {
        //     window.location.reload();
        // }
    }

    // 注册菜单命令
    GM_registerMenuCommand("➕ 将当前域名添加到限制列表", addCurrentDomainToRestrictedList);
    // 如果当前域名已在限制列表，注册移除菜单命令



    // --- 主逻辑 ---

    const currentHostname = window.location.hostname;



    // 首先通过 isRestricted 函数判断当前域名是否在限制范围内
    if (isRestricted(currentHostname)) {

        GM_registerMenuCommand("🗑️ 将当前域名从限制列表移除", function() {
            const restrictedDomains = getRestrictedBaseDomains();
            const idx = restrictedDomains.indexOf(currentHostname);
            if (idx !== -1) {
                restrictedDomains.splice(idx, 1);
                setRestrictedBaseDomains(restrictedDomains);
                alert(`域名 \"${currentHostname}\" 已从限制列表移除。`);
                // 可选：移除后刷新页面
                // window.location.reload();
            } else {
                alert(`域名 \"${currentHostname}\" 不在限制列表中。`);
            }
        });

        // 如果是受限域名，则检查是否已确认
        // const sessionConfirmed = isSessionConfirmed(currentHostname); // 不再需要会话确认
        const localConfirmedData = GM_getValue(LOCAL_CONFIRM_KEY_PREFIX + currentHostname, null);
        let localConfirmedInfo = null;
        try {
            if (localConfirmedData) {
                localConfirmedInfo = JSON.parse(localConfirmedData);
            }
        } catch (e) {
            console.error("解析本地确认信息失败:", e);
            GM_deleteValue(LOCAL_CONFIRM_KEY_PREFIX + currentHostname); // 清除损坏的数据
        }
        const localConfirmedAndNotExpired = isLocalConfirmedAndNotExpired(currentHostname);


        // 如果没有未过期的本地确认 (包括 30min, today, 5min)
        if (!localConfirmedAndNotExpired) {
            console.log(`访问 ${currentHostname} 受限，显示确认页面...`);
            showRestrictionPage(currentHostname);
        } else {
            // 如果有任何一种有效确认，则允许正常加载
            console.log(`访问 ${currentHostname} 已放行.`);

            // 在已放行的受限网站上显示倒计时
            if (localConfirmedAndNotExpired && localConfirmedInfo) {
                showCountdown(currentHostname, localConfirmedInfo.expiryType, localConfirmedInfo.timestamp);
            }
        }
    } else {
        // 如果不在限制范围内，则直接放行
        // console.log(`访问 ${currentHostname} 不在限制列表中，已放行.`); // 可以选择不打印这条日志
    }

})();
