const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { afterEach, test } = require('node:test')

const {
  DEFAULT_UPDATE_PREFERENCES,
  UPDATE_INTERVALS,
  normalizeUpdatePreferences,
  readUpdatePreferences,
  updatePreferencesPath,
  writeUpdatePreferences
} = require('../lib/update-preferences')

const temporaryDirectories = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

function temporaryDirectory () {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'weread-update-preferences-test-'))
  temporaryDirectories.push(directory)
  return directory
}

test('defaults to enabled monthly update checks', () => {
  assert.deepEqual(normalizeUpdatePreferences(null), DEFAULT_UPDATE_PREFERENCES)
  assert.equal(UPDATE_INTERVALS.daily, 24 * 60 * 60 * 1000)
  assert.equal(UPDATE_INTERVALS.weekly, 7 * UPDATE_INTERVALS.daily)
  assert.equal(UPDATE_INTERVALS.monthly, 30 * UPDATE_INTERVALS.daily)
})

test('accepts supported preferences and rejects malformed values', () => {
  assert.deepEqual(
    normalizeUpdatePreferences({ automaticChecksEnabled: false, interval: 'weekly' }),
    { automaticChecksEnabled: false, interval: 'weekly' }
  )
  assert.deepEqual(
    normalizeUpdatePreferences({ automaticChecksEnabled: 'no', interval: 'hourly' }),
    DEFAULT_UPDATE_PREFERENCES
  )
})

test('persists only normalized update preferences', () => {
  const userDataPath = temporaryDirectory()
  assert.deepEqual(readUpdatePreferences(userDataPath), DEFAULT_UPDATE_PREFERENCES)

  const saved = writeUpdatePreferences(userDataPath, {
    automaticChecksEnabled: false,
    interval: 'daily',
    unexpected: 'discarded'
  })

  assert.deepEqual(saved, { automaticChecksEnabled: false, interval: 'daily' })
  assert.deepEqual(readUpdatePreferences(userDataPath), saved)
  assert.deepEqual(JSON.parse(fs.readFileSync(updatePreferencesPath(userDataPath), 'utf8')), saved)
})
