export const isLiteralObject = (value) => {
  if (value === null || value === undefined) return false

  return typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
}

/**
 * Validates an object based on specified criteria
 *
 * @param {*} data - The object to be validated
 * @param {object} options - The options for validation
 * @param {function} options.avoid - The function that determines if a value should be avoided
 * @param {Array<string>} [options.keysRequired=[]] - The array of required keys in the object
 *
 * @returns {object} The validated object
 */
export const validateObject = (data, { avoid, keysRequired = [] }) => {
  if (!isLiteralObject(data)) {
    throw new Error('Given argument must be a literal object')
  }

  const values = Object.values(data)

  if (values.length <= 0) {
    throw new Error('There is no data in the object')
  }

  const existsExcluded = values.filter(avoid).length

  if (existsExcluded) {
    throw new Error('Exists invalid data in given object')
  }

  const isArrayOfStrings = keysRequired.every((key) => typeof key === 'string')

  if (isArrayOfStrings) {
    const givenKeys = Object.keys(data)
    const existsInvalidKeys = givenKeys.some((key) => !keysRequired.includes(key))

    if (existsInvalidKeys) {
      throw new Error('Invalid keys provided for this object')
    }
  }

  return data
}

export const otherSystemMessage = () => {
  console.log(`${process.platform} not supported`)
  process.exit(1)
}

/**
 * @typedef {import('ytsr').Item} Item
 * @typedef {{
 *  id: string, url: string,
 *  title: string, author: string,
 *  verified: boolean, views: number,
 *  duration: string
 * }} Result
 * @param {{ results: Item[], limit?: number }} mapArgs
 * @returns {Result[]}
 */
export function mapResults ({ results, limit = 0 }) {
  /**
   * @param {Item} result
   * @returns {Result}
   */
  const mapCallback = (result) => ({
    id: result.id,
    url: result.url,
    title: result.title,
    author: result.author.name,
    verified: result.author.verified,
    views: result.views,
    duration: result.duration
  })

  if (!limit) {
    return results.map(mapCallback)
  }

  if (typeof limit !== 'number') {
    throw new TypeError('Limit must be a number')
  }

  if (limit > results.length) limit = results.length

  return results.slice(0, limit).map(mapCallback)
}

export const getRandomNumber = (to) => {
  if (isNaN(Number(to))) {
    throw new TypeError('Argument must be a number')
  }

  return Math.floor(Math.random() * to)
}

/**
 * @param {boolean} isInDevelopMode
 */
export const developMode = (isInDevelopMode) => {
  if (typeof isInDevelopMode !== 'boolean') {
    throw new TypeError('Develop mode must be boolean')
  }

  if (!isInDevelopMode) {
    console.error = () => {} // Dirty way to get rid of third party errors
    console.warn = () => {}
  }
}

export const parseNumber = (rawData) => {
  const parsedNumber = Number(rawData.replace(/\D/g, ''))
  return isNaN(parsedNumber) ? 0 : parsedNumber
}

/**
 * Parse given string to get only letters
 * @param {string} data
 * @returns {string} parsedData
 */
export const parseOutput = (data) => {
  return data.replace(/[^a-zA-Z]/g, '')
}

export const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}

/**
 * The initial duration format must be in ```mm:ss```
 * @param {string} duration
 * @returns {number} ```durationInMilliseconds```
 */
export const songDurationToMiliseconds = (duration) => {
  const errorMessage = 'Given argument is not in a valid format type!'

  if (typeof duration !== 'string') {
    throw new TypeError(errorMessage)
  }

  if (duration.includes(':')) {
    const [minutes, seconds] = duration.split(':').map(parseNumber)
    const totalSeconds = (minutes * 60) + seconds
    const totalMiliseconds = totalSeconds * 1_000

    return totalMiliseconds
  }

  throw new Error(errorMessage)
}
