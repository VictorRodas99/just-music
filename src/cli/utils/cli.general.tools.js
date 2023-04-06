import { intro, isCancel, cancel, spinner } from '@clack/prompts'
import { getRandomNumber } from '../../utils/tools.js'
import { getAudioFormatsFromUrl, downloadAudioBy } from '../../core/download.tools.js'
import { playAudio } from '../../core/audio.js'
import { PATHS } from '../../config.js'

export const cliErrorMessage = (message) => {
  cancel(message)
  process.exit(1)
}

export const handleCancel = (propmtResult) => {
  if (isCancel(propmtResult)) {
    cancel('Operation cancelled')
    return process.exit(0)
  }
}

/**
 * @typedef {import('ytpl').Item} Item
 * @param {ytpl.Item[]} playlistItems
 * @returns {Item}
 */
export const getRandomSongFrom = (playlistItems) => {
  const total = playlistItems.length
  return playlistItems[getRandomNumber(total) - 1]
}

/**
 * @typedef {import('../interactions.js').SongInfo} SongInfo
 * @param {SongInfo} song
 */
export const downloadAndPlay = async (song) => {
  const loader = spinner()

  const [firstAudioFormat] = await getAudioFormatsFromUrl(
    song.url
  )

  loader.start('Downloading...')

  const { writableStream, filePath } = downloadAudioBy({
    url: song.url,
    givenMimeType: firstAudioFormat.mimeType
  })

  writableStream.on('finish', () => playAudio({ path: filePath, song }))

  loader.stop(`Playing "${song.title}"`) // TODO: change colors for this message
}

export const autoplay = () => {
  intro('Autoplaying...')
  playAudio({ path: PATHS.audio('sample.mp3') })
}
