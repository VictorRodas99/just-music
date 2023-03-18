import path from 'path'
import { srcRootPath, PATHS } from '../config.js'

/**
 *
 * @param {ytSearch.Item[]} results
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
export const mapResults = (results) => {
  return results.map(
    (result) => ({
      id: result.id,
      url: result.url,
      title: result.title,
      author: result.author.name,
      verified: result.author.verified,
      views: result.views,
      duration: result.duration
    })
  )
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
