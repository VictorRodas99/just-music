import { handleCancel, getRandomSongFrom, downloadAndPlay } from './cli.general.tools.js'
import { text, cancel } from '@clack/prompts'
import ytpl from 'ytpl'

export const getPlaylistIDFromUser = async () => {
  const playlistUrl = await text({
    message: 'Give the playlist link',
    placeholder: 'here...'
  })

  handleCancel(playlistUrl)

  let playlistID

  try {
    playlistID = await ytpl.getPlaylistID(playlistUrl)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unable to find a id')) {
      cancel('The given url is not valid!')
      process.exit(1)
    }
  }

  const isValid = ytpl.validateID(playlistID)

  if (!isValid) {
    cancel('The given url is not valid!')
    process.exit(1)
  }

  return playlistID
}

/**
 * @param {ytpl.Item[]} playlist
 */
export const playRandomSongFrom = (playlist) => {
  const song = getRandomSongFrom(playlist.items)
  downloadAndPlay(song)
}
