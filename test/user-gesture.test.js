const assert = require('node:assert/strict')
const { test } = require('node:test')

const { USER_GESTURE_WINDOW_MS, isRecentUserGesture } = require('../lib/user-gesture')

test('accepts only recent user gestures', () => {
  const now = 10_000
  assert.equal(isRecentUserGesture(now, now), true)
  assert.equal(isRecentUserGesture(now - USER_GESTURE_WINDOW_MS, now), true)
  assert.equal(isRecentUserGesture(now - USER_GESTURE_WINDOW_MS - 1, now), false)
  assert.equal(isRecentUserGesture(now + 1, now), false)
  assert.equal(isRecentUserGesture(0, now), false)
  assert.equal(isRecentUserGesture(undefined, now), false)
})
