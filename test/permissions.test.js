const assert = require('node:assert/strict')
const { test } = require('node:test')

const { isPermissionAllowed } = require('../lib/permissions')

test('allows the two required permissions for the WeRead main frame', () => {
  assert.equal(isPermissionAllowed('fullscreen', 'https://weread.qq.com/web/reader/1', { isMainFrame: true }), true)
  assert.equal(isPermissionAllowed('clipboard-sanitized-write', 'https://weread.qq.com/', { isMainFrame: true }), true)
})

test('denies sensitive and unknown permissions', () => {
  for (const permission of ['media', 'geolocation', 'notifications', 'fileSystem', 'usb', 'unknown']) {
    assert.equal(isPermissionAllowed(permission, 'https://weread.qq.com/', { isMainFrame: true }), false)
  }
})

test('denies permissions from subframes and other origins', () => {
  assert.equal(isPermissionAllowed('fullscreen', 'https://weread.qq.com/', { isMainFrame: false }), false)
  assert.equal(isPermissionAllowed('fullscreen', 'https://privacy.qq.com/', { isMainFrame: true }), false)
  assert.equal(isPermissionAllowed('fullscreen', undefined, { isMainFrame: true }), false)
})
