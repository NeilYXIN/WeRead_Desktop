# WeRead_Desktop / 微信读书 桌面版客户端
WeRead Desktop App (Unofficial) / 微信读书（网页版）桌面版客户端 (非官方)

Chinese version / 中文说明: [README](README_zh_CN.md) 

![](/assets/screenshots/WeRead_for_macOS-v1.0.0.webp)

 ## Description:
 Electron-based desktop app for WeRead (微信读书). Supports macOS (Intel, M1), Windows, Linux.

 Built on top of the [Electron Quick Start](https://www.electronjs.org/docs/latest/tutorial/quick-start) guide, with minimum modifications, which means it's essentially just a web browser that opens the WeRead website.

## Features:
- Based on Electron 28.2.0 and Chromium 120.
- Supports macOS, Windows (≥10), Linux.
- High-resolution icon that matches the latest design after macOS Big Sur.

## What's new:
- v1.0.3 Updated electron and electron-build version.

- v1.0.2 Organized directory, change build tools as electron-builder, add support for Apple Silicon, Windows, and Linux.

- v1.0.1 Same source code, just updated READMEs.

- v1.0.0 First release with only Mac (Intel) support, built by electron-packager

## Download: 
- [Latest Release](https://github.com/NeilYXIN/WeRead_Desktop/releases/latest)
- [Mac Installer (Universal)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.3/WeRead-1.0.3-universal.dmg)
- [Windows Installer (x64)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.3/WeRead.Setup.1.0.3.exe)
- [Linux Installer (deb)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.3/weread_1.0.3_amd64.deb)
- [Linux Application (AppImage)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.3/WeRead-1.0.3.AppImage)

## Installation:
- ### Mac (Intel and M1):
    - Download the dmg installer.
    - Open the dmg file, drag the WeRead App into the Application folder.

- ### Windows (≥10):
    - Download the exe installer.
    - Open the exe installer to complete installation.

- ### Linux:
    - Method 1: Install deb Package
        - Download the deb package installer.
        - Open the deb installer and click install.

    - Method 2: Use AppImage File
        - Download to your prefered location and open it (requires executable permission).

## How to build (with electron-builder):

The package.json supports build targets for macOS, Windows, and Linux. 

Open a terminal in the project root directory and run the below command:

<code>$ npm run dist</code>

The installer can be found under the *release-builds* directory.

## Notes
I'm not an Electron expert and developing this app is just a hobby. 

Contributions/Suggestions are welcome.