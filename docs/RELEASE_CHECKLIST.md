# Release checklist

This project uses the same GitHub Actions workflow for private release candidates and published releases. A manual run builds downloadable artifacts without publishing; pushing a matching version tag publishes them.

## 1. Prepare the source

- [ ] Confirm `package.json` contains the intended version, such as `1.1.0`.
- [ ] Review `git status` and the complete diff; do not include generated `release-builds/` or secrets.
- [ ] Run `npm ci` from a clean dependency state.
- [ ] Run `npm run check` and confirm all tests pass.
- [ ] Run `npm run audit` and resolve any reported vulnerability before release.
- [ ] Launch the local app and complete the macOS checks relevant to the change.
- [ ] Commit and push the source changes to `main`.
- [ ] Confirm the **CI** workflow passes on GitHub.

## 2. Build release candidates on GitHub

1. Open the repository on GitHub.
2. Select **Actions** → **Release**.
3. Select **Run workflow**, choose `main`, and confirm the run.
4. Wait for the validation and macOS, Windows, and Linux build jobs to finish.
5. Open the completed workflow run and download these artifacts:
   - `release-macos`
   - `release-windows`
   - `release-linux`
6. Extract each downloaded ZIP. Confirm it contains the expected installer, `SHA256SUMS-<platform>.txt`, and `SIGNING-STATUS-<platform>.txt`.

Manual workflow runs do not create a GitHub Release. Candidate artifacts are retained by GitHub Actions for 14 days.

## 3. Verify artifacts

### Automated gates

- [ ] `npm ci`, `npm run check`, and `npm run audit` passed.
- [ ] macOS, Windows, and Linux packaging jobs passed on their native GitHub runners.
- [ ] Packaged ASAR contents and Electron fuses passed verification.
- [ ] Every installer has a SHA-256 checksum and signing-status file.
- [ ] A locally calculated checksum matches the accompanying checksum file.

### WeRead smoke tests

Run these checks on every platform available to you. Ask a trusted user or contributor to cover Windows/Linux when necessary; never put account credentials in CI.

- [ ] The installer/package opens successfully.
- [ ] QR login succeeds and the session persists after relaunch.
- [ ] Existing users upgrading from 1.0.4 remain signed in.
- [ ] Shelf groups, book pages, and the reader open correctly.
- [ ] Text selection/copy, notes, fullscreen, and file upload still work.
- [ ] Back, Forward, Home, Reload, and Retry behave correctly.
- [ ] A second launch restores and focuses the existing window.
- [ ] Window bounds and maximized state restore on the active display.
- [ ] The Tencent privacy link opens in the system browser.
- [ ] HTTP, custom-scheme, credential-bearing, and deceptive-host URLs remain blocked.
- [ ] Offline startup shows the recovery page and Retry recovers after reconnecting.
- [ ] Automatic update checks default to monthly and the daily/weekly/monthly choices persist after relaunch.
- [ ] Disabling automatic checks persists after relaunch; **Check for Updates…** still works manually.
- [ ] Automatic check failures are silent; manual failures are explained.

### Distribution trust

- [ ] Signed macOS builds pass `codesign --verify --deep --strict` and `spctl --assess`.
- [ ] The macOS notarization ticket is stapled and validates offline.
- [ ] Signed Windows builds show the expected publisher and pass signature verification.
- [ ] Unsigned macOS/Windows artifacts contain `-unsigned` in the filename.
- [ ] Release text does not imply that an unsigned artifact is signed or trusted.

## 4. Publish the release

Only proceed after the release-candidate workflow and available smoke tests pass.

```sh
git switch main
git pull --ff-only
git status --short
git tag -a v1.1.0 -m "WeRead Desktop v1.1.0"
git push origin v1.1.0
```

Replace `1.1.0` with the exact version in `package.json`. Do not reuse or move a published version tag; fix the problem and create a new patch version instead.

The tag-triggered **Release** workflow verifies that the tag equals `v${package.version}`, rebuilds all artifacts from the tagged commit, and publishes a GitHub Release with generated notes.

## 5. Final GitHub checks

- [ ] The published release contains the DMG, EXE, AppImage, deb, checksums, and signing-status files.
- [ ] Artifact filenames use the expected version and architecture.
- [ ] Signing status is accurate and unsigned artifacts are clearly labeled.
- [ ] The latest-release link resolves to the new release.
- [ ] Install at least the macOS artifact downloaded from the published release rather than relying only on the local build.
- [ ] Monitor the repository issues after release and prepare a patch release if a platform-specific problem is reported.
