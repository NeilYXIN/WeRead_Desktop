const assert = require('node:assert/strict')
const { test } = require('node:test')
const { pathToFileURL } = require('node:url')

const { classifyNavigation, isTrustedWeReadUrl, parseUrl } = require('../lib/navigation')

const recoveryUrl = pathToFileURL('/tmp/weread recovery/index.html').href

test('classifies exact WeRead HTTPS pages as internal', () => {
  assert.equal(classifyNavigation('https://weread.qq.com/', recoveryUrl), 'internal')
  assert.equal(classifyNavigation('https://weread.qq.com/web/reader/123?chapter=2#note', recoveryUrl), 'internal')
  assert.equal(isTrustedWeReadUrl('https://weread.qq.com:443/web/shelf'), true)
})

test('classifies other HTTPS origins as external', () => {
  assert.equal(classifyNavigation('https://privacy.qq.com/mb/policy/tencent-privacypolicy', recoveryUrl), 'externalHttps')
  assert.equal(classifyNavigation('https://weread.qq.com.evil.example/', recoveryUrl), 'externalHttps')
  assert.equal(classifyNavigation('https://evilweread.qq.com/', recoveryUrl), 'externalHttps')
})

test('blocks unsafe and malformed URLs', () => {
  for (const url of [
    'http://weread.qq.com/',
    'javascript:alert(1)',
    'mailto:help@example.com',
    'https://user:password@weread.qq.com/',
    'not a URL',
    '',
    null
  ]) {
    assert.equal(classifyNavigation(url, recoveryUrl), 'blocked')
  }
  assert.equal(parseUrl('https://user@weread.qq.com/'), null)
})

test('allows only the exact local recovery page', () => {
  assert.equal(classifyNavigation(recoveryUrl, recoveryUrl), 'localRecovery')
  assert.equal(classifyNavigation(`${recoveryUrl}?changed=true`, recoveryUrl), 'blocked')
  assert.equal(classifyNavigation(pathToFileURL('/tmp/other.html').href, recoveryUrl), 'blocked')
})
