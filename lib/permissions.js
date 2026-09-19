const { isTrustedWeReadUrl } = require('./navigation')

const ALLOWED_PERMISSIONS = new Set(['clipboard-sanitized-write', 'fullscreen'])

function isPermissionAllowed (permission, requestingUrl, details = {}) {
  if (!ALLOWED_PERMISSIONS.has(permission)) return false
  if (!isTrustedWeReadUrl(requestingUrl)) return false
  if (details.isMainFrame === false) return false
  return true
}

module.exports = { ALLOWED_PERMISSIONS, isPermissionAllowed }
