const path = require('node:path')

const { readJsonFile, writeJsonFileAtomically } = require('./state-file')

const UPDATE_INTERVALS = Object.freeze({
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000
})
const DEFAULT_UPDATE_PREFERENCES = Object.freeze({
  automaticChecksEnabled: true,
  interval: 'monthly'
})

function normalizeUpdatePreferences (preferences) {
  return {
    automaticChecksEnabled: typeof preferences?.automaticChecksEnabled === 'boolean'
      ? preferences.automaticChecksEnabled
      : DEFAULT_UPDATE_PREFERENCES.automaticChecksEnabled,
    interval: Object.hasOwn(UPDATE_INTERVALS, preferences?.interval)
      ? preferences.interval
      : DEFAULT_UPDATE_PREFERENCES.interval
  }
}

function updatePreferencesPath (userDataPath) {
  return path.join(userDataPath, 'update-preferences.json')
}

function readUpdatePreferences (userDataPath) {
  return normalizeUpdatePreferences(readJsonFile(updatePreferencesPath(userDataPath), null))
}

function writeUpdatePreferences (userDataPath, preferences) {
  const normalized = normalizeUpdatePreferences(preferences)
  writeJsonFileAtomically(updatePreferencesPath(userDataPath), normalized)
  return normalized
}

module.exports = {
  DEFAULT_UPDATE_PREFERENCES,
  UPDATE_INTERVALS,
  normalizeUpdatePreferences,
  readUpdatePreferences,
  updatePreferencesPath,
  writeUpdatePreferences
}
