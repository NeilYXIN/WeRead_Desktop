const path = require('node:path')
const { spawnSync } = require('node:child_process')

function targetsMac (args, platform) {
  if (args.includes('--win') || args.includes('--linux')) return false
  return args.includes('--mac') || platform === 'darwin'
}

function hasSigningIdentity (args, environment) {
  return Boolean(
    environment.CSC_LINK ||
    environment.CSC_NAME ||
    args.some((argument) => argument.startsWith('--config.mac.identity'))
  )
}

function buildArguments (args, platform = process.platform, environment = process.env) {
  const result = [...args]

  // electron-builder otherwise treats any CI environment as permission to
  // publish. Releases are uploaded by the dedicated GitHub Actions job.
  if (!result.some((argument) => argument === '--publish' || argument === '-p' || argument.startsWith('--publish='))) {
    result.push('--publish=never')
  }

  // Fuse changes invalidate Electron's upstream macOS signature. Ad-hoc signing
  // keeps local/unsigned builds runnable without pretending they are trusted.
  if (targetsMac(result, platform) && !hasSigningIdentity(result, environment)) {
    result.push('--config.mac.identity=-', '--config.mac.hardenedRuntime=false')
  }

  return result
}

function run () {
  const cliPath = path.join(__dirname, '..', 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js')
  const result = spawnSync(process.execPath, [cliPath, ...buildArguments(process.argv.slice(2))], {
    env: process.env,
    stdio: 'inherit'
  })

  if (result.error) throw result.error
  process.exit(result.status ?? 1)
}

if (require.main === module) run()

module.exports = { buildArguments, hasSigningIdentity, targetsMac }
