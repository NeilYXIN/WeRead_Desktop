function createSingleFlight (task) {
  let activePromise = null

  return function run (...args) {
    if (activePromise) return activePromise

    const promise = Promise.resolve().then(() => task(...args))
    activePromise = promise
    void promise.then(clear, clear)
    return promise

    function clear () {
      if (activePromise === promise) activePromise = null
    }
  }
}

module.exports = { createSingleFlight }
