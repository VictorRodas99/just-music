export const otherSystemMessage = () => {
  console.log(`${process.platform} not supported`)
  process.exit(1)
}

/**
 *
 * @param {{ results: ytSearch.Item[], limit?: number }} results
 * @returns {{
 *  id: string,
 *  url: string,
 *  title: string,
 *  author: string,
 *  verified: boolean,
 *  views: number,
 *  duration: string
 * }[]}
 */
export function mapResults ({ results, limit = 0 }) {
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
  if (isNaN(to)) {
    throw new TypeError('Argument must be a number')
  }

  return Math.floor(Math.random() * to)
}

export const developMode = (isInDevelopMode) => {
  if (!isInDevelopMode) {
    console.error = () => {} // Dirty way to get rid of third party errors
    console.warn = () => {}
  }
}

export const parseNumber = (number) => {
  const parsedNumber = Number(number.replace(/\D/g, ''))
  return isNaN(parsedNumber) ? 0 : parsedNumber
}

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
