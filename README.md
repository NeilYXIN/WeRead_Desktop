# WeRead_mac / 微信读书 Mac客户端
 WeRead client for macOS / 微信读书 Mac客户端

Chinese version/中文说明: [README](README_zh_CN.md) 

![](/screenshots/WeRead_for_macOS-v1.0.0.png)

 ## Description
 Electron-based macOS client for WeRead(微信读书).

 Modified on top of the Electron Quick Start guide, which means it's essentially just a web browser that can open the WeRead webpage for you.

 Tested only on Intel chips, compatibility on Apple Silicon (M1) chips not verified.

 ## Installation
 - Download the DMG file from the [latest release](https://github.com/NeilYXIN/WeRead_mac/releases/tag/v1.0.0).
- Open the DMG file, drag the WeRead App into the Application folder.
- Enjoy!

## Features
- Based on Electron 17.0.0 and Chromium 98.
- Minimum modification on the Electron [Quick Start](https://www.electronjs.org/docs/latest/tutorial/quick-start) guide.
- High-resolution icon that matches the latest design since macOS Big Sur.

## How to build (electron-packager)
### App Generation: 

Open a terminal in the project root directory and run the below command:

<code>npm run package-mac</code>

The .app file can be found under */release-builds/WeRead-darwin-x64/*.

### DMG File Generation:

Open a terminal in the project root directory and run the below command:

<code>npm run dist</code>

The DMG file can be found under the *root dir*.

## Notes
I'm not an Electron pro and this app was my only experience with it. Purely developed as a hobby for my daily convenience. 

The build/distribution script is completely a mess and I can only guarantee it works on macOS following the above steps. 

Contributions/Suggestions are welcome.
