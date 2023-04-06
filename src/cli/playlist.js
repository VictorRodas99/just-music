import { getPlaylistIDFromUser, playRandomSongFrom } from './utils/playlist.tools.js'
import { handleCancel } from './utils/cli.general.tools.js'
import { mediaPlayerEventHandler } from '../core/audio.js'
import { OPTIONS, SESSIONS } from './config.js'
import { select } from '@clack/prompts'
import ytpl from 'ytpl'

const randomMode = async (playlist) => {
  global.playlistPlayOption = OPTIONS.playlist.random

  playRandomSongFrom(playlist) // first play

  mediaPlayerEventHandler.on('next', () => {
    mediaPlayerEventHandler.emit('restart')
    playRandomSongFrom(playlist)
  })
}

const inOrderMode = async (playlist) => {
  // TODO: wait until the last music being played ends
}

const justOneMode = async (playlist) => {

}

export async function handlePlaylistMode () {
  global.sessionMode = SESSIONS.playlistMode
  const playlistID = await getPlaylistIDFromUser()

  const playOption = await select({
    message: 'Select the mode you want',
    options: [
      { value: 'random', label: 'Play random songs from the playlist' },
      { value: 'order', label: 'Play songs in order' },
      { value: 'justOne', label: 'Select the song you want' }
    ]
  })

  handleCancel(playOption)
  global.playlist = await ytpl(playlistID)

  const playMode = {
    random: randomMode,
    order: inOrderMode,
    justOne: justOneMode
  }

  const playActionMode = playMode[playOption]
  playActionMode(global.playlist)
}
