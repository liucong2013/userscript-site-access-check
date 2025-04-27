# userscript-site-access-check

[🇨🇳 中文](#中文) | [🌍 English](#english)

---

## 🇨🇳 中文 <a name="中文"></a>

### 简介

`userscript-site-access-check` 是一个 Tampermonkey 用户脚本，帮助你限制对特定网站的访问。访问受限网站时会显示自定义确认页面，防止冲动浏览，培养专注习惯。

### 主要功能

- 支持主域名及其所有子域名的访问限制
- 可自定义拦截提示页面内容
- 在页面加载初期即生效（`document_start`）
- 通过 Tampermonkey 菜单动态添加受限域名
- 多种放行方式（30分钟、今日、本次会话）及倒计时提示
- 完全兼容 Tampermonkey

### 安装方法

1. 安装 Tampermonkey 浏览器扩展。
2. 点击本仓库中的原始脚本文件链接（通常命名为 `userscript-site-access-check.user.js`）。
3. Tampermonkey 会自动检测到脚本并提示安装。
4. 检查脚本权限并点击“安装”。

### 如何配置和使用

1. 安装脚本后，点击浏览器右上角 Tampermonkey 图标，选择“管理面板”。
2. 在已安装脚本列表中找到 `userscript-site-access-check`。
3. 访问你想要限制的网站页面。
4. 点击 Tampermonkey 图标，在菜单中选择“➕ 将当前域名添加到限制列表”。
5. 该域名将被加入受限列表，后续访问会自动弹出确认页面。
6. 确认页面支持三种放行方式：
   - 30分钟内不再提示
   - 今日剩余时间不再提示
   - 仅本次会话放行
7. 放行后页面右上角会显示剩余倒计时，双击可关闭提示。
8. 如需移除受限域名，可在 Tampermonkey 编辑器中手动清除 GM_Value 存储的相关域名，或重置脚本存储。

### 进阶说明

- 所有受限域名通过 Tampermonkey 的 GM_Value 机制持久存储，无需手动修改脚本代码。
- 支持主域名及其所有子域名自动匹配。
- 可自定义确认页面内容，修改 `showRestrictionPage()` 函数内的 HTML。
- 支持通过菜单命令随时添加当前域名。

### 贡献

如有建议或发现问题，欢迎提交 Issue 或 Pull Request。

### 许可证

Apache License 2.0

---

## 🌍 English  <a name="english"></a>

### Project Description

`userscript-site-access-check` is a Tampermonkey userscript to help you restrict access to specific websites. When you visit a restricted site, a custom confirmation page is shown to prevent impulsive browsing and encourage focus.

### Features

* Restrict access by base domain and all subdomains
* Customizable confirmation/intercept page
* Runs at `document_start` for early intervention
* Dynamically add restricted domains via Tampermonkey menu
* Multiple confirmation options (30 minutes, today, session) with countdown display
* Fully compatible with Tampermonkey

### Installation

1. Install the Tampermonkey browser extension.
2. Click the raw script file link (usually named `userscript-site-access-check.user.js`) in this repository.
3. Tampermonkey will detect the script and prompt you to install.
4. Review permissions and click "Install".

### Configuration & Usage

1. After installation, click the Tampermonkey icon and open the dashboard.
2. Find `userscript-site-access-check` in your installed scripts.
3. Visit the website you want to restrict.
4. Click the Tampermonkey icon and select "➕ Add current domain to restricted list" from the menu.
5. The domain will be added to the restricted list and future visits will trigger the confirmation page.
6. The confirmation page offers three options:
   - Allow for 30 minutes
   - Allow for the rest of today
   - Allow for this session only
7. After confirmation, a countdown appears at the top right; double-click to close it.
8. To remove a domain, manually clear the relevant GM_Value in Tampermonkey storage or reset the script storage.

### Advanced

- All restricted domains are stored persistently via Tampermonkey's GM_Value, no need to edit script code.
- Base domain and all subdomains are matched automatically.
- Confirmation page content can be customized by editing the `showRestrictionPage()` function.
- Add domains anytime via the menu command.

### Contributing

Suggestions and issues are welcome via Issues or Pull Requests.

### License

Apache License 2.0