# userscript-site-access-check

[🇨🇳 中文](#中文) | [🌎 English](#english)

---


## 🇨🇳 中文 <a name="中文"></a>

### 项目描述

`userscript-site-access-check` 是一个 Tampermonkey 用户脚本，旨在帮助您管理和控制对特定网站的访问。安装此脚本后，您可以定义一个网站列表，当访问这些网站时，它们将被阻止并替换为一个自定义的确认页面。这有助于防止冲动浏览，并鼓励有意识的在线习惯。

### 功能特性

*   **网站限制：** 定义您想要限制访问的 URL 或 URL 模式列表。
*   **自定义确认页面：** 当访问受限网站时，不会加载原始内容，而是显示一个简单、可定制的 HTML 页面。
*   **早期介入：** 脚本在 `document_start` 时运行，确保在页面加载过程的早期尽可能地进行干预。
*   **易于配置：** 直接修改脚本代码即可更新受限网站列表和确认页面的内容。
*   **兼容 Tampermonkey：** 与 Tampermonkey 浏览器扩展无缝协作。

### 如何安装

1.  确保您的浏览器（Chrome、Firefox、Edge、Safari 等）已安装 Tampermonkey 浏览器扩展。您可以从浏览器的扩展商店下载。
2.  点击此仓库中的原始脚本文件链接（通常命名为 `userscript-site-access-check.user.js`）。
3.  Tampermonkey 将自动检测到脚本并提示您安装。
4.  检查脚本的权限并点击“安装”。

### 如何配置

1.  打开 Tampermonkey 控制面板。
2.  在您已安装的脚本列表中找到 `userscript-site-access-check` 脚本。
3.  点击脚本名称打开编辑器。
4.  **添加受限网站：** 在脚本代码中找到 `restrictedSites` 数组。将您想要限制的网站的 URL 或 URL 模式（如果需要，可以使用正则表达式）添加到此数组中。
    ```javascript
    const restrictedSites = [
        // 在此处添加您的受限网站
        "https://www.example.com",
        "https://another-site.org/some/path",
        /https:\/\/social\.media\.com\/.*/ // 使用正则表达式的示例
    ];
    ```
    请记住使用逗号分隔条目。
5.  **自定义确认页面：** 找到 `showRestrictionPage()` 函数。您可以修改此函数中反引号（\`）内的 HTML 内容，以更改限制页面的外观和消息。
6.  在 Tampermonkey 编辑器中保存脚本（通常点击软盘图标或按 Ctrl+S/Cmd+S）。

### 使用方法

安装并配置完成后，当您尝试访问与您的 `restrictedSites` 列表匹配的网站时，脚本将自动运行。

### 贡献

如果您有改进建议或发现问题，请随时开启一个 Issue 或提交 Pull Request。

### 许可证

[在此处指定您的许可证，例如 MIT 许可证]




---

## 🌍 English  <a name="english"></a>

### Project Description

`userscript-site-access-check` is a Tampermonkey userscript designed to help you manage and control your access to specific websites. By installing this script, you can define a list of websites that, when accessed, will be blocked and replaced with a custom confirmation page. This helps prevent impulsive browsing and encourages mindful online habits.

### Features

*   **Website Restriction:** Define a list of URLs or URL patterns that you want to restrict access to.
*   **Custom Confirmation Page:** When a restricted site is accessed, instead of loading the original content, a simple, customizable HTML page is displayed.
*   **Early Intervention:** The script runs at `document_start`, ensuring it intervenes as early as possible in the page loading process.
*   **Easy Configuration:** Modify the script code directly to update the list of restricted websites and the content of the confirmation page.
*   **Tampermonkey Compatible:** Works seamlessly with the Tampermonkey browser extension.

### How to Install

1.  Make sure you have the Tampermonkey browser extension installed on your browser (Chrome, Firefox, Edge, Safari, etc.). You can download it from your browser's extension store.
2.  Click on the raw script file link (usually named `userscript-site-access-check.user.js`) in this repository.
3.  Tampermonkey will automatically detect the script and prompt you to install it.
4.  Review the script's permissions and click "Install".

### How to Configure

1.  Open the Tampermonkey Dashboard.
2.  Find the `userscript-site-access-check` script in your list of installed scripts.
3.  Click on the script name to open the editor.
4.  **To add restricted websites:** Find the `restrictedSites` array in the script code. Add the URLs or URL patterns (using regular expressions if needed) of the websites you want to restrict to this array.
    ```javascript
    const restrictedSites = [
        // Add your restricted sites here
        "https://www.example.com",
        "https://another-site.org/some/path",
        /https:\/\/social\.media\.com\/.*/ // Example using regex
    ];
    ```
    Remember to separate entries with commas.
5.  **To customize the confirmation page:** Find the `showRestrictionPage()` function. You can modify the HTML content within the backticks (\`) inside this function to change the appearance and message of the restriction page.
6.  Save the script in the Tampermonkey editor (usually by clicking the floppy disk icon or pressing Ctrl+S/Cmd+S).

### Usage

Once installed and configured, the script will automatically run whenever you try to visit a website matching your `restrictedSites` list.

### Contributing

If you have suggestions for improvements or find issues, feel free to open an issue or submit a pull request.

### License

[Specify your license here, e.g., MIT License]


---