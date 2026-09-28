const assert = require('node:assert/strict')
const path = require('node:path')
const { test } = require('node:test')

const { createRecoveryProtocolHandler } = require('../lib/recovery-protocol')

const rootDirectory = path.join(__dirname, '..')
const handleRecoveryRequest = createRecoveryProtocolHandler(rootDirectory)

test('serves the allowlisted offline resources with strict response headers', async () => {
  for (const [pathname, contentType] of [
    ['/index.html', 'text/html; charset=utf-8'],
    ['/renderer.js', 'text/javascript; charset=utf-8'],
    ['/styles.css', 'text/css; charset=utf-8']
  ]) {
    const response = handleRecoveryRequest(new Request(`weread-app://recovery${pathname}`))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), contentType)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.notEqual((await response.text()).length, 0)
  }
})

test('blocks other hosts, paths, query strings, and methods', () => {
  for (const request of [
    new Request('weread-app://other/index.html'),
    new Request('weread-app://recovery/../package.json'),
    new Request('weread-app://recovery/index.html?file=package.json'),
    new Request('weread-app://recovery/index.html', { method: 'POST' })
  ]) {
    assert.notEqual(handleRecoveryRequest(request).status, 200)
  }
})
