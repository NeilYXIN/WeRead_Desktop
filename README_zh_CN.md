# 微信读书 桌面版客户端 / WeRead_Desktop
微信读书（网页版）桌面版客户端 (非官方) / WeRead Desktop App (Unofficial)

英文说明 / English version: [README](README.md) 

![](/assets/screenshots/WeRead_for_macOS-v1.0.0.webp)

 ## 描述：
 微信读书网页版的桌面客户端程序-基于 Electron。支持 macOS (Intel, M1), Windows, Linux。

 根据 [Electron Quick Start](https://www.electronjs.org/docs/latest/tutorial/quick-start) 的基础进行最低限度的改动完成，本质上就是一个能打开微信读书网页版的套壳浏览器 app。

## 特性：
- 基于 Electron 28.2.0 和 Chromium 120.
- 支持 macOS, Windows, Linux。
- 高清图标，适配 macOS Big Sur 之后的设计风格。

## 更新：
- v1.0.3 更新了 electron 和 electron-build 版本。

- v1.0.2 重新整理目录，构建工具改为 electron-builder，增加了对 Apple Silicon, Windows, 和 Linux 的支持。

- v1.0.1 仅更新了 README 文件。

- v1.0.0 初版，仅支持 Mac (Intel)，使用 electron-packager 构建。

## 下载: 
- [最新 Release](https://github.com/NeilYXIN/WeRead_Desktop/releases/latest)
- [Mac 安装包 (Universal)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.3/WeRead-1.0.3-universal.dmg)
- [Windows 安装包 (x64)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.3/WeRead.Setup.1.0.3.exe)
- [Linux 安装包 (deb)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.3/weread_1.0.3_amd64.deb)
- [Linux 程序文件 (AppImage)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.3/WeRead-1.0.3.AppImage)

## 安装:
- ### Mac (Intel 和 M1):
    - 下载 dmg 安装包。
    - 打开 dmg 文件，拖动图标到应用程序文件夹即可。

- ### Windows:
    - 下载 exe 安装包。
    - 打开安装包后自动完成安装。

- ### Linux:
    - 方式 1: deb 安装包
        - 下载 deb 安装包。
        - 打开并点击安装。

    - 方式 2: AppImage 程序文件
        - 下载至喜好的文件夹后直接打开运行 (需要可执行权限)。

## 构建说明 (electron-builder)：
### 构建应用程序: 
package.json 文件支持 macOS, Windows, Linux 的应用程序构建。 

在项目根目录打开命令行，运行以下命令：

<code>$ npm run dist</code>

应用程序安装包在 *release-builds* 目录下。

## Notes：
本人并不太懂 Electron，相关开发经验仅限于此，本项目只是方便个人日常使用。

欢迎参与贡献，我会尽力学习更新。