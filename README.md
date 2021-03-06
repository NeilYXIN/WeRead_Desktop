# WeRead_Desktop / 微信读书 桌面客户端
WeRead Desktop Client (Unofficial) / 微信读书（网页版）桌面客户端 (非官方)

Chinese version / 中文说明: [README](README_zh_CN.md) 

![](/assets/screenshots/WeRead_for_macOS-v1.0.0.webp)

 ## Description:
 Electron-based desktop client for WeRead (微信读书). Supports macOS (Intel, M1), Windows, Linux.

 Modified on top of the Electron Quick Start guide, which means it's essentially just a web browser that can open the WeRead webpage for you.

 Tested only on macOS with Intel chips, compatibility on other platforms not verified.

## Features:
- Based on Electron 17.0.0 and Chromium 98.
- Supports macOS, Windows, Linux.
- Minimum modification on the Electron [Quick Start](https://www.electronjs.org/docs/latest/tutorial/quick-start) guide.
- High-resolution icon that matches the latest design since macOS Big Sur.

## What's new:
- v1.0.2 Organized directory, change build tools as electron-builder, add support for Apple Silicon, Windows, and Linux.

- v1.0.1 Same source code, just updated READMEs.

- v1.0.0 First release with only Mac (Intel) support, built by electron-packager

## Download: 
- [Latest Release](https://github.com/NeilYXIN/WeRead_Desktop/releases/latest)
- [Mac Installer (Universal)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.2/WeRead-1.0.2-universal.dmg)
- [Windows Installer (x64)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.2/WeRead.Setup.1.0.2.exe)
- [Linux Installer (deb)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.2/weread_1.0.2_amd64.deb)
- [Linux Application (AppImage)](https://github.com/NeilYXIN/WeRead_Desktop/releases/download/v1.0.2/WeRead-1.0.2.AppImage)

## Installation:
- ### Mac (Intel and M1):
    - Download the dmg installer.
    - Open the dmg file, drag the WeRead App into the Application folder.

- ### Windows:
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
I'm not an Electron pro and this app was my only experience with it. Purely developed as a hobby for my daily convenience. 

The build/distribution script is completely a mess and I can only guarantee it works on macOS following the above steps. 

Contributions/Suggestions are welcome.
