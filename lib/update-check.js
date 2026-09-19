const path = require('node:path')
const { RELEASES_URL } = require('./constants')
const { readJsonFile, writeJsonFileAtomically } = require('./state-file')
const { UPDATE_INTERVALS } = require('./update-preferences')
const { compareStableVersions, parseStableVersion } = require('./version')

const API_URL = 'https://api.github.com/repos/NeilYXIN/WeRead_Desktop/releases/latest'
const DEFAULT_CHECK_INTERVAL_MS = UPDATE_INTERVALS.monthly
const REQUEST_TIMEOUT_MS = 5000

function updateStatePath (userDataPath) {
  return path.join(userDataPath, 'update-state.json')
}

function shouldCheckForUpdates (state, now = Date.now(), intervalMs = DEFAULT_CHECK_INTERVAL_MS) {
  if (!Number.isFinite(state?.lastUpdateCheckAt)) return true
  const effectiveInterval = Number.isFinite(intervalMs) && intervalMs > 0
    ? intervalMs
    : DEFAULT_CHECK_INTERVAL_MS
  return now - state.lastUpdateCheckAt >= effectiveInterval
}

async function checkForUpdates ({
  checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS,
  currentVersion,
  dialog,
  manual,
  net,
  shell,
  userDataPath
}) {
  const statePath = updateStatePath(userDataPath)
  const state = readJsonFile(statePath, {})
  if (!manual && !shouldCheckForUpdates(state, Date.now(), checkIntervalMs)) return { status: 'skipped' }

  const checkStartedAt = Date.now()
  try {
    if (!manual) {
      state.lastUpdateCheckAt = checkStartedAt
      writeJsonFileAtomically(statePath, state)
    }

    const response = await net.fetch(API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': `WeRead-Desktop/${currentVersion}`,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}.`)

    const release = await response.json()
    if (release.draft || release.prerelease || !parseStableVersion(release.tag_name)) {
      throw new Error('GitHub did not return a stable version tag.')
    }

    const nextState = { lastUpdateCheckAt: checkStartedAt }
    const comparison = compareStableVersions(release.tag_name, currentVersion)
    if (comparison === null) throw new Error('The installed app version is invalid.')

    if (comparison <= 0) {
      writeJsonFileAtomically(statePath, nextState)
      if (manual) {
        await dialog.showMessageBox({
          type: 'info',
          title: 'WeRead Is Up to Date',
          message: `You are using the latest version (${currentVersion}).`
        })
      }
      return { status: 'current' }
    }

    if (!manual && state.lastNotifiedVersion === release.tag_name) {
      nextState.lastNotifiedVersion = release.tag_name
      writeJsonFileAtomically(statePath, nextState)
      return { status: 'already-notified' }
    }

    nextState.lastNotifiedVersion = release.tag_name
    writeJsonFileAtomically(statePath, nextState)
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'WeRead Update Available',
      message: `WeRead ${release.tag_name.replace(/^v/, '')} is available.`,
      detail: `You are currently using ${currentVersion}. Downloads are handled by GitHub.`,
      buttons: ['View Release', 'Later'],
      defaultId: 0,
      cancelId: 1
    })

    if (result.response === 0) await shell.openExternal(RELEASES_URL)
    return { status: 'available', version: release.tag_name }
  } catch (error) {
    if (manual) {
      await dialog.showMessageBox({
        type: 'warning',
        title: 'Unable to Check for Updates',
        message: 'WeRead could not check GitHub for a new release.',
        detail: error.message
      })
    }
    return { status: 'error', error }
  }
}

module.exports = {
  API_URL,
  DEFAULT_CHECK_INTERVAL_MS,
  REQUEST_TIMEOUT_MS,
  checkForUpdates,
  shouldCheckForUpdates,
  updateStatePath
}
