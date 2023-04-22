import { handleCancel, getRandomSongFrom, downloadAndPlay } from './cli.general.tools.js'
import { validatePlaylistURL } from '../../utils/validations.js'
import { pageEventsEmitter } from '../playlist.js'
import { text, select } from '@clack/prompts'
import color from 'picocolors'

export const getPlaylistIDFromUser = async () => {
  const playlistUrl = await text({
    message: 'Give the playlist link',
    placeholder: 'here...',
    validate: validatePlaylistURL
  })

  handleCancel(playlistUrl)

  return playlistUrl
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
