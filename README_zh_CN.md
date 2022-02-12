# 微信读书 Mac客户端 / WeRead_mac
微信读书 Mac客户端 (非官方) / WeRead client for macOS (Unofficial)

英文说明/English version: [README](README.md) 

![](/screenshots/WeRead_for_macOS-v1.0.0.webp)

 ## 描述
 微信读书 macOS 客户端-基于 Electron。

 根据 Electron Quick Start 进行简单修改完成，本质上就是一个只能打开微信读书网页版的浏览器App。

 基于Intel Mac开发，Apple Silicon (M1) 设备的兼容性未知。

 ## 安装
 - 下载最新的 [DMG 文件](https://github.com/NeilYXIN/WeRead_mac/releases/tag/v1.0.0)。
- 打开 DMG 文件，拖动图标到应用程序文件夹即可。

## 特性
- 基于 Electron 17.0.0 和 Chromium 98。
- 在 Electron [Quick Start](https://www.electronjs.org/docs/latest/tutorial/quick-start) 的基础上只进行了最低限度的改动。
- 高清图标，适配 macOS Big Sur 之后的设计风格。

## 构建说明 (electron-packager)
### 构建应用程序: 

在项目根目录打开命令行，运行如下命令：

<code>npm run package-mac</code>

.app 应用程序文件在 */release-builds/WeRead-darwin-x64/* 目录下。

### 构建 DMG 安装文件:

在项目根目录打开命令行，运行如下命令：

<code>npm run dist</code>

DMG 安装文件在根目录下。

## Notes
本人并不太懂 Electron，相关开发经验仅限于此，本项目只是方便个人日常使用。

个人缺乏web开发经验，从代码到构建/分发脚本都是一团浆糊，仅仅能用，按上面步骤可以在 Mac 上进行构建打包，如果使用其他方法则需要进一步修改完善。

欢迎参与贡献，我会尽力学习更新。
