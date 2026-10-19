// Runs the real application in an isolated profile. This file is not packaged.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { setTimeout: delay } = require('node:timers/promises')
const { app, BrowserWindow, Menu } = require('electron')

const { RECOVERY_URL } = require('../lib/constants')
const { readMenuPreferences } = require('../lib/menu-bar')
const packageMetadata = require('../package.json')

assert.equal(process.versions.electron, packageMetadata.devDependencies.electron,
  'The smoke test must use the pinned Electron runtime')

const phase = process.env.WEREAD_SMOKE_PHASE
const profile = process.env.WEREAD_SMOKE_PROFILE
const results = process.env.WEREAD_SMOKE_RESULTS
assert.ok(profile && path.isAbsolute(profile), 'An absolute, isolated smoke-test profile is required')
assert.ok(results && path.isAbsolute(results), 'An absolute evidence directory is required')
assert.ok(['default', 'hidden', 'shown', 'mac'].includes(phase), 'Unknown smoke-test phase')
assert.equal(process.platform, phase === 'mac' ? 'darwin' : 'linux')
fs.mkdirSync(profile, { recursive: true })
fs.mkdirSync(results, { recursive: true })
fs.writeFileSync(path.join(profile, 'update-preferences.json'), JSON.stringify({
  automaticChecksEnabled: false,
  interval: 'monthly'
}))
app.setPath('userData', profile)
app.setPath('sessionData', profile)
// Exercise the local recovery screen without contacting WeRead or GitHub.
app.commandLine.appendSwitch('host-resolver-rules', 'MAP * ~NOTFOUND')
app.commandLine.appendSwitch('disable-background-networking')
if (process.platform === 'linux') app.commandLine.appendSwitch('ozone-platform', 'x11')

require('../main')

async function waitFor (predicate, description) {
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    if (predicate()) return
    await delay(50)
  }
  throw new Error(`Timed out: ${description}`)
}

function key (keys) {
  execFileSync('xdotool', ['key', '--clearmodifiers', keys], { timeout: 5000 })
}

async function evidence (window, label) {
  await delay(250)
  // Capture the desktop: webContents.capturePage() excludes the native menu.
  if (process.platform === 'linux') {
    execFileSync('import', ['-window', 'root', path.join(results, `${phase}-${label}.png`)], { timeout: 5000 })
  }
  const state = {
    phase,
    label,
    appVersion: packageMetadata.version,
    electronVersion: process.versions.electron,
    url: window.webContents.getURL(),
    saved: readMenuPreferences(profile),
    ...(process.platform === 'linux'
      ? { autoHide: window.isMenuBarAutoHide(), visible: window.isMenuBarVisible() }
      : {})
  }
  fs.appendFileSync(path.join(results, 'states.jsonl'), `${JSON.stringify(state)}\n`)
  console.log(JSON.stringify(state))
}

async function expectMode (window, hidden) {
  await waitFor(() => window.isMenuBarAutoHide() === hidden && window.isMenuBarVisible() === !hidden,
    hidden ? 'menu hidden' : 'menu visible')
  assert.equal(Menu.getApplicationMenu().getMenuItemById('auto-hide-menu-bar').checked, hidden)
}

function changeUpdateFrequency (window) {
  // This existing action rebuilds the entire application menu.
  const help = Menu.getApplicationMenu().items.find((item) => item.role === 'help')
  const frequency = help.submenu.items.find((item) => item.label === 'Automatic Check Frequency')
  frequency.submenu.items.find((item) => item.label === 'Weekly').click({}, window, window.webContents)
  assert.equal(JSON.parse(fs.readFileSync(path.join(profile, 'update-preferences.json'))).interval, 'weekly')
}

app.whenReady().then(async () => {
  const window = BrowserWindow.getAllWindows()[0]
  assert.ok(window, 'The real main.js must create a window')
  await waitFor(() => window.isVisible() && window.webContents.getURL() === RECOVERY_URL &&
    !window.webContents.isLoading(), 'recovery window ready')

  if (phase === 'mac') {
    assert.ok(Menu.getApplicationMenu())
    assert.equal(Menu.getApplicationMenu().getMenuItemById('auto-hide-menu-bar'), null)
    changeUpdateFrequency(window)
    assert.ok(Menu.getApplicationMenu())
    assert.equal(Menu.getApplicationMenu().getMenuItemById('auto-hide-menu-bar'), null)
    await evidence(window, 'system-menu-preserved')
    return
  }

  const windowId = String(window.getNativeWindowHandle().readUInt32LE())
  execFileSync('xdotool', ['windowactivate', '--sync', windowId], { timeout: 5000 })
  await waitFor(() => window.isFocused(), 'native window focus')

  if (phase === 'default') {
    await expectMode(window, false)
    await evidence(window, 'initial-visible')
    key('ctrl+shift+m')
    await expectMode(window, true)
    assert.deepEqual(readMenuPreferences(profile), { autoHideMenuBar: true })
    await evidence(window, 'hidden')

    key('Alt_L')
    await waitFor(() => window.isMenuBarVisible(), 'Alt reveals the menu')
    assert.equal(readMenuPreferences(profile).autoHideMenuBar, true)
    await evidence(window, 'alt-revealed')
    key('Escape')
    await waitFor(() => !window.isMenuBarVisible(), 'Escape dismisses the temporary menu')

    changeUpdateFrequency(window)
    await expectMode(window, true)
    await evidence(window, 'after-menu-rebuild')
  } else if (phase === 'hidden') {
    await expectMode(window, true)
    await evidence(window, 'restart-hidden')
    const reloaded = new Promise((resolve) => window.webContents.once('did-finish-load', resolve))
    key('ctrl+r')
    await reloaded
    await expectMode(window, true)
    await evidence(window, 'reload-while-hidden')
    // The accelerator must still work with the entire menu bar hidden.
    key('ctrl+shift+m')
    await expectMode(window, false)
    assert.deepEqual(readMenuPreferences(profile), { autoHideMenuBar: false })
    await evidence(window, 'restored')
  } else {
    await expectMode(window, false)
    await evidence(window, 'restart-visible')
  }
}).then(() => app.quit()).catch((error) => {
  console.error(error)
  fs.writeFileSync(path.join(results, `${phase}-failure.txt`), error.stack || String(error))
  if (process.platform === 'linux') {
    try {
      execFileSync('import', ['-window', 'root', path.join(results, `${phase}-failure.png`)], { timeout: 5000 })
    } catch (captureError) {
      console.error('Could not capture failure screenshot:', captureError.message)
    }
  }
  app.exit(1)
})

setTimeout(() => {
  console.error('Menu bar smoke test exceeded its 60-second limit')
  app.exit(1)
}, 60000).unref()
