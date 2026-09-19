const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { afterEach, test } = require('node:test')

const { DEFAULT_CHECK_INTERVAL_MS, checkForUpdates, shouldCheckForUpdates } = require('../lib/update-check')

const temporaryDirectories = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

function temporaryDirectory () {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'weread-update-test-'))
  temporaryDirectories.push(directory)
  return directory
}

function testDependencies (release, response = 1) {
  const messages = []
  const openedUrls = []
  return {
    messages,
    openedUrls,
    dialog: {
      async showMessageBox (options) {
        messages.push(options)
        return { response }
      }
    },
    net: {
      async fetch () {
        return { ok: true, async json () { return release } }
      }
    },
    shell: {
      async openExternal (url) { openedUrls.push(url) }
    }
  }
}

test('rate limits automatic checks using the configured interval', () => {
  assert.equal(shouldCheckForUpdates({}, 1000), true)
  assert.equal(shouldCheckForUpdates({ lastUpdateCheckAt: 500 }, 1000), false)
  assert.equal(
    shouldCheckForUpdates({ lastUpdateCheckAt: 1000 }, 1000 + DEFAULT_CHECK_INTERVAL_MS),
    true
  )
  assert.equal(shouldCheckForUpdates({ lastUpdateCheckAt: 1000 }, 2000, 999), true)
})

test('reports an available update and opens only the fixed releases URL', async () => {
  const dependencies = testDependencies({ tag_name: 'v1.2.0', draft: false, prerelease: false }, 0)
  const result = await checkForUpdates({
    ...dependencies,
    currentVersion: '1.1.0',
    manual: true,
    userDataPath: temporaryDirectory()
  })

  assert.deepEqual(result, { status: 'available', version: 'v1.2.0' })
  assert.equal(dependencies.messages.length, 1)
  assert.deepEqual(dependencies.openedUrls, ['https://github.com/NeilYXIN/WeRead_Desktop/releases/latest'])
})

test('reports a current version during a manual check', async () => {
  const dependencies = testDependencies({ tag_name: 'v1.1.0', draft: false, prerelease: false })
  const result = await checkForUpdates({
    ...dependencies,
    currentVersion: '1.1.0',
    manual: true,
    userDataPath: temporaryDirectory()
  })

  assert.equal(result.status, 'current')
  assert.equal(dependencies.messages[0].title, 'WeRead Is Up to Date')
})

test('keeps automatic failures silent and surfaces manual failures', async () => {
  const dependencies = testDependencies({})
  let fetchCount = 0
  dependencies.net.fetch = async () => {
    fetchCount += 1
    throw new Error('offline')
  }
  const userDataPath = temporaryDirectory()

  const automatic = await checkForUpdates({
    ...dependencies,
    currentVersion: '1.1.0',
    manual: false,
    userDataPath
  })
  assert.equal(automatic.status, 'error')
  assert.equal(dependencies.messages.length, 0)

  const rateLimited = await checkForUpdates({
    ...dependencies,
    currentVersion: '1.1.0',
    manual: false,
    userDataPath
  })
  assert.equal(rateLimited.status, 'skipped')
  assert.equal(fetchCount, 1)

  const manual = await checkForUpdates({
    ...dependencies,
    currentVersion: '1.1.0',
    manual: true,
    userDataPath
  })
  assert.equal(manual.status, 'error')
  assert.equal(fetchCount, 2)
  assert.equal(dependencies.messages[0].title, 'Unable to Check for Updates')
})
