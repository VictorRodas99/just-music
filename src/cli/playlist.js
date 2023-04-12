import { getPlaylistIDFromUser, playRandomSongFrom } from './utils/playlist.tools.js'
import { downloadAndPlay, handleCancel } from './utils/cli.general.tools.js'
import { mediaPlayerEventHandler } from '../core/audio.js'
import { OPTIONS, SESSIONS } from './config.js'
import { select } from '@clack/prompts'
import ytpl from 'ytpl'

import { EventEmitter } from 'node:events'
import color from 'picocolors'

const pageEventsEmitter = new EventEmitter()

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
 * @typedef {import('ytpl').Result} Playlist
 * @typedef {import('ytpl').Item} Item
 *
 * @param {Playlist} playlist
 * @param {{ page: number, startIndex: number, endIndex: number }} argsForNextCall
 */
const justOneMode = async (playlist, argsForNextCall = undefined) => {
  if (!argsForNextCall) {
    global.playlistPlayOption = OPTIONS.playlist.one
  }

  const songs = playlist.items
  const limit = 5

  let page = argsForNextCall ? argsForNextCall.page : 1
  let startIndex = argsForNextCall ? argsForNextCall.startIndex : 0
  let endIndex = argsForNextCall ? argsForNextCall.endIndex : limit

  const nextPageOrDownloadSong = async (startIndex, endIndex) => {
    const result = songs.slice(startIndex, endIndex)
    const emitPageEvent = (eventName) => pageEventsEmitter.emit(eventName)

    /**
     * @param {Item} song
     */
    const mapOptions = (song) => ({ value: song, label: song.title })
    const getPageOptions = () => {
      if (startIndex >= songs.length) {
        return [
          { value: () => emitPageEvent('previousPage'), label: color.inverse('Go to previous section') }
        ]
      }

      return startIndex > 0
        ? [
            { value: () => emitPageEvent('nextPage'), label: color.inverse('Go to next section') },
            { value: () => emitPageEvent('previousPage'), label: color.inverse('Go to previous section') }
          ]
        : [{ value: () => emitPageEvent('nextPage'), label: color.inverse('Go to next section') }]
    }

    const selectedOption = await select({
      message: `${playlist.title} (Section ${page})`,
      options: result.map(mapOptions).concat(getPageOptions())
    })

    handleCancel(selectedOption)

    if (typeof selectedOption === 'function') {
      selectedOption() // emit page event
    } else {
      downloadAndPlay(selectedOption)
    }
  }

  if (!argsForNextCall) {
    pageEventsEmitter.on('nextPage', () => {
      page += 1

      startIndex = (page - 1) * limit
      endIndex = page * limit
      nextPageOrDownloadSong(startIndex, endIndex)
    })

    pageEventsEmitter.on('previousPage', () => {
      page -= 1

      startIndex = (page - 1) * limit
      endIndex = page * limit
      nextPageOrDownloadSong(startIndex, endIndex)
    })
  }

  nextPageOrDownloadSong(startIndex, endIndex) // first iteration

  mediaPlayerEventHandler.once('end', () => {
    justOneMode(playlist, { page, startIndex, endIndex })
  })
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
