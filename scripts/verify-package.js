const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const outputDirectory = path.resolve(process.argv[2] || 'release-builds')
const expectedTopLevelEntries = new Set([
  'index.html',
  'lib',
  'main.js',
  'package.json',
  'renderer.js',
  'styles.css'
])

function findFiles (directory, filename) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return findFiles(entryPath, filename)
    return entry.name === filename ? [entryPath] : []
  })
}

const asarFiles = findFiles(outputDirectory, 'app.asar')
if (asarFiles.length !== 1) {
  console.error(`Expected one app.asar under ${outputDirectory}, found ${asarFiles.length}.`)
  process.exit(1)
}

const asarPath = asarFiles[0]
const asarCommand = path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'asar.cmd' : 'asar')
const contentsResult = spawnSync(asarCommand, ['list', asarPath], { encoding: 'utf8' })
if (contentsResult.status !== 0) {
  process.stderr.write(contentsResult.stderr)
  process.exit(contentsResult.status || 1)
}

const unexpectedEntries = contentsResult.stdout
  .split(/\r?\n/)
  .filter(Boolean)
  .map((entry) => entry.replace(/^\//, '').split('/')[0])
  .filter((entry) => !expectedTopLevelEntries.has(entry))

if (unexpectedEntries.length > 0) {
  console.error(`Unexpected packaged entries: ${[...new Set(unexpectedEntries)].join(', ')}`)
  process.exit(1)
}

const resourcesDirectory = path.dirname(asarPath)
const appPath = process.platform === 'darwin'
  ? path.dirname(path.dirname(resourcesDirectory))
  : path.dirname(resourcesDirectory)
const fusesCommand = path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'electron-fuses.cmd' : 'electron-fuses')
const fusesResult = spawnSync(fusesCommand, ['read', '--app', appPath], { encoding: 'utf8' })
if (fusesResult.status !== 0) {
  process.stderr.write(fusesResult.stderr)
  process.exit(fusesResult.status || 1)
}

const expectedFuses = [
  'RunAsNode is Disabled',
  'EnableCookieEncryption is Disabled',
  'EnableNodeOptionsEnvironmentVariable is Disabled',
  'EnableNodeCliInspectArguments is Disabled',
  'EnableEmbeddedAsarIntegrityValidation is Enabled',
  'OnlyLoadAppFromAsar is Enabled',
  'GrantFileProtocolExtraPrivileges is Disabled',
  'WasmTrapHandlers is Enabled'
]
for (const expectedFuse of expectedFuses) {
  if (!fusesResult.stdout.includes(expectedFuse)) {
    console.error(`Packaged app does not report the expected fuse: ${expectedFuse}`)
    process.exit(1)
  }
}

console.log(`Verified package contents and security fuses in ${appPath}.`)
