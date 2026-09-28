const fs = require('node:fs')
const path = require('node:path')

const { RECOVERY_SCHEME } = require('./constants')

const RECOVERY_RESOURCES = new Map([
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/renderer.js', ['renderer.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']]
])

function textResponse (body, status) {
  return new Response(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}

function createRecoveryProtocolHandler (rootDirectory, onError = console.error) {
  return function handleRecoveryRequest (request) {
    let url
    try {
      url = new URL(request.url)
    } catch {
      return textResponse('Not found', 404)
    }

    if (request.method !== 'GET') return textResponse('Method not allowed', 405)
    if (url.protocol !== `${RECOVERY_SCHEME}:` || url.hostname !== 'recovery' || url.search) {
      return textResponse('Not found', 404)
    }

    const resource = RECOVERY_RESOURCES.get(url.pathname)
    if (!resource) return textResponse('Not found', 404)

    const [filename, contentType] = resource
    try {
      return new Response(fs.readFileSync(path.join(rootDirectory, filename)), {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': contentType,
          'X-Content-Type-Options': 'nosniff'
        }
      })
    } catch (error) {
      onError(error)
      return textResponse('Recovery page unavailable', 500)
    }
  }
}

module.exports = { createRecoveryProtocolHandler }
