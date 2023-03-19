import path from 'path'
import { srcRootPath, PATHS } from '../config.js'

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

export const getAudioAbsPath = (audioName = '') => {
  if (!audioName) {
    return path.join(srcRootPath, PATHS.audio)
  }

  return path.join(srcRootPath, PATHS.audio, audioName)
}

export const getScriptPath = (scriptName) => {
  return path.join(srcRootPath, PATHS.scripts, scriptName)
}

export const getRandomNumber = (to) => {
  if (isNaN(to)) {
    throw new TypeError('Argument must be a number')
  }

  return Math.floor(Math.random() * to)
}

export const developMode = (isInDevelopMode) => {
  if (isInDevelopMode) console.error = () => {} // Dirty way to get rid of third party errors
}
