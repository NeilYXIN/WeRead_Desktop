const { app, BrowserWindow, dialog, Menu, net, protocol, screen, session, shell } = require('electron')

const { HOME_URL, RECOVERY_SCHEME, RECOVERY_URL, RELEASES_URL, SESSION_PARTITION } = require('./lib/constants')
const { classifyNavigation, isRecoveryUrl, isTrustedWeReadUrl } = require('./lib/navigation')
const { isPermissionAllowed } = require('./lib/permissions')
const { createRecoveryProtocolHandler } = require('./lib/recovery-protocol')
const { createSingleFlight } = require('./lib/single-flight')
const { checkForUpdates } = require('./lib/update-check')
const {
  DEFAULT_UPDATE_PREFERENCES,
  UPDATE_INTERVALS,
  readUpdatePreferences,
  writeUpdatePreferences
} = require('./lib/update-preferences')
const { stripElectronFromUserAgent } = require('./lib/user-agent')
const { isRecentUserGesture } = require('./lib/user-gesture')
const { readWindowState, writeWindowState } = require('./lib/window-state')

app.enableSandbox()
protocol.registerSchemesAsPrivileged([
  { scheme: RECOVERY_SCHEME, privileges: { secure: true, standard: true } }
])

const hasSingleInstanceLock = app.requestSingleInstanceLock()
let mainWindow = null
let isQuitting = false
let updatePreferences = { ...DEFAULT_UPDATE_PREFERENCES }

function recoveryFileUrl () {
  return RECOVERY_URL
}

function openExternalHttps (url) {
  if (classifyNavigation(url, recoveryFileUrl()) !== 'externalHttps') return
  void shell.openExternal(url)
}

const loadRecoveryPage = createSingleFlight(async () => {
  const window = mainWindow
  if (!window || window.isDestroyed() || isRecoveryUrl(window.webContents.getURL(), RECOVERY_URL)) return

  try {
    await window.loadURL(RECOVERY_URL)
  } catch (error) {
    if (isQuitting || window.isDestroyed()) return
    console.error('Unable to load the recovery page:', error)
  }
})

async function loadWeRead (url = HOME_URL) {
  if (!mainWindow || mainWindow.isDestroyed() || !isTrustedWeReadUrl(url)) return

  try {
    await mainWindow.loadURL(url)
  } catch (error) {
    if (isQuitting || !mainWindow || mainWindow.isDestroyed()) return
    const replacedByRecovery = error?.code === 'ERR_ABORTED' && isRecoveryUrl(error?.url, RECOVERY_URL)
    if (!replacedByRecovery) console.error('Unable to load WeRead:', error)
    await loadRecoveryPage()
  }
}

function configureSession (persistentSession) {
  persistentSession.protocol.handle(
    RECOVERY_SCHEME,
    createRecoveryProtocolHandler(__dirname, (error) => console.error('Unable to read a recovery resource:', error))
  )
  persistentSession.setUserAgent(stripElectronFromUserAgent(persistentSession.getUserAgent()))

  persistentSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (!webContents || webContents !== mainWindow?.webContents) return false
    return isPermissionAllowed(permission, requestingOrigin, details)
  })

  persistentSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const requestingUrl = details?.requestingUrl || webContents?.getURL()
    const allowed = Boolean(
      webContents &&
      webContents === mainWindow?.webContents &&
      isPermissionAllowed(permission, requestingUrl, details)
    )
    callback(allowed)
  })

  persistentSession.setDevicePermissionHandler(() => false)
}

function configureNavigation (window) {
  const { webContents } = window
  let lastUserGestureAt = 0

  webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && !input.isAutoRepeat) lastUserGestureAt = Date.now()
  })

  webContents.on('before-mouse-event', (_event, mouse) => {
    if (mouse.type === 'mouseDown') lastUserGestureAt = Date.now()
  })

  webContents.on('will-attach-webview', (event) => event.preventDefault())

  webContents.on('will-navigate', (event, legacyUrl) => {
    const targetUrl = event.url || legacyUrl
    const classification = classifyNavigation(targetUrl, recoveryFileUrl())

    if (classification === 'internal' || classification === 'localRecovery') return

    event.preventDefault()
    if (classification === 'externalHttps' && isRecentUserGesture(lastUserGestureAt)) {
      openExternalHttps(targetUrl)
    }
  })

  webContents.on('will-redirect', (event, legacyUrl) => {
    const targetUrl = event.url || legacyUrl
    if (classifyNavigation(targetUrl, recoveryFileUrl()) !== 'internal') event.preventDefault()
  })

  webContents.setWindowOpenHandler(({ url }) => {
    const classification = classifyNavigation(url, recoveryFileUrl())
    const openedFromRecoveryPage = isRecoveryUrl(webContents.getURL(), recoveryFileUrl())

    if (openedFromRecoveryPage && url === HOME_URL && isRecentUserGesture(lastUserGestureAt)) {
      void shell.openExternal(HOME_URL)
    } else if (classification === 'internal') {
      void loadWeRead(url)
    } else if (classification === 'externalHttps' && isRecentUserGesture(lastUserGestureAt)) {
      openExternalHttps(url)
    }

    return { action: 'deny' }
  })
}

