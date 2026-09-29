const connectionStatus = document.querySelector('#connection-status')

function updateConnectionStatus () {
  connectionStatus.textContent = navigator.onLine
    ? 'Your device is online. Select Continue to open WeRead.'
    : 'Waiting for a network connection. You may leave this window open and continue when ready.'
}

window.addEventListener('online', updateConnectionStatus)
window.addEventListener('offline', updateConnectionStatus)
updateConnectionStatus()
