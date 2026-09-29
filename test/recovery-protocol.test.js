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

test('keeps visible recovery copy clear of AppImage screenshot error phrases', async () => {
  const screenshotErrorPhrase = /traceback|exception|segmentation fault|fatal|error while loading|glibc|not installed|cannot open display|permission denied|no such file|could not (?:load|find|open|start|initiali)|failed to (?:load|start|open|initiali|create)|cannot (?:load|find|open|execute|configure)|unable to (?:load|find|open|start)|command not found|core dumped|error|failed|failure|could not|cannot|unable to|not found/i
  const visibleCopy = []

  for (const pathname of ['/index.html', '/renderer.js']) {
    const response = handleRecoveryRequest(new Request(`weread-app://recovery${pathname}`))
    visibleCopy.push(await response.text())
  }

  assert.doesNotMatch(visibleCopy.join('\n'), screenshotErrorPhrase)
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
