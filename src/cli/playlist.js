import { getPlaylistIDFromUser, playRandomSongFrom, nextPageOrDownloadSong, paginate } from './utils/playlist.tools.js'
import { downloadAndPlay, handleCancel } from './utils/cli.general.tools.js'
import { mediaPlayerEventHandler } from '../core/audio.js'
import { validateObject } from '../utils/tools.js'
import { OPTIONS, SESSIONS } from './config.js'
import { cancel, select } from '@clack/prompts'
import ytpl from 'ytpl'

import { EventEmitter } from 'node:events'

export const pageEventsEmitter = new EventEmitter()

const randomMode = async (playlist) => {
  global.playlistPlayOption = OPTIONS.playlist.random

  playRandomSongFrom(playlist) // first play

  mediaPlayerEventHandler.on('next', () => {
    mediaPlayerEventHandler.emit('restart')
    playRandomSongFrom(playlist)
  })
}

const inOrderMode = async (playlist) => {
  global.playlistPlayOption = OPTIONS.playlist.order
  let currentIndexSong = 0

  mediaPlayerEventHandler.on('order', () => {
    const song = playlist.items[currentIndexSong]
    downloadAndPlay(song)
    currentIndexSong++
  })

  mediaPlayerEventHandler.on('next', () => {
    mediaPlayerEventHandler.emit('restart')
    mediaPlayerEventHandler.emit('order')
  })

  mediaPlayerEventHandler.emit('order') // First play
}

/**
 * @param {ytpl.Result} playlist
 * @param {{ page: number, startIndex: number, endIndex: number }} argsForNextCall
 */
async function justOneMode (
  playlist,
  argsForNextCall = { page: 0, startIndex: 0, endIndex: 0 }
) {
  global.playlistPlayOption = OPTIONS.playlist.one

  argsForNextCall = validateObject(
    argsForNextCall,
    {
      avoid: (value) => typeof value !== 'number',
      keysRequired: ['page', 'startIndex', 'endIndex']
    }
  )

  const limit = 5
  const totalSongs = playlist.items

  let page = argsForNextCall.page || 1
  let startIndex = argsForNextCall.startIndex || 0
  let endIndex = argsForNextCall.endIndex || limit

  if (argsForNextCall.page === 0) {
    pageEventsEmitter.on('nextPage', () => {
      const newData = paginate({
        playlist,
        page,
        limit,
        mode: 'next'
      })

      page = newData.page
      startIndex = newData.startIndex
      endIndex = newData.endIndex
    })

    pageEventsEmitter.on('previousPage', () => {
      const newData = paginate({
        playlist,
        page,
        limit,
        mode: 'back'
      })

      page = newData.page
      startIndex = newData.startIndex
      endIndex = newData.endIndex
    })
  }

  const firstSongs = totalSongs.slice(startIndex, endIndex)
  const firstConditions = {
    existsNextPage: true,
    existsPreviousPage: false
  }

  nextPageOrDownloadSong({
    songs: firstSongs,
    playlistTitle: playlist.title,
    currentPage: page,
    conditions: firstConditions
  }) // first iteration

  mediaPlayerEventHandler.once('end', () => {
    justOneMode(playlist, { page, startIndex, endIndex })
  })
}

/**
 * @param {{ payload: string } | {}} oneLineCall
 */
export async function handlePlaylistMode (oneLineCall = {}) {
  global.sessionMode = SESSIONS.playlistMode
  const playlistID = oneLineCall.payload ?? await getPlaylistIDFromUser()

  const playOption = await select({
    message: 'Select the mode you want',
    options: [
      { value: 'random', label: 'Play random songs from the playlist' },
      { value: 'order', label: 'Play songs in order' },
      { value: 'justOne', label: 'Select the song you want' }
    ]
  })

  handleCancel(playOption)

  try {
    global.playlist = await ytpl(playlistID)
  } catch (error) {
    const unknowPlaylistMessage = 'Unknown Playlist'

    if (error.message === unknowPlaylistMessage) {
      cancel(unknowPlaylistMessage)
      process.exit(1)
    }
  }

  const playMode = {
    random: randomMode,
    order: inOrderMode,
    justOne: justOneMode
  }

  const playActionMode = playMode[playOption]
  playActionMode(global.playlist)
}
