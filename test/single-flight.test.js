const assert = require('node:assert/strict')
const { test } = require('node:test')

const { createSingleFlight } = require('../lib/single-flight')

test('coalesces concurrent recovery navigations and permits a later retry', async () => {
  let callCount = 0
  let finish
  const run = createSingleFlight(async () => {
    callCount += 1
    if (callCount === 1) await new Promise((resolve) => { finish = resolve })
  })

  const first = run()
  const second = run()
  await Promise.resolve()

  assert.strictEqual(second, first)
  assert.equal(callCount, 1)

  finish()
  await first
  await run()
  assert.equal(callCount, 2)
})

test('permits a retry after a failed recovery navigation', async () => {
  let callCount = 0
  const run = createSingleFlight(async () => {
    callCount += 1
    if (callCount === 1) throw new Error('failed navigation')
  })

  await assert.rejects(run(), /failed navigation/)
  await run()
  assert.equal(callCount, 2)
})
