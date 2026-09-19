const assert = require('node:assert/strict')
const { test } = require('node:test')

const { buildArguments, hasSigningIdentity, targetsMac } = require('../scripts/build')

test('detects macOS build targets', () => {
  assert.equal(targetsMac([], 'darwin'), true)
  assert.equal(targetsMac(['--mac'], 'linux'), true)
  assert.equal(targetsMac(['--linux'], 'darwin'), false)
  assert.equal(targetsMac(['--win'], 'darwin'), false)
})

test('adds runnable ad-hoc settings to unsigned macOS builds', () => {
  assert.deepEqual(
    buildArguments(['--dir', '--mac', '--arm64'], 'darwin', {}),
    ['--dir', '--mac', '--arm64', '--publish=never', '--config.mac.identity=-', '--config.mac.hardenedRuntime=false']
  )
})

test('preserves hardened settings when a signing identity is configured', () => {
  const args = ['--mac', '--universal']
  assert.deepEqual(
    buildArguments(args, 'darwin', { CSC_LINK: 'certificate' }),
    [...args, '--publish=never']
  )
  assert.equal(hasSigningIdentity(args, { CSC_NAME: 'Developer ID' }), true)
  assert.equal(hasSigningIdentity(['--config.mac.identity=Developer ID'], {}), true)
})

test('does not add macOS settings to Windows or Linux builds', () => {
  assert.deepEqual(buildArguments(['--win', '--x64'], 'win32', {}), ['--win', '--x64', '--publish=never'])
  assert.deepEqual(buildArguments(['--linux', '--x64'], 'linux', {}), ['--linux', '--x64', '--publish=never'])
})

test('preserves an explicit electron-builder publish policy', () => {
  assert.deepEqual(
    buildArguments(['--linux', '--publish', 'always'], 'linux', {}),
    ['--linux', '--publish', 'always']
  )
  assert.deepEqual(
    buildArguments(['--win', '--publish=onTag'], 'win32', {}),
    ['--win', '--publish=onTag']
  )
})
