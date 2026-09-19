const path = require('node:path')
const { readJsonFile, writeJsonFileAtomically } = require('./state-file')

const DEFAULT_BOUNDS = Object.freeze({ width: 1280, height: 800 })
const MIN_WIDTH = 800
const MIN_HEIGHT = 600
const MAX_DIMENSION = 8192
const MIN_VISIBLE_PIXELS = 100

function intersectsDisplay (bounds, displays) {
  return displays.some((display) => {
    const workArea = display?.workArea || display?.bounds
    if (!workArea) return false

    const intersectionWidth = Math.min(bounds.x + bounds.width, workArea.x + workArea.width) - Math.max(bounds.x, workArea.x)
    const intersectionHeight = Math.min(bounds.y + bounds.height, workArea.y + workArea.height) - Math.max(bounds.y, workArea.y)
    return intersectionWidth >= MIN_VISIBLE_PIXELS && intersectionHeight >= MIN_VISIBLE_PIXELS
  })
}

function normalizeWindowState (state, displays = []) {
  const validDimensions = state &&
    Number.isInteger(state.width) &&
    Number.isInteger(state.height) &&
    state.width >= MIN_WIDTH &&
    state.height >= MIN_HEIGHT &&
    state.width <= MAX_DIMENSION &&
    state.height <= MAX_DIMENSION
  const validPosition = validDimensions && Number.isInteger(state.x) && Number.isInteger(state.y)
  const bounds = validPosition
    ? { x: state.x, y: state.y, width: state.width, height: state.height }
    : { ...DEFAULT_BOUNDS }

  if (!validPosition || displays.length === 0 || !intersectsDisplay(bounds, displays)) {
    return { bounds: { ...DEFAULT_BOUNDS }, isMaximized: false }
  }

  return { bounds, isMaximized: state.isMaximized === true }
}

function windowStatePath (userDataPath) {
  return path.join(userDataPath, 'window-state.json')
}

function readWindowState (userDataPath, displays) {
  return normalizeWindowState(readJsonFile(windowStatePath(userDataPath), null), displays)
}

function writeWindowState (userDataPath, state) {
  try {
    writeJsonFileAtomically(windowStatePath(userDataPath), state)
  } catch (error) {
    console.error('Unable to save window state:', error)
  }
}

module.exports = {
  DEFAULT_BOUNDS,
  MAX_DIMENSION,
  MIN_HEIGHT,
  MIN_WIDTH,
  normalizeWindowState,
  readWindowState,
  writeWindowState
}
