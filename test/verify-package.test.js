const assert = require('node:assert/strict')
const path = require('node:path')
const { test } = require('node:test')

const { findUnexpectedAsarEntries, resolveFuseTarget } = require('../scripts/verify-package')

const packageMetadata = {
  name: 'weread',
  productName: 'WeRead',
  build: {}
}

test('accepts expected ASAR entries with POSIX or Windows separators', () => {
  const posixListing = '/index.html\n/lib\n/lib/constants.js\n/main.js\n/package.json\n/renderer.js\n/styles.css\n'
  const windowsListing = '\\index.html\r\n\\lib\r\n\\lib\\constants.js\r\n\\main.js\r\n\\package.json\r\n\\renderer.js\r\n\\styles.css\r\n'

  assert.deepEqual(findUnexpectedAsarEntries(posixListing), [])
  assert.deepEqual(findUnexpectedAsarEntries(windowsListing), [])
})

test('reports unexpected ASAR entries on either platform', () => {
  assert.deepEqual(
    findUnexpectedAsarEntries('/index.html\n/secrets.txt\n\\debug.log\r\n'),
    ['secrets.txt', 'debug.log']
  )
})

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
