import { cliErrorMessage, downloadAndPlay, handleCancel } from './utils/cli.general.tools.js'
import { validateSingleVideoURL } from '../utils/validations.js'
import { formatTime, songDurationToMiliseconds } from '../utils/tools.js'
import { text } from '@clack/prompts'
import { SESSIONS } from './config.js'
import ytdl from 'ytdl-core'
import { MAX_SONG_DURATION_MS } from '../config.js'

const getSongInfo = (generalInfo, url) => {
  const { videoDetails } = generalInfo

  const songDurationFormatted = formatTime(Number(videoDetails.lengthSeconds) * 1000)

  return {
    url,
    id: videoDetails.videoId,
    title: videoDetails.title,
    duration: songDurationFormatted
  }
}

const getURLFromUser = async () => {
  const url = await text({
    message: 'Give the youtube link',
    placeholder: 'here...',
    validate: validateSingleVideoURL
  })

  handleCancel(url)

  return url
}

/**
 * @param {{ payload: string } | {}} oneLineCall
 */
export async function handleSingleModeByLink (oneLineCall = {}) {
  global.sessionMode = SESSIONS.singleMode

  const givenUrl = oneLineCall.payload ?? await getURLFromUser()
  let generalVideoInfo

  try {
    generalVideoInfo = await ytdl.getInfo(givenUrl)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Video unavailable')) {
      cliErrorMessage('The link leads to an unavailable video')
    }
  }

  const song = getSongInfo(generalVideoInfo, givenUrl)

  if (songDurationToMiliseconds(song.duration) > MAX_SONG_DURATION_MS) {
    cliErrorMessage('Song duration exceeds 25 minutes')
  }

  downloadAndPlay(song)
}
