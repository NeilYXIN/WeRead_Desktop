const { WE_READ_ORIGIN } = require('./constants')

const NAVIGATION_CLASSIFICATIONS = Object.freeze({
  INTERNAL: 'internal',
  EXTERNAL_HTTPS: 'externalHttps',
  LOCAL_RECOVERY: 'localRecovery',
  BLOCKED: 'blocked'
})

function parseUrl (value) {
  if (typeof value !== 'string' || value.length === 0) return null

  try {
    const parsed = new URL(value)
    if (parsed.username || parsed.password) return null
    return parsed
  } catch {
    return null
  }
}

function isTrustedWeReadUrl (value) {
  const parsed = parseUrl(value)
  return Boolean(parsed && parsed.protocol === 'https:' && parsed.origin === WE_READ_ORIGIN)
}

function isRecoveryUrl (value, recoveryUrl) {
  const parsed = parseUrl(value)
  const parsedRecovery = parseUrl(recoveryUrl)
  if (!parsed || !parsedRecovery || parsed.protocol !== 'file:') return false
  return parsed.href === parsedRecovery.href
}

function classifyNavigation (value, recoveryUrl) {
  if (isTrustedWeReadUrl(value)) return NAVIGATION_CLASSIFICATIONS.INTERNAL
  if (isRecoveryUrl(value, recoveryUrl)) return NAVIGATION_CLASSIFICATIONS.LOCAL_RECOVERY

  const parsed = parseUrl(value)
  if (parsed?.protocol === 'https:') return NAVIGATION_CLASSIFICATIONS.EXTERNAL_HTTPS
  return NAVIGATION_CLASSIFICATIONS.BLOCKED
}

module.exports = {
  NAVIGATION_CLASSIFICATIONS,
  classifyNavigation,
  isRecoveryUrl,
  isTrustedWeReadUrl,
  parseUrl
}
