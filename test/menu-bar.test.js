const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { afterEach, test } = require('node:test')

const {
  DEFAULT_MENU_PREFERENCES,
  applyMenuBarPreferences,
  menuPreferencesPath,
  normalizeMenuPreferences,
  readMenuPreferences,
  supportsMenuBar,
  writeMenuPreferences
} = require('../lib/menu-bar')

const temporaryDirectories = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

function temporaryDirectory () {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'weread-menu-test-'))
  temporaryDirectories.push(directory)
  return directory
}

test('only enables auto-hide for an explicit boolean true', () => {
  for (const value of [null, undefined, {}, { autoHideMenuBar: 'true' }, { autoHideMenuBar: 1 }]) {
    assert.deepEqual(normalizeMenuPreferences(value), DEFAULT_MENU_PREFERENCES)
  }
  assert.deepEqual(normalizeMenuPreferences({ autoHideMenuBar: true }), { autoHideMenuBar: true })
})

test('persists both choices and defaults to visible for missing or corrupt preferences', () => {
  const directory = temporaryDirectory()
  assert.deepEqual(readMenuPreferences(directory), DEFAULT_MENU_PREFERENCES)
  for (const autoHideMenuBar of [true, false]) {
    const saved = writeMenuPreferences(directory, { autoHideMenuBar, unexpected: 'discarded' })
    assert.deepEqual(saved, { autoHideMenuBar })
    assert.deepEqual(readMenuPreferences(directory), saved)
    assert.deepEqual(JSON.parse(fs.readFileSync(menuPreferencesPath(directory), 'utf8')), saved)
  }
  fs.writeFileSync(menuPreferencesPath(directory), '{broken')
  assert.deepEqual(readMenuPreferences(directory), DEFAULT_MENU_PREFERENCES)
})

test('reports write failures rather than claiming the setting was saved', () => {
  const directory = temporaryDirectory()
  fs.mkdirSync(menuPreferencesPath(directory))
  assert.throws(() => writeMenuPreferences(directory, { autoHideMenuBar: true }))
})

test('hides immediately, restores explicitly, and reapplies after menu replacement on Windows and Linux', () => {
  for (const platform of ['linux', 'win32']) {
    const window = {
      autoHide: false,
      visible: true,
      isDestroyed: () => false,
      // Electron deliberately does not hide an already visible menu here.
      setAutoHideMenuBar (value) { this.autoHide = value },
      setMenuBarVisibility (value) { this.visible = value }
    }
    assert.equal(supportsMenuBar(platform), true)
    applyMenuBarPreferences(window, { autoHideMenuBar: true }, platform)
    assert.equal(window.autoHide, true)
    assert.equal(window.visible, false)

    // Simulate installing a new application menu that makes the bar visible.
    window.visible = true
    applyMenuBarPreferences(window, { autoHideMenuBar: true }, platform)
    assert.equal(window.visible, false)

    applyMenuBarPreferences(window, { autoHideMenuBar: false }, platform)
    assert.equal(window.autoHide, false)
    assert.equal(window.visible, true)
  }
})

test('leaves the macOS system menu alone and tolerates missing or closed windows', () => {
  assert.equal(supportsMenuBar('darwin'), false)
  applyMenuBarPreferences({}, { autoHideMenuBar: true }, 'darwin')
  applyMenuBarPreferences(null, { autoHideMenuBar: true }, 'linux')
  applyMenuBarPreferences({ isDestroyed: () => true }, { autoHideMenuBar: true }, 'win32')
})
