const assert = require('node:assert/strict')
const { test } = require('node:test')

const { compareStableVersions, parseStableVersion } = require('../lib/version')

test('parses stable numeric versions with an optional v prefix', () => {
  assert.deepEqual(parseStableVersion('1.2.3'), [1, 2, 3])
  assert.deepEqual(parseStableVersion('v44.2.0'), [44, 2, 0])
})

test('rejects malformed versions and prereleases', () => {
  for (const version of ['1.2', '1.2.3-beta.1', 'v1.2.3.4', 'latest', '', null]) {
    assert.equal(parseStableVersion(version), null)
  }
})

test('compares stable versions', () => {
  assert.equal(compareStableVersions('v1.2.0', '1.1.9'), 1)
  assert.equal(compareStableVersions('1.0.9', '1.1.0'), -1)
  assert.equal(compareStableVersions('1.1.0', 'v1.1.0'), 0)
  assert.equal(compareStableVersions('invalid', '1.0.0'), null)
})
