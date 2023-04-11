import { intro, isCancel, cancel, spinner } from '@clack/prompts'
import { formatTime, getRandomNumber, songDurationToMiliseconds } from '../../utils/tools.js'
import { getAudioFormatsFromUrl, downloadAudioBy } from '../../core/download.tools.js'
import { restartTimer } from '../../utils/player.tools.js'
import { mediaPlayerEventHandler, playAudio } from '../../core/audio.js'
import { PATHS } from '../../config.js'
import Timer from '../../utils/timer.js'
import { SESSIONS } from '../config.js'

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

export const parseOption = (value) => value.trim().toLowerCase()

export const mediaPlayerOptionsValidation = (value, controls) => {
  const parsedValue = parseOption(value)

  if (!parsedValue) return 'Please, select an option'
  if (!controls.includes(parsedValue)) {
    return 'Enter a valid action'
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
 * Logs the progress of a song with the given duration
 * @param {number} songDuration - The duration of the song in milliseconds
 * @param {function} callbackWhenSongEnds - The callback function to be executed when the song ends
 */
export const logSongProgress = (songDuration, callbackWhenSongEnds) => {
  global.timer = new Timer(() => {}, songDuration) // TODO: fix timer (it doesn't call the function)

  const intervalId = setInterval(() => {
    const currentDurationMilliseconds = songDuration - global.timer.currentTime()

    const currentDuration = formatTime(currentDurationMilliseconds)
    const formattedTotalDuration = formatTime(songDuration)

    process.stdout.write(`\r(${currentDuration} / ${formattedTotalDuration})`)

    if (currentDuration === formattedTotalDuration) {
      clearInterval(intervalId)
      callbackWhenSongEnds() // temporal
    }
  }, 1000)

  if (global.sessionMode === SESSIONS.playlistMode) {
    mediaPlayerEventHandler.once('next', () => clearInterval(intervalId))
  }
}

/**
 * @typedef {import('../interactions.js').SongInfo} SongInfo
 * @param {SongInfo} song
 */
export const downloadAndPlay = async (song) => {
  // TODO: validate if song is of type SongInfo
  const songDuration = songDurationToMiliseconds(song.duration)

  restartTimer(songDuration)

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
