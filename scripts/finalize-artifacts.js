const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const outputDirectory = path.resolve(process.argv[2] || 'release-builds')
const signed = process.argv[3] === 'true'
const platform = process.argv[4] || process.platform
const artifactPattern = /\.(?:dmg|exe|AppImage|deb)$/

function addUnsignedSuffix (filename) {
  const extension = path.extname(filename)
  return `${filename.slice(0, -extension.length)}-unsigned${extension}`
}

let artifacts = fs.readdirSync(outputDirectory).filter((filename) => artifactPattern.test(filename))
if (artifacts.length === 0) {
  console.error(`No release artifacts were found in ${outputDirectory}.`)
  process.exit(1)
}

if (!signed && platform !== 'linux') {
  artifacts = artifacts.map((filename) => {
    const renamed = addUnsignedSuffix(filename)
    fs.renameSync(path.join(outputDirectory, filename), path.join(outputDirectory, renamed))
    return renamed
  })
}

artifacts.sort()
const checksums = artifacts.map((filename) => {
  const contents = fs.readFileSync(path.join(outputDirectory, filename))
  return `${crypto.createHash('sha256').update(contents).digest('hex')}  ${filename}`
})

fs.writeFileSync(path.join(outputDirectory, `SHA256SUMS-${platform}.txt`), `${checksums.join('\n')}\n`)
fs.writeFileSync(
  path.join(outputDirectory, `SIGNING-STATUS-${platform}.txt`),
  platform === 'linux'
    ? 'linux: not code-signed; verify with the accompanying SHA-256 checksums.\n'
    : signed
      ? `${platform}: signed; verify the operating-system signature and accompanying SHA-256 checksums.\n`
      : `${platform}: unsigned build; operating-system trust warnings are expected.\n`
)

console.log(`Prepared ${artifacts.length} ${platform} release artifact(s).`)
