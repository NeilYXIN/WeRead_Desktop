const path = require('node:path')

const { readJsonFile, writeJsonFileAtomically } = require('./state-file')

const DEFAULT_MENU_PREFERENCES = Object.freeze({ autoHideMenuBar: false })

function supportsMenuBar (platform = process.platform) {
  return platform === 'linux' || platform === 'win32'
}

function normalizeMenuPreferences (preferences) {
  return { autoHideMenuBar: preferences?.autoHideMenuBar === true }
}

function menuPreferencesPath (userDataPath) {
  return path.join(userDataPath, 'menu-preferences.json')
}

function readMenuPreferences (userDataPath) {
  return normalizeMenuPreferences(readJsonFile(menuPreferencesPath(userDataPath), null))
}

function writeMenuPreferences (userDataPath, preferences) {
  const normalized = normalizeMenuPreferences(preferences)
  writeJsonFileAtomically(menuPreferencesPath(userDataPath), normalized)
  return normalized
}

function applyMenuBarPreferences (window, preferences, platform = process.platform) {
  if (!supportsMenuBar(platform) || !window || window.isDestroyed()) return

  const { autoHideMenuBar } = normalizeMenuPreferences(preferences)
  window.setAutoHideMenuBar(autoHideMenuBar)
  // Auto-hide alone does not immediately hide an already visible menu bar.
  window.setMenuBarVisibility(!autoHideMenuBar)
}

module.exports = {
  DEFAULT_MENU_PREFERENCES,
  applyMenuBarPreferences,
  menuPreferencesPath,
  normalizeMenuPreferences,
  readMenuPreferences,
  supportsMenuBar,
  writeMenuPreferences
}
