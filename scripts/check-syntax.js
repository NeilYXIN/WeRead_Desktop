const { readdirSync, statSync } = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const ROOT = path.resolve(__dirname, '..')
const INCLUDED_PATHS = ['main.js', 'renderer.js', 'lib', 'scripts', 'test']

function javascriptFiles (entry) {
  const absolutePath = path.join(ROOT, entry)
  if (!statSync(absolutePath).isDirectory()) return absolutePath.endsWith('.js') ? [absolutePath] : []

  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((item) => {
    const child = path.join(entry, item.name)
    return item.isDirectory() ? javascriptFiles(child) : child.endsWith('.js') ? [path.join(ROOT, child)] : []
  })
}

const files = INCLUDED_PATHS.flatMap(javascriptFiles)
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}

console.log(`Syntax checked ${files.length} JavaScript files.`)
