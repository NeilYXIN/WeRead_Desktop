const HOME_URL = 'https://weread.qq.com/'
const WE_READ_ORIGIN = new URL(HOME_URL).origin
const RELEASES_URL = 'https://github.com/NeilYXIN/WeRead_Desktop/releases/latest'

// This legacy name must remain stable so existing users keep their login session.
const SESSION_PARTITION = 'persist:infragistics'

module.exports = { HOME_URL, RELEASES_URL, SESSION_PARTITION, WE_READ_ORIGIN }
