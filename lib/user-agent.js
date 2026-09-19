function stripElectronFromUserAgent (userAgent) {
  if (typeof userAgent !== 'string') return ''
  return userAgent.replace(/\sElectron\/[^\s]+/g, '')
}

module.exports = { stripElectronFromUserAgent }
