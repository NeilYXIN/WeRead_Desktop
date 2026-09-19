const USER_GESTURE_WINDOW_MS = 1500

function isRecentUserGesture (timestamp, now = Date.now()) {
  return Number.isFinite(timestamp) && timestamp > 0 && now >= timestamp && now - timestamp <= USER_GESTURE_WINDOW_MS
}

module.exports = { USER_GESTURE_WINDOW_MS, isRecentUserGesture }
