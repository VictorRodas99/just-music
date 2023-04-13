import { handleCancel, getRandomSongFrom, downloadAndPlay } from './cli.general.tools.js'
import { text, cancel, select } from '@clack/prompts'
import { pageEventsEmitter } from '../playlist.js'
import color from 'picocolors'
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

/* single mode (playlist) tools  */
const emitPageEvent = (eventName) => pageEventsEmitter.emit(eventName)

const getPageOptions = ({ existsNextPage, existsPreviousPage }) => {
  const createOption = (value, label) => ({ value, label: color.inverse(label) })

  const nextOption = createOption(() => emitPageEvent('nextPage'), 'Go to next section')
  const backOption = createOption(() => emitPageEvent('previousPage'), 'Got to previous section')

  if (existsNextPage && existsPreviousPage) {
    return [backOption, nextOption]
  } else if (existsNextPage && !existsPreviousPage) {
    return [nextOption]
  } else {
    return [backOption]
  }
}

/**
 * @typedef {('next' | 'back')} PageMode
 *
 * @param {{
 *  playlist: ytpl.Result, page: number,
 *  limit: number, mode: PageMode
 * }} args
 * @returns {{ page: number, startIndex: number, endIndex: number }} New data about pages and indexes
 */
export const paginate = ({ playlist, page, limit, mode }) => {
  page = mode === 'next'
    ? page + 1
    : page - 1

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const totalSongs = playlist.items
  const paginatedSongs = totalSongs.slice(startIndex, endIndex)

  const conditions = {
    existsNextPage: startIndex < totalSongs.length,
    existsPreviousPage: startIndex > 0
  }

  nextPageOrDownloadSong({
    songs: paginatedSongs,
    playlistTitle: playlist.title,
    currentPage: page,
    conditions
  })

  return {
    page,
    startIndex,
    endIndex
  }
}

/**
 * Performs the action of navigating to the next or previous page, or downloading and playing a selected song from the given playlist
 *
 * @param {{
 *   songs: ytpl.Item[],
 *   playlistTitle: string,
 *   currentPage: number,
 *   conditions: {
 *     existsNextPage: boolean,
 *     existsPreviousPage: boolean
 *   }
 * }} args
*/
export const nextPageOrDownloadSong = async ({ songs, playlistTitle, currentPage, conditions }) => {
  const mapOptions = (song) => ({ value: song, label: song.title })

  const selectedOption = await select({
    message: `${playlistTitle} (Section ${currentPage})`,
    options: songs.map(mapOptions).concat(getPageOptions(conditions))
  })

  handleCancel(selectedOption)

  if (typeof selectedOption === 'function') {
    selectedOption() // emit page event
  } else {
    downloadAndPlay(selectedOption)
  }
}
