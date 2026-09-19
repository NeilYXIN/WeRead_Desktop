# WeRead_Desktop / 微信读书桌面版客户端

WeRead Desktop App (Unofficial) / 微信读书网页版桌面客户端（非官方）

[中文说明](README_zh_CN.md)

![WeRead Desktop screenshot](assets/screenshots/WeRead_for_macOS-v1.0.0.webp)

## Description

WeRead Desktop is a small Electron wrapper for the official [WeRead website](https://weread.qq.com/). It provides a focused desktop window on macOS, Windows, and Linux while leaving reading, account, and library functionality to WeRead itself.

> This project is not affiliated with or endorsed by Tencent or WeRead. Login and reading data remain in the dedicated Chromium website session and are not read by this project.

## Features

- Supports macOS (Intel and Apple Silicon), Windows 10 or later, and Linux.
- Keeps the existing login session and restores the previous window position and size.
- Provides native Home, Back, Forward, Reload, Retry, About, and update-check commands.
- Shows a local recovery page when WeRead is offline or the renderer fails.
- Keeps `https://weread.qq.com` inside the app and opens other user-initiated HTTPS links in the default browser.
- Runs remote content with Electron sandboxing, context isolation, no Node.js integration, and no preload bridge.
- Requests no camera, microphone, location, notification, device, or filesystem permissions.
- Checks GitHub Releases monthly by default; automatic checks can be set to daily, weekly, monthly, or disabled, while manual checks remain available.
- Contains no telemetry, advertising, injected webpage scripts, or native WeRead API integration.

## What's new

### v1.1.0

- Upgraded from Electron 33 to the Electron 44 release line.
- Added strict navigation, popup, redirect, and web-permission controls.
- Added single-instance behavior, window-state restoration, native navigation commands, and an offline/crash recovery page.
- Added configurable update notifications that link to the fixed GitHub Releases page without downloading or installing anything automatically.
- Added reproducible dependency locking, automated tests, dependency auditing, package-content checks, and Electron fuse verification.
- Added GitHub Actions release builds for macOS universal, Windows x64, and Linux x64, with SHA-256 checksums and clearly labeled unsigned artifacts.
- Removed unused dependencies and the empty preload script.
- Disabled Electron cookie encryption to avoid macOS Keychain prompts.

The v1.1.0 review, implementation, tests, and release-hardening work were assisted by OpenAI Codex.

Previous releases:

- v1.0.4 fixed grouped-book navigation and updated Electron and electron-builder.
- v1.0.3 updated Electron and electron-builder.
- v1.0.2 adopted electron-builder and added Apple Silicon, Windows, and Linux support.
- v1.0.1 updated documentation.
- v1.0.0 was the initial Intel macOS release.

## Download

Download the newest build from [GitHub Releases](https://github.com/NeilYXIN/WeRead_Desktop/releases/latest).

| Platform | Architecture | Format |
| --- | --- | --- |
| macOS | Intel + Apple Silicon (universal) | DMG |
| Windows 10 or later | x64 | NSIS installer |
| Linux | x64 | AppImage and deb |

Release files include SHA-256 checksums and a signing-status note. macOS and Windows artifacts are signed when signing credentials are configured. A filename ending in `-unsigned` indicates that operating-system trust warnings are expected.

## Installation

### macOS

Download the universal DMG, open it, and drag WeRead into the Applications folder. Unsigned builds may require an explicit override in macOS Privacy & Security settings.

### Windows

Download and run the x64 installer. Windows SmartScreen may warn when the installer is unsigned.

### Linux

Install the deb package with your package manager, or mark the AppImage executable and run it directly.

## Development and build

Node.js 24 and npm are required.

```sh
npm ci
npm start
```

Run the local checks:

```sh
npm run check
npm run audit
```

Build on the native platform:

```sh
npm run dist:mac
npm run dist:win
npm run dist:linux
```

GitHub Actions is the recommended way to create all three platforms. Run the **Release** workflow manually to produce private release-candidate artifacts without publishing a release. After testing them, push a `vX.Y.Z` tag matching `package.json` to build and publish the GitHub Release. See the [release checklist](docs/RELEASE_CHECKLIST.md) for the complete procedure.

## Security and privacy

Only the exact `https://weread.qq.com` origin can navigate inside the application. Other HTTPS links open in the system browser after a user action; HTTP, credential-bearing, malformed, local-file, JavaScript, and custom-scheme URLs are blocked. Web permissions are denied except for fullscreen and sanitized clipboard writes from the WeRead main frame.

The legacy session partition name is intentionally retained so existing users remain signed in. Application-owned state files contain only window geometry, update-check timestamps, and update-check preferences. Electron cookie encryption is disabled to avoid macOS Keychain prompts; website session data remains in Chromium's local profile under the operating-system user account.

## Notes

This remains a small hobby project intended to make the official WeRead website more convenient to access. Contributions, bug reports, and suggestions are welcome.

## License

[MIT](LICENSE)
