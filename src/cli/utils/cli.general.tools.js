import { isCancel, cancel, spinner } from '@clack/prompts'
import { getRandomNumber } from '../../utils/tools.js'
import { getAudioFormatsFromUrl, downloadAudioBy } from '../../core/download.tools.js'
import { playAudio } from '../../core/audio.js'

export const cliErrorMessage = (message) => {
  cancel(message)
  process.exit(1)
}

export const clearConsole = () => {
  process.stdout.write('\u001b[2J\u001b[0;0H')
  console.log()
}

export const handleCancel = (propmtResult) => {
  if (isCancel(propmtResult)) {
    cancel('Operation cancelled')
    return process.exit(0)
  }
}

/**
 * @param {ytpl.Item[]} playlistItems
 * @returns {ytpl.Item}
 */
export const getRandomSongFrom = (playlistItems) => {
  const total = playlistItems.length
  return playlistItems[getRandomNumber(total) - 1]
}

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

  loader.stop(`Playing "${song.title}"`)
}