function configureFailureHandling (window) {
  window.webContents.on('did-fail-load', (_event, errorCode, _description, validatedUrl, isMainFrame) => {
    if (!isMainFrame || errorCode === -3 || isRecoveryUrl(validatedUrl, recoveryFileUrl())) return
    void loadRecoveryPage()
  })

  window.webContents.on('render-process-gone', (_event, details) => {
    if (isQuitting || details.reason === 'clean-exit') return
    void loadRecoveryPage()
  })
}

function createWindow () {
  const savedState = readWindowState(app.getPath('userData'), screen.getAllDisplays())

  mainWindow = new BrowserWindow({
    ...savedState.bounds,
    minWidth: 800,
    minHeight: 600,
    show: false,
    navigateOnDragDrop: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false,
      partition: SESSION_PARTITION
    }
  })

  if (savedState.isMaximized) mainWindow.maximize()

  configureNavigation(mainWindow)
  configureFailureHandling(mainWindow)

  mainWindow.once('ready-to-show', () => mainWindow?.show())
  mainWindow.on('close', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    writeWindowState(app.getPath('userData'), {
      ...mainWindow.getNormalBounds(),
      isMaximized: mainWindow.isMaximized()
    })
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  void loadWeRead()
}

function navigateBack () {
  if (mainWindow?.webContents.navigationHistory.canGoBack()) {
    mainWindow.webContents.navigationHistory.goBack()
  }
}

function navigateForward () {
  if (mainWindow?.webContents.navigationHistory.canGoForward()) {
    mainWindow.webContents.navigationHistory.goForward()
  }
}

function runUpdateCheck (manual) {
  if (!manual && !updatePreferences.automaticChecksEnabled) {
    return Promise.resolve({ status: 'disabled' })
  }

  return checkForUpdates({
    checkIntervalMs: UPDATE_INTERVALS[updatePreferences.interval],
    currentVersion: app.getVersion(),
    dialog,
    manual,
    net,
    shell,
    userDataPath: app.getPath('userData')
  })
}

function saveUpdatePreferences (changes) {
  try {
    updatePreferences = writeUpdatePreferences(app.getPath('userData'), {
      ...updatePreferences,
      ...changes
    })
    installApplicationMenu()
  } catch (error) {
    console.error('Unable to save update preferences:', error)
  }
}

function showAboutDialog () {
  return dialog.showMessageBox({
    type: 'info',
    title: `About ${app.name}`,
    message: `${app.name} ${app.getVersion()}`,
    detail: 'An unofficial desktop wrapper for WeRead.'
  })
}

function installApplicationMenu () {
  const navigationMenu = {
    label: 'Navigation',
    submenu: [
      { label: 'Home', accelerator: 'CmdOrCtrl+Shift+H', click: () => void loadWeRead() },
      {
        label: 'Back',
        accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Alt+Left',
        click: navigateBack
      },
      {
        label: 'Forward',
        accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Alt+Right',
        click: navigateForward
      },
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
      { label: 'Retry WeRead', click: () => void loadWeRead() }
    ]
  }

  const helpMenu = {
    role: 'help',
    submenu: [
      { label: 'Check for Updates…', click: () => void runUpdateCheck(true) },
      {
        label: 'Automatically Check for Updates',
        type: 'checkbox',
        checked: updatePreferences.automaticChecksEnabled,
        click: (menuItem) => {
          saveUpdatePreferences({ automaticChecksEnabled: menuItem.checked })
          if (menuItem.checked) void runUpdateCheck(false)
        }
      },
      {
        label: 'Automatic Check Frequency',
        submenu: [
          ['Daily', 'daily'],
          ['Weekly', 'weekly'],
          ['Monthly', 'monthly']
        ].map(([label, interval]) => ({
          label,
          type: 'radio',
          checked: updatePreferences.interval === interval,
          click: () => {
            saveUpdatePreferences({ interval })
            if (updatePreferences.automaticChecksEnabled) void runUpdateCheck(false)
          }
        }))
      },
      { label: 'View Releases', click: () => openExternalHttps(RELEASES_URL) },
      ...(process.platform === 'darwin'
        ? []
        : [{ type: 'separator' }, { label: `About ${app.name}`, click: () => void showAboutDialog() }])
    ]
  }

  const template = process.platform === 'darwin'
    ? [
        {
          label: app.name,
          submenu: [
            { label: `About ${app.name}`, click: () => void showAboutDialog() },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        },
        { role: 'editMenu' },
        navigationMenu,
        { role: 'windowMenu' },
        helpMenu
      ]
    : [
        { label: 'File', submenu: [{ role: 'quit' }] },
        { role: 'editMenu' },
        navigationMenu,
        { role: 'viewMenu' },
        helpMenu
      ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

if (!hasSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  })

  app.whenReady().then(() => {
    configureSession(session.fromPartition(SESSION_PARTITION))
    updatePreferences = readUpdatePreferences(app.getPath('userData'))
    createWindow()
    installApplicationMenu()
    void runUpdateCheck(false)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
