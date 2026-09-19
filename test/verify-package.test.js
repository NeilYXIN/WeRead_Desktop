const assert = require('node:assert/strict')
const path = require('node:path')
const { test } = require('node:test')

const { resolveFuseTarget } = require('../scripts/verify-package')

const packageMetadata = {
  name: 'weread',
  productName: 'WeRead',
  build: {}
}

test('resolves the packaged macOS app bundle for fuse inspection', () => {
  const asarPath = path.join('release-builds', 'mac-universal', 'WeRead.app', 'Contents', 'Resources', 'app.asar')
  assert.equal(
    resolveFuseTarget(asarPath, 'darwin', packageMetadata),
    path.join('release-builds', 'mac-universal', 'WeRead.app')
  )
})

test('resolves the packaged Windows executable for fuse inspection', () => {
  const asarPath = path.join('release-builds', 'win-unpacked', 'resources', 'app.asar')
  assert.equal(
    resolveFuseTarget(asarPath, 'win32', packageMetadata),
    path.join('release-builds', 'win-unpacked', 'WeRead.exe')
  )
})

test('resolves the packaged Linux executable for fuse inspection', () => {
  const asarPath = path.join('release-builds', 'linux-unpacked', 'resources', 'app.asar')
  assert.equal(
    resolveFuseTarget(asarPath, 'linux', packageMetadata),
    path.join('release-builds', 'linux-unpacked', 'weread')
  )
})

test('honors explicitly configured executable names', () => {
  const customMetadata = {
    ...packageMetadata,
    build: {
      linux: { executableName: 'weread-app' },
      win: { executableName: 'WeReadApp' }
    }
  }

  assert.equal(
    resolveFuseTarget(path.join('out', 'linux-unpacked', 'resources', 'app.asar'), 'linux', customMetadata),
    path.join('out', 'linux-unpacked', 'weread-app')
  )
  assert.equal(
    resolveFuseTarget(path.join('out', 'win-unpacked', 'resources', 'app.asar'), 'win32', customMetadata),
    path.join('out', 'win-unpacked', 'WeReadApp.exe')
  )
})
