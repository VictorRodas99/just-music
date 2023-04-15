import { downloadAndPlay, handleCancel } from './utils/cli.general.tools.js'
import { formatTime } from '../utils/tools.js'
import { text, cancel } from '@clack/prompts'
import { SESSIONS } from './config.js'
import ytdl from 'ytdl-core'

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
    validate: (value) => {
      if (!ytdl.validateURL(value)) return 'It is not a valid video url!'
    }
  })

  handleCancel(url)

  return url
}

export async function handleSingleModeByLink () {
  global.sessionMode = SESSIONS.singleMode

  const givenUrl = await getURLFromUser()
  let generalVideoInfo

  try {
    generalVideoInfo = await ytdl.getInfo(givenUrl)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Video unavailable')) {
      cancel('The link leads to an unavailable video')
      process.exit(1)
    }
  }

  const song = getSongInfo(generalVideoInfo, givenUrl)
  downloadAndPlay(song)
}
