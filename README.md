# 华科网课助手（16倍全自动过视频）v1.0

一个为智慧华中大（华中科技大学）课程平台设计的**Tampermonkey**脚本v1.0，实现**16倍速播放、自动下一节、弹窗自动点击**，让网课学习更加高效。测试于2026年3月12日，完全由作者本人与Deepseek完成，仅做学习交流测试，实际使用导致的成绩或后台问题作者概不负责。

## 🌐 已测试范围

- **课程**：《研究生心理健康》。学习通知见：《关于修习《研究生心理健康》课程的通知： `http://gs.hust.edu.cn/info/1037/6656.htm`》。
- **平台**：仅在PC端的Edge浏览器最新版上的**Tampermonkey**扩展插件上测试。
- **网址**：仅在 `https://smartcourse.hust.edu.cn/mycourse/studentstudy*` 和`https://smartcourse.hust.edu.cn/mooc-smartcourse/mycourse/studentstudy*`网址上测试。更多网址可能可以在⚙️ 配置说明 中进行修改和扩展。

## ✨ 功能特性

- **16倍速播放**：强制锁定视频速度为16倍（浏览器上限），即使平台限制也能突破。

- **自动下一节**：视频结束后延迟1.5秒自动点击“下一节”按钮，无缝衔接。

- **弹窗自动处理**：当出现存在答题的页面时，会在知识点弹窗时，自动点击“下一节”按钮

- **自动播放**：新视频加载后自动尝试播放，若被浏览器阻止则自动静音播放。

- **防暂停**：检测到平台强制暂停时自动恢复播放，用户无法手动暂停。

## 📥 安装方法

1. 安装浏览器扩展 **Tampermonkey**（[Chrome版](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) / [Edge版](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)）。

2. 在以下链接获取脚本：  [**华科网课助手（16倍全自动过视频）**]([YouDengdeng/HUST-Online-Course-Helper: A Tampermonkey script designed for the HUST course platform, enabling 16x speed playback, automatic next section navigation, and automatic pop-up clicks to make online learning more efficient.](https://github.com/YouDengdeng/HUST-Online-Course-Helper)

3. 方法一：将`HUST-Online-Course-Helper v1.0.user.js`直接拖入浏览器即可。
   
   方法二：在浏览器扩展栏目内点击 **Tampermonkey** 按钮，得到下图。在这个界面点击**添加新脚本**，将脚本的内容复制粘贴，并用`Ctrl+S`保存即可。
   
   ![](C:\Users\Administrator\AppData\Roaming\marktext\images\2026-03-12-10-30-51-image.png)

4. 打开网课界面，注意该界面的网址需要与脚本中的`@match `相同，默认为`https://smartcourse.hust.edu.cn/mooc-smartcourse/mycourse/studentstudy*`

## ⚙️ 配置说明

- 默认速度为16倍，如需修改，打开脚本编辑界面，找到开头的常量 `TARGET_SPEED` 并改为你想要的值（如4、8、16等）。

- 视频停止后到点击下一节之间的延迟时间默认为1.5秒（1500毫秒），可修改 `DELAY_BEFORE_NEXT` 常量调整。

- 脚本仅在两个网址（见🌐 已测试范围）上进行过测试，如需其他域名请自行修改 `@match` 规则并测试。

## 💬 常见问题

- 如何开启/关闭该脚本：在`@match`所指的页面下，在浏览器扩展栏目内点击 **Tampermonkey**按钮，可以看到该脚本已启用。点击滑块可以切换脚本的开/关状态，刷新页面后即启用/禁用。
  
  ![](C:\Users\Administrator\AppData\Roaming\marktext\images\2026-03-12-10-39-07-image.png)

- 如何编辑和配置该脚本：在浏览器扩展栏目内点击 **Tampermonkey** 按钮，点击**管理面板**，在里面找到该脚本，编辑后按`Ctrl+S`保存即可。
  
  ![](C:\Users\Administrator\AppData\Roaming\marktext\images\2026-03-12-10-53-26-image.png)

- 有答题任务点怎么办：脚本默认看完该页面视频就跳转到下一节。答题需要大家自己去做。

## 🛠️ 开发与贡献

- 脚本完全开源，基于MIT许可证。

- 由超级灯灯子和Deepseek共同完成。

- 本地调试：克隆仓库后，在Tampermonkey中新建脚本，粘贴代码即可。

## 📌 注意事项

- 由于浏览器策略，视频可能无法自动播放，需用户首次点击页面后恢复正常。

- 若遇到弹窗点击失败，请确保脚本为最新版本，或检查控制台错误信息。

## 💝 特别致谢

感谢喵爪🐾🐾🐾

## 📄 许可证

[MIT](https://license/) © [超级灯灯子]
