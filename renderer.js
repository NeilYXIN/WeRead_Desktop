const connectionStatus = document.querySelector('#connection-status')

function updateConnectionStatus () {
  connectionStatus.textContent = navigator.onLine
    ? 'Your device appears online, but WeRead could not be reached. Retry now or use the Navigation menu.'
    : 'Your device appears to be offline. Retry after reconnecting.'
}

window.addEventListener('online', updateConnectionStatus)
window.addEventListener('offline', updateConnectionStatus)
updateConnectionStatus()
