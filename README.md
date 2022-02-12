# WeRead_mac / 微信读书 Mac客户端
WeRead Desktop Client (Unofficial) / 微信读书（网页版）桌面客户端 (非官方)

Chinese version / 中文说明: [README](README_zh_CN.md) 

![](/assets/screenshots/WeRead_for_macOS-v1.0.0.webp)

 ## Description:
 Electron-based desktop client for WeRead(微信读书). Supports macOS (Intel, M1), Windows, Linux.

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

## Installation:
- ### Mac (Intel and M1):
    - Download the DMG file from the [latest release](https://github.com/NeilYXIN/WeRead_mac/releases).
    - Open the DMG file, drag the WeRead App into the Application folder.
    - Enjoy!

- ### Windows:
    - (To be updated)

- ### Linux:
    - (To be updated)

## How to build (with electron-builder):

The package.json supports build targets for macOS, Windows, and Linux. 

Open a terminal in the project root directory and run the below command:

<code>$ npm run dist</code>

The installer can be found under the *release-builds* directory.

## Notes
I'm not an Electron pro and this app was my only experience with it. Purely developed as a hobby for my daily convenience. 

The build/distribution script is completely a mess and I can only guarantee it works on macOS following the above steps. 

Contributions/Suggestions are welcome.
