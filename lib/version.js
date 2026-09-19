function parseStableVersion (value) {
  if (typeof value !== 'string') return null
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value.trim())
  if (!match) return null
  return match.slice(1).map(Number)
}

function compareStableVersions (left, right) {
  const leftParts = parseStableVersion(left)
  const rightParts = parseStableVersion(right)
  if (!leftParts || !rightParts) return null

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1
    if (leftParts[index] < rightParts[index]) return -1
  }
  return 0
}

module.exports = { compareStableVersions, parseStableVersion }
