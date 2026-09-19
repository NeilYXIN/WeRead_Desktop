const assert = require('node:assert/strict')
const { test } = require('node:test')

const { DEFAULT_BOUNDS, normalizeWindowState } = require('../lib/window-state')

const displays = [{ workArea: { x: 0, y: 0, width: 1920, height: 1080 } }]

test('keeps a valid visible window state', () => {
  assert.deepEqual(
    normalizeWindowState({ x: 100, y: 80, width: 1200, height: 700, isMaximized: true }, displays),
    { bounds: { x: 100, y: 80, width: 1200, height: 700 }, isMaximized: true }
  )
})

test('accepts a window with at least 100 visible pixels', () => {
  assert.deepEqual(
    normalizeWindowState({ x: 1820, y: 980, width: 800, height: 600, isMaximized: false }, displays),
    { bounds: { x: 1820, y: 980, width: 800, height: 600 }, isMaximized: false }
  )
})

test('rejects corrupt, undersized, oversized, and off-screen state', () => {
  const fallback = { bounds: { ...DEFAULT_BOUNDS }, isMaximized: false }
  assert.deepEqual(normalizeWindowState(null, displays), fallback)
  assert.deepEqual(normalizeWindowState({ x: 0, y: 0, width: 799, height: 600 }, displays), fallback)
  assert.deepEqual(normalizeWindowState({ x: 0, y: 0, width: 9000, height: 600 }, displays), fallback)
  assert.deepEqual(normalizeWindowState({ x: 4000, y: 4000, width: 800, height: 600 }, displays), fallback)
  assert.deepEqual(normalizeWindowState({ x: 0, y: 0, width: 1280, height: 800 }, []), fallback)
})
