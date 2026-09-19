const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

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

function findUnexpectedAsarEntries (listing) {
  return listing
    .split(/\r?\n/)
    .filter(Boolean)
    .map((entry) => entry.replace(/^[\\/]+/, '').split(/[\\/]/)[0])
    .filter((entry) => !expectedTopLevelEntries.has(entry))
}

function resolveFuseTarget (asarPath, platform, packageMetadata) {
  const resourcesDirectory = path.dirname(asarPath)

  if (platform === 'darwin') {
    const appBundle = path.dirname(path.dirname(resourcesDirectory))
    if (!appBundle.endsWith('.app')) {
      throw new Error(`Could not locate a macOS app bundle from ${asarPath}.`)
    }
    return appBundle
  }

  const applicationDirectory = path.dirname(resourcesDirectory)
  if (platform === 'win32') {
    const executableName = packageMetadata.build?.win?.executableName ||
      packageMetadata.build?.executableName ||
      packageMetadata.productName
    return path.join(applicationDirectory, `${executableName}.exe`)
  }

  if (platform === 'linux') {
    const executableName = packageMetadata.build?.linux?.executableName ||
      packageMetadata.build?.executableName ||
      packageMetadata.name.toLowerCase()
    return path.join(applicationDirectory, executableName)
  }

  throw new Error(`Unsupported verification platform: ${platform}`)
}

function verifyPackage (outputDirectory, platform = process.platform) {
  const asarFiles = findFiles(outputDirectory, 'app.asar')
  if (asarFiles.length !== 1) {
    throw new Error(`Expected one app.asar under ${outputDirectory}, found ${asarFiles.length}.`)
  }

  const asarPath = asarFiles[0]
  const asarCommand = path.join(__dirname, '..', 'node_modules', '@electron', 'asar', 'bin', 'asar.js')
  const contentsResult = spawnSync(process.execPath, [asarCommand, 'list', asarPath], { encoding: 'utf8' })
  if (contentsResult.status !== 0) {
    throw new Error(contentsResult.stderr || 'Unable to inspect app.asar.')
  }

  const unexpectedEntries = findUnexpectedAsarEntries(contentsResult.stdout)

  if (unexpectedEntries.length > 0) {
    throw new Error(`Unexpected packaged entries: ${[...new Set(unexpectedEntries)].join(', ')}`)
  }

  const packageMetadata = require(path.join(__dirname, '..', 'package.json'))
  const fuseTarget = resolveFuseTarget(asarPath, platform, packageMetadata)
  if (!fs.statSync(fuseTarget).isFile() && platform !== 'darwin') {
    throw new Error(`Expected packaged Electron executable at ${fuseTarget}.`)
  }

  const fusesCommand = path.join(__dirname, '..', 'node_modules', '@electron', 'fuses', 'dist', 'bin.js')
  const fusesResult = spawnSync(process.execPath, [fusesCommand, 'read', '--app', fuseTarget], { encoding: 'utf8' })
  if (fusesResult.status !== 0) {
    throw new Error(fusesResult.stderr || `Unable to inspect Electron fuses in ${fuseTarget}.`)
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
      throw new Error(`Packaged app does not report the expected fuse: ${expectedFuse}`)
    }
  }

  console.log(`Verified package contents and security fuses in ${fuseTarget}.`)
}

if (require.main === module) {
  try {
    verifyPackage(path.resolve(process.argv[2] || 'release-builds'))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = { findUnexpectedAsarEntries, resolveFuseTarget, verifyPackage }
