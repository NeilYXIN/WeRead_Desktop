const assert = require('node:assert/strict')
const { test } = require('node:test')

const { stripElectronFromUserAgent } = require('../lib/user-agent')

test('removes only the Electron product token', () => {
  const macUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/152.0.0.0 Electron/44.2.0 Safari/537.36'
  const result = stripElectronFromUserAgent(macUserAgent)
  assert.equal(result.includes('Electron/'), false)
  assert.equal(result.includes('Macintosh'), true)
  assert.equal(result.includes('Chrome/152.0.0.0'), true)
})

test('handles missing and already-clean user agents', () => {
  assert.equal(stripElectronFromUserAgent('Chrome/152 Safari/537.36'), 'Chrome/152 Safari/537.36')
  assert.equal(stripElectronFromUserAgent(null), '')
})
