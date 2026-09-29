const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { afterEach, test } = require('node:test')

const temporaryDirectories = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

function temporaryDirectory () {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'weread-artifact-test-'))
  temporaryDirectories.push(directory)
  return directory
}

test('labels multiple unsigned desktop artifacts and writes their checksums', () => {
  const directory = temporaryDirectory()
  const arm64Contents = Buffer.from('arm64 installer fixture')
  const x64Contents = Buffer.from('x64 installer fixture')
  fs.writeFileSync(path.join(directory, 'WeRead-1.1.2-arm64.dmg'), arm64Contents)
  fs.writeFileSync(path.join(directory, 'WeRead-1.1.2-x64.dmg'), x64Contents)

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, '..', 'scripts', 'finalize-artifacts.js'), directory, 'false', 'macos'],
    { encoding: 'utf8' }
  )

  assert.equal(result.status, 0, result.stderr)
  assert.equal(fs.existsSync(path.join(directory, 'WeRead-1.1.2-arm64-unsigned.dmg')), true)
  assert.equal(fs.existsSync(path.join(directory, 'WeRead-1.1.2-x64-unsigned.dmg')), true)
  const arm64Hash = crypto.createHash('sha256').update(arm64Contents).digest('hex')
  const x64Hash = crypto.createHash('sha256').update(x64Contents).digest('hex')
  assert.equal(
    fs.readFileSync(path.join(directory, 'SHA256SUMS-macos.txt'), 'utf8'),
    `${arm64Hash}  WeRead-1.1.2-arm64-unsigned.dmg\n${x64Hash}  WeRead-1.1.2-x64-unsigned.dmg\n`
  )
  assert.match(fs.readFileSync(path.join(directory, 'SIGNING-STATUS-macos.txt'), 'utf8'), /unsigned/)
})

test('fails when a release build produced no artifacts', () => {
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, '..', 'scripts', 'finalize-artifacts.js'), temporaryDirectory(), 'true', 'linux'],
    { encoding: 'utf8' }
  )
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /No release artifacts/)
})
