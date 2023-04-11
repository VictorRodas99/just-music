export default class Timer {
  /**
   * Create a new timer instance
   * @param {function} callback The function to call when the timer expires
   * @param {number} delay The number of milliseconds to wait before calling the callback
   */
  constructor (callback, delay) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback for timer must be a function')
    }

    if (delay < 0) {
      throw new Error('Delay cannot be negative!')
    }

    this.remaining = delay
    this.callback = callback
    this.timerId = undefined
    this.start = undefined
    this.isPaused = false
    this.resume()
  }

  /**
   * Gets the current time of the timer.
   * @returns {number} the current time in milliseconds.
   */
  currentTime () {
    return this.isPaused
      ? this.remaining
      : this.start + this.remaining - Date.now()
  }

  pause () {
    if (!this.timerId) return

    clearTimeout(this.timerId)
    this.timerId = null
    this.remaining -= Date.now() - this.start
    this.isPaused = true
  }

  resume () {
    if (this.timerId) return

    this.start = Date.now()
    this.timerId = setTimeout(() => this.callback, this.remaining)
    this.isPaused = false
  }

  /**
   * Restart the timer with the original or a new delay
   * @param {number | undefined} [newDelay] The number of milliseconds to wait before calling the callback. If not provided, the original delay is used
   */
  restart (newDelay) {
    if (newDelay && typeof newDelay !== 'number') {
      throw new TypeError('Given delay must be a number')
    }

    this.pause()
    this.remaining = newDelay ?? this.remaining
    this.resume()
  }
}
