# 微信读书 桌面客户端 / WeRead_Desktop
微信读书（网页版）桌面客户端 (非官方) / WeRead Desktop Client (Unofficial)

英文说明 / English version: [README](README.md) 

![](/assets/screenshots/WeRead_for_macOS-v1.0.0.webp)

 ## 描述：
 微信读书网页版的桌面客户端程序-基于 Electron。支持 macOS (Intel, M1), Windows, Linux。

 根据 Electron Quick Start 进行简单修改完成，本质上就是一个能打开微信读书网页版的套壳浏览器 App。

 基于 Intel Mac开发，macOS 的程序为 Universal 构建，理论上支持 Apple Silicon (M1) 但未经测试，欢迎反馈。

## 特性：
- 基于 Electron 17.0.0 和 Chromium 98。
- 支持 macOS, Windows, Linux。
- 在 Electron [Quick Start](https://www.electronjs.org/docs/latest/tutorial/quick-start) 的基础上只进行了最低限度的改动。
- 高清图标，适配 macOS Big Sur 之后的设计风格。

## 更新：
- v1.0.2 重新整理目录，构建工具改为 electron-builder，增加了对 Apple Silicon, Windows, 和 Linux 的支持。

- v1.0.1 仅更新了 README 文件。

- v1.0.0 初版，仅支持 Mac (Intel)，使用 electron-packager 构建。



## 安装:
- ### Mac (Intel 和 M1):
    - 下载最新的 [DMG 文件](https://github.com/NeilYXIN/WeRead_mac/releases)。
    - 打开 DMG 文件，拖动图标到应用程序文件夹即可。

- ### Windows:
    - (待更新)

- ### Linux:
    - (待更新)


## 构建说明 (electron-builder)：
### 构建应用程序: 
package.json 文件支持 macOS, Windows, Linux 的应用程序构建。 

在项目根目录打开命令行，运行以下命令：

<code>$ npm run package-mac</code>

应用程序安装包在 *release-builds* 目录下。

## Notes：
本人并不太懂 Electron，相关开发经验仅限于此，本项目只是方便个人日常使用。

个人缺乏web开发经验，从代码到构建/分发脚本都是一团浆糊，仅仅能用，按上面步骤可以在 Mac 上进行构建打包，如果使用其他方法则需要进一步修改完善。

欢迎参与贡献，我会尽力学习更新。
