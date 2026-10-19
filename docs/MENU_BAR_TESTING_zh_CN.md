# 菜单栏功能：先测试候选 AppImage，再发布

此功能支持 Linux、Windows，在 View 菜单提供 **Auto-hide Menu Bar (Alt to Show)**，快捷键为 **Ctrl+Shift+M**。默认保持显示，启用后单按 **Alt** 可临时显示菜单；取消勾选或再次按快捷键可恢复常驻显示。两种选择都会保存在本地。macOS 保留系统菜单。

当前候选版本为 **1.1.3**，同时整合 [PR #13](https://github.com/NeilYXIN/WeRead_Desktop/pull/13) 的 Electron **44.7.2** 和 [PR #9](https://github.com/NeilYXIN/WeRead_Desktop/pull/9) 的 electron-builder **26.17.0**。两个原 PR 的 CI 在 `npm ci` 阶段因锁文件缺失可选 peer 依赖而失败；本次重新生成组合后的锁文件，保留 http-cache-semantics **4.3.0** 的安全修复。版本号已准备好，不代表已经发布。

## 1. 提交代码并生成候选包

1. 检查本地改动，运行 `npm run check` 和 `npm run audit`，将改动提交并推送到 GitHub 分支。此时不要创建或推送版本标签。
2. 在仓库 **Actions → Release → Run workflow** 中选择包含本次改动的分支，手动运行。若新增的 workflow 尚未显示，先将改动合并到默认分支。
3. 等待整个运行成功，包括 `validate`、三个平台的 `build` 和 `appimage-catalog-check`。手动运行时 `publish` 应显示为 **skipped**，不会创建 GitHub Release。
4. 下载 **menu-bar-linux-test**，检查 `states.jsonl` 和截图：初始显示、启用后隐藏、Alt 临时显示、修改更新设置后仍隐藏、重启后仍隐藏、隐藏时刷新、恢复显示、再次重启后显示。截图使用离线恢复页，不涉及微信读书账号。
5. 下载 **release-linux** ZIP，记录本次 Actions 运行链接和完整 commit SHA。本次构建的 AppImage 名为 **WeRead-1.1.3-x86_64.AppImage**；包名没有 candidate 后缀，请明确标注这是测试候选包，用运行链接和 commit 区分每次构建。

两个依赖更新已经包含在本次改动中，无需再单独合并 #13、#9 的旧锁文件。等本次组合改动合并到默认分支后，检查 Dependabot 是否自动关闭这两个 PR；若没有，可标记为“已由组合改动包含”并关闭。

现有工作流的构建产物保存 14 天。访问需要 GitHub 登录及仓库读取权限；公开仓库的产物不应被视为私密文件。

## 2. 请 issue 提交者在 Cinnamon 下测试

1. 将运行链接发给提交者，明确说明这是未发布的候选版本，让对方下载同一次运行的 **release-linux**。
2. 如果对方无法下载 Actions 产物，下载 ZIP 后通过双方可访问的文件分享方式提供原始 ZIP，并附上同一次运行的 SHA-256 校验文件。无需为分享候选包创建 GitHub Release。
3. 请对方完整退出已有 WeRead 后解压 ZIP。应用有单实例机制，旧进程仍在运行可能导致测试到旧版本。候选程序沿用已有用户配置，可使用原来的登录状态。
4. 在解压目录验证校验值，并为 AppImage 添加执行权限，再启动：

   ```sh
   sha256sum -c SHA256SUMS-linux.txt
   chmod +x WeRead-1.1.3-x86_64.AppImage
   ./WeRead-1.1.3-x86_64.AppImage
   ```

5. 请对方完成下面的验收，并在 issue 中记录结果。

| 检查 | 预期结果 |
| --- | --- |
| 首次使用新设置 | 菜单栏默认显示 |
| 勾选 View → Auto-hide Menu Bar (Alt to Show) | 菜单栏立即消失，阅读区域没有空白条 |
| 单按 Alt、使用菜单后返回页面 | 可以临时访问菜单，并恢复隐藏 |
| Ctrl+Shift+M | 隐藏时也能恢复菜单，再按可重新隐藏 |
| 隐藏后完全退出再启动 | 仍然隐藏，Alt 和恢复快捷键仍然有效 |
| 恢复显示后完全退出再启动 | 仍然常驻显示 |
| 隐藏时修改 Help 中的更新检查频率 | 菜单重建后仍然隐藏 |
| 阅读、后退、前进、刷新、缩放、全屏 | 常用操作正常；退出全屏后隐藏偏好不变 |

请反馈：发行版及版本、Cinnamon 版本、X11 或 Wayland、屏幕缩放比例、是否使用全局菜单插件、候选包的运行链接/commit，以及隐藏前后的截图。获取会话类型可运行 `echo "$XDG_SESSION_TYPE"`。截图可遮挡书架、账户等个人信息。

如果桌面环境拦截了 Alt，请单独反馈 **Ctrl+Shift+M** 是否有效。若需要回到原有界面，可用 Ctrl+Shift+M 恢复显示，再退出候选版本并启动旧版本。

## 3. 根据反馈决定是否发布

- 没有 Cinnamon 验证结果，或对方仍看到空白条、无法恢复菜单等问题时，继续修复并重新手动构建候选包。
- 修复后必须测试新的 commit，不能用旧包的反馈代替。
- 确认 Cinnamon 通过后，补做可用平台的冒烟测试。Windows 的原生菜单行为也需要 Windows 用户验证；macOS 检查系统菜单和常用操作。
- 本次已将 `package.json`、`package-lock.json` 和更新说明准备为 **1.1.3**。按 [Release 检查清单](RELEASE_CHECKLIST.md) 将验收通过的组合改动合并到默认分支；如果合并带入其他程序改动，重新手动构建并测试最终候选包。
- 只有完成验收后，才为已验证的最终源码推送 **v1.1.3** 标签；若期间该版本号已被占用，准备新的未使用版本并重新验证。标签推送会触发正式发布，不要提前推送或复用已发布的标签。

## 自动测试覆盖范围

`npm run check` 验证设置的默认值、数据校验、读写、配置损坏及写入失败、Linux/Windows 显示控制和 macOS 平台保护。

CI 和手动 Release 的 `validate` 阶段还会运行真实 Electron，使用独立临时配置和 Linux X11/IceWM 虚拟桌面，通过系统键盘事件测试快捷键与 Alt，连续三次启动验证设置保持，并检查更新菜单重建。测试截图捕获整个桌面，因此包含原生菜单栏；无需登录微信读书，也不关闭应用沙盒。Ubuntu 临时 runner 会允许 Electron 创建沙盒所需的用户命名空间。

这不能替代 Cinnamon 主题、全局菜单插件、Wayland 和实际阅读体验的人工验证。已有的 AppImage catalog 测试还会检查打包后的 AppImage 是否能启动并截图；菜单交互测试运行的是同一 commit 的源码，而非打包后的 AppImage。

## v1.1.3 验收记录

- 候选构建：[Actions 39132518827](https://github.com/NeilYXIN/WeRead_Desktop/actions/runs/39132518827)，程序源码 commit 为 `a012e076f521b5ae7eb17921162f3ff8013f17a8`。后续致谢、指南及发布说明的文档改动不进入安装包。
- 自动验证：47 项测试、Linux X11/IceWM 菜单交互、macOS/Windows/Linux 构建、安装包内容与安全 fuse 检查、打包后的 AppImage 启动及截图检查均通过。Linux 候选包 SHA-256 校验通过。
- macOS 自动验证：Electron 44.7.2 下的隔离启动及菜单重建检查通过；Apple Silicon 本地打包检查通过。
- Cinnamon 人工验收：[@ChRomiumCR](https://github.com/ChRomiumCR) 在 Linux Mint 22.3 / Cinnamon 6.9 / X11、未使用全局菜单的环境下确认 deb 和 AppImage 均测试通过，并提供隐藏前后截图。原始记录见 [issue #12](https://github.com/NeilYXIN/WeRead_Desktop/issues/12)。
- 尚待确认：维护者使用 macOS 候选安装包完成登录、书架、阅读、刷新和全屏检查。Windows 原生交互与 Wayland 未获得人工验证记录。
