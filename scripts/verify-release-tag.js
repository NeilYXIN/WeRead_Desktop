const { version } = require('../package.json')

const expectedTag = `v${version}`
const actualTag = process.env.GITHUB_REF_NAME || process.argv[2]

if (actualTag !== expectedTag) {
  console.error(`Release tag ${actualTag || '(missing)'} does not match package version ${expectedTag}.`)
  process.exit(1)
}

console.log(`Release tag ${actualTag} matches package version.`)
